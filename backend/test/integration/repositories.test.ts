import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Db } from '../../src/db/pool.js';
import * as identity from '../../src/modules/identity/repo.js';
import * as catalog from '../../src/modules/catalog/repo.js';
import * as evaluation from '../../src/modules/evaluation/repo.js';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';

describe('repository (BR2.4, BR2.5, BR3.9, SD-6)', () => {
  let app: Db;
  let owner: Db;

  beforeAll(async () => {
    const base = {
      host: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT),
      service: process.env.DB_SERVICE!,
      poolMin: 1,
      poolMax: 3,
      queueTimeoutMs: 5000,
      callTimeoutMs: 8000,
    };
    app = await createDb({
      ...base,
      user: process.env.DB_APP_USER!,
      password: process.env.DB_APP_PASSWORD!,
      currentSchema: process.env.DB_OWNER_USER,
    });
    owner = await createDb({
      ...base,
      user: process.env.DB_OWNER_USER!,
      password: process.env.DB_OWNER_PASSWORD!,
    });
  });
  afterAll(async () => {
    await app.close();
    await owner.close();
  });
  beforeEach(async () => {
    const c = await ownerConn();
    await resetData(c);
    await seedMinimal(c);
    // Thêm dữ liệu để kiểm sắp xếp và lọc
    await exec(c, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C2', 'Ứng viên 2', 'VT2')`);
    await exec(c, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C3', 'Ứng viên 3', 'VT1')`);
    await exec(c, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C4', 'Ứng viên 4', 'VT1')`);
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC2','P1','C2','08:00','08:30','Y')`,
    );
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC3','P1','C3','09:00','09:30','Y')`,
    );
    await exec(
      c,
      `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan) values ('PC4','P1','C4','07:00','07:30','N')`,
    );
    await exec(
      c,
      `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('P0','Cũ hơn', trunc(sysdate)-1, 'Offline', 'INPROGRESS')`,
    );
    await exec(
      c,
      `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai) values ('P2','Nháp', trunc(sysdate), 'Online', 'DRAFT')`,
    );
    await exec(c, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PI0','P0','E1')`);
    await exec(c, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PI2','P2','E1')`);
    await c.close();
  });

  it('catalog: chỉ liệt kê HĐPV Inprogress được gán, sắp theo ngày rồi mã (BR2.2, BR2.4)', async () => {
    const rows = await catalog.listAssignedInprogressPanels(app, 'E1');
    expect(rows.map((r) => r.maHdpv)).toEqual(['P0', 'P1']);
    expect(rows[1]?.soUngVienXacNhan).toBe(3); // P1 có C1, C2, C3 xác nhận Y và C4 là N
  });

  it('catalog: ứng viên xác nhận Y của mọi vị trí, sắp theo giờ rồi mã (BR2.3, BR2.5)', async () => {
    const rows = await catalog.listConfirmedCandidates(app, 'P1');
    expect(rows.map((r) => r.maUngVien)).toEqual(['C2', 'C1', 'C3']);
    expect(rows[0]?.viTri.maViTri).toBe('VT2');
    expect(rows[0]).not.toHaveProperty('sdt');
  });

  it('catalog: phân biệt HĐPV không tồn tại, không được gán, trạng thái (BR2.10)', async () => {
    expect(await catalog.findPanel(app, 'KHONG')).toBeNull();
    expect((await catalog.findPanel(app, 'P2'))?.trangThai).toBe('DRAFT');
    expect(await catalog.isAssigned(app, 'P1', 'E1')).toBe(true);
    expect(await catalog.isAssigned(app, 'P1', 'E_LA')).toBe(false);
  });

  it('catalog: findPanelCandidate trả cả dòng xacNhan = N để tầng chính sách quyết định', async () => {
    expect((await catalog.findPanelCandidate(app, 'P1', 'C4'))?.xacNhan).toBe('N');
    expect(await catalog.findPanelCandidate(app, 'P1', 'KHONG')).toBeNull();
  });

  it('identity: tìm tài khoản theo email chuẩn hóa và theo userId', async () => {
    const byEmail = await identity.findAccountByEmail(app, 'a@x.vn');
    expect(byEmail?.userId).toBe('U1');
    expect((await identity.findAccountById(app, 'U1'))?.employedId).toBe('E1');
    expect(await identity.findAccountByEmail(app, 'khong@x.vn')).toBeNull();
  });

  it('identity: bộ đếm đăng nhập sai ghi, đọc, xóa và dọn hết hạn', async () => {
    const now = new Date('2026-10-09T10:00:00Z');
    await app.withTransaction(async (tx) => {
      await identity.upsertThrottle(tx, { email: 'a@x.vn', soLanSai: 3, khoaDen: null, lanSaiCuoi: now });
    });
    expect((await identity.getThrottle(app, 'a@x.vn'))?.soLanSai).toBe(3);
    await app.withTransaction(async (tx) => {
      await identity.upsertThrottle(tx, {
        email: 'a@x.vn',
        soLanSai: 5,
        khoaDen: new Date(now.getTime() + 900000),
        lanSaiCuoi: now,
      });
    });
    expect((await identity.getThrottle(app, 'a@x.vn'))?.khoaDen).toBeInstanceOf(Date);
    const removed = await app.withTransaction((tx) =>
      identity.deleteStaleThrottles(tx, new Date(now.getTime() + 3 * 86400000)),
    );
    expect(removed).toBe(1);
    expect(await identity.getThrottle(app, 'a@x.vn')).toBeNull();
  });

  it('evaluation: tiêu chí ACTIVE theo thứ tự', async () => {
    const c = await ownerConn();
    await exec(
      c,
      `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu, trang_thai) values ('TC0','Đầu',1,5,0,'ACTIVE')`,
    );
    await exec(
      c,
      `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu, trang_thai) values ('TCX','Ngừng',1,5,2,'INACTIVE')`,
    );
    await c.close();
    const rows = await evaluation.listActiveCriteria(app);
    expect(rows.map((r) => r.maTieuChi)).toEqual(['TC0', 'TC1']);
  });

  it('evaluation: ghi phiếu và điểm trong một giao dịch, đọc theo khóa và theo bộ ba (BR3.9)', async () => {
    await app.withTransaction(async (tx) => {
      await evaluation.insertEvaluation(tx, {
        evaluationId: 'EV1',
        userId: 'U1',
        maHdpv: 'P1',
        maUngVien: 'C1',
        nhanXet: 'Tốt',
        idempotencyKey: 'key-1',
        submittedAt: new Date('2026-10-09T10:00:00Z'),
        ketLuan: 'DAT',
        referMaViTri: null,
        referLyDo: null,
        diemTrungBinh: 4,
      });
      await evaluation.insertScores(tx, 'EV1', [{ maTieuChi: 'TC1', diem: 4 }]);
    });
    expect((await evaluation.findByKey(app, 'U1', 'key-1'))?.evaluationId).toBe('EV1');
    expect((await evaluation.findByTriple(app, 'U1', 'P1', 'C1'))?.idempotencyKey).toBe('key-1');
    expect(await evaluation.findByKey(app, 'U1', 'khac')).toBeNull();
    const mine = await evaluation.listMine(app, 'U1', 'P1');
    expect(mine.map((m) => m.maUngVien)).toEqual(['C1']);
  });

  it('evaluation: lỗi ở dòng điểm thì phiếu cũng bị hoàn tác', async () => {
    await expect(
      app.withTransaction(async (tx) => {
        await evaluation.insertEvaluation(tx, {
          evaluationId: 'EV2',
          userId: 'U1',
          maHdpv: 'P1',
          maUngVien: 'C1',
          nhanXet: null,
          idempotencyKey: 'key-2',
          submittedAt: new Date(),
          ketLuan: 'DAT',
          referMaViTri: null,
          referLyDo: null,
          diemTrungBinh: 3,
        });
        await evaluation.insertScores(tx, 'EV2', [{ maTieuChi: 'KHONG_CO', diem: 3 }]);
      }),
    ).rejects.toThrow();
    expect(await evaluation.findByKey(app, 'U1', 'key-2')).toBeNull();
  });

  it('owner: upsert tiêu chí thêm rồi cập nhật, không nhân đôi (BR4.1)', async () => {
    const first = await owner.withTransaction((tx) =>
      evaluation.upsertCriterion(tx, {
        maTieuChi: 'TC9',
        tenTieuChi: 'Mới',
        diemToiThieu: 1,
        diemToiDa: 5,
        thuTu: 9,
        trangThai: 'ACTIVE',
      }),
    );
    const second = await owner.withTransaction((tx) =>
      evaluation.upsertCriterion(tx, {
        maTieuChi: 'TC9',
        tenTieuChi: 'Đổi tên',
        diemToiThieu: 1,
        diemToiDa: 5,
        thuTu: 9,
        trangThai: 'ACTIVE',
      }),
    );
    expect([first, second]).toEqual(['added', 'updated']);
    const rows = await owner.query(`select ten_tieu_chi from criterion where ma_tieu_chi = 'TC9'`);
    expect(rows).toEqual([{ tenTieuChi: 'Đổi tên' }]);
  });
});
