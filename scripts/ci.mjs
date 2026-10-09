// npm run ci: kiểm tĩnh, kiểm thử, độ phủ ≥ 80% và kiểm bí mật cho cả backend lẫn app (CP-2, CP-3, CP-4, CP-6).
// Cờ: --skip-app bỏ phần Flutter (chỉ khi máy chưa có Flutter SDK; CI thật không dùng cờ này).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, run, step } from './lib.mjs';

const skipApp = process.argv.includes('--skip-app');

step('Tạo .env nếu chưa có', () => run('node', ['scripts/init-env.mjs']));
step('Khởi động Oracle XE cho test tích hợp', () => run('docker', ['compose', 'up', '-d', '--wait', 'oracle']));

step('Backend: ESLint', () => run('npm', ['--prefix', 'backend', 'run', 'lint']));
step('Backend: Prettier', () => run('npm', ['--prefix', 'backend', 'run', 'format:check']));
step('Backend: kiểm kiểu', () => run('npm', ['--prefix', 'backend', 'run', 'typecheck']));
step('Backend: test và độ phủ (ngưỡng 80% đặt trong vitest.config.ts)', () =>
  run('npm', ['--prefix', 'backend', 'run', 'test:coverage']),
);

if (!skipApp) {
  const app = join(root, 'app');
  step('App: dart format', () => run('dart', ['format', '--set-exit-if-changed', 'lib', 'test'], { cwd: app }));
  step('App: flutter analyze', () => run('flutter', ['analyze'], { cwd: app }));
  step('App: flutter test và độ phủ', () => run('flutter', ['test', '--coverage'], { cwd: app }));
  step('App: độ phủ dòng lệnh ≥ 80%', () => {
    const lcov = join(app, 'coverage', 'lcov.info');
    if (!existsSync(lcov)) return 1;
    let lf = 0;
    let lh = 0;
    for (const line of readFileSync(lcov, 'utf8').split(/\r?\n/)) {
      if (line.startsWith('LF:')) lf += Number(line.slice(3));
      if (line.startsWith('LH:')) lh += Number(line.slice(3));
    }
    const pct = lf === 0 ? 0 : (100 * lh) / lf;
    console.log(`Độ phủ app: ${pct.toFixed(1)}% (${lh}/${lf})`);
    return pct >= 80 ? 0 : 1;
  });
}

step('Kiểm bí mật', () => run('node', ['scripts/check-secrets.mjs']));
console.log('\nCI xanh.');
