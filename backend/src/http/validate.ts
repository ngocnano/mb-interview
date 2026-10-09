import { z } from 'zod';
import { AppError } from '../errors.js';
import { KET_LUAN } from '../modules/evaluation/validation.js';

/** Kiểm dữ liệu vào bằng lược đồ zod; lỗi thành 400 VALIDATION_FAILED kèm danh sách trường (NFR1.9, SD-7). */
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const details = result.error.issues.map((i) => ({
    field: i.path.map(String).join('.') || '(thân yêu cầu)',
    message: i.message,
  }));
  throw new AppError(400, 'VALIDATION_FAILED', 'Dữ liệu không hợp lệ', details);
}

export const loginBody = z.object({
  email: z.string().min(1).max(255).pipe(z.email()),
  password: z.string().min(1).max(128),
});

export const completeBody = z.object({
  idempotencyKey: z.uuid(),
  diem: z
    .array(z.object({ maTieuChi: z.string().min(1).max(20), diem: z.number() }))
    .min(1)
    .max(50),
  nhanXet: z.string().max(2000).nullish(),
  // Bắt buộc từ U2 (BR5.1). Trường diemTrungBinh nếu client gửi sẽ bị lược bỏ ở đây (BR6.3).
  ketLuan: z.enum(KET_LUAN),
  referMaViTri: z.string().max(50).nullish(),
  referLyDo: z.string().max(1000).nullish(),
});

export const panelParams = z.object({ maHdpv: z.string().min(1).max(50) });
export const candidateParams = panelParams.extend({ maUngVien: z.string().min(1).max(50) });
