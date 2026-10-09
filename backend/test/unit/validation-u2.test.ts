import { describe, expect, it } from 'vitest';
import { validateCompletion, type CompletionInput } from '../../src/modules/evaluation/validation.js';

const criteria = [{ maTieuChi: 'TC1', tenTieuChi: 'Chuyên môn', diemToiThieu: 1, diemToiDa: 5, thuTu: 1 }];
const base: CompletionInput = {
  idempotencyKey: '11111111-1111-4111-8111-111111111111',
  diem: [{ maTieuChi: 'TC1', diem: 4 }],
  ketLuan: 'DAT',
};
const fields = (input: CompletionInput) => validateCompletion(criteria, input).map((i) => i.field);

describe('validateCompletion: kết luận và refer (BR5.1, BR5.2, BR5.4)', () => {
  it('hợp lệ với từng kết luận', () => {
    for (const ketLuan of ['DAT', 'LOAI', 'CAN_NHAC', 'KHAC'] as const) {
      expect(fields({ ...base, ketLuan })).toEqual([]);
    }
  });

  it('thiếu hoặc sai kết luận bị báo ở trường ketLuan', () => {
    expect(fields({ ...base, ketLuan: undefined as never })).toContain('ketLuan');
    expect(fields({ ...base, ketLuan: 'LA_LUNG' as never })).toContain('ketLuan');
  });

  it('refer chỉ khi kết luận là KHAC', () => {
    expect(fields({ ...base, ketLuan: 'DAT', referMaViTri: 'VT2' })).toContain('referMaViTri');
    expect(fields({ ...base, ketLuan: 'LOAI', referLyDo: 'x', referMaViTri: 'VT2' })).toContain(
      'referMaViTri',
    );
    expect(fields({ ...base, ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'Hợp hơn' })).toEqual([]);
  });

  it('lý do refer cần có vị trí refer và tối đa 500 ký tự', () => {
    expect(fields({ ...base, ketLuan: 'KHAC', referLyDo: 'Có lý do nhưng không có vị trí' })).toContain(
      'referLyDo',
    );
    expect(fields({ ...base, ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'a'.repeat(501) })).toContain(
      'referLyDo',
    );
    expect(fields({ ...base, ketLuan: 'KHAC', referMaViTri: 'VT2', referLyDo: 'a'.repeat(500) })).toEqual([]);
  });

  it('chuỗi chỉ gồm khoảng trắng được coi là rỗng', () => {
    expect(fields({ ...base, ketLuan: 'DAT', referMaViTri: '   ', referLyDo: '  ' })).toEqual([]);
  });

  it('nhận xét tùy chọn với mọi kết luận (AC5.3.3)', () => {
    expect(fields({ ...base, ketLuan: 'LOAI', nhanXet: '' })).toEqual([]);
  });
});
