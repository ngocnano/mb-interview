// Sao lưu lược đồ ứng dụng bằng Oracle Data Pump (IS-10, RD-10). Chạy trước mỗi đợt phát hành.
// Kết quả: backups/AAAAMMDD-HHmm.dmp (thư mục gắn vào container). Mật khẩu lấy từ môi trường trong container, không đi qua dòng lệnh.
import { run, stamp } from './lib.mjs';

const name = stamp();
const inner =
  `expdp interview_owner/"$DB_OWNER_PASSWORD"@//localhost:1521/XEPDB1 schemas=INTERVIEW_OWNER ` +
  `directory=BACKUP_DIR dumpfile=${name}.dmp logfile=${name}.log reuse_dumpfiles=y`;
const code = run('docker', ['compose', 'exec', '-T', 'oracle', 'sh', '-c', inner]);
if (code !== 0) {
  console.error('Sao lưu thất bại.');
  process.exit(code);
}
console.log(`Đã sao lưu: backups/${name}.dmp. Hãy chép tệp này sang nơi khác (ổ ngoài hoặc kho chung) trước khi phát hành.`);
