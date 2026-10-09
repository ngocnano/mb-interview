import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../../src/db/pool.js';
import { AppError } from '../../src/errors.js';
import { CatalogPolicy } from '../../src/modules/catalog/policy.js';
import { EvaluationService } from '../../src/modules/evaluation/service.js';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { appDb, captureAudit, FakeClock } from '../helpers/services.js';

const caller = { userId: 'U1', employedId: 'E1' };
const KEY1 = '11111111-1111-4111-8111-111111111111';
const KEY2 = '22222222-2222-4222-8222-222222222222';

describe('EvaluationService (BR3.2..BR3.9, RD-4, SC-5)', () => {
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
      `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu, trang_thai) values ('TCX','Đã ngừng',1,5,3,'INACTIVE')`,
    );
    await exec(c, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C2', 'Ứng viên 2', 'VT1')`);
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC2','P1','C2','10:00','10:30','Y')`,
    );
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

  const good = (key = KEY1) => ({
    idempotencyKey: key,
    diem: [
      { maTieuChi: 'TC1', diem: 4 },
      { maTieuChi: 'TC2', diem: 5 },
    ],
    nhanXet: 'Tốt',
    ketLuan: 'DAT' as const,
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

  it('listCriteria trả tiêu chí ACTIVE theo thứ tự (BR3.1)', async () => {
    const rows = await svc.listCriteria();
    expect(rows.map((r) => r.maTieuChi)).toEqual(['TC1', 'TC2']);
  });

  it('hoàn thành hợp lệ: lưu phiếu và điểm, trả 201 dạng created (BR3.9)', async () => {
    const res = await svc.complete(caller, 'P1', 'C1', good());
    expect(res.replayed).toBe(false);
    expect(res.trangThai).toBe('SUBMITTED');
    const scores = await db.query(
      `select ma_tieu_chi, diem from evaluation_score where evaluation_id = :id order by ma_tieu_chi`,
      { id: res.evaluationId },
    );
    expect(scores).toEqual([
      { maTieuChi: 'TC1', diem: 4 },
      { maTieuChi: 'TC2', diem: 5 },
    ]);
    expect(audit.events.map((e) => e.type)).toContain('evaluation_completed');
  });

  it('gửi lại cùng idempotencyKey và cùng cặp: trả bản đã lưu, không tạo thêm (BR3.7)', async () => {
    const first = await svc.complete(caller, 'P1', 'C1', good());
    const again = await svc.complete(caller, 'P1', 'C1', good());
    expect(again.replayed).toBe(true);
    expect(again.evaluationId).toBe(first.evaluationId);
    expect(await db.query(`select 1 from interview_evaluation`)).toHaveLength(1);
    expect(audit.events.map((e) => e.type)).toContain('evaluation_replayed');
  });

  it('khóa mới cho cặp đã có phiếu: 409 và không tạo bản ghi (BR3.6)', async () => {
    await svc.complete(caller, 'P1', 'C1', good());
    const e = await expectApp(svc.complete(caller, 'P1', 'C1', good(KEY2)), 409);
    expect(e.message).toBe('Bạn đã hoàn thành đánh giá cho ứng viên này');
    expect(await db.query(`select 1 from interview_evaluation`)).toHaveLength(1);
  });

  it('khóa idempotency đã dùng cho ứng viên khác: 409 và không lộ phiếu kia (BR3.7)', async () => {
    await svc.complete(caller, 'P1', 'C1', good());
    await expectApp(svc.complete(caller, 'P1', 'C2', good(KEY1)), 409);
  });

  it('hai request đồng thời cho cùng cặp: đúng một phiếu (SC-5, NFR13.12)', async () => {
    const results = await Promise.allSettled([
      svc.complete(caller, 'P1', 'C1', good(KEY1)),
      svc.complete(caller, 'P1', 'C1', good(KEY2)),
    ]);
    const ok = results.filter((r) => r.status === 'fulfilled');
    const rej = results.filter((r) => r.status === 'rejected') as PromiseRejectedResult[];
    expect(ok).toHaveLength(1);
    expect(rej).toHaveLength(1);
    expect((rej[0]!.reason as AppError).status).toBe(409);
    expect(await db.query(`select 1 from interview_evaluation`)).toHaveLength(1);
  });

  it('thiếu điểm, mã lạ, tiêu chí ngừng, trùng mã: 400 kèm danh sách trường và không lưu (BR3.3)', async () => {
    const miss = await expectApp(
      svc.complete(caller, 'P1', 'C1', { ...good(), diem: [{ maTieuChi: 'TC1', diem: 3 }] }),
      400,
    );
    expect(JSON.stringify(miss.details)).toContain('TC2');
    await expectApp(
      svc.complete(caller, 'P1', 'C1', { ...good(), diem: [...good().diem, { maTieuChi: 'LA', diem: 3 }] }),
      400,
    );
    await expectApp(
      svc.complete(caller, 'P1', 'C1', { ...good(), diem: [...good().diem, { maTieuChi: 'TCX', diem: 3 }] }),
      400,
    );
    await expectApp(
      svc.complete(caller, 'P1', 'C1', { ...good(), diem: [...good().diem, { maTieuChi: 'TC1', diem: 3 }] }),
      400,
    );
    expect(await db.query(`select 1 from interview_evaluation`)).toHaveLength(0);
  });

  it('điểm phải là số nguyên trong thang (BR3.2)', async () => {
    for (const bad of [6, 0, 3.5, -1]) {
      await expectApp(
        svc.complete(caller, 'P1', 'C1', {
          ...good(),
          diem: [
            { maTieuChi: 'TC1', diem: bad },
            { maTieuChi: 'TC2', diem: 3 },
          ],
        }),
        400,
      );
    }
  });

  it('nhận xét tối đa 2000 ký tự, để trống vẫn được (BR3.4)', async () => {
    await expectApp(svc.complete(caller, 'P1', 'C1', { ...good(), nhanXet: 'a'.repeat(2001) }), 400);
    const res = await svc.complete(caller, 'P1', 'C2', { ...good(KEY2), nhanXet: undefined });
    expect(res.replayed).toBe(false);
    const edge = await svc.complete({ ...caller }, 'P1', 'C2', { ...good(KEY2), nhanXet: 'a'.repeat(2000) });
    expect(edge.replayed).toBe(true);
  });

  it('không có tiêu chí ACTIVE thì không cho chấm (BR3.1)', async () => {
    const c = await ownerConn();
    await exec(c, `update criterion set trang_thai = 'INACTIVE'`);
    await c.close();
    await expectApp(svc.complete(caller, 'P1', 'C1', good()), 400);
  });

  it('chính sách chặn: ứng viên Xác nhận = N hoặc HĐPV Draft thì 404, không tạo phiếu (BR3.5)', async () => {
    const c = await ownerConn();
    await exec(c, `update panel_candidate set xac_nhan = 'N' where id = 'PC2'`);
    await c.close();
    await expectApp(svc.complete(caller, 'P1', 'C2', good()), 404);
    await expectApp(svc.complete({ userId: 'U1', employedId: 'LA' }, 'P1', 'C1', good()), 403);
    expect(await db.query(`select 1 from interview_evaluation`)).toHaveLength(0);
  });

  it('listMine trả các bài tôi đã hoàn thành trong HĐPV (BR2.11)', async () => {
    await svc.complete(caller, 'P1', 'C1', good());
    const mine = await svc.listMine(caller, 'P1');
    expect(mine.map((m) => m.maUngVien)).toEqual(['C1']);
  });

  it('không có API sửa hoặc xóa trên service (BR3.8)', () => {
    expect(Object.getOwnPropertyNames(EvaluationService.prototype)).not.toEqual(
      expect.arrayContaining(['update', 'delete', 'edit', 'remove']),
    );
  });
});
