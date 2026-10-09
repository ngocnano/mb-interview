// Phát hành thủ công theo đợt (CP-8): node scripts/deploy.mjs <slug-bolt>
// Các bước: CI → kiểm sao lưu < 24 giờ → dựng web và ảnh backend → cập nhật → kiểm /health → xác minh trên Oracle tạm.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { root, run, step } from './lib.mjs';

const slug = process.argv[2];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error('Cách dùng: node scripts/deploy.mjs <slug-bolt>   (ví dụ b1-scoring-skeleton)');
  process.exit(1);
}
const rev = run('git', ['rev-parse', '--short', 'HEAD'], { capture: true }).stdout?.trim() || 'local';
const version = `${slug}-${rev}`;

step('1. CI', () => run('node', ['scripts/ci.mjs']));

step('2. Kiểm bản sao lưu dưới 24 giờ (MD-4a)', () => {
  const dir = join(root, 'backups');
  const recent = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.dmp') && Date.now() - statSync(join(dir, f)).mtimeMs < 86_400_000)
    : [];
  if (recent.length === 0) {
    console.error('Chưa có bản sao lưu nào trong 24 giờ qua. Chạy "node scripts/backup.mjs" rồi thử lại.');
    return 1;
  }
  console.log(`Bản sao lưu gần nhất: ${recent.sort().at(-1)}`);
  return 0;
});

// Chạy sau khi đã có bản sao lưu: chỉ thêm ràng buộc và điền bù, chạy lại không đổi gì (BR9.2).
step('2b. Áp dụng migration DB chưa chạy', () => run('node', ['scripts/migrate.mjs']));

step('3. Dựng bản Flutter Web', () => run('flutter', ['build', 'web', '--release', '--dart-define=API_BASE_URL=/api/v1'], { cwd: join(root, 'app') }));
step(`4. Dựng ảnh backend interview-backend:${version}`, () =>
  run('docker', ['compose', 'build', 'backend'], { env: { APP_VERSION: version } }),
);
step('5. Cập nhật dịch vụ', () => run('docker', ['compose', 'up', '-d', '--wait', 'oracle', 'backend'], { env: { APP_VERSION: version } }));
step('6. Kiểm /health', () => {
  for (let i = 0; i < 12; i++) {
    const r = run('node', ['-e', "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"], { capture: true });
    if (r.status === 0) return 0;
    run('node', ['-e', 'setTimeout(()=>{},5000)']);
  }
  return 1;
});
step('7. Xác minh đầu cuối trên Oracle tạm (không đụng DB demo)', () => run('npm', ['--prefix', 'backend', 'run', 'verify:e2e']));

console.log(`\nĐã phát hành ${version}. Người phụ trách xác nhận kết quả rồi ghi nhãn phiên bản.`);
console.log(`Quay lui: APP_VERSION=<phiên bản cũ> docker compose up -d backend`);
