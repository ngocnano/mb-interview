import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDb, type Db, type DbOptions } from '../../src/db/pool.js';
import { DbUnavailableError, UniqueViolationError } from '../../src/db/errors.js';
import { ownerConn, resetData, seedMinimal } from '../helpers/db.js';

function opts(over: Partial<DbOptions> = {}): DbOptions {
  return {
    user: process.env.DB_APP_USER!,
    password: process.env.DB_APP_PASSWORD!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    service: process.env.DB_SERVICE!,
    currentSchema: process.env.DB_OWNER_USER,
    poolMin: 1,
    poolMax: 3,
    queueTimeoutMs: 5000,
    callTimeoutMs: 8000,
    ...over,
  };
}

describe('lớp truy cập DB (RD-3, RD-5, PD-1)', () => {
  let db: Db;

  beforeAll(async () => {
    const owner = await ownerConn();
    await resetData(owner);
    await seedMinimal(owner);
    await owner.close();
    db = await createDb(opts());
  });
  afterAll(async () => {
    await db.close();
  });
  beforeEach(async () => {
    await db.withTransaction(async (tx) => {
      await tx.execute(`delete from login_throttle`);
    });
  });

  it('trả hàng với khóa camelCase', async () => {
    const rows = await db.query<{ maHdpv: string; trangThai: string }>(
      `select ma_hdpv, trang_thai from interview_panel where ma_hdpv = :id`,
      { id: 'P1' },
    );
    expect(rows).toEqual([{ maHdpv: 'P1', trangThai: 'INPROGRESS' }]);
  });

  it('withTransaction commit khi thành công', async () => {
    await db.withTransaction(async (tx) => {
      await tx.execute(`insert into login_throttle (email, so_lan_sai) values (:e, 1)`, { e: 'x@x.vn' });
    });
    const rows = await db.query(`select email from login_throttle where email = :e`, { e: 'x@x.vn' });
    expect(rows).toHaveLength(1);
  });

  it('withTransaction hoàn tác khi hàm ném lỗi', async () => {
    await expect(
      db.withTransaction(async (tx) => {
        await tx.execute(`insert into login_throttle (email, so_lan_sai) values (:e, 1)`, { e: 'y@x.vn' });
        throw new Error('hỏng giữa chừng');
      }),
    ).rejects.toThrow('hỏng giữa chừng');
    const rows = await db.query(`select email from login_throttle where email = :e`, { e: 'y@x.vn' });
    expect(rows).toHaveLength(0);
  });

  it('ánh xạ ORA-00001 sang UniqueViolationError kèm tên ràng buộc', async () => {
    await db.withTransaction(async (tx) => {
      await tx.execute(`insert into login_throttle (email) values (:e)`, { e: 'z@x.vn' });
    });
    const err = await db
      .withTransaction(async (tx) => {
        await tx.execute(`insert into login_throttle (email) values (:e)`, { e: 'z@x.vn' });
      })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(UniqueViolationError);
    expect((err as UniqueViolationError).constraint).toBe('PK_LOGIN_THROTTLE');
  });

  it('ping trả true khi DB sẵn sàng', async () => {
    await expect(db.ping()).resolves.toBe(true);
  });

  it('lỗi kết nối được ánh xạ sang DbUnavailableError (NFR2.5)', async () => {
    await expect(
      createDb(opts({ port: 1 })).then((d) => d.query('select 1 from dual')),
    ).rejects.toBeInstanceOf(DbUnavailableError);
  });

  it('hết hàng đợi nhóm kết nối thì báo DbUnavailableError (PD-1)', async () => {
    const small = await createDb(opts({ poolMin: 1, poolMax: 1, queueTimeoutMs: 300 }));
    try {
      const hold = small.withTransaction(async () => {
        await new Promise((r) => setTimeout(r, 1200));
      });
      await new Promise((r) => setTimeout(r, 100));
      await expect(small.query('select 1 from dual')).rejects.toBeInstanceOf(DbUnavailableError);
      await hold;
    } finally {
      await small.close();
    }
  });
});
