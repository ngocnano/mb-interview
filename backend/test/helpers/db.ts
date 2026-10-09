import oracledb from 'oracledb';

export function connectString(): string {
  return `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE}`;
}

export async function ownerConn(): Promise<oracledb.Connection> {
  return oracledb.getConnection({
    user: process.env.DB_OWNER_USER,
    password: process.env.DB_OWNER_PASSWORD,
    connectString: connectString(),
  });
}

export async function appConn(): Promise<oracledb.Connection> {
  const conn = await oracledb.getConnection({
    user: process.env.DB_APP_USER,
    password: process.env.DB_APP_PASSWORD,
    connectString: connectString(),
  });
  // Bảng thuộc tài khoản chủ lược đồ; tài khoản ứng dụng đọc qua lược đồ đó.
  // Tên lược đồ lấy từ cấu hình test, không phải đầu vào người dùng.
  await conn.execute('alter session set current_schema = ' + (process.env.DB_OWNER_USER ?? ''));
  return conn;
}

// Thứ tự xóa tôn trọng khóa ngoại.
const TABLES_DELETE_ORDER = [
  'evaluation_score',
  'interview_evaluation',
  'panel_candidate',
  'panel_interviewer',
  'interview_panel',
  'candidate',
  'job_position',
  'criterion',
  'user_account',
  'login_throttle',
  'interviewer',
];

export async function resetData(conn?: oracledb.Connection): Promise<void> {
  const own = conn ?? (await ownerConn());
  try {
    for (const t of TABLES_DELETE_ORDER) {
      // Tên bảng là hằng số của tệp này.
      await own.execute('delete from ' + t);
    }
    await own.commit();
  } finally {
    if (!conn) await own.close();
  }
}

export type Binds = Record<string, string | number | Date | null>;

export async function exec(conn: oracledb.Connection, sql: string, binds: Binds = {}): Promise<void> {
  await conn.execute(sql, binds, { autoCommit: true });
}

export async function expectOraError(promise: Promise<unknown>, code: string): Promise<void> {
  try {
    await promise;
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes(code)) return;
    throw new Error(`Mong lỗi ${code} nhưng nhận: ${msg}`, { cause: err });
  }
  throw new Error(`Mong lỗi ${code} nhưng thao tác thành công`);
}

/** Dữ liệu tối thiểu cho các test: 1 CBQL có tài khoản, 1 vị trí, 1 ứng viên, 1 HĐPV Inprogress, 1 tiêu chí. */
export async function seedMinimal(conn: oracledb.Connection): Promise<void> {
  await exec(conn, `insert into interviewer (employed_id, ten) values ('E1', 'CBQL Một')`);
  await exec(
    conn,
    `insert into user_account (user_id, email, password_hash, employed_id, ho_ten)
     values ('U1', 'a@x.vn', 'hash', 'E1', 'Người Một')`,
  );
  await exec(conn, `insert into job_position (ma_vi_tri, job, dvql) values ('VT1', 'Kế toán', 'Phòng A')`);
  await exec(conn, `insert into job_position (ma_vi_tri, job, dvql) values ('VT2', 'Lập trình', 'Phòng B')`);
  await exec(conn, `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('C1', 'Ứng viên 1', 'VT1')`);
  await exec(
    conn,
    `insert into interview_panel (ma_hdpv, ten, ngay, hinh_thuc, trang_thai)
     values ('P1', 'HĐPV 1', trunc(sysdate), 'Online', 'INPROGRESS')`,
  );
  await exec(
    conn,
    `insert into panel_candidate (id, ma_hdpv, ma_ung_vien, tu_thoi_gian, den_thoi_gian, xac_nhan)
     values ('PC1', 'P1', 'C1', '09:00', '09:30', 'Y')`,
  );
  await exec(conn, `insert into panel_interviewer (id, ma_hdpv, ma_cbql) values ('PI1', 'P1', 'E1')`);
  await exec(
    conn,
    `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu)
     values ('TC1', 'Chuyên môn', 1, 5, 1)`,
  );
}
