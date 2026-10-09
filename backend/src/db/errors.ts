// Lỗi miền ánh xạ từ lỗi Oracle (RD-5, SC-5). Module nghiệp vụ không phụ thuộc mã lỗi ORA trực tiếp.

export class DbUnavailableError extends Error {
  constructor(cause: unknown) {
    super('Cơ sở dữ liệu tạm thời không khả dụng', { cause });
    this.name = 'DbUnavailableError';
  }
}

export class UniqueViolationError extends Error {
  /** Tên ràng buộc, viết hoa, không kèm tên lược đồ (ví dụ UQ_EVAL_TRIPLE). */
  readonly constraint: string;
  constructor(constraint: string, cause: unknown) {
    super(`Vi phạm ràng buộc duy nhất ${constraint}`, { cause });
    this.name = 'UniqueViolationError';
    this.constraint = constraint;
  }
}

const UNAVAILABLE =
  /DPY-6005|DPY-4011|DPY-4001|DPY-4024|DPY-1001|NJS-040|NJS-500|NJS-503|ORA-12541|ORA-12514|ORA-12170|ORA-12543|ORA-12537|ORA-03113|ORA-03114|ORA-03135|ORA-01033|ORA-01034|ORA-01089|ECONNREFUSED|ETIMEDOUT|ECONNRESET|queue timeout|call timeout/i;

export function mapOracleError(err: unknown): unknown {
  if (err instanceof DbUnavailableError || err instanceof UniqueViolationError) return err;
  const message = err instanceof Error ? err.message : String(err);
  if (/ORA-00001/.test(message)) {
    const m = /\((?:[A-Z0-9_$#]+\.)?([A-Z0-9_$#]+)\)/.exec(message);
    return new UniqueViolationError(m?.[1] ?? 'UNKNOWN', err);
  }
  if (UNAVAILABLE.test(message)) return new DbUnavailableError(err);
  return err;
}
