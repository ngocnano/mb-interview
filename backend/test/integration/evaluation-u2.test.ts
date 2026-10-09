import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../../src/db/pool.js';
import { AppError } from '../../src/errors.js';
import { CatalogPolicy } from '../../src/modules/catalog/policy.js';
import type { CompletionInput } from '../../src/modules/evaluation/validation.js';
import { EvaluationService } from '../../src/modules/evaluation/service.js';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { appDb, captureAudit, FakeClock } from '../helpers/services.js';

const caller = { userId: 'U1', employedId: 'E1' };
const other = { userId: 'U2', employedId: 'E2' };
const KEY1 = '11111111-1111-4111-8111-111111111111';
const KEY2 = '22222222-2222-4222-8222-222222222222';

describe('EvaluationService U2: kết luận, refer, điểm trung bình, xem lại (BR5.x, BR6.x, BR7.x)', () => {
  let db: Db;
  let svc: EvaluationService;
  const audit = captureAudit();
  const clock = new FakeClock(new Date('2026-10-09T10:00:00Z'));

  beforeAll(async () => {
    db = await appDb();
  });
  afterAll(async () => {
    await db.close();
  });
  beforeEach(async () => {
    const c = await ownerConn();
    await resetData(c);
    await seedMinimal(c);
    await exec(
      c,
      `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu) values ('TC2','Giao tiếp',1,5,2)`,
    );
    await exec(
      c,
      `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu) values ('TC3','Thang ba',1,3,3)`,
    );
    await exec(
      c,
      `insert into job_position (ma_vi_tri, job, dvql, trang_thai) values ('VT3', 'Đã ngừng', 'Phòng C', 'INACTIVE')`,
    );
    await exec(c, `insert into job_position (ma_vi_tri, job, dvql) values ('VT4', 'Quản trị', 'Phòng D')`);
    await exec(c, `insert into interviewer (employed_id, ten) values ('E2', 'CBQL Hai')`);
    await exec(
      c,
      `insert into user_account (user_id, email, password_hash, employed_id, ho_ten) values ('U2', 'b@x.vn', 'hash', 'E2', 'Người Hai')`,
    );
    await exec(c, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PI2', 'P1', 'E2')`);
    await c.close();
    audit.events.length = 0;
    svc = new EvaluationService({
      db,
      policy: new CatalogPolicy(db),
      audit,
      clock: clock.now,
      criteriaTtlMs: 0,
    });
  });

  // TC1 4/5, TC2 3/5, TC3 2/3: (4 + 3 + 3,3333) / 3 = 3,4444 -> 3,44
  const input = (over: Partial<CompletionInput> = {}): CompletionInput => ({
    idempotencyKey: KEY1,
    diem: [
      { maTieuChi: 'TC1', diem: 4 },
      { maTieuChi: 'TC2', diem: 3 },
      { maTieuChi: 'TC3', diem: 2 },
    ],
    nhanXet: 'Ghi chú',
    ketLuan: 'DAT',
    ...over,
  });
  const expectApp = async (p: Promise<unknown>, status: number): Promise<AppError> => {
    try {
      await p;
    } catch (e) {
      expect((e as AppError).status).toBe(status);
      return e as AppError;
    }
    throw new Error(`mong lỗi ${status}`);
  };
  const stored = async () =>
    db.query<{
      ketLuan: string | null;
      referMaViTri: string | null;
      referLyDo: string | null;
      diemTrungBinh: number | null;
    }>(`select ket_luan, refer_ma_vi_tri, refer_ly_do, diem_trung_binh from interview_evaluation`);

  it('lưu kết luận và tự tính điểm trung bình hai chữ số (BR6.3, AC6.1.14)', async () => {
    const res = await svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'CAN_NHAC' }));
    expect(res).toMatchObject({ ketLuan: 'CAN_NHAC', diemTrungBinh: 3.44, replayed: false });
    expect(await stored()).toEqual([
      { ketLuan: 'CAN_NHAC', referMaViTri: null, referLyDo: null, diemTrungBinh: 3.44 },
    ]);
  });

  it('bỏ qua diemTrungBinh do client gửi (BR6.3, AC6.1.15)', async () => {
    const res = await svc.complete(caller, 'P1', 'C1', { ...input(), diemTrungBinh: 5 } as CompletionInput);
    expect(res.diemTrungBinh).toBe(3.44);
    expect((await stored())[0]?.diemTrungBinh).toBe(3.44);
  });

  it('thiếu kết luận: 400 và không lưu gì (BR5.1, AC6.1.8)', async () => {
    await expectApp(svc.complete(caller, 'P1', 'C1', input({ ketLuan: undefined as never })), 400);
    expect(await stored()).toHaveLength(0);
  });

  it('KHAC kèm refer hợp lệ: lưu vị trí và lý do, ứng viên không đổi vị trí (BR5.5, AC6.1.9)', async () => {
    await svc.complete(
      caller,
      'P1',
      'C1',
      input({ ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'Hợp hơn' }),
    );
    expect(await stored()).toMatchObject([{ ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'Hợp hơn' }]);
    const cand = await db.query<{ maViTri: string }>(
      `select ma_vi_tri from candidate where ma_ung_vien = 'C1'`,
    );
    expect(cand[0]?.maViTri).toBe('VT1');
  });

  it('refer bị từ chối: vị trí trùng, ngừng, không tồn tại, hoặc kết luận không phải KHAC (BR5.2, BR5.3)', async () => {
    for (const referMaViTri of ['VT1', 'VT3', 'KHONG_CO']) {
      await expectApp(svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'KHAC', referMaViTri })), 400);
    }
    await expectApp(svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'LOAI', referMaViTri: 'VT2' })), 400);
    await expectApp(
      svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'KHAC', referLyDo: 'không có vị trí' })),
      400,
    );
    expect(await stored()).toHaveLength(0);
  });

  it('gửi lại cùng khóa trả bản đã lưu kèm kết luận và điểm trung bình, bỏ qua payload khác (BR7.4)', async () => {
    const first = await svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'LOAI' }));
    const again = await svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'DAT' }));
    expect(again).toMatchObject({
      replayed: true,
      evaluationId: first.evaluationId,
      ketLuan: 'LOAI',
      diemTrungBinh: 3.44,
    });
  });

  it('audit có ketLuan và coRefer, không có điểm hay nhận xét (BR8.5)', async () => {
    await svc.complete(
      caller,
      'P1',
      'C1',
      input({ ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'bí mật' }),
    );
    const ev = audit.events.find((e) => e.type === 'evaluation_completed');
    expect(ev?.data).toMatchObject({ ketLuan: 'KHAC', coRefer: true });
    const text = JSON.stringify(ev?.data);
    expect(text).not.toContain('bí mật');
    expect(text).not.toContain('Ghi chú');
    expect(ev?.data).not.toHaveProperty('diem');
  });

  it('listMine trả thêm ketLuan và diemTrungBinh (BR8.3)', async () => {
    await svc.complete(caller, 'P1', 'C1', input({ ketLuan: 'DAT' }));
    const mine = await svc.listMine(caller, 'P1');
    expect(mine).toMatchObject([{ maUngVien: 'C1', ketLuan: 'DAT', diemTrungBinh: 3.44 }]);
  });

  it('getMine trả điểm theo thứ tự tiêu chí, kể cả tiêu chí đã ngừng, kèm refer và điểm trung bình (BR7.5, AC6.3.2)', async () => {
    await svc.complete(
      caller,
      'P1',
      'C1',
      input({ ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'Hợp hơn' }),
    );
    const c = await ownerConn();
    await exec(c, `update criterion set trang_thai = 'INACTIVE' where ma_tieu_chi = 'TC2'`);
    await c.close();
    const d = await svc.getMine(caller, 'P1', 'C1');
    expect(d.diem.map((x) => [x.maTieuChi, x.tenTieuChi, x.diemToiDa, x.diem])).toEqual([
      ['TC1', 'Chuyên môn', 5, 4],
      ['TC2', 'Giao tiếp', 5, 3],
      ['TC3', 'Thang ba', 3, 2],
    ]);
    expect(d).toMatchObject({
      ketLuan: 'KHAC',
      referLyDo: 'Hợp hơn',
      referViTri: { maViTri: 'VT2', job: 'Lập trình' },
      diemTrungBinh: 3.44,
      nhanXet: 'Ghi chú',
      trangThai: 'SUBMITTED',
    });
  });

  it('điểm trung bình đã lưu không đổi khi thang tiêu chí đổi về sau (BR6.4, AC6.1.16)', async () => {
    await svc.complete(caller, 'P1', 'C1', input());
    const c = await ownerConn();
    await exec(c, `update criterion set trang_thai = 'INACTIVE'`);
    await c.close();
    expect((await svc.getMine(caller, 'P1', 'C1')).diemTrungBinh).toBe(3.44);
  });

  it('getMine: chưa có bài thì 404 EVALUATION_NOT_FOUND; người khác không đọc được bài của tôi (AC6.3.3)', async () => {
    const e = await expectApp(svc.getMine(caller, 'P1', 'C1'), 404);
    expect(e.code).toBe('EVALUATION_NOT_FOUND');
    await svc.complete(caller, 'P1', 'C1', input());
    await expectApp(svc.getMine(other, 'P1', 'C1'), 404);
    await expectApp(svc.getMine({ userId: 'U9', employedId: 'LA' }, 'P1', 'C1'), 403);
  });

  it('referablePositions: vị trí ACTIVE trừ vị trí hiện tại, sắp theo job (BR5.6)', async () => {
    const list = await svc.referablePositions(caller, 'P1', 'C1');
    expect(list.map((p) => p.maViTri)).toEqual(['VT2', 'VT4']);
    await expectApp(svc.referablePositions({ userId: 'U9', employedId: 'LA' }, 'P1', 'C1'), 403);
    await expectApp(svc.referablePositions(caller, 'P1', 'KHONG_CO'), 404);
  });

  it('khóa idempotency khác nhưng đã có bài vẫn 409 (BR3.6 còn hiệu lực)', async () => {
    await svc.complete(caller, 'P1', 'C1', input());
    await expectApp(svc.complete(caller, 'P1', 'C1', input({ idempotencyKey: KEY2 })), 409);
  });
});
