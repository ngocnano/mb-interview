import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import type oracledb from 'oracledb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { exec, expectOraError, ownerConn, resetData, seedMinimal } from '../helpers/db.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

/** Chạy lệnh migrate thật như người vận hành (BR9.2). */
function migrate(): string {
  return execFileSync('node', ['scripts/migrate.mjs'], { cwd: root, env: process.env, encoding: 'utf8' });
}

async function tryExec(conn: oracledb.Connection, sql: string): Promise<void> {
  try {
    await exec(conn, sql);
  } catch {
    // Ràng buộc hoặc bảng chưa có: bỏ qua khi dựng lại trạng thái U1.
  }
}

const insertEval = (id: string, ketLuan: string | null, referVt: string | null, referLyDo: string | null) =>
  `insert into interview_evaluation
     (evaluation_id, user_id, ma_hdpv, ma_ung_vien, idempotency_key, submitted_at, ket_luan, refer_ma_vi_tri, refer_ly_do)
   values ('${id}', 'U1', 'P1', '${id === 'EVL' ? 'C1' : 'X' + id}', 'k-${id}', systimestamp,
     ${ketLuan ? `'${ketLuan}'` : 'null'}, ${referVt ? `'${referVt}'` : 'null'}, ${referLyDo ? `'${referLyDo}'` : 'null'})`;

describe('Migration 002 và ràng buộc kết luận, refer (BR9.1..BR9.3)', () => {
  let owner: oracledb.Connection;

  beforeAll(async () => {
    owner = await ownerConn();
    await resetData(owner);
    await seedMinimal(owner);
    await exec(
      owner,
      `insert into criterion (ma_tieu_chi, ten_tieu_chi, diem_toi_thieu, diem_toi_da, thu_tu) values ('TC2','Giao tiếp',1,5,2)`,
    );
    for (const id of ['E2', 'E3', 'E4', 'E5', 'E6']) {
      await exec(
        owner,
        `insert into candidate (ma_ung_vien, ten, ma_vi_tri) values ('X${id}', 'UV ${id}', 'VT1')`,
      );
    }
    // Dựng lại trạng thái cuối U1: chưa có hai ràng buộc U2, chưa đánh dấu migration.
    await tryExec(owner, 'alter table interview_evaluation drop constraint ck_eval_refer_khac');
    await tryExec(owner, 'alter table interview_evaluation drop constraint ck_eval_refer_ly_do');
    await tryExec(owner, `delete from schema_migrations where id = '002-u2-constraints'`);
    // Bài U1: không kết luận, không điểm trung bình; điểm 4 và 3 thang 5 → 3,50.
    await exec(owner, insertEval('EVL', null, null, null));
    await exec(
      owner,
      `insert into evaluation_score (evaluation_id, ma_tieu_chi, diem) values ('EVL', 'TC1', 4)`,
    );
    await exec(
      owner,
      `insert into evaluation_score (evaluation_id, ma_tieu_chi, diem) values ('EVL', 'TC2', 3)`,
    );
  });

  afterAll(async () => {
    await resetData(owner);
    await owner.close();
    migrate(); // luôn để DB dev ở trạng thái đã migrate
  });

  it('migrate áp dụng 002 và báo tên migration (BR9.2)', () => {
    expect(migrate()).toContain('002-u2-constraints');
  });

  it('điền bù điểm trung bình cho bài U1, kết luận giữ rỗng (BR9.3)', async () => {
    const rows = await owner.execute<[number | null, string | null]>(
      `select diem_trung_binh, ket_luan from interview_evaluation where evaluation_id = 'EVL'`,
    );
    expect(rows.rows?.[0]).toEqual([3.5, null]);
  });

  it('chạy lại migrate không áp dụng gì và không đổi dữ liệu (BR9.2)', async () => {
    expect(migrate()).toContain('Không có migration mới');
    const rows = await owner.execute<[number]>(
      `select diem_trung_binh from interview_evaluation where evaluation_id = 'EVL'`,
    );
    expect(rows.rows?.[0]?.[0]).toBe(3.5);
  });

  it('refer chỉ được ghi khi kết luận là KHAC (BR9.1)', async () => {
    await expectOraError(exec(owner, insertEval('E2', 'DAT', 'VT2', null)), 'ORA-02290');
    await expectOraError(exec(owner, insertEval('E3', null, 'VT2', null)), 'ORA-02290');
  });

  it('lý do refer cần có vị trí refer (BR9.1)', async () => {
    await expectOraError(exec(owner, insertEval('E4', 'KHAC', null, 'Có lý do')), 'ORA-02290');
  });

  it('KHAC kèm vị trí và lý do hợp lệ vẫn ghi được; vị trí không tồn tại bị khóa ngoại chặn', async () => {
    await exec(owner, insertEval('E5', 'KHAC', 'VT2', 'Hợp vị trí khác hơn'));
    await expectOraError(exec(owner, insertEval('E6', 'KHAC', 'KHONG_CO', null)), 'ORA-02291');
  });
});
