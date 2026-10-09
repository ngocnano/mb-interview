import type { CriterionRow } from './repo.js';

export const KET_LUAN = ['DAT', 'LOAI', 'CAN_NHAC', 'KHAC'] as const;
export type KetLuan = (typeof KET_LUAN)[number];

export interface CompletionInput {
  idempotencyKey: string;
  diem: { maTieuChi: string; diem: number }[];
  nhanXet?: string | null | undefined;
  ketLuan: KetLuan;
  referMaViTri?: string | null | undefined;
  referLyDo?: string | null | undefined;
}

export interface Issue {
  field: string;
  message: string;
}

export const MAX_COMMENT = 2000;
export const MAX_REFER_REASON = 500;

/** Chuỗi chỉ gồm khoảng trắng hoặc rỗng được coi là không có giá trị (BR5.2). */
export function blankToUndefined(v: string | null | undefined): string | undefined {
  const t = v?.trim();
  return t ? t : undefined;
}

/**
 * Kiểm điểm theo thang từng tiêu chí và đủ mọi tiêu chí ACTIVE (BR3.2, BR3.3, BR3.4), cùng kết luận và cấu trúc refer
 * (BR5.1, BR5.2, BR5.4). Hàm thuần, không chạm DB; việc vị trí refer có hợp lệ hay không do service kiểm (BR5.3).
 */
export function validateCompletion(criteria: CriterionRow[], input: CompletionInput): Issue[] {
  const issues: Issue[] = [];
  const byCode = new Map(criteria.map((c) => [c.maTieuChi, c]));
  const seen = new Set<string>();

  for (const s of input.diem) {
    const field = `diem.${s.maTieuChi}`;
    if (seen.has(s.maTieuChi)) {
      issues.push({ field, message: 'Tiêu chí bị gửi trùng' });
      continue;
    }
    seen.add(s.maTieuChi);
    const c = byCode.get(s.maTieuChi);
    if (!c) {
      issues.push({ field, message: 'Tiêu chí không tồn tại hoặc không còn hoạt động' });
      continue;
    }
    if (!Number.isInteger(s.diem) || s.diem < c.diemToiThieu || s.diem > c.diemToiDa) {
      issues.push({ field, message: `Điểm phải là số nguyên từ ${c.diemToiThieu} đến ${c.diemToiDa}` });
    }
  }
  for (const c of criteria) {
    if (!seen.has(c.maTieuChi)) issues.push({ field: `diem.${c.maTieuChi}`, message: 'Chưa có điểm' });
  }
  if (input.nhanXet != null && input.nhanXet.length > MAX_COMMENT) {
    issues.push({ field: 'nhanXet', message: `Nhận xét tối đa ${MAX_COMMENT} ký tự` });
  }

  if (!(KET_LUAN as readonly string[]).includes(input.ketLuan as string)) {
    issues.push({ field: 'ketLuan', message: 'Chưa chọn kết luận hợp lệ (Đạt, Loại, Cân nhắc hoặc Khác)' });
  }
  const referVt = blankToUndefined(input.referMaViTri);
  const referLyDo = blankToUndefined(input.referLyDo);
  if (referVt && input.ketLuan !== 'KHAC') {
    issues.push({
      field: 'referMaViTri',
      message: 'Chỉ được giới thiệu sang vị trí khác khi kết luận là Khác',
    });
  }
  if (referLyDo && !referVt) {
    issues.push({ field: 'referLyDo', message: 'Lý do giới thiệu cần có vị trí giới thiệu' });
  }
  if (referLyDo && referLyDo.length > MAX_REFER_REASON) {
    issues.push({ field: 'referLyDo', message: `Lý do giới thiệu tối đa ${MAX_REFER_REASON} ký tự` });
  }
  return issues;
}
