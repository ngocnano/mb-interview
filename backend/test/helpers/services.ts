import bcrypt from 'bcryptjs';
import type { Audit } from '../../src/observability/audit.js';
import { createDb, type Db } from '../../src/db/pool.js';

export interface AuditEvent {
  type: string;
  data: Record<string, unknown>;
}

export function captureAudit(): Audit & { events: AuditEvent[] } {
  const events: AuditEvent[] = [];
  return {
    events,
    event(type: string, data: Record<string, unknown> = {}) {
      events.push({ type, data });
    },
  };
}

export async function appDb(): Promise<Db> {
  return createDb({
    user: process.env.DB_APP_USER!,
    password: process.env.DB_APP_PASSWORD!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    service: process.env.DB_SERVICE!,
    currentSchema: process.env.DB_OWNER_USER,
    poolMin: 1,
    poolMax: 4,
    queueTimeoutMs: 5000,
    callTimeoutMs: 8000,
  });
}

export async function ownerDb(): Promise<Db> {
  return createDb({
    user: process.env.DB_OWNER_USER!,
    password: process.env.DB_OWNER_PASSWORD!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    service: process.env.DB_SERVICE!,
    poolMin: 1,
    poolMax: 4,
    queueTimeoutMs: 5000,
    callTimeoutMs: 8000,
  });
}

export const TEST_PASSWORD = 'matkhau-thu-nghiem';
export const testHash = (): string => bcrypt.hashSync(TEST_PASSWORD, 4);

export class FakeClock {
  constructor(private t: Date) {}
  now = (): Date => new Date(this.t.getTime());
  advanceMs(ms: number): void {
    this.t = new Date(this.t.getTime() + ms);
  }
}
