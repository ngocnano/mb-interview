import bcrypt from 'bcryptjs';
import type { Db, Tx } from '../db/pool.js';
import * as catalog from '../modules/catalog/repo.js';
import * as evaluation from '../modules/evaluation/repo.js';
import * as identity from '../modules/identity/repo.js';
import { normalizeEmail } from '../modules/identity/service.js';

export interface ImportError {
  line: number;
  field?: string;
  reason: string;
}
export interface GroupReport {
  group: string;
  added: number;
  updated: number;
  errors: ImportError[];
}
export interface ImportReport {
  groups: GroupReport[];
}
export interface ImportOptions {
  bcryptCost: number;
}

type Obj = Record<string, unknown>;

const STATUS_MAP: Record<string, catalog.PanelStatus> = {
  draft: 'DRAFT',
  sent: 'SENT',
  'xác nhận': 'CONFIRMED',
  inprogress: 'INPROGRESS',
  completed: 'COMPLETED',
};
const TIME = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

class RowError extends Error {
  constructor(
    readonly field: string | undefined,
    reason: string,
  ) {
    super(reason);
  }
}

const fail = (field: string | undefined, reason: string): never => {
  throw new RowError(field, reason);
};

function str(row: Obj, field: string, opts: { required?: boolean; max: number }): string | null {
  const v = row[field];
  if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
    if (opts.required) fail(field, `Thiếu trường bắt buộc ${field}`);
    return null;
  }
  if (typeof v !== 'string' && typeof v !== 'number') fail(field, `${field} phải là chuỗi`);
  const s = String(v).trim();
  if (s.length > opts.max) fail(field, `${field} dài quá ${opts.max} ký tự`);
  return s;
}

function parseDate(row: Obj, field: string, required: boolean): Date | null {
  const s = str(row, field, { required, max: 10 });
  if (s === null) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return fail(field, `${field} phải có dạng dd/mm/yyyy`);
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) {
    return fail(field, `${field} không phải ngày hợp lệ`);
  }
  return date;
}

function time(row: Obj, field: string, required: boolean): string | null {
  const s = str(row, field, { required, max: 5 });
  if (s === null) return null;
  if (!TIME.test(s)) return fail(field, `${field} phải có dạng HH:mm`);
  return s;
}

function oneOf<T extends string>(row: Obj, field: string, allowed: readonly T[], dflt: T | null): T {
  const s = str(row, field, { required: dflt === null, max: 20 });
  if (s === null) return dflt as T;
  const found = allowed.find((a) => a.toLowerCase() === s.toLowerCase());
  if (!found) return fail(field, `${field} phải là một trong ${allowed.join(', ')}`);
  return found;
}

function timeRange(row: Obj, required: boolean): { from: string | null; to: string | null } {
  const from = time(row, 'tuThoiGian', required);
  const to = time(row, 'denThoiGian', required);
  if (from !== null && to !== null && from >= to)
    fail('tuThoiGian', 'Từ thời gian phải nhỏ hơn Đến thời gian');
  return { from, to };
}

function asRows(file: Obj, key: string): Obj[] {
  const v = file[key];
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((r) => r === null || typeof r !== 'object' || Array.isArray(r))) {
    throw new Error(`Sai cấu trúc tệp nạp: nhóm ${key} phải là danh sách đối tượng`);
  }
  return v as Obj[];
}

/**
 * Nạp dữ liệu theo C6 trong MỘT giao dịch (BR4.1, ADR-007). Dòng lỗi được bỏ qua và ghi vào báo cáo (BR4.2..BR4.8);
 * lỗi DB bất kỳ làm hoàn tác toàn bộ và được ném ra ngoài (BR4.5). Không xóa bản ghi nào (BR4.9).
 */
