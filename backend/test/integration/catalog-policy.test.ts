import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../../src/db/pool.js';
import { CatalogPolicy } from '../../src/modules/catalog/policy.js';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { appDb } from '../helpers/services.js';

const caller = { userId: 'U1', employedId: 'E1' };

describe('CatalogPolicy (BR2.1..BR2.3, BR2.10, BR3.5, ADR-004)', () => {
  let db: Db;
  let policy: CatalogPolicy;

  beforeAll(async () => {
    db = await appDb();
    policy = new CatalogPolicy(db);
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
      `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('CN', 'Không xác nhận', 'VT1')`,
    );
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PCN','P1','CN','10:00','10:30','N')`,
    );
    await exec(
      c,
      `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('PD','Nháp', sysdate, 'Online', 'DRAFT')`,
    );
    await exec(
      c,
      `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('PC','Xong', sysdate, 'Online', 'COMPLETED')`,
    );
    await exec(
      c,
      `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('PX','Không được gán', sysdate, 'Online', 'INPROGRESS')`,
    );
    for (const p of ['PD', 'PC']) {
      await exec(c, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PI_${p}', '${p}', 'E1')`);
      await exec(
        c,
        `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC_${p}', '${p}', 'C1', '09:00', '09:30', 'Y')`,
      );
    }
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC_PX','PX','C1','09:00','09:30','Y')`,
    );
    await c.close();
  });

  it('canOpenForScoring cho phép khi được gán, Inprogress, Xác nhận = Y', async () => {
    expect(await policy.canOpenForScoring(caller, 'P1', 'C1')).toEqual({
      ok: true,
      value: { maViTri: 'VT1' },
    });
  });

  it('HĐPV không tồn tại: 404; có tồn tại nhưng không được gán: 403 (BR2.10, BR2.1)', async () => {
    expect(await policy.canOpenForScoring(caller, 'KHONG', 'C1')).toMatchObject({
      ok: false,
      denial: { reason: 'PANEL_NOT_FOUND', httpStatus: 404 },
    });
    expect(await policy.canOpenForScoring(caller, 'PX', 'C1')).toMatchObject({
      ok: false,
      denial: { reason: 'NOT_ASSIGNED', httpStatus: 403 },
    });
  });

  it('mở chấm mới chỉ khi Inprogress; Draft hoặc Completed trả 404 (BR2.2)', async () => {
    expect(await policy.canOpenForScoring(caller, 'PD', 'C1')).toMatchObject({
      ok: false,
      denial: { reason: 'PANEL_NOT_AVAILABLE', httpStatus: 404 },
    });
    expect(await policy.canOpenForScoring(caller, 'PC', 'C1')).toMatchObject({
      ok: false,
      denial: { httpStatus: 404 },
    });
  });

  it('hoàn thành cho phép Inprogress hoặc Completed nhưng không Draft (BR3.5)', async () => {
    expect((await policy.canComplete(caller, 'P1', 'C1')).ok).toBe(true);
    expect((await policy.canComplete(caller, 'PC', 'C1')).ok).toBe(true);
    expect(await policy.canComplete(caller, 'PD', 'C1')).toMatchObject({
      ok: false,
      denial: { httpStatus: 404 },
    });
  });

  it('ứng viên Xác nhận = N hoặc không thuộc HĐPV: 404 (BR2.3)', async () => {
    expect(await policy.canOpenForScoring(caller, 'P1', 'CN')).toMatchObject({
      ok: false,
      denial: { reason: 'CANDIDATE_NOT_CONFIRMED', httpStatus: 404 },
    });
    expect(await policy.canComplete(caller, 'P1', 'CN')).toMatchObject({
      ok: false,
      denial: { httpStatus: 404 },
    });
    expect(await policy.canOpenForScoring(caller, 'P1', 'LA')).toMatchObject({
      ok: false,
      denial: { reason: 'CANDIDATE_NOT_FOUND', httpStatus: 404 },
    });
  });

  it('canViewPanel: được gán và Inprogress', async () => {
    expect((await policy.canViewPanel(caller, 'P1')).ok).toBe(true);
    expect(await policy.canViewPanel(caller, 'PX')).toMatchObject({ ok: false, denial: { httpStatus: 403 } });
    expect(await policy.canViewPanel(caller, 'PD')).toMatchObject({ ok: false, denial: { httpStatus: 404 } });
  });
});
