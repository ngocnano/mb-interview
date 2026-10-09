import type { CandidateRow, PanelCandidateDetail, PanelRow, PositionInfo } from '../modules/catalog/repo.js';
import type { CriterionRow, MyEvaluationRow } from '../modules/evaluation/repo.js';
import type { CompletionResult, EvaluationDetail } from '../modules/evaluation/service.js';

/** Chuyển các đối tượng miền sang dạng phản hồi của hợp đồng C1; chỉ chọn trường được phép (SD-5, BR2.6). */

export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function presentPanel(p: PanelRow) {
  return {
    maHdpv: p.maHdpv,
    ten: p.ten,
    ngay: isoDate(p.ngay),
    hinhThuc: p.hinhThuc,
    ...(p.diaDiem ? { diaDiem: p.diaDiem } : {}),
    soUngVienXacNhan: p.soUngVienXacNhan,
  };
}

export function presentCandidateRow(c: CandidateRow) {
  return {
    maUngVien: c.maUngVien,
    ten: c.ten,
    viTri: c.viTri,
    tuThoiGian: c.tuThoiGian,
    denThoiGian: c.denThoiGian,
  };
}

export function presentCandidateDetail(c: PanelCandidateDetail, panel: PanelRow) {
  return {
    ...presentCandidateRow(c),
    ...(c.kinhNghiem ? { kinhNghiem: c.kinhNghiem } : {}),
    ...(c.trinhDo ? { trinhDo: c.trinhDo } : {}),
    panel: presentPanel(panel),
  };
}

export function presentCriterion(c: CriterionRow) {
  return {
    maTieuChi: c.maTieuChi,
    tenTieuChi: c.tenTieuChi,
    diemToiThieu: c.diemToiThieu,
    diemToiDa: c.diemToiDa,
    thuTu: c.thuTu,
  };
}

export function presentCompletion(r: CompletionResult) {
  return {
    evaluationId: r.evaluationId,
    submittedAt: r.submittedAt.toISOString(),
    trangThai: r.trangThai,
    ...(r.ketLuan ? { ketLuan: r.ketLuan } : {}),
    ...(r.diemTrungBinh !== null ? { diemTrungBinh: r.diemTrungBinh } : {}),
  };
}

export function presentPosition(p: PositionInfo) {
  return {
    maViTri: p.maViTri,
    job: p.job,
    dvql: p.dvql,
    ...(p.dvtt1 ? { dvtt1: p.dvtt1 } : {}),
    ...(p.dvtt2 ? { dvtt2: p.dvtt2 } : {}),
    ...(p.dvtt3 ? { dvtt3: p.dvtt3 } : {}),
  };
}

export function presentMyEvaluation(m: MyEvaluationRow) {
  return {
    maUngVien: m.maUngVien,
    submittedAt: m.submittedAt.toISOString(),
    ...(m.ketLuan ? { ketLuan: m.ketLuan } : {}),
    ...(m.diemTrungBinh !== null ? { diemTrungBinh: m.diemTrungBinh } : {}),
  };
}

export function presentEvaluationDetail(e: EvaluationDetail) {
  return {
    evaluationId: e.evaluationId,
    maHdpv: e.maHdpv,
    maUngVien: e.maUngVien,
    diem: e.diem.map((s) => ({
      maTieuChi: s.maTieuChi,
      tenTieuChi: s.tenTieuChi,
      diemToiThieu: s.diemToiThieu,
      diemToiDa: s.diemToiDa,
      diem: s.diem,
    })),
    ...(e.nhanXet ? { nhanXet: e.nhanXet } : {}),
    ...(e.ketLuan ? { ketLuan: e.ketLuan } : {}),
    ...(e.referViTri ? { referViTri: presentPosition(e.referViTri) } : {}),
    ...(e.referLyDo ? { referLyDo: e.referLyDo } : {}),
    ...(e.diemTrungBinh !== null ? { diemTrungBinh: e.diemTrungBinh } : {}),
    submittedAt: e.submittedAt.toISOString(),
    trangThai: e.trangThai,
  };
}
