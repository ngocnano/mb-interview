import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Db } from '../../db/pool.js';
import { AppError, unauthorized } from '../../errors.js';
import type { Audit } from '../../observability/audit.js';
import * as repo from './repo.js';

export interface Caller {
  userId: string;
  employedId: string;
}

export interface LoginResult {
  token: string;
  expiresAt: Date;
  user: { userId: string; employedId: string; hoTen: string; email: string };
}

export interface IdentityDeps {
  db: Db;
  secret: string;
  bcryptCost: number;
  ttlSeconds: number;
  maxFailures: number;
  lockMs: number;
  clock: () => Date;
  audit: Audit;
}

export const normalizeEmail = (raw: string): string => raw.trim().toLowerCase();

export class IdentityService {
  private dummyHash: Promise<string> | undefined;

  constructor(private readonly d: IdentityDeps) {}

  /** Băm giả để thời gian phản hồi của email không tồn tại gần bằng email tồn tại (NFR1.5). */
  private getDummyHash(): Promise<string> {
    this.dummyHash ??= bcrypt.hash('khong-ai-dung-mat-khau-nay', this.d.bcryptCost);
    return this.dummyHash;
  }

  async login(emailRaw: string, password: string): Promise<LoginResult> {
    const { db, clock } = this.d;
    const email = normalizeEmail(emailRaw);
    const now = clock();

    const throttle = await repo.getThrottle(db, email);
    if (throttle?.khoaDen && throttle.khoaDen > now) {
      const retry = Math.ceil((throttle.khoaDen.getTime() - now.getTime()) / 1000);
      throw new AppError(429, 'LOGIN_LOCKED', 'Đăng nhập tạm khóa, thử lại sau 15 phút', undefined, {
        'Retry-After': String(retry),
      });
    }

    const account = await repo.findAccountByEmail(db, email);
    const matches = await bcrypt.compare(password, account?.passwordHash ?? (await this.getDummyHash()));
    if (!account || !matches) {
      await this.recordFailure(email, throttle, now);
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng');
    }
    if (account.trangThai === 'LOCKED') {
      throw new AppError(403, 'ACCOUNT_LOCKED', 'Tài khoản đã bị khóa');
    }

    if (throttle) await db.withTransaction((tx) => repo.clearThrottle(tx, email));

    const expiresAt = new Date(now.getTime() + this.d.ttlSeconds * 1000);
    const token = jwt.sign(
      { employedId: account.employedId, iat: Math.floor(now.getTime() / 1000) },
      this.d.secret,
      { subject: account.userId, expiresIn: this.d.ttlSeconds, algorithm: 'HS256' },
    );
    return {
      token,
      expiresAt,
      user: {
        userId: account.userId,
        employedId: account.employedId,
        hoTen: account.hoTen,
        email: account.email,
      },
    };
  }

  private async recordFailure(email: string, throttle: repo.Throttle | null, now: Date): Promise<void> {
    const expired = throttle?.khoaDen != null && throttle.khoaDen <= now;
    const base = throttle && !expired ? throttle.soLanSai : 0;
    const count = base + 1;
    const locked = count >= this.d.maxFailures;
    await this.d.db.withTransaction((tx) =>
      repo.upsertThrottle(tx, {
        email,
        soLanSai: count,
        khoaDen: locked ? new Date(now.getTime() + this.d.lockMs) : null,
        lanSaiCuoi: now,
      }),
    );
    this.d.audit.event('login_failed', { email, soLanSai: count });
    if (locked) this.d.audit.event('login_locked', { email });
  }

  /** Kiểm tra token và trạng thái tài khoản; mọi lỗi đều là 401 (BR1.4, C3). */
  async verifyToken(token: string): Promise<Caller> {
    if (!token) throw unauthorized();
    let payload: jwt.JwtPayload;
    try {
      const decoded = jwt.verify(token, this.d.secret, {
        algorithms: ['HS256'],
        clockTimestamp: Math.floor(this.d.clock().getTime() / 1000),
      });
      if (typeof decoded === 'string') throw new Error('payload không hợp lệ');
      payload = decoded;
    } catch {
      throw unauthorized();
    }
    const userId = payload.sub;
    if (!userId) throw unauthorized();
    const account = await repo.findAccountById(this.d.db, userId);
    if (!account || account.trangThai !== 'ACTIVE') throw unauthorized();
    return { userId: account.userId, employedId: account.employedId };
  }
}
