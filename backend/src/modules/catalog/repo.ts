import type { Reader, Tx } from '../../db/pool.js';
import { upsertRow, type TableSpec } from '../../db/upsert.js';

export type PanelStatus = 'DRAFT' | 'SENT' | 'CONFIRMED' | 'INPROGRESS' | 'COMPLETED';

export interface PanelRow {
  maHdpv: string;
  ten: string;
  diaDiem: string | null;
  ngay: Date;
  hinhThuc: 'Online' | 'Offline';
  trangThai: PanelStatus;
  soUngVienXacNhan: number;
}

export interface PositionInfo {
  maViTri: string;
  job: string;
  dvql: string;
  dvtt1?: string;
  dvtt2?: string;
  dvtt3?: string;
}

export interface CandidateRow {
  maUngVien: string;
  ten: string;
  viTri: PositionInfo;
  tuThoiGian: string;
  denThoiGian: string;
}

export interface PanelCandidateDetail extends CandidateRow {
  xacNhan: 'Y' | 'N';
  kinhNghiem: string | null;
  trinhDo: string | null;
}

const PANEL_SELECT = `select p.ma_hdpv, p.ten, p.dia_diem, p.ngay, p.hinh_thuc, p.trang_thai,
  (select count(*) from panel_candidate pc where pc.ma_hdpv = p.ma_hdpv and pc.xac_nhan = 'Y') as so_ung_vien_xac_nhan
  from interview_panel p`;

/** HĐPV Inprogress mà người dùng được gán, sắp theo ngày rồi mã (BR2.1, BR2.2, BR2.4). */
export async function listAssignedInprogressPanels(r: Reader, employedId: string): Promise<PanelRow[]> {
  return r.query<PanelRow>(
    PANEL_SELECT +
      ` where p.trang_thai = 'INPROGRESS'
        and exists (select 1 from panel_interviewer pi where pi.ma_hdpv = p.ma_hdpv and pi.ma_cbql = :employedId)
        order by p.ngay, p.ma_hdpv`,
    { employedId },
  );
}

export async function findPanel(r: Reader, maHdpv: string): Promise<PanelRow | null> {
  const rows = await r.query<PanelRow>(PANEL_SELECT + ` where p.ma_hdpv = :maHdpv`, { maHdpv });
  return rows[0] ?? null;
}

export async function isAssigned(r: Reader, maHdpv: string, employedId: string): Promise<boolean> {
  const rows = await r.query<{ n: number }>(
    `select count(*) as n from panel_interviewer where ma_hdpv = :maHdpv and ma_cbql = :employedId`,
    { maHdpv, employedId },
  );
  return (rows[0]?.n ?? 0) > 0;
}

interface FlatCandidate {
  maUngVien: string;
  ten: string;
  maViTri: string;
  job: string;
  dvql: string;
  dvtt1: string | null;
  dvtt2: string | null;
  dvtt3: string | null;
  tuThoiGian: string;
  denThoiGian: string;
  xacNhan: 'Y' | 'N';
  kinhNghiem: string | null;
  trinhDo: string | null;
}

const CANDIDATE_SELECT = `select c.ma_ung_vien, c.ten, c.ma_vi_tri, jp.job, jp.dvql, jp.dvtt1, jp.dvtt2, jp.dvtt3,
  pc.tu_thoi_gian, pc.den_thoi_gian, pc.xac_nhan, c.kinh_nghiem, c.trinh_do
  from panel_candidate pc
  join candidate c on c.ma_ung_vien = pc.ma_ung_vien
  join job_position jp on jp.ma_vi_tri = c.ma_vi_tri`;

function position(f: FlatCandidate): PositionInfo {
  const p: PositionInfo = { maViTri: f.maViTri, job: f.job, dvql: f.dvql };
  if (f.dvtt1) p.dvtt1 = f.dvtt1;
  if (f.dvtt2) p.dvtt2 = f.dvtt2;
  if (f.dvtt3) p.dvtt3 = f.dvtt3;
  return p;
}

/** Ứng viên Xác nhận = Y của mọi vị trí, sắp theo giờ bắt đầu rồi mã (BR2.3, BR2.5, BR2.7). */
export async function listConfirmedCandidates(r: Reader, maHdpv: string): Promise<CandidateRow[]> {
  const rows = await r.query<FlatCandidate>(
    CANDIDATE_SELECT +
      ` where pc.ma_hdpv = :maHdpv and pc.xac_nhan = 'Y' order by pc.tu_thoi_gian, c.ma_ung_vien`,
    { maHdpv },
  );
  return rows.map((f) => ({
    maUngVien: f.maUngVien,
    ten: f.ten,
    viTri: position(f),
    tuThoiGian: f.tuThoiGian,
    denThoiGian: f.denThoiGian,
  }));
}

/** Dòng lịch của một ứng viên trong HĐPV, kể cả Xác nhận = N để tầng chính sách quyết định. */
export async function findPanelCandidate(
  r: Reader,
  maHdpv: string,
  maUngVien: string,
): Promise<PanelCandidateDetail | null> {
  const rows = await r.query<FlatCandidate>(
    CANDIDATE_SELECT + ` where pc.ma_hdpv = :maHdpv and pc.ma_ung_vien = :maUngVien`,
    {
      maHdpv,
      maUngVien,
    },
  );
  const f = rows[0];
  if (!f) return null;
  return {
    maUngVien: f.maUngVien,
    ten: f.ten,
    viTri: position(f),
    tuThoiGian: f.tuThoiGian,
    denThoiGian: f.denThoiGian,
    xacNhan: f.xacNhan,
    kinhNghiem: f.kinhNghiem,
    trinhDo: f.trinhDo,
  };
}

