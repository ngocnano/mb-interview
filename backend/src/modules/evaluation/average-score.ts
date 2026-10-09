export interface ScoreTerm {
  diem: number;
  /** diemToiDa của tiêu chí, từ 1 đến 5. */
  max: number;
}

export interface AverageScore {
  /** Điểm trung bình nhân 100, làm tròn nửa lên: giá trị lưu ở DB (BR6.2). */
  stored100: number;
  /** Điểm hiển thị nhân 10, làm tròn nửa lên từ stored100. */
  display10: number;
}

/** Mẫu số chung của 1..5 để tính hoàn toàn bằng số nguyên, giống hệt bản Dart (BR6.2, ADR-003). */
const COMMON = 60;

/**
 * Trung bình cộng không trọng số của các điểm, mỗi điểm quy về thang 5 bằng diem * 5 / max (BR6.1).
 * Hàm thuần, không dùng số dấu phẩy động để quyết định làm tròn. Trả null khi không có điểm nào.
 */
export function averageScore(scores: readonly ScoreTerm[]): AverageScore | null {
  if (scores.length === 0) return null;
  let sum = 0;
  for (const s of scores) {
    if (!Number.isInteger(s.diem) || !Number.isInteger(s.max) || s.max < 1 || s.max > 5 || s.diem < 0) {
      throw new RangeError(`Điểm hoặc thang không hợp lệ: ${s.diem}/${s.max}`);
    }
    sum += s.diem * 5 * (COMMON / s.max);
  }
  const n = scores.length;
  const stored100 = Math.floor((200 * sum + COMMON * n) / (2 * COMMON * n));
  const display10 = Math.floor((stored100 + 5) / 10);
  return { stored100, display10 };
}

/** Đổi stored100 sang số thập phân hai chữ số để lưu ở cột NUMBER(4,2). */
export function storedToDecimal(stored100: number): number {
  return stored100 / 100;
}
