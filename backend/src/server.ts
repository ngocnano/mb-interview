import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createDb } from './db/pool.js';
import { startCleanup } from './jobs/cleanup.js';
import { CatalogPolicy } from './modules/catalog/policy.js';
import { CatalogService } from './modules/catalog/service.js';
import { EvaluationService } from './modules/evaluation/service.js';
import { IdentityService } from './modules/identity/service.js';
import { createAudit, createLogger } from './observability/logger.js';

// Điểm vào: nối dây các thành phần. Logic nằm ở các module đã có test (xem vitest.config.ts).
const logger = createLogger();
const config = loadConfig(process.env); // thiếu hoặc sai cấu hình thì ném lỗi và không khởi động (NFR1.2)

const db = await createDb({
  user: config.db.appUser,
  password: config.db.appPassword,
  host: config.db.host,
  port: config.db.port,
  service: config.db.service,
  currentSchema: config.db.ownerUser,
  poolMin: config.db.poolMin,
  poolMax: config.db.poolMax,
  queueTimeoutMs: config.db.queueTimeoutMs,
  callTimeoutMs: config.db.callTimeoutMs,
});

const audit = createAudit(logger);
const policy = new CatalogPolicy(db);
const clock = () => new Date();
const app = createApp({
  config,
  db,
  logger,
  audit,
  identity: new IdentityService({
    db,
    secret: config.jwtSecret,
    bcryptCost: config.bcryptCost,
    ttlSeconds: config.jwtTtlSeconds,
    maxFailures: config.loginMaxFailures,
    lockMs: config.loginLockMinutes * 60_000,
    clock,
    audit,
  }),
  catalog: new CatalogService(db, policy),
  evaluation: new EvaluationService({ db, policy, audit, clock, criteriaTtlMs: 60_000 }),
});

const cleanup = startCleanup({
  db,
  clock,
  intervalMs: 3_600_000,
  onError: (err) => logger.warn({ type: 'app', err }, 'Dọn bộ đếm đăng nhập lỗi'),
});

const server = app.listen(config.port, () => {
  logger.info({ type: 'app', port: config.port }, 'Backend đã sẵn sàng');
});

// Dừng êm (RD-6): ngừng nhận kết nối mới, chờ request đang chạy tối đa 10 giây, đóng nhóm kết nối.
let stopping = false;
async function shutdown(signal: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  logger.info({ type: 'app', signal }, 'Đang dừng backend');
  cleanup.stop();
  const force = setTimeout(() => {
    logger.error({ type: 'app' }, 'Hết thời gian chờ dừng êm');
    process.exit(1);
  }, 10_000);
  force.unref();
  server.close(async () => {
    await db.close();
    clearTimeout(force);
    process.exit(0);
  });
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
