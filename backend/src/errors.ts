/** Lỗi nghiệp vụ có mã HTTP; bộ xử lý lỗi cuối của vỏ HTTP chuyển thành `{ code, message }` (SD-15). */
export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly headers?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const unauthorized = (message = 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn') =>
  new AppError(401, 'UNAUTHENTICATED', message);
