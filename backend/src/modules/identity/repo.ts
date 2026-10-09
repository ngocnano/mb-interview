import type { Reader, Tx } from '../../db/pool.js';
import { upsertRow, type TableSpec } from '../../db/upsert.js';

export interface Account {
  userId: string;
  email: string;
  passwordHash: string;
  employedId: string;
  hoTen: string;
  trangThai: 'ACTIVE' | 'LOCKED';
}

export interface Throttle {
  email: string;
  soLanSai: number;
  khoaDen: Date | null;
  lanSaiCuoi: Date | null;
}

const ACCOUNT_COLS = 'user_id, email, password_hash, employed_id, ho_ten, trang_thai from user_account';

export async function findAccountByEmail(r: Reader, email: string): Promise<Account | null> {
  const rows = await r.query<Account>('select ' + ACCOUNT_COLS + ' where email = :email', { email });
  return rows[0] ?? null;
}

export async function findAccountById(r: Reader, userId: string): Promise<Account | null> {
  const rows = await r.query<Account>('select ' + ACCOUNT_COLS + ' where user_id = :userId', { userId });
  return rows[0] ?? null;
}

export async function getThrottle(r: Reader, email: string): Promise<Throttle | null> {
  const rows = await r.query<Throttle>(
    `select email, so_lan_sai, khoa_den, lan_sai_cuoi from login_throttle where email = :email`,
    { email },
  );
  return rows[0] ?? null;
}

export async function upsertThrottle(tx: Tx, t: Throttle): Promise<void> {
  await tx.execute(
    `merge into login_throttle d
     using (select :email as email, :soLanSai as so_lan_sai, :khoaDen as khoa_den, :lanSaiCuoi as lan_sai_cuoi from dual) s
     on (d.email = s.email)
     when matched then update set d.so_lan_sai = s.so_lan_sai, d.khoa_den = s.khoa_den, d.lan_sai_cuoi = s.lan_sai_cuoi
     when not matched then insert (email, so_lan_sai, khoa_den, lan_sai_cuoi)
       values (s.email, s.so_lan_sai, s.khoa_den, s.lan_sai_cuoi)`,
    { email: t.email, soLanSai: t.soLanSai, khoaDen: t.khoaDen, lanSaiCuoi: t.lanSaiCuoi },
  );
}

export async function clearThrottle(tx: Tx, email: string): Promise<void> {
  await tx.execute(`delete from login_throttle where email = :email`, { email });
}

/** Xóa dòng đếm đã hết khóa và không có lần sai nào kể từ `cutoff` (SC-6). */
export async function deleteStaleThrottles(tx: Tx, cutoff: Date): Promise<number> {
  const res = await tx.execute(
    `delete from login_throttle where lan_sai_cuoi < :c1 and (khoa_den is null or khoa_den < :c2)`,
    { c1: cutoff, c2: cutoff },
  );
  return res.rowsAffected;
}

const ACCOUNT_SPEC: TableSpec = {
  table: 'user_account',
  key: ['email'],
  columns: ['password_hash', 'employed_id', 'ho_ten', 'trang_thai'],
  generated: ['user_id'],
};

export async function upsertAccount(
  tx: Tx,
  a: {
    email: string;
    passwordHash: string;
    employedId: string;
    hoTen: string;
    trangThai: 'ACTIVE' | 'LOCKED';
  },
): Promise<'added' | 'updated'> {
  return upsertRow(tx, ACCOUNT_SPEC, {
    email: a.email,
    password_hash: a.passwordHash,
    employed_id: a.employedId,
    ho_ten: a.hoTen,
    trang_thai: a.trangThai,
  });
}
