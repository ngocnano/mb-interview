import { describe, expect, it } from 'vitest';

describe('test runner', () => {
  it('chạy được bằng cấu hình dự án (môi trường test, bcrypt cost thấp)', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.BCRYPT_COST).toBe('4');
  });
});
