import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Db, Tx } from '../../src/db/pool.js';
import { DbUnavailableError } from '../../src/db/errors.js';
import { runImport, type ImportReport } from '../../src/import/importer.js';
import { resetData } from '../helpers/db.js';
import { ownerDb } from '../helpers/services.js';

function validFile() {
  return {
    tieuChi: [
      { maTieuChi: 'TC1', tenTieuChi: 'Chuyên môn', diemToiThieu: 1, diemToiDa: 5, thuTu: 1 },
      { maTieuChi: 'TC2', tenTieuChi: 'Giao tiếp', thuTu: 2 },
    ],
    viTri: [
      { maViTri: 'VT1', job: 'Kế toán', dvql: 'Phòng A' },
      { maViTri: 'VT2', job: 'Lập trình', dvql: 'Phòng B' },
    ],
    cbql: [{ employedId: 'E1', ten: 'CBQL Một', email: 'e1@x.vn' }],
    taiKhoan: [{ email: 'A@X.vn', matKhau: 'mat-khau-dai-du', employedId: 'E1', hoTen: 'Người Một' }],
    ungVien: [
      { ma: 'C1', ten: 'Ứng viên 1', maViTri: 'VT1', ngaySinh: '01/02/1995' },
      { ma: 'C2', ten: 'Ứng viên 2', maViTri: 'VT2' },
    ],
    hdpv: [{ ma: 'P1', ten: 'HĐPV 1', ngay: '09/10/2026', hinhThuc: 'Online', trangThai: 'Inprogress' }],
    hdpvUngVien: [
      { maHdpv: 'P1', maUngVien: 'C1', tuThoiGian: '09:00', denThoiGian: '09:30', xacNhan: 'Y' },
      { maHdpv: 'P1', maUngVien: 'C2', tuThoiGian: '10:00', denThoiGian: '10:30', xacNhan: 'N' },
    ],
    hdpvCbql: [{ maHdpv: 'P1', maCbql: 'E1' }],
  };
}

const total = (r: ImportReport, key: 'added' | 'updated') => r.groups.reduce((s, g) => s + g[key], 0);
const errorsOf = (r: ImportReport, group: string) => r.groups.find((g) => g.group === group)?.errors ?? [];

