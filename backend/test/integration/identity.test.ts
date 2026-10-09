import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppError } from '../../src/errors.js';
import { IdentityService } from '../../src/modules/identity/service.js';
import { exec, ownerConn, resetData, seedMinimal } from '../helpers/db.js';
import { appDb, captureAudit, FakeClock, TEST_PASSWORD, testHash } from '../helpers/services.js';
import type { Db } from '../../src/db/pool.js';

const SECRET = 'k'.repeat(40);

describe('IdentityAccess (BR1.1..BR1.7, SD-1..SD-3)', () => {
  let db: Db;
  const clock = new FakeClock(new Date('2026-10-09T10:00:00Z'));
  const audit = captureAudit();
  let svc: IdentityService;

  beforeAll(async () => {
    db = await appDb();
  });
  afterAll(async () => {
    await db.close();
  });
  beforeEach(async () => {
    const c = await ownerConn();
    await resetData(c);
    await seedMinimal(c);
    await exec(c, `update user_account set password_hash = :h where user_id = 'U1'`, { h: testHash() });
    await c.close();
    audit.events.length = 0;
    svc = new IdentityService({
      db,
      secret: SECRET,
      bcryptCost: 4,
      ttlSeconds: 8 * 3600,
      maxFailures: 5,
      lockMs: 15 * 60_000,
      clock: clock.now,
      audit,
    });
  });

  const fail = async (email: string, pw: string): Promise<AppError> => {
    try {
      await svc.login(email, pw);
    } catch (e) {
      return e as AppError;
    }
    throw new Error('mong lỗi nhưng đăng nhập thành công');
  };

  it('đăng nhập đúng trả token, thời điểm hết hạn và thông tin người dùng (BR1.7)', async () => {
    const res = await svc.login('  A@X.vn ', TEST_PASSWORD);
    expect(res.user).toEqual({ userId: 'U1', employedId: 'E1', hoTen: 'Người Một', email: 'a@x.vn' });
    expect(res.expiresAt.getTime()).toBe(clock.now().getTime() + 8 * 3600 * 1000);
    const payload = jwt.verify(res.token, SECRET, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    expect(payload.sub).toBe('U1');
    expect(payload.employedId).toBe('E1');
  });

  it('sai mật khẩu và email không tồn tại cùng một thông báo chung (BR1.1)', async () => {
    const a = await fail('a@x.vn', 'sai-mat-khau');
    const b = await fail('khong-co@x.vn', 'sai-mat-khau');
    expect([a.status, a.code]).toEqual([401, 'INVALID_CREDENTIALS']);
    expect([b.status, b.code]).toEqual([401, 'INVALID_CREDENTIALS']);
    expect(a.message).toBe(b.message);
    expect(a.message).toBe('Email hoặc mật khẩu không đúng');
  });

  it('tài khoản LOCKED bị từ chối 403 và không tăng bộ đếm (BR1.2)', async () => {
    const c = await ownerConn();
    await exec(c, `update user_account set trang_thai = 'LOCKED' where user_id = 'U1'`);
    await c.close();
    const e = await fail('a@x.vn', TEST_PASSWORD);
    expect([e.status, e.code]).toEqual([403, 'ACCOUNT_LOCKED']);
    const rows = await db.query(`select * from login_throttle`);
    expect(rows).toHaveLength(0);
  });

  it('sai 5 lần thì lần thứ 6 bị 429 kể cả đúng mật khẩu, kèm Retry-After (BR1.6)', async () => {
    for (let i = 0; i < 5; i++) expect((await fail('a@x.vn', 'sai')).status).toBe(401);
    const locked = await fail('a@x.vn', TEST_PASSWORD);
    expect([locked.status, locked.code]).toEqual([429, 'LOGIN_LOCKED']);
    expect(Number(locked.headers?.['Retry-After'])).toBe(15 * 60);
    expect(audit.events.map((e) => e.type)).toContain('login_locked');
  });

  it('hết 15 phút thì đăng nhập lại được và bộ đếm được đặt lại (BR1.6)', async () => {
    for (let i = 0; i < 5; i++) await fail('a@x.vn', 'sai');
    clock.advanceMs(15 * 60_000 + 1000);
    const res = await svc.login('a@x.vn', TEST_PASSWORD);
    expect(res.user.userId).toBe('U1');
    expect(await db.query(`select * from login_throttle`)).toHaveLength(0);
  });

  it('đăng nhập đúng trước khi đủ 5 lần sai thì đặt lại bộ đếm (BR1.6)', async () => {
    for (let i = 0; i < 4; i++) await fail('a@x.vn', 'sai');
    await svc.login('a@x.vn', TEST_PASSWORD);
    for (let i = 0; i < 4; i++) expect((await fail('a@x.vn', 'sai')).status).toBe(401);
  });

  it('email không tồn tại cũng bị đếm để không lộ email (SD-3)', async () => {
    for (let i = 0; i < 5; i++) await fail('ma@x.vn', 'sai');
    expect((await fail('ma@x.vn', 'sai')).status).toBe(429);
  });

  it('ghi sự kiện kiểm toán đăng nhập thất bại, không chứa mật khẩu (NFR14.7)', async () => {
    await fail('a@x.vn', 'mat-khau-bi-mat-123');
    const ev = audit.events.find((e) => e.type === 'login_failed');
    expect(ev).toBeDefined();
    expect(JSON.stringify(ev)).not.toContain('mat-khau-bi-mat-123');
  });

  it('verifyToken chấp nhận token hợp lệ và trả người gọi (BR1.4)', async () => {
    const { token } = await svc.login('a@x.vn', TEST_PASSWORD);
    await expect(svc.verifyToken(token)).resolves.toEqual({ userId: 'U1', employedId: 'E1' });
  });

  it('verifyToken từ chối token thiếu, sai chữ ký, hết hạn, hoặc tài khoản đã bị khóa', async () => {
    const { token } = await svc.login('a@x.vn', TEST_PASSWORD);
    await expect(svc.verifyToken('')).rejects.toMatchObject({ status: 401 });
    await expect(svc.verifyToken(token + 'x')).rejects.toMatchObject({ status: 401 });
    const expired = jwt.sign(
      { employedId: 'E1', exp: Math.floor(clock.now().getTime() / 1000) - 10 },
      SECRET,
      {
        subject: 'U1',
      },
    );
    await expect(svc.verifyToken(expired)).rejects.toMatchObject({ status: 401 });
    const c = await ownerConn();
    await exec(c, `update user_account set trang_thai = 'LOCKED' where user_id = 'U1'`);
    await c.close();
    await expect(svc.verifyToken(token)).rejects.toMatchObject({ status: 401 });
  });

  it('không bao giờ lưu mật khẩu rõ (BR1.5)', async () => {
    const rows = await db.query<{ passwordHash: string }>(`select password_hash from user_account`);
    expect(rows.every((r) => r.passwordHash !== TEST_PASSWORD && r.passwordHash.startsWith('$2'))).toBe(true);
  });
});
