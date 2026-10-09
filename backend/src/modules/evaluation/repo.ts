import type { Reader, Tx } from '../../db/pool.js';
import { upsertRow, type TableSpec } from '../../db/upsert.js';

export interface CriterionRow {
  maTieuChi: string;
  tenTieuChi: string;
  diemToiThieu: number;
  diemToiDa: number;
  thuTu: number;
}

export type KetLuanValue = 'DAT' | 'LOAI' | 'CAN_NHAC' | 'KHAC';

export interface EvaluationRow {
  evaluationId: string;
  userId: string;
  maHdpv: string;
  maUngVien: string;
  nhanXet: string | null;
  idempotencyKey: string;
  trangThai: 'SUBMITTED';
  submittedAt: Date;
  /** Rỗng với bài hoàn thành từ U1 (BR7.7). */
  ketLuan: KetLuanValue | null;
  referMaViTri: string | null;
  referLyDo: string | null;
  diemTrungBinh: number | null;
}

export interface NewEvaluation {
  evaluationId: string;
  userId: string;
  maHdpv: string;
  maUngVien: string;
  nhanXet: string | null;
  idempotencyKey: string;
  submittedAt: Date;
  ketLuan: KetLuanValue;
  referMaViTri: string | null;
  referLyDo: string | null;
  diemTrungBinh: number;
}

export interface ScoreInput {
  maTieuChi: string;
  diem: number;
}

export async function listActiveCriteria(r: Reader): Promise<CriterionRow[]> {
  return r.query<CriterionRow>(
    `select ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu
       from criterion where trang_thai = 'ACTIVE' order by thu_tu, ma_tieu_chi`,
  );
}

const EVAL_COLS =
  'evaluation_id, user_id, ma_hdpv, ma_ung_vien, nhan_xet, idempotency_key, trang_thai, submitted_at, ket_luan, refer_ma_vi_tri, refer_ly_do, diem_trung_binh from interview_evaluation';

export async function findByKey(
  r: Reader,
  userId: string,
  idempotencyKey: string,
): Promise<EvaluationRow | null> {
  const rows = await r.query<EvaluationRow>(
    'select ' + EVAL_COLS + ' where user_id = :userId and idempotency_key = :idempotencyKey',
    { userId, idempotencyKey },
  );
  return rows[0] ?? null;
}

export async function findByTriple(
  r: Reader,
  userId: string,
  maHdpv: string,
  maUngVien: string,
): Promise<EvaluationRow | null> {
  const rows = await r.query<EvaluationRow>(
    'select ' + EVAL_COLS + ' where user_id = :userId and ma_hdpv = :maHdpv and ma_ung_vien = :maUngVien',
    { userId, maHdpv, maUngVien },
  );
  return rows[0] ?? null;
}

export async function insertEvaluation(tx: Tx, e: NewEvaluation): Promise<void> {
  await tx.execute(
    `insert into interview_evaluation
       (evaluation_id, user_id, ma_hdpv, ma_ung_vien, nhan_xet, idempotency_key, trang_thai, submitted_at,
        ket_luan, refer_ma_vi_tri, refer_ly_do, diem_trung_binh)
     values (:evaluationId, :userId, :maHdpv, :maUngVien, :nhanXet, :idempotencyKey, 'SUBMITTED', :submittedAt,
        :ketLuan, :referMaViTri, :referLyDo, :diemTrungBinh)`,
    {
      evaluationId: e.evaluationId,
      userId: e.userId,
      maHdpv: e.maHdpv,
      maUngVien: e.maUngVien,
      nhanXet: e.nhanXet,
      idempotencyKey: e.idempotencyKey,
      submittedAt: e.submittedAt,
      ketLuan: e.ketLuan,
      referMaViTri: e.referMaViTri,
      referLyDo: e.referLyDo,
      diemTrungBinh: e.diemTrungBinh,
    },
  );
}

export async function insertScores(tx: Tx, evaluationId: string, scores: ScoreInput[]): Promise<void> {
  for (const s of scores) {
    await tx.execute(
      `insert into evaluation_score (evaluation_id, ma_tieu_chi, diem) values (:evaluationId, :maTieuChi, :diem)`,
      { evaluationId, maTieuChi: s.maTieuChi, diem: s.diem },
    );
  }
}

export interface MyEvaluationRow {
  maUngVien: string;
  submittedAt: Date;
  ketLuan: KetLuanValue | null;
  diemTrungBinh: number | null;
}

/** Bài tôi đã hoàn thành trong một HĐPV, kèm kết luận và điểm trung bình đã lưu (BR8.3). */
export async function listMine(r: Reader, userId: string, maHdpv: string): Promise<MyEvaluationRow[]> {
  return r.query<MyEvaluationRow>(
    `select ma_ung_vien, submitted_at, ket_luan, diem_trung_binh from interview_evaluation
      where user_id = :userId and ma_hdpv = :maHdpv order by ma_ung_vien`,
    { userId, maHdpv },
  );
}

export interface DetailScore {
  maTieuChi: string;
  tenTieuChi: string;
  diemToiThieu: number;
  diemToiDa: number;
  diem: number;
}

/** Điểm từng tiêu chí của một phiếu, gồm cả tiêu chí đã ngừng, theo thứ tự cấu hình (BR7.5). */
export async function listScores(r: Reader, evaluationId: string): Promise<DetailScore[]> {
  return r.query<DetailScore>(
    `select s.ma_tieu_chi, c.ten_tieu_chi, c.diem_toi_thieu, c.diem_toi_da, s.diem
       from evaluation_score s join criterion c on c.ma_tieu_chi = s.ma_tieu_chi
      where s.evaluation_id = :evaluationId order by c.thu_tu, s.ma_tieu_chi`,
    { evaluationId },
  );
}

const CRITERION: TableSpec = {
  table: 'criterion',
  key: ['ma_tieu_chi'],
  columns: ['ten_tieu_chi', 'diem_toi_thieu', 'diem_toi_da', 'thu_tu', 'trang_thai'],
};

export async function upsertCriterion(
  tx: Tx,
  c: {
    maTieuChi: string;
    tenTieuChi: string;
    diemToiThieu: number;
    diemToiDa: number;
    thuTu: number;
    trangThai: 'ACTIVE' | 'INACTIVE';
  },
): Promise<'added' | 'updated'> {
  return upsertRow(tx, CRITERION, {
    ma_tieu_chi: c.maTieuChi,
    ten_tieu_chi: c.tenTieuChi,
    diem_toi_thieu: c.diemToiThieu,
    diem_toi_da: c.diemToiDa,
    thu_tu: c.thuTu,
    trang_thai: c.trangThai,
  });
}