describe('DataImport (BR4.1..BR4.9, NFR2.7, NFR3.3)', () => {
  let db: Db;
  beforeAll(async () => {
    db = await ownerDb();
  });
  afterAll(async () => {
    await db.close();
  });
  beforeEach(async () => {
    await resetData();
  });

  const run = (file: unknown, d: Db = db) => runImport(d, file, { bcryptCost: 4 });

  it('nạp tệp hợp lệ: thêm mọi bản ghi, 0 lỗi, mật khẩu được băm bcrypt (AC7.1.1, AC7.3.1)', async () => {
    const report = await run(validFile());
    expect(total(report, 'added')).toBe(2 + 2 + 1 + 1 + 2 + 1 + 2 + 1);
    expect(report.groups.every((g) => g.errors.length === 0)).toBe(true);
    const [acc] = await db.query<{ passwordHash: string; email: string }>(
      `select password_hash, email from user_account`,
    );
    expect(acc?.email).toBe('a@x.vn');
    expect(await bcrypt.compare('mat-khau-dai-du', acc!.passwordHash)).toBe(true);
    const crit = await db.query<{ diemToiDa: number; trangThai: string }>(
      `select diem_toi_da, trang_thai from criterion where ma_tieu_chi = 'TC2'`,
    );
    expect(crit[0]).toEqual({ diemToiDa: 5, trangThai: 'ACTIVE' });
  });

  it('chạy lại cùng tệp không nhân đôi, chỉ cập nhật (AC7.1.2, AC7.3.3)', async () => {
    await run(validFile());
    const again = await run(validFile());
    expect(total(again, 'added')).toBe(0);
    expect(total(again, 'updated')).toBe(12);
    expect(await db.query(`select 1 from user_account`)).toHaveLength(1);
    expect(await db.query(`select 1 from panel_candidate`)).toHaveLength(2);
  });

  it('nạp lại với tệp ít bản ghi hơn không xóa bản ghi cũ (BR4.9)', async () => {
    await run(validFile());
    const smaller = { ...validFile(), hdpvUngVien: [], ungVien: [], hdpvCbql: [], hdpv: [] };
    await run(smaller);
    expect(await db.query(`select 1 from candidate`)).toHaveLength(2);
    expect(await db.query(`select 1 from interview_panel`)).toHaveLength(1);
  });

  it('dòng tham chiếu không tồn tại bị bỏ qua và báo cáo kèm số dòng, các dòng còn lại vẫn nạp (AC7.1.3, AC7.1.8, AC7.3.2)', async () => {
    const f = validFile();
    f.ungVien.push({ ma: 'C3', ten: 'Sai vị trí', maViTri: 'KHONG_CO' } as never);
    f.hdpvUngVien.push({
      maHdpv: 'P1',
      maUngVien: 'KHONG',
      tuThoiGian: '11:00',
      denThoiGian: '11:30',
      xacNhan: 'Y',
    });
    f.taiKhoan.push({ email: 'b@x.vn', matKhau: 'mat-khau-dai-du', employedId: 'LA', hoTen: 'X' });
    const r = await run(f);
    expect(errorsOf(r, 'ungVien')).toEqual([expect.objectContaining({ line: 3 })]);
    expect(errorsOf(r, 'hdpvUngVien')).toEqual([expect.objectContaining({ line: 3 })]);
    expect(errorsOf(r, 'taiKhoan')).toEqual([expect.objectContaining({ line: 2 })]);
    expect(await db.query(`select 1 from candidate`)).toHaveLength(2);
  });

  it('trạng thái HĐPV ngoài 5 giá trị bị từ chối; "Xác nhận" được chấp nhận (AC7.1.4)', async () => {
    const f = validFile();
    f.hdpv.push({ ma: 'P2', ten: 'Sai', ngay: '09/10/2026', hinhThuc: 'Online', trangThai: 'Dang chay' });
    f.hdpv.push({
      ma: 'P3',
      ten: 'Đã xác nhận',
      ngay: '09/10/2026',
      hinhThuc: 'Online',
      trangThai: 'Xác nhận',
    });
    const r = await run(f);
    expect(errorsOf(r, 'hdpv')).toHaveLength(1);
    const rows = await db.query<{ trangThai: string }>(
      `select trang_thai from interview_panel where ma_hdpv = 'P3'`,
    );
    expect(rows[0]?.trangThai).toBe('CONFIRMED');
  });

  it('giờ sai định dạng hoặc bắt đầu không nhỏ hơn kết thúc bị từ chối (AC7.1.5)', async () => {
    const f = validFile();
    f.hdpvUngVien.push({
      maHdpv: 'P1',
      maUngVien: 'C1',
      tuThoiGian: '10:00',
      denThoiGian: '09:00',
      xacNhan: 'Y',
    });
    f.hdpvUngVien.push({
      maHdpv: 'P1',
      maUngVien: 'C2',
      tuThoiGian: '9h00',
      denThoiGian: '10:00',
      xacNhan: 'Y',
    });
    const r = await run(f);
    expect(errorsOf(r, 'hdpvUngVien')).toHaveLength(2);
  });

  it('thang tiêu chí sai hoặc trùng mã trong tệp bị từ chối (AC7.2.3, BR4.7)', async () => {
    const f = validFile();
    f.tieuChi.push({ maTieuChi: 'TC3', tenTieuChi: 'Sai thang', diemToiThieu: 3, diemToiDa: 3 } as never);
    f.tieuChi.push({ maTieuChi: 'TC1', tenTieuChi: 'Trùng mã' } as never);
    const r = await run(f);
    expect(errorsOf(r, 'tieuChi')).toHaveLength(2);
    expect(await db.query(`select 1 from criterion`)).toHaveLength(2);
  });

  it('mật khẩu ngắn hơn 8 ký tự bị từ chối và báo cáo không chứa mật khẩu (BR4.8, BR1.5)', async () => {
    const f = validFile();
    f.taiKhoan.push({ email: 'c@x.vn', matKhau: 'ngan', employedId: 'E1', hoTen: 'Y' });
    const r = await run(f);
    expect(errorsOf(r, 'taiKhoan')).toHaveLength(1);
    expect(JSON.stringify(r)).not.toContain('ngan"');
    expect(JSON.stringify(r)).not.toContain('mat-khau-dai-du');
  });

  it('mất kết nối giữa chừng thì hoàn tác toàn bộ và ném lỗi (AC7.1.6, BR4.5)', async () => {
    let calls = 0;
    const flaky: Db = {
      ...db,
      query: db.query.bind(db),
      withTransaction: <T>(fn: (tx: Tx) => Promise<T>) =>
        db.withTransaction((tx) =>
          fn({
            query: tx.query.bind(tx),
            execute: async (sql, binds) => {
              if (++calls > 6) throw new DbUnavailableError(new Error('mất kết nối'));
              return tx.execute(sql, binds);
            },
          }),
        ),
    };
    await expect(run(validFile(), flaky)).rejects.toBeInstanceOf(DbUnavailableError);
    expect(await db.query(`select 1 from criterion`)).toHaveLength(0);
    expect(await db.query(`select 1 from job_position`)).toHaveLength(0);
  });

  it('tệp sai cấu trúc (không phải đối tượng) bị từ chối ngay', async () => {
    await expect(run('khong phai doi tuong')).rejects.toThrow(/cấu trúc/);
    expect(await db.query(`select 1 from criterion`)).toHaveLength(0);
  });

  it('AC7.3.4: tài khoản có EmployedID trùng Mã CBQL của HĐPV Inprogress thấy HĐPV đó', async () => {
    await run(validFile());
    const rows = await db.query(
      `select p.ma_hdpv from interview_panel p join panel_interviewer pi on pi.ma_hdpv = p.ma_hdpv
        join user_account u on u.employed_id = pi.ma_cbql where u.email = 'a@x.vn' and p.trang_thai = 'INPROGRESS'`,
    );
    expect(rows).toHaveLength(1);
  });
});
