// Áp dụng các migration DB chưa chạy: node scripts/migrate.mjs (BR9.2).
// Đọc docker/schema/migrate/NNN-ten.sql theo thứ tự, ghi vào bảng SCHEMA_MIGRATIONS, chạy lại không đổi gì.
// Dùng tài khoản chủ lược đồ (DB_OWNER_*) từ .env hoặc biến môi trường. Thoát mã khác 0 khi lỗi.
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { root } from './lib.mjs';

try {
  process.loadEnvFile(join(root, '.env'));
} catch {
  // CI hoặc môi trường truyền biến trực tiếp.
}

const need = ['DB_HOST', 'DB_PORT', 'DB_SERVICE', 'DB_OWNER_USER', 'DB_OWNER_PASSWORD'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`Thiếu biến môi trường ${missing.join(', ')}.`);
  process.exit(1);
}

const require = createRequire(join(root, 'backend', 'package.json'));
const oracledb = require('oracledb');

const dir = join(root, 'docker', 'schema', 'migrate');
const ORA_NAME_USED = 'ORA-02264'; // ràng buộc đã tồn tại: coi như đã áp dụng

/** Tách tệp thành các lệnh theo dòng chỉ có dấu "/"; bỏ dòng chú thích đứng đầu và phần rỗng. */
export function splitStatements(sql) {
  return sql
    .split(/^\/\s*$/m)
    .map((s) =>
      s
        .split('\n')
        .filter((line, i, all) => !(line.trim().startsWith('--') && all.slice(0, i).every((l) => l.trim() === '' || l.trim().startsWith('--'))))
        .join('\n')
        .trim(),
    )
    .filter((s) => s.length > 0);
}

let conn;
try {
  conn = await oracledb.getConnection({
    user: process.env.DB_OWNER_USER,
    password: process.env.DB_OWNER_PASSWORD,
    connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
  });

  const exists = await conn.execute(
    `select count(*) from user_tables where table_name = 'SCHEMA_MIGRATIONS'`,
  );
  if (exists.rows[0][0] === 0) {
    await conn.execute(
      `create table schema_migrations (
         id         varchar2(100 char) not null,
         applied_at timestamp default systimestamp not null,
         constraint pk_schema_migrations primary key (id))`,
    );
  }
  const applied = new Set((await conn.execute('select id from schema_migrations')).rows.map((r) => r[0]));

  const files = readdirSync(dir)
    .filter((f) => /^\d{3}-.+\.sql$/.test(f))
    .sort();
  let count = 0;
  for (const file of files) {
    const id = file.replace(/\.sql$/, '');
    if (applied.has(id)) continue;
    for (const stmt of splitStatements(readFileSync(join(dir, file), 'utf8'))) {
      try {
        await conn.execute(stmt, [], { autoCommit: true });
      } catch (err) {
        if (String(err.message).includes(ORA_NAME_USED)) {
          console.log(`  (bỏ qua, đã có sẵn: ${err.message.split('\n')[0]})`);
          continue;
        }
        throw new Error(`Lỗi ở ${file}: ${err.message}`, { cause: err });
      }
    }
    await conn.execute('insert into schema_migrations (id) values (:id)', { id }, { autoCommit: true });
    console.log(`Đã áp dụng: ${id}`);
    count++;
  }
  if (count === 0) console.log('Không có migration mới.');
} catch (err) {
  console.error(`LỖI migrate: ${err.message}`);
  process.exitCode = 1;
} finally {
  await conn?.close();
}
