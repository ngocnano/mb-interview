// Khôi phục từ bản Data Pump: node scripts/restore.mjs AAAAMMDD-HHmm (không kèm đuôi .dmp).
// Quy trình (RD-11): dừng backend → (lược đồ rỗng hoặc chấp nhận ghi đè bảng) → chạy lệnh này → khởi động backend → kiểm /health.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { root, run } from './lib.mjs';

const name = process.argv[2];
if (!name || !/^\d{8}-\d{4}$/.test(name)) {
  console.error('Cách dùng: node scripts/restore.mjs AAAAMMDD-HHmm');
  process.exit(1);
}
if (!existsSync(join(root, 'backups', `${name}.dmp`))) {
  console.error(`Không thấy backups/${name}.dmp`);
  process.exit(1);
}
const inner =
  `impdp interview_owner/"$DB_OWNER_PASSWORD"@//localhost:1521/XEPDB1 schemas=INTERVIEW_OWNER ` +
  `directory=BACKUP_DIR dumpfile=${name}.dmp logfile=restore-${name}.log table_exists_action=replace`;
const code = run('docker', ['compose', 'exec', '-T', 'oracle', 'sh', '-c', inner]);
process.exit(code);
