import { randomUUID } from 'node:crypto';
import type { Binds, Tx } from './pool.js';

/** Mô tả tĩnh của một bảng nạp dữ liệu; tên cột là hằng số của mã nguồn, không phải đầu vào người dùng. */
export interface TableSpec {
  table: string;
  key: readonly string[];
  columns: readonly string[];
  /** Cột mã do server sinh (UUID) khi thêm mới. */
  generated?: readonly string[];
}

const IDENT = /^[a-z][a-z0-9_]*$/;

function check(spec: TableSpec): void {
  for (const n of [spec.table, ...spec.key, ...spec.columns, ...(spec.generated ?? [])]) {
    if (!IDENT.test(n)) throw new Error(`Tên định danh không hợp lệ: ${n}`);
  }
}

/**
 * Thêm hoặc cập nhật một hàng theo khóa nghiệp vụ (BR4.1, BR4.9). Trả 'added' hoặc 'updated'.
 * `row` dùng tên cột dạng snake_case; thiếu cột thì coi là null.
 */
export async function upsertRow(
  tx: Tx,
  spec: TableSpec,
  row: Record<string, string | number | Date | null | undefined>,
): Promise<'added' | 'updated'> {
  check(spec);
  const value = (c: string) => row[c] ?? null;
  const keyBinds: Binds = {};
  for (const k of spec.key) keyBinds[k] = value(k);

  const where = spec.key.map((k) => k + ' = :' + k).join(' and ');
  const found = await tx.query('select 1 as x from ' + spec.table + ' where ' + where, keyBinds);

  if (found.length > 0) {
    const sets = spec.columns.map((c) => c + ' = :' + c).join(', ');
    const binds: Binds = { ...keyBinds };
    for (const c of spec.columns) binds[c] = value(c);
    await tx.execute('update ' + spec.table + ' set ' + sets + ' where ' + where, binds);
    return 'updated';
  }

  const cols = [...(spec.generated ?? []), ...spec.key, ...spec.columns];
  const binds: Binds = { ...keyBinds };
  for (const c of spec.columns) binds[c] = value(c);
  for (const g of spec.generated ?? []) binds[g] = randomUUID();
  await tx.execute(
    'insert into ' +
      spec.table +
      ' (' +
      cols.join(', ') +
      ') values (' +
      cols.map((c) => ':' + c).join(', ') +
      ')',
    binds,
  );
  return 'added';
}
