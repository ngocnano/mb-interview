// Lưu log backend theo ngày và xóa tệp cũ hơn 30 ngày (IS-9, OD-6). Chạy hằng ngày bằng Task Scheduler hoặc cron.
import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, run } from './lib.mjs';

const dir = join(root, 'logs');
mkdirSync(dir, { recursive: true });
const day = new Date().toISOString().slice(0, 10);
const res = run('docker', ['compose', 'logs', 'backend', '--no-log-prefix', '--since', '24h'], { capture: true });
if (res.status !== 0) {
  console.error(res.stderr);
  process.exit(1);
}
writeFileSync(join(dir, `${day}.jsonl`), res.stdout, 'utf8');
const limit = Date.now() - 30 * 86_400_000;
for (const f of readdirSync(dir)) {
  const p = join(dir, f);
  if (f.endsWith('.jsonl') && statSync(p).mtimeMs < limit) {
    unlinkSync(p);
    console.log(`Đã xóa log cũ: ${f}`);
  }
}
console.log(`Đã lưu logs/${day}.jsonl`);
