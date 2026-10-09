import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '../../src/db/pool.js';
import { runCleanup, startCleanup } from '../../src/jobs/cleanup.js';
import { exec, ownerConn, resetData } from '../helpers/db.js';
import { appDb, ownerDb } from '../helpers/services.js';

describe('công việc dọn LoginThrottle (SC-6, NFR13.13)', () => {
  let db: Db;
  let owner: Db;
  const now = new Date('2026-10-09T10:00:00Z');

  beforeAll(async () => {
    db = await appDb();
    owner = await ownerDb();
  });
  afterAll(async () => {
    await db.close();
    await owner.close();
  });
  beforeEach(async () => {
    const c = await ownerConn();
    await resetData(c);
    const at = (days: number) => new Date(now.getTime() - days * 86_400_000);
    await exec(
      c,
      `insert into login_throttle (email, so_lan_sai, khoa_den, lan_sai_cuoi) values ('cu@x.vn', 5, :k, :l)`,
      { k: at(2), l: at(2) },
    );
    await exec(
      c,
      `insert into login_throttle (email, so_lan_sai, lan_sai_cuoi) values ('cu-khong-khoa@x.vn', 2, :l)`,
      { l: at(3) },
    );
    await exec(
      c,
      `insert into login_throttle (email, so_lan_sai, khoa_den, lan_sai_cuoi) values ('dang-khoa@x.vn', 5, :k, :l)`,
      { k: new Date(now.getTime() + 600_000), l: new Date(now.getTime() - 60_000) },
    );
    await exec(c, `insert into login_throttle (email, so_lan_sai, lan_sai_cuoi) values ('moi@x.vn', 1, :l)`, {
      l: at(0),
    });
    await c.close();
  });

  it('xóa dòng hết khóa quá 1 ngày, giữ dòng đang khóa và dòng mới', async () => {
    const removed = await runCleanup(db, now);
    expect(removed).toBe(2);
    const left = await db.query<{ email: string }>(`select email from login_throttle order by email`);
    expect(left.map((r) => r.email)).toEqual(['dang-khoa@x.vn', 'moi@x.vn']);
  });

  it('startCleanup chạy ngay khi khởi động và có thể dừng', async () => {
    const warns: unknown[] = [];
    const job = startCleanup({ db, clock: () => now, intervalMs: 3_600_000, onError: (e) => warns.push(e) });
    await job.firstRun;
    job.stop();
    expect(warns).toHaveLength(0);
    expect(await db.query(`select 1 from login_throttle`)).toHaveLength(2);
  });

  it('lỗi khi dọn chỉ được báo, không làm sập tiến trình', async () => {
    const broken = { ...db, withTransaction: () => Promise.reject(new Error('DB hỏng')) } as unknown as Db;
    const errors: unknown[] = [];
    const job = startCleanup({
      db: broken,
      clock: () => now,
      intervalMs: 3_600_000,
      onError: (e) => errors.push(e),
    });
    await job.firstRun;
    job.stop();
    expect(errors).toHaveLength(1);
  });
});
