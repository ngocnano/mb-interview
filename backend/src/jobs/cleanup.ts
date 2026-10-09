import type { Db } from '../db/pool.js';
import { deleteStaleThrottles } from '../modules/identity/repo.js';

const DAY_MS = 86_400_000;

/** Xóa dòng đếm đăng nhập sai đã hết khóa và không có lần sai nào trong 1 ngày (SC-6). Trả số dòng đã xóa. */
export async function runCleanup(db: Db, now: Date): Promise<number> {
  const cutoff = new Date(now.getTime() - DAY_MS);
  return db.withTransaction((tx) => deleteStaleThrottles(tx, cutoff));
}

export interface CleanupOptions {
  db: Db;
  clock: () => Date;
  intervalMs: number;
  onError: (err: unknown) => void;
}

/** Chạy một lần khi khởi động rồi lặp theo chu kỳ; lỗi chỉ được báo, không làm sập tiến trình. */
export function startCleanup(o: CleanupOptions): { firstRun: Promise<void>; stop: () => void } {
  const tick = async (): Promise<void> => {
    try {
      await runCleanup(o.db, o.clock());
    } catch (err) {
      o.onError(err);
    }
  };
  const firstRun = tick();
  const timer = setInterval(() => void tick(), o.intervalMs);
  timer.unref();
  return { firstRun, stop: () => clearInterval(timer) };
}
