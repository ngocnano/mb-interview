import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { averageScore, storedToDecimal } from '../../src/modules/evaluation/average-score.js';

interface Example {
  name: string;
  scores: { diem: number; max: number }[];
  stored100: number | null;
  display10: number | null;
}

// Tệp ví dụ dùng chung với app Dart (BR6.6, ADR-003): không có bản sao.
const shared = JSON.parse(
  readFileSync(new URL('../../../shared/average-score-examples.json', import.meta.url), 'utf8'),
) as { examples: Example[] };

describe('averageScore (BR6.1, BR6.2, BR6.6)', () => {
  it('có ít nhất 6 ví dụ dùng chung', () => {
    expect(shared.examples.length).toBeGreaterThanOrEqual(6);
  });

  for (const ex of shared.examples) {
    it(`ví dụ dùng chung: ${ex.name}`, () => {
      const r = averageScore(ex.scores);
      if (ex.stored100 === null) {
        expect(r).toBeNull();
      } else {
        expect(r).toEqual({ stored100: ex.stored100, display10: ex.display10 });
      }
    });
  }

  it('storedToDecimal đổi stored100 sang số hai chữ số thập phân', () => {
    expect(storedToDecimal(367)).toBe(3.67);
    expect(storedToDecimal(420)).toBe(4.2);
  });

  it('từ chối thang ngoài 1..5 hoặc điểm không nguyên', () => {
    expect(() => averageScore([{ diem: 3, max: 6 }])).toThrow();
    expect(() => averageScore([{ diem: 3.5, max: 5 }])).toThrow();
  });
});
