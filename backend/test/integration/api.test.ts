import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DbUnavailableError } from '../../src/db/errors.js';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { buildTestApp, type TestApp } from '../helpers/app.js';
import { TEST_PASSWORD, testHash } from '../helpers/services.js';

const KEY1 = '11111111-1111-4111-8111-111111111111';
const KEY2 = '22222222-2222-4222-8222-222222222222';
const API = '/api/v1';

async function seed(): Promise<void> {
  const c = await ownerConn();
  await resetData(c);
  await seedMinimal(c);
  await exec(c, `update user_account set password_hash = :h where user_id = 'U1'`, { h: testHash() });
  await exec(
    c,
    `update candidate set sdt = '0900000000', ngay_sinh = date '1990-01-01', gioi_tinh = 'Nam', kinh_nghiem = '5 năm', trinh_do = 'Đại học' where ma_ung_vien = 'C1'`,
  );
  await exec(c, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C2', 'Ứng viên 2', 'VT2')`);
  await exec(
    c,
    `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC2','P1','C2','08:00','08:30','Y')`,
  );
  await exec(c, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('CN', 'Không xác nhận', 'VT1')`);
  await exec(
    c,
    `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PCN','P1','CN','07:00','07:30','N')`,
  );
  await exec(
    c,
    `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('PD','Nháp', sysdate, 'Online', 'DRAFT')`,
  );
  await exec(c, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PID','PD','E1')`);
  await exec(
    c,
    `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('PX','Không được gán', sysdate, 'Online', 'INPROGRESS')`,
  );
  await exec(
    c,
    `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu) values ('TC2','Giao tiếp',1,5,2)`,
  );
  await c.close();
}

describe('API v1 (AC1.1.x, AC2.1.x, AC4.1.x, AC5.1.x, AC6.1.x)', () => {
  let t: TestApp;
  let token: string;

  beforeAll(async () => {
    t = await buildTestApp();
  });
  afterAll(async () => {
    await t.close();
  });
  beforeEach(async () => {
    await seed();
    t.logs.length = 0;
    const res = await request(t.app)
      .post(`${API}/auth/login`)
      .send({ email: 'a@x.vn', password: TEST_PASSWORD });
    token = res.body.token;
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const body = (key = KEY1) => ({
    idempotencyKey: key,
    diem: [
      { maTieuChi: 'TC1', diem: 4 },
      { maTieuChi: 'TC2', diem: 5 },
    ],
    nhanXet: 'Tốt',
    ketLuan: 'DAT',
  });

  it('login 200: token, expiresAt, user; no-store và mã tương quan (AC1.1.1, NFR1.14, NFR3.2)', async () => {
    const res = await request(t.app)
      .post(`${API}/auth/login`)
      .set('X-Correlation-Id', 'test-corr-1')
      .send({ email: 'A@x.vn', password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ userId: 'U1', employedId: 'E1', hoTen: 'Người Một', email: 'a@x.vn' });
    expect(typeof res.body.token).toBe('string');
    expect(Number.isNaN(Date.parse(res.body.expiresAt))).toBe(false);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-correlation-id']).toBe('test-corr-1');
  });

  it('login lỗi: 401 chung, 400 sai định dạng, 403 khóa, 429 sau 5 lần sai (AC1.1.2..AC1.1.4, AC1.1.9)', async () => {
    const bad = await request(t.app).post(`${API}/auth/login`).send({ email: 'a@x.vn', password: 'sai' });
    expect([bad.status, bad.body.code, bad.body.message]).toEqual([
      401,
      'INVALID_CREDENTIALS',
      'Email hoặc mật khẩu không đúng',
    ]);
    const fmt = await request(t.app)
      .post(`${API}/auth/login`)
      .send({ email: 'khong-phai-email', password: '' });
    expect(fmt.status).toBe(400);
    expect(fmt.body.code).toBe('VALIDATION_FAILED');
    expect(fmt.body.details.map((d: { field: string }) => d.field).sort()).toEqual(['email', 'password']);
    const c = await ownerConn();
    await exec(c, `update user_account set trang_thai = 'LOCKED'`);
    await c.close();
    const locked = await request(t.app)
      .post(`${API}/auth/login`)
      .send({ email: 'a@x.vn', password: TEST_PASSWORD });
    expect([locked.status, locked.body.code]).toEqual([403, 'ACCOUNT_LOCKED']);
    for (let i = 0; i < 5; i++)
      await request(t.app).post(`${API}/auth/login`).send({ email: 'b@x.vn', password: 'sai' });
    const throttled = await request(t.app)
      .post(`${API}/auth/login`)
      .send({ email: 'b@x.vn', password: 'sai' });
    expect([throttled.status, throttled.body.code]).toEqual([429, 'LOGIN_LOCKED']);
    expect(throttled.headers['retry-after']).toBe(String(15 * 60));
  });

  it('API nghiệp vụ không có hoặc sai token: 401 (AC1.1.5)', async () => {
    expect((await request(t.app).get(`${API}/panels`)).status).toBe(401);
    expect((await request(t.app).get(`${API}/panels`).set('Authorization', 'Bearer rac')).status).toBe(401);
    const res = await request(t.app).get(`${API}/criteria`);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  it('GET /panels: chỉ HĐPV Inprogress được gán, định dạng ngày và tổng ứng viên (AC2.1.1..AC2.1.4)', async () => {
    const res = await request(t.app).get(`${API}/panels`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      maHdpv: 'P1',
      ten: 'HĐPV 1',
      hinhThuc: 'Online',
      soUngVienXacNhan: 2,
    });
    expect(res.body.items[0].ngay).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('GET candidates: sắp theo giờ, đủ vị trí, không có dữ liệu cá nhân; 403 và 404 đúng chỗ (AC4.1.1..AC4.1.9)', async () => {
    const res = await request(t.app).get(`${API}/panels/P1/candidates`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.panel.maHdpv).toBe('P1');
    expect(res.body.items.map((i: { maUngVien: string }) => i.maUngVien)).toEqual(['C2', 'C1']);
    expect(res.body.items[0].viTri.maViTri).toBe('VT2');
    expect(res.body.items[0]).toMatchObject({ tuThoiGian: '08:00', denThoiGian: '08:30' });
    expect(JSON.stringify(res.body)).not.toMatch(/sdt|ngaySinh|gioiTinh|0900000000/);
    expect((await request(t.app).get(`${API}/panels/PX/candidates`).set(auth())).status).toBe(403);
    expect((await request(t.app).get(`${API}/panels/PD/candidates`).set(auth())).status).toBe(404);
    expect((await request(t.app).get(`${API}/panels/KHONG/candidates`).set(auth())).status).toBe(404);
  });

  it('GET candidate detail: thông tin cho phép, không sdt/ngày sinh/giới tính; N trả 404 (AC5.1.1, AC5.1.2, AC5.1.4)', async () => {
    const res = await request(t.app).get(`${API}/panels/P1/candidates/C1`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      maUngVien: 'C1',
      ten: 'Ứng viên 1',
      kinhNghiem: '5 năm',
      trinhDo: 'Đại học',
    });
    expect(res.body.panel.maHdpv).toBe('P1');
    expect(JSON.stringify(res.body)).not.toMatch(/sdt|ngaySinh|gioiTinh|Nam|0900000000|1990/);
    const n = await request(t.app).get(`${API}/panels/P1/candidates/CN`).set(auth());
    expect([n.status, n.body.code]).toEqual([404, 'CANDIDATE_NOT_CONFIRMED']);
  });

  it('GET /criteria: theo thứ tự cấu hình (AC5.1.3)', async () => {
    const res = await request(t.app).get(`${API}/criteria`).set(auth());
    expect(res.body.items.map((c: { maTieuChi: string }) => c.maTieuChi)).toEqual(['TC1', 'TC2']);
  });

  it('POST evaluation: 201, gửi lại cùng khóa 200, khóa mới 409 (AC6.1.1, AC6.1.2, AC6.2.1)', async () => {
    const first = await request(t.app)
      .post(`${API}/panels/P1/candidates/C1/evaluation`)
      .set(auth())
      .send(body());
    expect(first.status).toBe(201);
    expect(first.body).toMatchObject({ trangThai: 'SUBMITTED' });
    const again = await request(t.app)
      .post(`${API}/panels/P1/candidates/C1/evaluation`)
      .set(auth())
      .send(body());
    expect(again.status).toBe(200);
    expect(again.body.evaluationId).toBe(first.body.evaluationId);
    const other = await request(t.app)
      .post(`${API}/panels/P1/candidates/C1/evaluation`)
      .set(auth())
      .send(body(KEY2));
    expect([other.status, other.body.code]).toEqual([409, 'ALREADY_COMPLETED']);
    const mine = await request(t.app).get(`${API}/panels/P1/my-evaluations`).set(auth());
    expect(mine.body.items.map((i: { maUngVien: string }) => i.maUngVien)).toEqual(['C1']);
  });

  it('POST evaluation: dữ liệu sai 400 kèm danh sách trường, không lưu (AC5.2.2, AC6.1.3)', async () => {
    const bad = { ...body(), diem: [{ maTieuChi: 'TC1', diem: 6 }] };
    const res = await request(t.app).post(`${API}/panels/P1/candidates/C1/evaluation`).set(auth()).send(bad);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(res.body.details.map((d: { field: string }) => d.field)).toEqual(
      expect.arrayContaining(['diem.TC1', 'diem.TC2']),
    );
    const noKey = await request(t.app)
      .post(`${API}/panels/P1/candidates/C1/evaluation`)
      .set(auth())
      .send({ diem: body().diem });
    expect(noKey.status).toBe(400);
    expect(await t.db.query(`select 1 from interview_evaluation`)).toHaveLength(0);
  });

  it('POST evaluation: không được gán 403, ứng viên N hoặc HĐPV Draft 404 (AC6.1.4, AC6.1.5)', async () => {
    expect(
      (await request(t.app).post(`${API}/panels/PX/candidates/C1/evaluation`).set(auth()).send(body()))
        .status,
    ).toBe(403);
    expect(
      (await request(t.app).post(`${API}/panels/P1/candidates/CN/evaluation`).set(auth()).send(body()))
        .status,
    ).toBe(404);
    expect(
      (await request(t.app).post(`${API}/panels/PD/candidates/C1/evaluation`).set(auth()).send(body()))
        .status,
    ).toBe(404);
    expect((await request(t.app).post(`${API}/panels/P1/candidates/C1/evaluation`).send(body())).status).toBe(
      401,
    );
  });

  it('không có API sửa hoặc xóa phiếu (AC6.1.7)', async () => {
    await request(t.app).post(`${API}/panels/P1/candidates/C1/evaluation`).set(auth()).send(body());
    for (const method of ['put', 'patch', 'delete'] as const) {
      const agent = request(t.app);
      const res = await agent[method](`${API}/panels/P1/candidates/C1/evaluation`).set(auth()).send(body());
      expect([404, 405]).toContain(res.status);
    }
  });

  it('/health: 200 khi DB sẵn sàng, 503 khi DB hỏng, không cần xác thực (NFR14.8)', async () => {
    const ok = await request(t.app).get('/health');
    expect([ok.status, ok.body]).toEqual([200, { status: 'ok' }]);
    const broken = await buildTestApp({}, (d) => ({
      ...d,
      db: { ...d.db, ping: () => Promise.resolve(false) },
    }));
    const bad = await request(broken.app).get('/health');
    expect([bad.status, bad.body]).toEqual([503, { status: 'degraded' }]);
    await broken.close();
  });

  it('JSON quá 100 KB: 413; JSON hỏng: 400 (NFR1.9)', async () => {
    const big = await request(t.app)
      .post(`${API}/auth/login`)
      .send({ email: 'a@x.vn', password: 'x'.repeat(200_000) });
    expect(big.status).toBe(413);
    const broken = await request(t.app)
      .post(`${API}/auth/login`)
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(broken.status).toBe(400);
  });

  it('CORS chỉ cho nguồn trong danh sách (NFR1.13)', async () => {
    const strict = await buildTestApp({ corsOrigins: ['http://cho-phep.vn'] });
    const yes = await request(strict.app).get('/health').set('Origin', 'http://cho-phep.vn');
    const no = await request(strict.app).get('/health').set('Origin', 'http://la.vn');
    expect(yes.headers['access-control-allow-origin']).toBe('http://cho-phep.vn');
    expect(no.headers['access-control-allow-origin']).toBeUndefined();
    await strict.close();
  });

  it('giới hạn tốc độ theo IP (NFR1.4)', async () => {
    const limited = await buildTestApp({ rateLimitPerMinute: 3 });
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) statuses.push((await request(limited.app).get(`${API}/criteria`)).status);
    expect(statuses.slice(0, 3)).not.toContain(429);
    expect(statuses.slice(3)).toEqual([429, 429]);
    await limited.close();
  });

  it('log có mã tương quan và không chứa mật khẩu hay token (NFR14.4, NFR14.6)', async () => {
    t.logs.length = 0;
    const res = await request(t.app)
      .post(`${API}/auth/login`)
      .set('X-Correlation-Id', 'corr-log-1')
      .send({ email: 'a@x.vn', password: TEST_PASSWORD });
    await request(t.app).get(`${API}/panels`).set('Authorization', `Bearer ${res.body.token}`);
    const text = t.logs.join('');
    expect(text).toContain('corr-log-1');
    expect(text).not.toContain(TEST_PASSWORD);
    expect(text).not.toContain(res.body.token);
    const access = t.logs.map((l) => JSON.parse(l)).filter((l) => l.type === 'access');
    expect(access.length).toBeGreaterThanOrEqual(2);
    expect(access[0]).toMatchObject({ method: 'POST', status: 200 });
    expect(typeof access[0].durationMs).toBe('number');
  });

  it('lỗi chưa biết: 500 chỉ có code và message, không lộ stack; mất DB: 503 (SD-15, RD-5)', async () => {
    const boom = await buildTestApp({}, (d) => ({
      ...d,
      catalog: { listPanels: () => Promise.reject(new Error('bí mật nội bộ ở /src/x.ts')) } as never,
    }));
    const res = await request(boom.app)
      .post(`${API}/auth/login`)
      .send({ email: 'a@x.vn', password: TEST_PASSWORD });
    const panels = await request(boom.app)
      .get(`${API}/panels`)
      .set('Authorization', `Bearer ${res.body.token}`);
    expect(panels.status).toBe(500);
    expect(Object.keys(panels.body).sort()).toEqual(['code', 'correlationId', 'message']);
    expect(JSON.stringify(panels.body)).not.toContain('bí mật');
    await boom.close();

    const down = await buildTestApp({}, (d) => ({
      ...d,
      catalog: { listPanels: () => Promise.reject(new DbUnavailableError(new Error('x'))) } as never,
    }));
    const l = await request(down.app)
      .post(`${API}/auth/login`)
      .send({ email: 'a@x.vn', password: TEST_PASSWORD });
    const r = await request(down.app).get(`${API}/panels`).set('Authorization', `Bearer ${l.body.token}`);
    expect([r.status, r.body.code]).toEqual([503, 'DB_UNAVAILABLE']);
    await down.close();
  });

  it('đường dẫn không tồn tại: 404 dạng JSON', async () => {
    const res = await request(t.app).get(`${API}/khong-co`).set(auth());
    expect([res.status, res.body.code]).toEqual([404, 'NOT_FOUND']);
  });
});
