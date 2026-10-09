// Tạo .env từ .env.example với mật khẩu và khóa ngẫu nhiên (NFR1.15). Không ghi đè .env có sẵn.
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, '.env');
if (existsSync(target)) {
  console.log('.env đã tồn tại, giữ nguyên.');
  process.exit(0);
}
const secret = (bytes) => randomBytes(bytes).toString('base64url');
const replacements = {
  ORACLE_PASSWORD: `Sys${secret(12)}`,
  DB_OWNER_PASSWORD: `Own${secret(12)}`,
  DB_APP_PASSWORD: `App${secret(12)}`,
  JWT_SECRET: secret(48),
};
let text = readFileSync(join(root, '.env.example'), 'utf8');
for (const [key, value] of Object.entries(replacements)) {
  text = text.replace(new RegExp(`^${key}=.*$`, 'm'), `${key}=${value}`);
}
writeFileSync(target, text, { mode: 0o600 });
console.log('Đã tạo .env với mật khẩu ngẫu nhiên.');