export async function runImport(db: Db, file: unknown, opts: ImportOptions): Promise<ImportReport> {
  if (file === null || typeof file !== 'object' || Array.isArray(file)) {
    throw new Error('Sai cấu trúc tệp nạp: phải là một đối tượng JSON');
  }
  const f = file as Obj;
  const groups = {
    tieuChi: asRows(f, 'tieuChi'),
    viTri: asRows(f, 'viTri'),
    cbql: asRows(f, 'cbql'),
    taiKhoan: asRows(f, 'taiKhoan'),
    ungVien: asRows(f, 'ungVien'),
    hdpv: asRows(f, 'hdpv'),
    hdpvUngVien: asRows(f, 'hdpvUngVien'),
    hdpvCbql: asRows(f, 'hdpvCbql'),
  };

  return db.withTransaction(async (tx) => {
    const reports: GroupReport[] = [];

    async function group(
      name: string,
      rows: Obj[],
      handle: (row: Obj, index: number) => Promise<'added' | 'updated'>,
    ): Promise<void> {
      const rep: GroupReport = { group: name, added: 0, updated: 0, errors: [] };
      for (const [i, row] of rows.entries()) {
        try {
          rep[await handle(row, i)]++;
        } catch (err) {
          if (err instanceof RowError) {
            rep.errors.push({ line: i + 1, ...(err.field ? { field: err.field } : {}), reason: err.message });
          } else {
            throw err; // lỗi DB: hoàn tác toàn bộ
          }
        }
      }
      reports.push(rep);
    }

    const seenCriteria = new Set<string>();
    await group('tieuChi', groups.tieuChi, async (r, i) => {
      const ma = str(r, 'maTieuChi', { required: true, max: 20 })!;
      if (seenCriteria.has(ma)) fail('maTieuChi', `Mã tiêu chí ${ma} bị trùng trong tệp`);
      const min = Number(r.diemToiThieu ?? 1);
      const max = Number(r.diemToiDa ?? 5);
      if (!Number.isInteger(min) || !Number.isInteger(max) || min < 1 || min >= max || max > 5) {
        fail('diemToiDa', 'Thang điểm phải thỏa 1 ≤ điểm tối thiểu < điểm tối đa ≤ 5');
      }
      const thuTu = Number(r.thuTu ?? i + 1);
      if (!Number.isInteger(thuTu)) fail('thuTu', 'thuTu phải là số nguyên');
      const res = await evaluation.upsertCriterion(tx, {
        maTieuChi: ma,
        tenTieuChi: str(r, 'tenTieuChi', { required: true, max: 200 })!,
        diemToiThieu: min,
        diemToiDa: max,
        thuTu,
        trangThai: oneOf(r, 'trangThai', ['ACTIVE', 'INACTIVE'] as const, 'ACTIVE'),
      });
      seenCriteria.add(ma);
      return res;
    });

    await group('viTri', groups.viTri, (r) =>
      catalog.upsertPosition(tx, {
        ma_vi_tri: str(r, 'maViTri', { required: true, max: 50 }),
        job: str(r, 'job', { required: true, max: 200 }),
        dvql: str(r, 'dvql', { required: true, max: 200 }),
        dvtt1: str(r, 'dvtt1', { max: 200 }),
        dvtt2: str(r, 'dvtt2', { max: 200 }),
        dvtt3: str(r, 'dvtt3', { max: 200 }),
        trang_thai: oneOf(r, 'trangThai', ['ACTIVE', 'INACTIVE'] as const, 'ACTIVE'),
      }),
    );

    await group('cbql', groups.cbql, async (r) => {
      const email = str(r, 'email', { required: true, max: 255 })!;
      if (!EMAIL.test(email)) fail('email', 'Email không đúng định dạng');
      return catalog.upsertInterviewer(tx, {
        employed_id: str(r, 'employedId', { required: true, max: 50 }),
        ten: str(r, 'ten', { required: true, max: 200 }),
        job: str(r, 'job', { max: 200 }),
        don_vi: str(r, 'donVi', { max: 200 }),
        email,
      });
    });

    await group('taiKhoan', groups.taiKhoan, async (r) => {
      const email = normalizeEmail(str(r, 'email', { required: true, max: 255 })!);
      if (!EMAIL.test(email)) fail('email', 'Email không đúng định dạng');
      const pw = str(r, 'matKhau', { required: true, max: 128 })!;
      if (pw.length < MIN_PASSWORD) fail('matKhau', `Mật khẩu phải có tối thiểu ${MIN_PASSWORD} ký tự`);
      const employedId = str(r, 'employedId', { required: true, max: 50 })!;
      if (!(await catalog.existsInterviewer(tx, employedId))) {
        fail('employedId', `EmployedID ${employedId} không khớp CBQL nào`);
      }
      return identity.upsertAccount(tx, {
        email,
        passwordHash: await bcrypt.hash(pw, opts.bcryptCost),
        employedId,
        hoTen: str(r, 'hoTen', { max: 200 }) ?? employedId,
        trangThai: oneOf(r, 'trangThai', ['ACTIVE', 'LOCKED'] as const, 'ACTIVE'),
      });
    });

    await group('ungVien', groups.ungVien, async (r) => {
      const maViTri = str(r, 'maViTri', { required: true, max: 50 })!;
      if (!(await catalog.existsPosition(tx, maViTri))) fail('maViTri', `Vị trí ${maViTri} không tồn tại`);
      return catalog.upsertCandidate(tx, {
        ma_ung_vien: str(r, 'ma', { required: true, max: 50 }),
        ten: str(r, 'ten', { required: true, max: 200 }),
        ma_vi_tri: maViTri,
        sdt: str(r, 'sdt', { max: 30 }),
        email: str(r, 'email', { max: 255 }),
        ngay_sinh: parseDate(r, 'ngaySinh', false),
        gioi_tinh: str(r, 'gioiTinh', { max: 20 }),
        kinh_nghiem: str(r, 'kinhNghiem', { max: 1000 }),
        trinh_do: str(r, 'trinhDo', { max: 200 }),
      });
    });

    await group('hdpv', groups.hdpv, async (r) => {
      const raw = str(r, 'trangThai', { required: true, max: 20 })!.normalize('NFC').toLowerCase();
      const status = STATUS_MAP[raw];
      if (!status) fail('trangThai', 'Trạng thái phải là Draft, Sent, Xác nhận, Inprogress hoặc Completed');
      return catalog.upsertPanel(tx, {
        ma_hdpv: str(r, 'ma', { required: true, max: 50 }),
        ten: str(r, 'ten', { required: true, max: 200 }),
        dia_diem: str(r, 'diaDiem', { max: 300 }),
        ngay: parseDate(r, 'ngay', true),
        hinh_thuc: oneOf(r, 'hinhThuc', ['Online', 'Offline'] as const, 'Offline'),
        da_gui_email: oneOf(r, 'daGuiEmail', ['Y', 'N'] as const, 'N') === 'Y' ? 1 : 0,
        trang_thai: status ?? null,
      });
    });

    await group('hdpvUngVien', groups.hdpvUngVien, async (r) => {
      const maHdpv = str(r, 'maHdpv', { required: true, max: 50 })!;
      const maUngVien = str(r, 'maUngVien', { required: true, max: 50 })!;
      if (!(await catalog.existsPanel(tx, maHdpv))) fail('maHdpv', `HĐPV ${maHdpv} không tồn tại`);
      if (!(await catalog.existsCandidate(tx, maUngVien)))
        fail('maUngVien', `Ứng viên ${maUngVien} không tồn tại`);
      const t = timeRange(r, true);
      return catalog.upsertPanelCandidate(tx, {
        ma_hdpv: maHdpv,
        ma_ung_vien: maUngVien,
        tu_thoi_gian: t.from,
        den_thoi_gian: t.to,
        // Thiếu Xác nhận thì coi là N để ứng viên không hiện ra khi chưa được xác nhận (BR2.3).
        xac_nhan: oneOf(r, 'xacNhan', ['Y', 'N'] as const, 'N'),
      });
    });

    await group('hdpvCbql', groups.hdpvCbql, async (r) => {
      const maHdpv = str(r, 'maHdpv', { required: true, max: 50 })!;
      const maCbql = str(r, 'maCbql', { required: true, max: 50 })!;
      if (!(await catalog.existsPanel(tx, maHdpv))) fail('maHdpv', `HĐPV ${maHdpv} không tồn tại`);
      if (!(await catalog.existsInterviewer(tx, maCbql))) fail('maCbql', `CBQL ${maCbql} không tồn tại`);
      const t = timeRange(r, false);
      const xn = str(r, 'xacNhan', { max: 1 });
      return catalog.upsertPanelInterviewer(tx, {
        ma_hdpv: maHdpv,
        ma_cbql: maCbql,
        tu_thoi_gian: t.from,
        den_thoi_gian: t.to,
        xac_nhan: xn === null ? null : oneOf(r, 'xacNhan', ['Y', 'N'] as const, null),
      });
    });

    return { groups: reports };
  });
}

export type { Tx };
