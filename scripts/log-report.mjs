// Báo cáo nhanh từ log JSON (OD-7): node scripts/log-report.mjs logs/2026-10-09.jsonl [tệp khác…]
// Đếm theo API và mã trạng thái, p95 thời gian xử lý, số lần tạm khóa đăng nhập, số phiếu hoàn thành.
import { readFileSync } from 'node:fs';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Cách dùng: node scripts/log-report.mjs <tệp.jsonl>…');
  process.exit(1);
}
const byRoute = new Map();
let locked = 0;
let completed = 0;
let errors5xx = 0;
let total = 0;

const norm = (p) => p.replace(/\/panels\/[^/]+/, '/panels/:maHdpv').replace(/\/candidates\/[^/]+/, '/candidates/:maUngVien');

for (const f of files) {
  for (const line of readFileSync(f, 'utf8').split(/\r?\n/)) {
    if (!line.startsWith('{')) continue;
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.type === 'audit' && e.event === 'login_locked') locked++;
    if (e.type === 'audit' && e.event === 'evaluation_completed') completed++;
    if (e.type !== 'access') continue;
    total++;
    if (e.status >= 500) errors5xx++;
    const key = `${e.method} ${norm(e.path)}`;
    const r = byRoute.get(key) ?? { n: 0, status: {}, ms: [] };
    r.n++;
    r.status[e.status] = (r.status[e.status] ?? 0) + 1;
    r.ms.push(e.durationMs);
    byRoute.set(key, r);
  }
}
const p95 = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.max(0, Math.ceil(0.95 * s.length) - 1)] ?? 0;
};
console.log('API'.padEnd(52), 'số'.padStart(6), 'p95 ms'.padStart(8), ' trạng thái');
for (const [k, r] of [...byRoute.entries()].sort()) {
  console.log(k.padEnd(52), String(r.n).padStart(6), String(p95(r.ms)).padStart(8), ' ', JSON.stringify(r.status));
}
console.log(`\nTổng request: ${total}; 5xx: ${errors5xx} (${total ? ((100 * errors5xx) / total).toFixed(2) : 0}%)`);
console.log(`Tạm khóa đăng nhập: ${locked}; phiếu hoàn thành: ${completed}`);
