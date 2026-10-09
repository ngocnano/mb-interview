// Kiểm bí mật (CP-6, NFR1.15): .env và tệp nạp thật không được nằm trong git; không có khóa riêng hay mật khẩu gán cứng.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, run } from './lib.mjs';

const res = run('git', ['ls-files'], { capture: true });
if (res.status !== 0) {
  console.error('Không chạy được git ls-files (thư mục chưa phải kho git?).');
  process.exit(1);
}
const files = res.stdout.split(/\r?\n/).filter(Boolean);
const problems = [];

for (const f of files) {
  if (/(^|\/)\.env$/.test(f) || /^data\/import\//.test(f) || /^backups\//.test(f) || /^logs\//.test(f)) {
    problems.push(`Tệp không được commit: ${f}`);
  }
}

const SCAN = /\.(ts|js|mjs|dart|json|yml|yaml|sh|sql|md)$/;
const PATTERNS = [
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'khóa riêng'],
  [/JWT_SECRET\s*=\s*(?!change-me)[A-Za-z0-9_\-]{20,}/, 'JWT_SECRET gán cứng'],
  [/(DB_(APP|OWNER)_PASSWORD|ORACLE_PASSWORD)\s*=\s*(?!change-me|\$\{)[^\s#]{6,}/, 'mật khẩu DB gán cứng'],
];
for (const f of files) {
  if (!SCAN.test(f) || f.startsWith('.kiro/') || f.startsWith('aidlc/') || f.endsWith('package-lock.json')) continue;
  let text;
  try {
    text = readFileSync(join(root, f), 'utf8');
  } catch {
    continue;
  }
  for (const [re, label] of PATTERNS) {
    if (re.test(text)) problems.push(`${f}: có ${label}`);
  }
}

if (problems.length > 0) {
  console.error('Kiểm bí mật thất bại:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log(`Kiểm bí mật đạt (${files.length} tệp được theo dõi).`);