// --- Ghi khi nạp dữ liệu (chỉ DataImport gọi, bằng tài khoản chủ lược đồ) ---

const POSITION: TableSpec = {
  table: 'job_position',
  key: ['ma_vi_tri'],
  columns: ['job', 'dvql', 'dvtt1', 'dvtt2', 'dvtt3', 'trang_thai'],
};
const INTERVIEWER: TableSpec = {
  table: 'interviewer',
  key: ['employed_id'],
  columns: ['ten', 'job', 'don_vi', 'email'],
};
const CANDIDATE: TableSpec = {
  table: 'candidate',
  key: ['ma_ung_vien'],
  columns: ['ten', 'ma_vi_tri', 'sdt', 'email', 'ngay_sinh', 'gioi_tinh', 'kinh_nghiem', 'trinh_do'],
};
const PANEL: TableSpec = {
  table: 'interview_panel',
  key: ['ma_hdpv'],
  columns: ['ten', 'dia_diem', 'ngay', 'hinh_thuc', 'da_gui_email', 'trang_thai'],
};
const PANEL_CANDIDATE: TableSpec = {
  table: 'panel_candidate',
  key: ['ma_hdpv', 'ma_ung_vien'],
  columns: ['tu_thoi_gian', 'den_thoi_gian', 'xac_nhan'],
  generated: ['id'],
};
const PANEL_INTERVIEWER: TableSpec = {
  table: 'panel_interviewer',
  key: ['ma_hdpv', 'ma_cbql'],
  columns: ['tu_thoi_gian', 'den_thoi_gian', 'xac_nhan'],
  generated: ['id'],
};

type Row = Record<string, string | number | Date | null | undefined>;
export const upsertPosition = (tx: Tx, row: Row) => upsertRow(tx, POSITION, row);
export const upsertInterviewer = (tx: Tx, row: Row) => upsertRow(tx, INTERVIEWER, row);
export const upsertCandidate = (tx: Tx, row: Row) => upsertRow(tx, CANDIDATE, row);
export const upsertPanel = (tx: Tx, row: Row) => upsertRow(tx, PANEL, row);
export const upsertPanelCandidate = (tx: Tx, row: Row) => upsertRow(tx, PANEL_CANDIDATE, row);
export const upsertPanelInterviewer = (tx: Tx, row: Row) => upsertRow(tx, PANEL_INTERVIEWER, row);

/** Vị trí đang hoạt động trừ vị trí hiện tại của ứng viên, sắp theo job rồi mã (BR5.6). */
export async function listReferablePositions(r: Reader, excludeMaViTri: string): Promise<PositionInfo[]> {
  const rows = await r.query<{
    maViTri: string;
    job: string;
    dvql: string;
    dvtt1: string | null;
    dvtt2: string | null;
    dvtt3: string | null;
  }>(
    `select ma_vi_tri, job, dvql, dvtt1, dvtt2, dvtt3 from job_position
      where trang_thai = 'ACTIVE' and ma_vi_tri <> :excludeMaViTri order by job, ma_vi_tri`,
    { excludeMaViTri },
  );
  return rows.map((x) => toPosition(x));
}

/** Tìm vị trí theo mã, kể cả vị trí đã ngừng, để hiển thị bài cũ (BR7.5). */
export async function findPosition(r: Reader, maViTri: string): Promise<PositionInfo | null> {
  const rows = await r.query<{
    maViTri: string;
    job: string;
    dvql: string;
    dvtt1: string | null;
    dvtt2: string | null;
    dvtt3: string | null;
  }>('select ma_vi_tri, job, dvql, dvtt1, dvtt2, dvtt3 from job_position where ma_vi_tri = :maViTri', {
    maViTri,
  });
  return rows[0] ? toPosition(rows[0]) : null;
}

function toPosition(f: {
  maViTri: string;
  job: string;
  dvql: string;
  dvtt1: string | null;
  dvtt2: string | null;
  dvtt3: string | null;
}): PositionInfo {
  const p: PositionInfo = { maViTri: f.maViTri, job: f.job, dvql: f.dvql };
  if (f.dvtt1) p.dvtt1 = f.dvtt1;
  if (f.dvtt2) p.dvtt2 = f.dvtt2;
  if (f.dvtt3) p.dvtt3 = f.dvtt3;
  return p;
}

export async function existsInterviewer(r: Reader, employedId: string): Promise<boolean> {
  const rows = await r.query(`select 1 as x from interviewer where employed_id = :employedId`, {
    employedId,
  });
  return rows.length > 0;
}
export async function existsPosition(r: Reader, maViTri: string): Promise<boolean> {
  const rows = await r.query(`select 1 as x from job_position where ma_vi_tri = :maViTri`, { maViTri });
  return rows.length > 0;
}
export async function existsCandidate(r: Reader, maUngVien: string): Promise<boolean> {
  const rows = await r.query(`select 1 as x from candidate where ma_ung_vien = :maUngVien`, { maUngVien });
  return rows.length > 0;
}
export async function existsPanel(r: Reader, maHdpv: string): Promise<boolean> {
  const rows = await r.query(`select 1 as x from interview_panel where ma_hdpv = :maHdpv`, { maHdpv });
  return rows.length > 0;
}
