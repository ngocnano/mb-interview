import { Writable } from 'node:stream';
import type { Express } from 'express';
import { createApp, type AppDeps } from '../../src/app.js';
import { loadConfig, type Config } from '../../src/config.js';
import { createDb, type Db } from '../../src/db/pool.js';
import { CatalogPolicy } from '../../src/modules/catalog/policy.js';
import { CatalogService } from '../../src/modules/catalog/service.js';
import { EvaluationService } from '../../src/modules/evaluation/service.js';
import { IdentityService } from '../../src/modules/identity/service.js';
import { createAudit, createLogger } from '../../src/observability/logger.js';

export interface TestApp {
  app: Express;
  db: Db;
  config: Config;
  logs: string[];
  deps: AppDeps;
  close: () => Promise<void>;
}

export async function buildTestApp(
  over: Partial<Config> = {},
  patch?: (d: AppDeps) => AppDeps,
): Promise<TestApp> {
  const config: Config = {
    ...loadConfig({ ...process.env, BCRYPT_COST: '4' }),
    rateLimitPerMinute: 10_000, // test không bị giới hạn trừ khi tự ghi đè
    ...over,
  };
  const db = await createDb({
    user: config.db.appUser,
    password: config.db.appPassword,
    host: config.db.host,
    port: config.db.port,
    service: config.db.service,
    currentSchema: config.db.ownerUser,
    poolMin: 1,
    poolMax: 4,
    queueTimeoutMs: config.db.queueTimeoutMs,
    callTimeoutMs: config.db.callTimeoutMs,
  });
  const logs: string[] = [];
  const sink = new Writable({
    write(chunk, _enc, cb) {
      logs.push(String(chunk));
      cb();
    },
  });
  const logger = createLogger(sink);
  const audit = createAudit(logger);
  const policy = new CatalogPolicy(db);
  let deps: AppDeps = {
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
      clock: () => new Date(),
      audit,
    }),
    catalog: new CatalogService(db, policy),
    evaluation: new EvaluationService({ db, policy, audit, clock: () => new Date(), criteriaTtlMs: 0 }),
  };
  if (patch) deps = patch(deps);
  return { app: createApp(deps), db, config, logs, deps, close: () => db.close() };
}
