// Kiểm tra đầu cuối của walking skeleton (TD-4, NFR4.4), lệnh đã được duyệt:
//   npm --prefix backend run verify:e2e
// Dựng một Oracle XE tạm (project Compose riêng, cổng ngẫu nhiên, DB sạch), nạp dữ liệu mẫu, chạy ứng dụng thật trên cổng
// ngẫu nhiên, đi hết luồng đăng nhập → chấm → hoàn thành → gửi lại, kiểm DB và log, rồi hủy DB tạm.
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { createServer as netServer } from 'node:net';
import { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createDb, type Db } from '../src/db/pool.js';
import { runImport } from '../src/import/importer.js';
import { CatalogPolicy } from '../src/modules/catalog/policy.js';
import { CatalogService } from '../src/modules/catalog/service.js';
import { EvaluationService } from '../src/modules/evaluation/service.js';
import { IdentityService } from '../src/modules/identity/service.js';
import { createAudit, createLogger } from '../src/observability/logger.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const keep = process.argv.includes('--keep');
const project = `interview-e2e-${randomBytes(3).toString('hex')}`;
const secret = (n: number) => randomBytes(n).toString('base64url');

const results: { name: string; ok: boolean; detail?: string }[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, ...(detail ? { detail } : {}) });
  console.log(`${ok ? 'ĐẠT ' : 'LỖI '} ${name}${!ok && detail ? ` — ${detail}` : ''}`);
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const s = netServer();
    s.listen(0, '127.0.0.1', () => {
      const port = (s.address() as { port: number }).port;
      s.close(() => resolve(port));
    });
    s.on('error', reject);
  });
}

function compose(env: NodeJS.ProcessEnv, ...args: string[]) {
  return spawnSync('docker', ['compose', '-p', project, '-f', join(root, 'docker-compose.yml'), ...args], {
    cwd: root,
    env,
    encoding: 'utf8',
    shell: false,
  });
}

