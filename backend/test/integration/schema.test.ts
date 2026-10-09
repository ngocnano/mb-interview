import type oracledb from 'oracledb';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { appConn, exec, expectOraError, ownerConn, resetData, seedMinimal } from '../helpers/db.js';

describe('lược đồ Oracle (BR3.6, BR3.8, BR4.7, NFR1.10, NFR13.5)', () => {
  let owner: oracledb.Connection;
  let app: oracledb.Connection;

  beforeAll(async () => {
    owner = await ownerConn();
    app = await appConn();
  });
  afterAll(async () => {
    await owner.close();
    await app.close();
  });
  beforeEach(async () => {
    await resetData(owner);
    await seedMinimal(owner);
  });

  const insertEval = (conn: oracledb.Connection, id: string, key: string) =>
    exec(
      conn,
      `insert into interview_evaluation (evaluation_id, user_id, ma_hdpv, ma_ung_vien, idempotency_key, submitted_at)
       values (:id, 'U1', 'P1', 'C1', :key, systimestamp)`,
      { id, key },
    );

  it('email tài khoản là duy nhất', async () => {
    await expectOraError(
      exec(
        owner,
        `insert into user_account (user_id, email, password_hash, employed_id, ho_ten)
         values ('U2', 'a@x.vn', 'h', 'E1', 'Trùng email')`,
      ),
      'ORA-00001',
    );
  });

  it('mỗi (người chấm, HĐPV, ứng viên) chỉ có một phiếu', async () => {
    await insertEval(owner, 'EV1', 'k1');
    await expectOraError(insertEval(owner, 'EV2', 'k2'), 'ORA-00001');
  });

  it('idempotencyKey là duy nhất theo người chấm', async () => {
    await exec(
      owner,
      `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C2', 'Ứng viên 2', 'VT1')`,
    );
    await insertEval(owner, 'EV1', 'k1');
    await expectOraError(
      exec(
        owner,
        `insert into interview_evaluation (evaluation_id, user_id, ma_hdpv, ma_ung_vien, idempotency_key, submitted_at)
         values ('EV2', 'U1', 'P1', 'C2', 'k1', systimestamp)`,
      ),
      'ORA-00001',
    );
  });

  it('khóa ngoại chặn tham chiếu không tồn tại', async () => {
    await expectOraError(
      exec(owner, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C9', 'X', 'KHONG_CO')`),
      'ORA-02291',
    );
  });

  it('chặn giá trị trạng thái và kết luận ngoài danh sách', async () => {
    await expectOraError(
      exec(
        owner,
        `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai)
         values ('P9', 'X', sysdate, 'Online', 'SAI')`,
      ),
      'ORA-02290',
    );
    await expectOraError(
      exec(
        owner,
        `insert into interview_evaluation (evaluation_id, user_id, ma_hdpv, ma_ung_vien, idempotency_key, submitted_at, ket_luan)
         values ('EV3', 'U1', 'P1', 'C1', 'k3', systimestamp, 'LA_LUNG')`,
      ),
      'ORA-02290',
    );
  });

  it('thang tiêu chí phải thỏa 1 <= min < max <= 5 (BR4.7)', async () => {
    await expectOraError(
      exec(
        owner,
        `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu)
         values ('TC9', 'Sai thang', 3, 3, 9)`,
      ),
      'ORA-02290',
    );
  });

  it('giờ phỏng vấn đúng định dạng hh:mm và bắt đầu nhỏ hơn kết thúc (BR4.4)', async () => {
    await exec(
      owner,
      `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C3', 'Ứng viên 3', 'VT1')`,
    );
    await expectOraError(
      exec(
        owner,
        `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan)
         values ('PC9', 'P1', 'C3', '10:00', '09:00', 'Y')`,
      ),
      'ORA-02290',
    );
    await expectOraError(
      exec(
        owner,
        `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan)
         values ('PC8', 'P1', 'C3', '9:00', '09:30', 'Y')`,
      ),
      'ORA-02290',
    );
  });

  it('có các chỉ mục theo PD-3', async () => {
    const res = await owner.execute<[string]>(`select index_name from user_indexes`);
    const names = (res.rows ?? []).map((r) => r[0]);
    for (const n of [
      'IDX_PI_CBQL',
      'IDX_PC_PANEL',
      'IDX_CRITERION_ACTIVE',
      'IDX_EVAL_USER_PANEL',
      'UQ_USER_EMAIL',
      'UQ_EVAL_TRIPLE',
      'UQ_EVAL_IDEM',
    ]) {
      expect(names).toContain(n);
    }
  });

  it('tài khoản ứng dụng chỉ được thêm vào bảng phiếu, không sửa hoặc xóa (NFR1.10)', async () => {
    await insertEval(app, 'EVA', 'ka');
    await expectOraError(
      exec(app, `update interview_evaluation set nhan_xet = 'sửa' where evaluation_id = 'EVA'`),
      'ORA-01031',
    );
    await expectOraError(
      exec(app, `delete from interview_evaluation where evaluation_id = 'EVA'`),
      'ORA-01031',
    );
    await expectOraError(
      exec(
        app,
        `insert into user_account (user_id, email, password_hash, employed_id, ho_ten) values ('UX','b@x.vn','h','E1','X')`,
      ),
      'ORA-01031',
    );
  });
});
