import { readFileSync } from 'node:fs';
import { loadConfig } from '../config.js';
import { createDb } from '../db/pool.js';
import { runImport } from './importer.js';

// Lệnh nạp dữ liệu: npm --prefix backend run import -- <tệp.json> [--strict]
// Dùng tài khoản chủ lược đồ (ghi dữ liệu nguồn). Mã thoát: 0 = xong, 1 = lỗi DB hoặc tệp, 2 = có dòng lỗi và dùng --strict.
const args = process.argv.slice(2);
const strict = args.includes('--strict');
const path = args.find((a) => !a.startsWith('--'));
if (!path) {
  console.error('Cách dùng: npm --prefix backend run import -- <tệp.json> [--strict]');
  process.exit(1);
}

try {
  const config = loadConfig(process.env);
  const file: unknown = JSON.parse(readFileSync(path, 'utf8'));
  const db = await createDb({
    user: config.db.ownerUser,
    password: config.db.ownerPassword,
    host: config.db.host,
    port: config.db.port,
    service: config.db.service,
    poolMin: 1,
    poolMax: 2,
    queueTimeoutMs: config.db.queueTimeoutMs,
    callTimeoutMs: 60_000,
  });
  let report;
  try {
    report = await runImport(db, file, { bcryptCost: config.bcryptCost });
  } finally {
    await db.close();
  }
  let errorCount = 0;
  console.log('Nhóm            thêm  cập nhật  lỗi');
  for (const g of report.groups) {
    errorCount += g.errors.length;
    console.log(
      `${g.group.padEnd(14)}  ${String(g.added).padStart(4)}  ${String(g.updated).padStart(8)}  ${String(g.errors.length).padStart(3)}`,
    );
  }
  for (const g of report.groups) {
    for (const e of g.errors)
      console.log(`  [${g.group}] dòng ${e.line}${e.field ? ` (${e.field})` : ''}: ${e.reason}`);
  }
  process.exit(strict && errorCount > 0 ? 2 : 0);
} catch (err) {
  console.error(`Nạp dữ liệu thất bại, đã hoàn tác toàn bộ: ${(err as Error).message}`);
  process.exit(1);
}