async function main(): Promise<boolean> {
  const dbPort = await freePort();
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ORACLE_PASSWORD: `Sys${secret(10)}`,
    DB_OWNER_PASSWORD: `Own${secret(10)}`,
    DB_APP_PASSWORD: `App${secret(10)}`,
    DB_PORT: String(dbPort),
  };

  console.log(`Dựng Oracle XE tạm (project ${project}, cổng ${dbPort})…`);
  const up = compose(env, 'up', '-d', '--wait', '--wait-timeout', '420', 'oracle');
  if (up.status !== 0) {
    console.error(up.stderr || up.stdout);
    check('Dựng Oracle XE tạm', false, 'docker compose up thất bại');
    return false;
  }
  check('Dựng Oracle XE tạm và tạo lược đồ', true);

  const jwtSecret = secret(48);
  const config = loadConfig({
    NODE_ENV: 'test',
    DB_HOST: 'localhost',
    DB_PORT: String(dbPort),
    DB_SERVICE: 'XEPDB1',
    DB_APP_USER: 'INTERVIEW_APP',
    DB_APP_PASSWORD: env.DB_APP_PASSWORD,
    DB_OWNER_USER: 'INTERVIEW_OWNER',
    DB_OWNER_PASSWORD: env.DB_OWNER_PASSWORD,
    JWT_SECRET: jwtSecret,
    BCRYPT_COST: '4',
  });
  const base = {
    host: config.db.host,
    port: config.db.port,
    service: config.db.service,
    poolMin: 1,
    poolMax: 4,
    queueTimeoutMs: 5000,
    callTimeoutMs: 8000,
  };
  const owner: Db = await createDb({ ...base, user: config.db.ownerUser, password: config.db.ownerPassword });
  // Phòng hờ: chờ lược đồ sẵn sàng (healthcheck đã kiểm, đây là rào cuối cho môi trường chậm).
  for (let i = 0; ; i++) {
    try {
      await owner.query('select count(*) as n from criterion');
      break;
    } catch (err) {
      if (i >= 60) throw err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  const appDb: Db = await createDb({
    ...base,
    user: config.db.appUser,
    password: config.db.appPassword,
    currentSchema: config.db.ownerUser,
  });
  let server: Server | undefined;
  try {
    // 1. Nạp dữ liệu mẫu, rồi nạp lại để kiểm không nhân đôi
    const seed: unknown = JSON.parse(readFileSync(join(root, 'data', 'sample', 'seed.json'), 'utf8'));
    const r1 = await runImport(owner, seed, { bcryptCost: 4 });
    const added = r1.groups.reduce((s, g) => s + g.added, 0);
    const errors = r1.groups.reduce((s, g) => s + g.errors.length, 0);
    check('Nạp dữ liệu mẫu: 41 bản ghi, 0 lỗi', added === 41 && errors === 0, JSON.stringify(r1.groups));
    const r2 = await runImport(owner, seed, { bcryptCost: 4 });
    check(
      'Nạp lại không nhân đôi',
      r2.groups.every((g) => g.added === 0 && g.errors.length === 0),
    );

    // 2. Chạy ứng dụng thật
    const lines: string[] = [];
    const sink = new Writable({
      write(chunk, _e, cb) {
        lines.push(String(chunk));
        cb();
      },
    });
    const logger = createLogger(sink);
    const audit = createAudit(logger);
    const policy = new CatalogPolicy(appDb);
    const app = createApp({
      config: { ...config, rateLimitPerMinute: 10_000 },
      db: appDb,
      logger,
      audit,
      identity: new IdentityService({
        db: appDb,
        secret: config.jwtSecret,
        bcryptCost: config.bcryptCost,
        ttlSeconds: config.jwtTtlSeconds,
        maxFailures: config.loginMaxFailures,
        lockMs: config.loginLockMinutes * 60_000,
        clock: () => new Date(),
        audit,
      }),
      catalog: new CatalogService(appDb, policy),
      evaluation: new EvaluationService({
        db: appDb,
        policy,
        audit,
        clock: () => new Date(),
        criteriaTtlMs: 0,
      }),
    });
    server = createServer(app);
    await new Promise<void>((r) => server!.listen(0, '127.0.0.1', r));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

    const call = async (method: string, path: string, opts: { token?: string; body?: unknown } = {}) => {
      const res = await fetch(url + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        },
        ...(opts.body !== undefined ? { body: JSON.stringify(opts.body) } : {}),
      });
      const text = await res.text();
      return {
        status: res.status,
        headers: res.headers,
        text,
        json: (text ? JSON.parse(text) : {}) as Record<string, unknown>,
      };
    };

    const health = await call('GET', '/health');
    check('GET /health trả 200', health.status === 200);

    const bad = await call('POST', '/api/v1/auth/login', {
      body: { email: 'an@mau.vn', password: 'sai-mat-khau' },
    });
    check(
      'Đăng nhập sai: 401 thông báo chung',
      bad.status === 401 && bad.json.message === 'Email hoặc mật khẩu không đúng',
    );
    const login = await call('POST', '/api/v1/auth/login', {
      body: { email: 'an@mau.vn', password: 'MatKhauMau-001' },
    });
    const token = login.json.token as string;
    check('Đăng nhập đúng: 200 kèm token', login.status === 200 && typeof token === 'string');

    const panels = await call('GET', '/api/v1/panels', { token });
    const panelIds = (panels.json.items as { maHdpv: string }[]).map((p) => p.maHdpv);
    check(
      'Danh sách HĐPV: chỉ HD004 (Inprogress, được gán)',
      JSON.stringify(panelIds) === '["HD004"]',
      JSON.stringify(panelIds),
    );

    const cands = await call('GET', '/api/v1/panels/HD004/candidates', { token });
    const order = (cands.json.items as { maUngVien: string }[]).map((c) => c.maUngVien);
    check(
      'Ứng viên: sắp theo giờ, UV004 (N) bị ẩn',
      JSON.stringify(order) === '["UV002","UV001","UV003"]',
      JSON.stringify(order),
    );
    check('Không lộ sdt, ngày sinh, giới tính', !/sdt|ngaySinh|gioiTinh|0900000/.test(cands.text));

    const forbidden = await call('GET', '/api/v1/panels/HD001/candidates', { token });
    const unavailable = await call('GET', '/api/v1/panels/HD005/candidates', { token });
    const hidden = await call('GET', '/api/v1/panels/HD004/candidates/UV004', { token });
    check(
      'Chính sách: 403 chưa gán, 404 HĐPV Completed, 404 ứng viên N',
      [forbidden.status, unavailable.status, hidden.status].join() === '403,404,404',
    );

    const crit = await call('GET', '/api/v1/criteria', { token });
    const codes = (crit.json.items as { maTieuChi: string; diemToiDa: number }[]).map((c) => c.maTieuChi);
    check('Có đủ 5 tiêu chí', codes.length === 5);

    // 3. Chấm và hoàn thành
    const key = '44444444-4444-4444-8444-444444444444';
    const body = {
      idempotencyKey: key,
      diem: codes.map((c, i) => ({ maTieuChi: c, diem: 1 + (i % 5) })),
      nhanXet: 'Kiểm tra đầu cuối',
      ketLuan: 'KHAC',
      referMaViTri: 'VT01',
      referLyDo: 'Phù hợp vị trí kế toán hơn',
      diemTrungBinh: 5, // server phải bỏ qua giá trị này
    };
    const done = await call('POST', '/api/v1/panels/HD004/candidates/UV002/evaluation', { token, body });
    check('Hoàn thành đánh giá: 201', done.status === 201 && done.json.trangThai === 'SUBMITTED', done.text);
    check(
      'Kết luận Khác được lưu; điểm trung bình do server tính (3), bỏ qua giá trị client (5)',
      done.json.ketLuan === 'KHAC' && done.json.diemTrungBinh === 3,
      done.text,
    );
    const replay = await call('POST', '/api/v1/panels/HD004/candidates/UV002/evaluation', { token, body });
    check(
      'Gửi lại cùng idempotencyKey: 200, cùng mã đánh giá',
      replay.status === 200 && replay.json.evaluationId === done.json.evaluationId,
    );
    const again = await call('POST', '/api/v1/panels/HD004/candidates/UV002/evaluation', {
      token,
      body: { ...body, idempotencyKey: '55555555-5555-4555-8555-555555555555' },
    });
    check(
      'Khóa mới cho ứng viên đã chấm: 409',
      again.status === 409 && again.json.code === 'ALREADY_COMPLETED',
    );

    // 3b. Kết luận, refer, điểm trung bình, xem lại (U2)
    const uv001 = '/api/v1/panels/HD004/candidates/UV001/evaluation';
    const k2 = '66666666-6666-4666-8666-666666666666';
    const badRefer = [
      { ketLuan: 'DAT', referMaViTri: 'VT02' }, // refer khi kết luận không phải Khác
      { ketLuan: 'KHAC', referMaViTri: 'VT01' }, // trùng vị trí hiện tại của UV001
      { ketLuan: 'KHAC', referMaViTri: 'VT04' }, // vị trí đã ngừng
      { ketLuan: 'KHAC', referLyDo: 'chỉ có lý do' }, // lý do mà không có vị trí
      { ketLuan: undefined }, // thiếu kết luận
    ];
    const badStatuses: number[] = [];
    for (const extra of badRefer) {
      const r = await call('POST', uv001, { token, body: { ...body, idempotencyKey: k2, ...extra } });
      badStatuses.push(r.status);
    }
    check(
      'Refer hoặc kết luận sai: toàn bộ 400',
      badStatuses.every((s) => s === 400),
      badStatuses.join(),
    );
    const loai = await call('POST', uv001, {
      token,
      body: { ...body, idempotencyKey: k2, ketLuan: 'LOAI', referMaViTri: undefined, referLyDo: undefined },
    });
    check('Kết luận Loại không refer: 201', loai.status === 201 && loai.json.ketLuan === 'LOAI', loai.text);

    const detail = await call('GET', '/api/v1/panels/HD004/candidates/UV002/evaluation', { token });
    const refer = detail.json.referViTri as { maViTri: string } | undefined;
    check(
      'Xem lại bài: kết luận Khác, refer VT01, điểm trung bình 3, đủ 5 điểm',
      detail.status === 200 &&
        detail.json.ketLuan === 'KHAC' &&
        refer?.maViTri === 'VT01' &&
        detail.json.diemTrungBinh === 3 &&
        (detail.json.diem as unknown[]).length === 5,
      detail.text,
    );
    const positions = await call('GET', '/api/v1/panels/HD004/candidates/UV002/referable-positions', {
      token,
    });
    const posCodes = (positions.json.items as { maViTri: string }[]).map((p) => p.maViTri);
    check(
      'Vị trí có thể refer của UV002: VT01, VT03 (trừ VT02 hiện tại và VT04 đã ngừng)',
      JSON.stringify(posCodes) === '["VT01","VT03"]',
      JSON.stringify(posCodes),
    );
    const noEval = await call('GET', '/api/v1/panels/HD004/candidates/UV003/evaluation', { token });
    check(
      'Chưa có bài: 404 EVALUATION_NOT_FOUND',
      noEval.status === 404 && noEval.json.code === 'EVALUATION_NOT_FOUND',
    );

    const evals = await owner.query<{ n: number }>(
      `select count(*) as n from interview_evaluation where trang_thai = 'SUBMITTED'`,
    );
    const scores = await owner.query<{ n: number }>(`select count(*) as n from evaluation_score`);
    check(
      'DB: đúng 2 phiếu SUBMITTED và 10 dòng điểm (các request 400 không lưu gì)',
      evals[0]?.n === 2 && scores[0]?.n === 10,
      JSON.stringify({ evals, scores }),
    );
    const candPos = await owner.query<{ maViTri: string }>(
      `select ma_vi_tri from candidate where ma_ung_vien = 'UV002'`,
    );
    check('Vị trí của ứng viên không đổi sau khi refer (BR-A3)', candPos[0]?.maViTri === 'VT02');

    const mine = await call('GET', '/api/v1/panels/HD004/my-evaluations', { token });
    const mineItems = mine.json.items as { maUngVien: string; ketLuan: string; diemTrungBinh: number }[];
    check(
      'my-evaluations liệt kê UV001 (Loại) và UV002 (Khác) kèm điểm trung bình',
      JSON.stringify(mineItems.map((m) => [m.maUngVien, m.ketLuan])) ===
        '[["UV001","LOAI"],["UV002","KHAC"]]' && mineItems.every((m) => typeof m.diemTrungBinh === 'number'),
      JSON.stringify(mineItems),
    );

    // 4. Người khác và khóa đăng nhập
    const other = await call('POST', '/api/v1/auth/login', {
      body: { email: 'cuong@mau.vn', password: 'MatKhauMau-003' },
    });
    const otherDenied = await call('GET', '/api/v1/panels/HD004/candidates', {
      token: other.json.token as string,
    });
    check('Người chưa được gán vào HD004: 403', otherDenied.status === 403);
    for (let i = 0; i < 5; i++)
      await call('POST', '/api/v1/auth/login', { body: { email: 'binh@mau.vn', password: 'sai' } });
    const locked = await call('POST', '/api/v1/auth/login', {
      body: { email: 'binh@mau.vn', password: 'MatKhauMau-002' },
    });
    check(
      'Sai 5 lần thì lần 6 bị 429 kèm Retry-After',
      locked.status === 429 && locked.headers.get('retry-after') === '900',
    );

    // 5. Log
    const text = lines.join('');
    const noSecrets =
      !text.includes('MatKhauMau-') && !text.includes(token) && !text.includes('Kiểm tra đầu cuối');
    check('Log không chứa mật khẩu, token hay nhận xét', noSecrets);
    check(
      'Log có mã tương quan và sự kiện kiểm toán hoàn thành',
      text.includes('"correlationId"') && text.includes('evaluation_completed'),
    );
    check(
      'Mọi phản hồi có X-Correlation-Id',
      login.headers.get('x-correlation-id') !== null && done.headers.get('x-correlation-id') !== null,
    );
  } catch (err) {
    check('Chạy kịch bản', false, (err as Error).stack ?? String(err));
  } finally {
    server?.close();
    await appDb.close();
    await owner.close();
  }
  return results.every((r) => r.ok);
}

const ok = await main().finally(() => {
  if (keep) {
    console.log(`Giữ lại project ${project} (--keep).`);
    return;
  }
  const down = compose(
    { ...process.env, ORACLE_PASSWORD: 'x', DB_OWNER_PASSWORD: 'x', DB_APP_PASSWORD: 'x' },
    'down',
    '-v',
    '--remove-orphans',
  );
  if (down.status !== 0) console.error('Không hủy được Oracle XE tạm:', down.stderr);
});
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} kiểm tra đạt.`);
process.exit(ok && failed === 0 ? 0 : 1);
