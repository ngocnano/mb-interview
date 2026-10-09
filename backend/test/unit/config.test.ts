import { describe, expect, it } from 'vitest';
import { ConfigError, loadConfig } from '../../src/config.js';

const base = {
  NODE_ENV: 'test',
  DB_HOST: 'localhost',
  DB_PORT: '1521',
  DB_SERVICE: 'XEPDB1',
  DB_APP_USER: 'INTERVIEW_APP',
  DB_APP_PASSWORD: 'p',
  DB_OWNER_USER: 'INTERVIEW_OWNER',
  DB_OWNER_PASSWORD: 'p',
  JWT_SECRET: 'x'.repeat(32),
};

describe('loadConfig (NFR1.2, NFR1.13, SD-2)', () => {
  it('đọc cấu hình hợp lệ và áp dụng giá trị mặc định', () => {
    const c = loadConfig(base);
    expect(c.port).toBe(8080);
    expect(c.bcryptCost).toBe(10);
    expect(c.corsOrigins).toEqual([]);
    expect(c.jwtTtlSeconds).toBe(8 * 3600);
    expect(c.loginMaxFailures).toBe(5);
    expect(c.loginLockMinutes).toBe(15);
    expect(c.db.poolMax).toBe(10);
    expect(c.trustProxy).toBe(0);
    expect(loadConfig({ ...base, TRUST_PROXY: '1' }).trustProxy).toBe(1);
  });

  it('từ chối khởi động khi thiếu khóa JWT', () => {
    const rest: Record<string, string | undefined> = { ...base };
    delete rest.JWT_SECRET;
    expect(() => loadConfig(rest)).toThrow(ConfigError);
  });

  it('từ chối khóa JWT ngắn hơn 32 byte', () => {
    expect(() => loadConfig({ ...base, JWT_SECRET: 'ngan' })).toThrow(/JWT_SECRET/);
  });

  it('tách danh sách CORS theo dấu phẩy và bỏ phần tử rỗng', () => {
    const c = loadConfig({ ...base, CORS_ORIGINS: 'http://a.vn, http://b.vn,,' });
    expect(c.corsOrigins).toEqual(['http://a.vn', 'http://b.vn']);
  });

  it('thông báo lỗi liệt kê biến thiếu nhưng không chứa giá trị bí mật', () => {
    try {
      loadConfig({ ...base, DB_APP_PASSWORD: '', JWT_SECRET: 'bimat-ngan' });
      throw new Error('không ném lỗi');
    } catch (e) {
      expect((e as Error).message).toContain('DB_APP_PASSWORD');
      expect((e as Error).message).not.toContain('bimat-ngan');
    }
  });
});
