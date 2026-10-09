import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import request from 'supertest';
import { parse } from 'yaml';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { buildTestApp, type TestApp } from '../helpers/app.js';
import { TEST_PASSWORD, testHash } from '../helpers/services.js';

// NFR3.1: phản hồi của từng API phải khớp lược đồ trong openapi.yaml.
const doc = parse(readFileSync(new URL('../../openapi.yaml', import.meta.url), 'utf8')) as {
  components: Record<string, unknown>;
};
const ajv = new Ajv({ strict: false, allErrors: true });
addFormats(ajv);

function validator(schemaName: string) {
  return ajv.compile({ components: doc.components, $ref: `#/components/schemas/${schemaName}` });
}
function expectValid(schemaName: string, value: unknown): void {
  const v = validator(schemaName);
  const ok = v(value);
  expect(ok, JSON.stringify(v.errors)).toBe(true);
}

describe('hợp đồng OpenAPI C1 (NFR3.1)', () => {
  let t: TestApp;
  let auth: { Authorization: string };

  beforeAll(async () => {
    t = await buildTestApp();
    const c = await ownerConn();
    await resetData(c);
    await seedMinimal(c);
    await exec(c, `update user_account set password_hash = :h where user_id = 'U1'`, { h: testHash() });
    await exec(
      c,
      `insert into candidate (ma_ung_vien, ten, ma_vi_tri, kinh_nghiem) values ('C2', 'Ứng viên 2', 'VT2', '3 năm')`,
    );
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC2','P1','C2','08:00','08:30','Y')`,
    );
    await c.close();
    const res = await request(t.app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@x.vn', password: TEST_PASSWORD });
    expectValid('LoginResponse', res.body);
    auth = { Authorization: `Bearer ${res.body.token}` };
  });
  afterAll(async () => {
    await t.close();
  });

  it('GET /panels khớp lược đồ PanelSummary', async () => {
    const res = await request(t.app).get('/api/v1/panels').set(auth);
    for (const item of res.body.items) expectValid('PanelSummary', item);
  });

  it('GET candidates và candidate detail khớp CandidateRow và CandidateDetail', async () => {
    const list = await request(t.app).get('/api/v1/panels/P1/candidates').set(auth);
    expectValid('PanelSummary', list.body.panel);
    for (const item of list.body.items) expectValid('CandidateRow', item);
    const detail = await request(t.app).get('/api/v1/panels/P1/candidates/C2').set(auth);
    expectValid('CandidateDetail', detail.body);
  });

  it('GET /criteria khớp Criterion', async () => {
    const res = await request(t.app).get('/api/v1/criteria').set(auth);
    for (const item of res.body.items) expectValid('Criterion', item);
  });

  it('POST evaluation 201 và my-evaluations khớp lược đồ', async () => {
    const res = await request(t.app)
      .post('/api/v1/panels/P1/candidates/C2/evaluation')
      .set(auth)
      .send({
        idempotencyKey: '33333333-3333-4333-8333-333333333333',
        diem: [{ maTieuChi: 'TC1', diem: 5 }],
        ketLuan: 'KHAC',
        referMaViTri: 'VT1',
        referLyDo: 'Hợp vị trí khác',
      });
    expect(res.status).toBe(201);
    expectValid('CompleteEvaluationResponse', res.body);
    const mine = await request(t.app).get('/api/v1/panels/P1/my-evaluations').set(auth);
    for (const item of mine.body.items) expectValid('MyEvaluationSummary', item);
    const detail = await request(t.app).get('/api/v1/panels/P1/candidates/C2/evaluation').set(auth);
    expect(detail.status).toBe(200);
    expectValid('EvaluationDetail', detail.body);
    const refer = await request(t.app).get('/api/v1/panels/P1/candidates/C2/referable-positions').set(auth);
    expect(refer.status).toBe(200);
    for (const p of refer.body.items) expectValid('Position', p);
  });

  it('mọi lỗi khớp lược đồ Error', async () => {
    const e401 = await request(t.app).get('/api/v1/panels');
    const e404 = await request(t.app).get('/api/v1/panels/KHONG/candidates').set(auth);
    const e400 = await request(t.app).post('/api/v1/auth/login').send({});
    for (const r of [e401, e404, e400]) expectValid('Error', r.body);
  });
});
