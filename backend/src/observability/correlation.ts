import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

const store = new AsyncLocalStorage<string>();

export const CORRELATION_HEADER = 'X-Correlation-Id';
const VALID = /^[A-Za-z0-9._-]{1,64}$/;

export function currentCorrelationId(): string | undefined {
  return store.getStore();
}

/** Lấy mã tương quan từ client hoặc sinh mới, trả lại trong header và giữ trong ngữ cảnh bất đồng bộ (OD-1). */
export function correlation(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header(CORRELATION_HEADER);
  const id = incoming && VALID.test(incoming) ? incoming : randomUUID();
  res.setHeader(CORRELATION_HEADER, id);
  res.locals.correlationId = id;
  store.run(id, next);
}
