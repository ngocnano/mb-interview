import oracledb from 'oracledb';
import { mapOracleError } from './errors.js';

export type Bind = string | number | Date | null;
export type Binds = Record<string, Bind>;
export type Row = Record<string, unknown>;

/** Đối tượng chỉ đọc: cả Db lẫn Tx đều thỏa. */
export interface Reader {
  query<T = Row>(sql: string, binds?: Binds): Promise<T[]>;
}
/** Giao dịch đang mở, do `withTransaction` truyền cho module (Q1 = A). */
export interface Tx extends Reader {
  execute(sql: string, binds?: Binds): Promise<{ rowsAffected: number }>;
}
export interface Db extends Reader {
  withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

export interface DbOptions {
  user: string;
  password: string;
  host: string;
  port: number;
  service: string;
  /** Lược đồ sở hữu bảng (tài khoản ứng dụng đọc qua lược đồ của chủ). */
  currentSchema?: string;
  poolMin: number;
  poolMax: number;
  queueTimeoutMs: number;
  callTimeoutMs: number;
}

function camelKey(k: string): string {
  return k.toLowerCase().replace(/_([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
}

function camelRow<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[camelKey(k)] = v;
  return out as T;
}

async function runQuery<T>(conn: oracledb.Connection, sql: string, binds: Binds): Promise<T[]> {
  try {
    const res = await conn.execute<Record<string, unknown>>(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    return (res.rows ?? []).map((r) => camelRow<T>(r));
  } catch (err) {
    throw mapOracleError(err);
  }
}

export async function createDb(opts: DbOptions): Promise<Db> {
  let pool: oracledb.Pool;
  try {
    pool = await oracledb.createPool({
      user: opts.user,
      password: opts.password,
      connectString: `${opts.host}:${opts.port}/${opts.service}`,
      poolMin: opts.poolMin,
      poolMax: opts.poolMax,
      queueTimeout: opts.queueTimeoutMs,
      poolPingInterval: 30,
    });
  } catch (err) {
    throw mapOracleError(err);
  }

  async function acquire(): Promise<oracledb.Connection> {
    let conn: oracledb.Connection;
    try {
      conn = await pool.getConnection();
    } catch (err) {
      throw mapOracleError(err);
    }
    try {
      conn.callTimeout = opts.callTimeoutMs;
      if (opts.currentSchema) {
        // Tên lược đồ lấy từ cấu hình (không phải đầu vào người dùng) và đã lọc ký tự.
        const schema = opts.currentSchema.replace(/[^A-Za-z0-9_$#]/g, '');
        await conn.execute('alter session set current_schema = ' + schema);
      }
    } catch (err) {
      await conn.close().catch(() => undefined);
      throw mapOracleError(err);
    }
    return conn;
  }

  return {
    async query<T = Row>(sql: string, binds: Binds = {}): Promise<T[]> {
      const conn = await acquire();
      try {
        return await runQuery<T>(conn, sql, binds);
      } finally {
        await conn.close().catch(() => undefined);
      }
    },

    async withTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
      const conn = await acquire();
      const tx: Tx = {
        query: <R = Row>(sql: string, binds: Binds = {}) => runQuery<R>(conn, sql, binds),
        async execute(sql, binds = {}) {
          try {
            const res = await conn.execute(sql, binds, { autoCommit: false });
            return { rowsAffected: res.rowsAffected ?? 0 };
          } catch (err) {
            throw mapOracleError(err);
          }
        },
      };
      try {
        const result = await fn(tx);
        await conn.commit();
        return result;
      } catch (err) {
        await conn.rollback().catch(() => undefined);
        throw mapOracleError(err);
      } finally {
        await conn.close().catch(() => undefined);
      }
    },

    async ping(): Promise<boolean> {
      try {
        const conn = await acquire();
        try {
          await conn.execute('select 1 from dual');
          return true;
        } finally {
          await conn.close().catch(() => undefined);
        }
      } catch {
        return false;
      }
    },

    async close(): Promise<void> {
      await pool.close(0).catch(() => undefined);
    },
  };
}
