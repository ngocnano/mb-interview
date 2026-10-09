import { defineConfig } from 'vitest/config';

// Nạp .env ở thư mục gốc (nếu có) để test tích hợp biết thông tin kết nối Oracle.
try {
  process.loadEnvFile(new URL('../.env', import.meta.url));
} catch {
  // CI có thể truyền biến môi trường trực tiếp.
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    globalSetup: ['test/global-setup.ts'],
    env: { NODE_ENV: 'test', BCRYPT_COST: '4' },
    // Các test tích hợp dùng chung một Oracle XE nên chạy tuần tự.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Chỉ loại hai điểm vào mỏng (chỉ nối dây, logic nằm ở module có test).
      exclude: ['src/server.ts', 'src/import/cli.ts'],
      reporter: ['text', 'json-summary'],
      thresholds: { lines: 80 },
    },
  },
});
