import { z } from 'zod';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_SERVICE: z.string().min(1),
  DB_APP_USER: z.string().min(1),
  DB_APP_PASSWORD: z.string().min(1),
  DB_OWNER_USER: z.string().min(1),
  DB_OWNER_PASSWORD: z.string().min(1),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
  // Khóa JWT bắt buộc, không có giá trị mặc định (NFR1.2).
  JWT_SECRET: z.string().refine((s) => Buffer.byteLength(s, 'utf8') >= 32, {
    message: 'phải dài tối thiểu 32 byte',
  }),
  CORS_ORIGINS: z.string().default(''),
  BCRYPT_COST: z.coerce.number().int().min(4).max(14).default(10),
  WEB_DIR: z.string().default(''),
  // Số lớp proxy tin cậy phía trước backend; 0 là không có proxy. Cần > 0 khi chạy sau reverse proxy HTTPS,
  // nếu không giới hạn tốc độ theo IP sẽ tính mọi người dùng chung một địa chỉ (NFR1.4).
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
});

export interface Config {
  nodeEnv: string;
  port: number;
  db: {
    host: string;
    port: number;
    service: string;
    appUser: string;
    appPassword: string;
    ownerUser: string;
    ownerPassword: string;
    poolMin: number;
    poolMax: number;
    queueTimeoutMs: number;
    callTimeoutMs: number;
  };
  jwtSecret: string;
  jwtTtlSeconds: number;
  bcryptCost: number;
  loginMaxFailures: number;
  loginLockMinutes: number;
  rateLimitPerMinute: number;
  jsonLimit: string;
  corsOrigins: string[];
  webDir: string;
  trustProxy: number;
}

/** Đọc và kiểm tra biến môi trường; thiếu hoặc sai thì ném ConfigError, tuyệt đối không in giá trị bí mật (LC-7). */
export function loadConfig(env: Record<string, string | undefined>): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `- ${i.path.join('.') || '(cấu hình)'}: ${i.message}`);
    throw new ConfigError(`Cấu hình không hợp lệ:\n${lines.join('\n')}`);
  }
  const e = parsed.data;
  return {
    nodeEnv: e.NODE_ENV,
    port: e.PORT,
    db: {
      host: e.DB_HOST,
      port: e.DB_PORT,
      service: e.DB_SERVICE,
      appUser: e.DB_APP_USER,
      appPassword: e.DB_APP_PASSWORD,
      ownerUser: e.DB_OWNER_USER,
      ownerPassword: e.DB_OWNER_PASSWORD,
      poolMin: e.DB_POOL_MIN,
      poolMax: e.DB_POOL_MAX,
      queueTimeoutMs: 5000,
      callTimeoutMs: 8000,
    },
    jwtSecret: e.JWT_SECRET,
    jwtTtlSeconds: 8 * 3600,
    bcryptCost: e.BCRYPT_COST,
    loginMaxFailures: 5,
    loginLockMinutes: 15,
    rateLimitPerMinute: 100,
    jsonLimit: '100kb',
    corsOrigins: e.CORS_ORIGINS.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
    webDir: e.WEB_DIR,
    trustProxy: e.TRUST_PROXY,
  };
}
