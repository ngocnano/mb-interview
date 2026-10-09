import oracledb from 'oracledb';

// Chạy một lần trước mọi test: kiểm tra Oracle XE sẵn sàng để thông báo lỗi rõ ràng.
export default async function globalSetup(): Promise<void> {
  const need = ['DB_HOST', 'DB_PORT', 'DB_SERVICE', 'DB_OWNER_USER', 'DB_OWNER_PASSWORD'];
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `Thiếu biến môi trường ${missing.join(', ')}. Chạy "npm run init-env" ở thư mục gốc rồi "npm run db:up".`,
    );
  }
  let conn: oracledb.Connection | undefined;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_OWNER_USER,
      password: process.env.DB_OWNER_PASSWORD,
      connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`,
    });
    await conn.execute('select 1 from dual');
  } catch (err) {
    throw new Error(`Không kết nối được Oracle XE (chạy "npm run db:up"): ${(err as Error).message}`, {
      cause: err,
    });
  } finally {
    await conn?.close();
  }
}
