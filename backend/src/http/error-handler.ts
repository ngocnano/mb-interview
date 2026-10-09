import type { ErrorRequestHandler, RequestHandler } from 'express';
import { DbUnavailableError } from '../db/errors.js';
import { AppError } from '../errors.js';
import type { Logger } from '../observability/logger.js';

export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', 'Không tìm thấy đường dẫn yêu cầu'));
};

interface BodyParserError extends Error {
  type?: string;
  status?: number;
}

/** Bộ xử lý lỗi cuối: chỉ trả `code`, `message` (và `details`, `correlationId`); stack chỉ vào log (SD-15, NFR1.17). */
export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (err: unknown, _req, res, _next) => {
    const correlationId = res.locals.correlationId as string | undefined;
    let status = 500;
    let code = 'INTERNAL';
    let message = 'Hệ thống gặp lỗi, vui lòng thử lại';
    let details: unknown;

    const bp = err as BodyParserError;
    if (err instanceof AppError) {
      ({ status, code, message, details } = err);
      for (const [k, v] of Object.entries(err.headers ?? {})) res.setHeader(k, v);
    } else if (err instanceof DbUnavailableError) {
      status = 503;
      code = 'DB_UNAVAILABLE';
      message = 'Hệ thống tạm thời không khả dụng, vui lòng thử lại';
      logger.error({ type: 'app', err }, 'Mất kết nối cơ sở dữ liệu');
    } else if (bp?.type === 'entity.too.large') {
      status = 413;
      code = 'PAYLOAD_TOO_LARGE';
      message = 'Dữ liệu gửi lên quá lớn';
    } else if (bp?.type === 'entity.parse.failed') {
      status = 400;
      code = 'VALIDATION_FAILED';
      message = 'Nội dung JSON không hợp lệ';
    } else {
      logger.error({ type: 'app', err }, 'Lỗi không xác định');
    }

    res.status(status).json({
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(correlationId ? { correlationId } : {}),
    });
  };
}
