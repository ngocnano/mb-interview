import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { buildTestApp, type TestApp } from '../helpers/app.js';
import { TEST_PASSWORD, testHash } from '../helpers/services.js';

const KEY1 = '11111111-1111-4111-8111-111111111111';
const API = '/api/v1';

async function seed(): Promise<void> {
  const c = await ownerConn();
  await resetData(c);
  await seedMinimal(c);
  await exec(c, `update user_account set password_hash = :h where user_id = 'U1'`, { h: testHash() });
  await exec(
    c,
    `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu) values ('TC2','Giao tiếp',1,5,2)`,
  );
  await exec(
    c,
    `insert into job_position (ma_vi_tri, job, dvql, trang_thai) values ('VT3', 'Đã ngừng', 'Phòng C', 'INACTIVE')`,
  );
  await exec(c, `insert into interviewer (employed_id, ten) values ('E2', 'CBQL Hai')`);
  await exec(
    c,
    `insert into user_account (user_id, email, password_hash, employed_id, ho_ten) values ('U2', 'b@x.vn', :h, 'E2', 'Người Hai')`,
    { h: testHash() },
  );
  await exec(c, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PI2', 'P1', 'E2')`);
  await exec(
    c,
    `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('PX','Không được gán', sysdate, 'Online', 'INPROGRESS')`,
  );
  await c.close();
}

describe('API v1 U2: kết luận, refer, điểm trung bình, xem lại (AC5.3.x, AC5.4.x, AC6.1.8..16, AC6.3.x)', () => {
  let t: TestApp;
  let token: string;
  let token2: string;

  const login = async (email: string): Promise<string> =>
    (await request(t.app).post(`${API}/auth/login`).send({ email, password: TEST_PASSWORD })).body.token;
  const auth = (tk = token) => ({ Authorization: `Bearer ${tk}` });
  const body = (over: Record<string, unknown> = {}) => ({
    idempotencyKey: KEY1,
    diem: [
      { maTieuChi: 'TC1', diem: 4 },
      { maTieuChi: 'TC2', diem: 5 },
    ],
    nhanXet: 'Tốt',
    ketLuan: 'DAT',
    ...over,
  });
  const post = (b: unknown, tk = token) =>
    request(t.app)
      .post(`${API}/panels/P1/candidates/C1/evaluation`)
      .set(auth(tk))
      .send(b as object);

  beforeAll(async () => {
    t = await buildTestApp();
  });
  afterAll(async () => {
    await t.close();
  });
  beforeEach(async () => {
    await seed();
    token = await login('a@x.vn');
    token2 = await login('b@x.vn');
  });

  it('201 trả ketLuan và diemTrungBinh do server tính, bỏ qua giá trị client (AC6.1.14, AC6.1.15)', async () => {
    const res = await post(body({ diemTrungBinh: 1 }));
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ trangThai: 'SUBMITTED', ketLuan: 'DAT', diemTrungBinh: 4.5 });
  });

  it('400 khi thiếu hoặc sai ketLuan, không lưu gì (AC6.1.8)', async () => {
    const noKetLuan: Record<string, unknown> = body();
    delete noKetLuan.ketLuan;
    for (const bad of [noKetLuan, body({ ketLuan: 'LA_LUNG' }), body({ ketLuan: '' })]) {
      const res = await post(bad);
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    }
    expect(await t.db.query(`select 1 from interview_evaluation`)).toHaveLength(0);
  });

  it('400 với refer không hợp lệ (AC6.1.10, AC6.1.11, AC6.1.12)', async () => {
    const cases = [
      body({ ketLuan: 'DAT', referMaViTri: 'VT2' }),
      body({ ketLuan: 'KHAC', referMaViTri: 'VT1' }),
      body({ ketLuan: 'KHAC', referMaViTri: 'VT3' }),
      body({ ketLuan: 'KHAC', referMaViTri: 'KHONG_CO' }),
      body({ ketLuan: 'KHAC', referLyDo: 'chỉ có lý do' }),
      body({ ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'a'.repeat(501) }),
    ];
    for (const c of cases) expect((await post(c)).status).toBe(400);
    expect(await t.db.query(`select 1 from interview_evaluation`)).toHaveLength(0);
  });

  it('KHAC kèm refer hợp lệ: 201 và đọc lại thấy vị trí và lý do (AC5.4.4, AC6.1.9)', async () => {
    const res = await post(body({ ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'Hợp hơn' }));
    expect(res.status).toBe(201);
    const get = await request(t.app).get(`${API}/panels/P1/candidates/C1/evaluation`).set(auth());
    expect(get.status).toBe(200);
    expect(get.body).toMatchObject({
      ketLuan: 'KHAC',
      referViTri: { maViTri: 'VT2', job: 'Lập trình' },
      referLyDo: 'Hợp hơn',
      diemTrungBinh: 4.5,
      trangThai: 'SUBMITTED',
    });
    expect(get.body.diem).toHaveLength(2);
  });

  it('GET evaluation: 404 EVALUATION_NOT_FOUND khi chưa có bài, 403 khi không được gán, 401 khi thiếu token (AC6.3.3)', async () => {
    const none = await request(t.app).get(`${API}/panels/P1/candidates/C1/evaluation`).set(auth());
    expect([none.status, none.body.code]).toEqual([404, 'EVALUATION_NOT_FOUND']);
    expect((await request(t.app).get(`${API}/panels/PX/candidates/C1/evaluation`).set(auth())).status).toBe(
      403,
    );
    expect((await request(t.app).get(`${API}/panels/P1/candidates/C1/evaluation`)).status).toBe(401);
  });

  it('người phỏng vấn khác trong cùng HĐPV không đọc được bài của tôi (AC6.3.3, AC6.3.5)', async () => {
    await post(body());
    const res = await request(t.app).get(`${API}/panels/P1/candidates/C1/evaluation`).set(auth(token2));
    expect(res.status).toBe(404);
    expect(JSON.stringify(res.body)).not.toContain('4.5');
  });

  it('referable-positions: vị trí ACTIVE trừ vị trí hiện tại; 403 và 404 theo chính sách (AC5.4.2)', async () => {
    const res = await request(t.app).get(`${API}/panels/P1/candidates/C1/referable-positions`).set(auth());
    expect(res.status).toBe(200);
    expect(res.body.items.map((p: { maViTri: string }) => p.maViTri)).toEqual(['VT2']);
    expect(
      (await request(t.app).get(`${API}/panels/PX/candidates/C1/referable-positions`).set(auth())).status,
    ).toBe(403);
    expect(
      (await request(t.app).get(`${API}/panels/P1/candidates/KHONG_CO/referable-positions`).set(auth()))
        .status,
    ).toBe(404);
  });

  it('my-evaluations trả thêm ketLuan và diemTrungBinh, chỉ bài của tôi (AC4.1.11, AC4.1.12)', async () => {
    await post(body({ ketLuan: 'CAN_NHAC' }));
    const mine = await request(t.app).get(`${API}/panels/P1/my-evaluations`).set(auth());
    expect(mine.body.items).toMatchObject([{ maUngVien: 'C1', ketLuan: 'CAN_NHAC', diemTrungBinh: 4.5 }]);
    const theirs = await request(t.app).get(`${API}/panels/P1/my-evaluations`).set(auth(token2));
    expect(theirs.body.items).toEqual([]);
  });

  it('phản hồi không lộ sdt, ngày sinh, giới tính và có no-store (BR2.6, NFR1.14)', async () => {
    await post(body());
    const res = await request(t.app).get(`${API}/panels/P1/candidates/C1/evaluation`).set(auth());
    expect(res.headers['cache-control']).toContain('no-store');
    expect(JSON.stringify(res.body)).not.toMatch(/sdt|ngaySinh|gioiTinh/);
  });
});
