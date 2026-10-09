import pino from 'pino';
import type { Audit } from './audit.js';
import { currentCorrelationId } from './correlation.js';

export type Logger = pino.Logger;

const REDACT = [
  'password',
  'matKhau',
  'token',
  'authorization',
  'sdt',
  'ngaySinh',
  'gioiTinh',
  'nhanXet',
  '*.password',
  '*.matKhau',
  '*.token',
  '*.authorization',
  '*.sdt',
  '*.ngaySinh',
  '*.gioiTinh',
  '*.nhanXet',
];

/** Log JSON một dòng, che trường nhạy cảm, mọi dòng tự mang mã tương quan (OD-1, OD-3). */
export function createLogger(destination?: NodeJS.WritableStream, level = 'info'): Logger {
  return pino(
    {
      level,
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: { level: (label) => ({ level: label }) },
      redact: { paths: REDACT, censor: '[che]' },
      mixin: () => {
        const correlationId = currentCorrelationId();
        return correlationId ? { correlationId } : {};
      },
    },
    destination,
  );
}

/** Kênh kiểm toán riêng (`type=audit`), cùng luồng stdout (OD-4). */
export function createAudit(logger: Logger): Audit {
  return {
    event(event, data = {}) {
      logger.info({ type: 'audit', event, ...data }, 'audit');
    },
  };
}
