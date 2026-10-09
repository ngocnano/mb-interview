import { randomUUID } from 'node:crypto';
import type { Db } from '../../db/pool.js';
import { UniqueViolationError } from '../../db/errors.js';
import { AppError } from '../../errors.js';
import type { Audit } from '../../observability/audit.js';
import { denialToError } from '../catalog/service.js';
import type { CatalogPolicy } from '../catalog/policy.js';
import type { PositionInfo } from '../catalog/repo.js';
import type { Caller } from '../identity/service.js';
import { averageScore, storedToDecimal } from './average-score.js';
import * as repo from './repo.js';
import { blankToUndefined, validateCompletion, type CompletionInput } from './validation.js';

export interface CompletionResult {
  evaluationId: string;
  submittedAt: Date;
  trangThai: 'SUBMITTED';
  ketLuan: repo.KetLuanValue | null;
  diemTrungBinh: number | null;
  /** true khi trả lại bản đã lưu của cùng idempotencyKey (HTTP 200). */
  replayed: boolean;
}

export interface EvaluationDetail {
  evaluationId: string;
  maHdpv: string;
  maUngVien: string;
  diem: repo.DetailScore[];
  nhanXet: string | null;
  ketLuan: repo.KetLuanValue | null;
  referViTri: PositionInfo | null;
  referLyDo: string | null;
  diemTrungBinh: number | null;
  submittedAt: Date;
  trangThai: 'SUBMITTED';
}

export interface EvaluationDeps {
  db: Db;
  policy: CatalogPolicy;
  audit: Audit;
  clock: () => Date;
  /** Thời gian giữ bộ đệm tiêu chí (PD-4); 0 là không đệm. */
  criteriaTtlMs: number;
}

const alreadyCompleted = () =>
  new AppError(409, 'ALREADY_COMPLETED', 'Bạn đã hoàn thành đánh giá cho ứng viên này');
const keyReused = () =>
  new AppError(409, 'IDEMPOTENCY_KEY_REUSED', 'Khóa gửi lại đã được dùng cho một ứng viên khác');
const notFound = () =>
  new AppError(404, 'EVALUATION_NOT_FOUND', 'Bạn chưa hoàn thành đánh giá cho ứng viên này');

export class EvaluationService {
  private cache: { at: number; rows: repo.CriterionRow[] } | null = null;

  constructor(private readonly d: EvaluationDeps) {}

  async listCriteria(): Promise<repo.CriterionRow[]> {
    const ttl = this.d.criteriaTtlMs;
    const now = this.d.clock().getTime();
    if (ttl > 0 && this.cache && now - this.cache.at < ttl) return this.cache.rows;
    const rows = await repo.listActiveCriteria(this.d.db);
    this.cache = { at: now, rows };
    return rows;
  }

  async listMine(caller: Caller, maHdpv: string) {
    const ok = await this.d.policy.canViewPanel(caller, maHdpv);
    if (!ok.ok) throw denialToError(ok);
    return repo.listMine(this.d.db, caller.userId, maHdpv);
  }

  /** Vị trí có thể giới thiệu sang cho một ứng viên đang mở để chấm (BR5.6). */
  async referablePositions(caller: Caller, maHdpv: string, maUngVien: string): Promise<PositionInfo[]> {
    const ok = await this.d.policy.canOpenForScoring(caller, maHdpv, maUngVien);
    if (!ok.ok) throw denialToError(ok);
    return this.d.policy.listReferablePositions(ok.value.maViTri);
  }

  /** Bài đã hoàn thành của chính người gọi, chỉ đọc (BR7.5). Tra theo userId trong token nên không đọc được bài của người khác. */
  async getMine(caller: Caller, maHdpv: string, maUngVien: string): Promise<EvaluationDetail> {
    const ok = await this.d.policy.canComplete(caller, maHdpv, maUngVien);
    if (!ok.ok) throw denialToError(ok);
    const row = await repo.findByTriple(this.d.db, caller.userId, maHdpv, maUngVien);
    if (!row) throw notFound();
    const [diem, referViTri] = await Promise.all([
      repo.listScores(this.d.db, row.evaluationId),
      row.referMaViTri ? this.d.policy.findPosition(row.referMaViTri) : Promise.resolve(null),
    ]);
    return {
      evaluationId: row.evaluationId,
      maHdpv: row.maHdpv,
      maUngVien: row.maUngVien,
      diem,
      nhanXet: row.nhanXet,
      ketLuan: row.ketLuan,
      referViTri,
      referLyDo: row.referLyDo,
      diemTrungBinh: row.diemTrungBinh,
      submittedAt: row.submittedAt,
      trangThai: 'SUBMITTED',
    };
  }

  /** Hoàn thành đánh giá: kiểm quyền, kiểm payload, rồi ghi phiếu và điểm trong một giao dịch (RD-3, RD-4). */
  async complete(
    caller: Caller,
    maHdpv: string,
    maUngVien: string,
    input: CompletionInput,
  ): Promise<CompletionResult> {
    const allowed = await this.d.policy.canComplete(caller, maHdpv, maUngVien);
    if (!allowed.ok) throw denialToError(allowed);

    const criteria = await this.listCriteria();
    if (criteria.length === 0) {
      throw new AppError(400, 'NO_CRITERIA', 'Chưa cấu hình tiêu chí');
    }
    const issues = validateCompletion(criteria, input);
    const referMaViTri = blankToUndefined(input.referMaViTri) ?? null;
    const referLyDo = blankToUndefined(input.referLyDo) ?? null;
    if (issues.length === 0 && referMaViTri) {
      const referable = await this.d.policy.listReferablePositions(allowed.value.maViTri);
      if (!referable.some((p) => p.maViTri === referMaViTri)) {
        issues.push({
          field: 'referMaViTri',
          message: 'Vị trí giới thiệu không tồn tại, đã ngừng hoạt động hoặc trùng vị trí hiện tại',
        });
      }
    }
    if (issues.length > 0) {
      throw new AppError(400, 'VALIDATION_FAILED', 'Dữ liệu không hợp lệ', issues);
    }

    // Điểm trung bình do server tính; giá trị client gửi (nếu có) không bao giờ được đọc (BR6.3).
    const scaleOf = new Map(criteria.map((c) => [c.maTieuChi, c.diemToiDa]));
    const avg = averageScore(input.diem.map((s) => ({ diem: s.diem, max: scaleOf.get(s.maTieuChi)! })));
    const diemTrungBinh = storedToDecimal(avg!.stored100);

    const toResult = (e: repo.EvaluationRow, replayed: boolean): CompletionResult => ({
      evaluationId: e.evaluationId,
      submittedAt: e.submittedAt,
      trangThai: 'SUBMITTED',
      ketLuan: e.ketLuan,
      diemTrungBinh: e.diemTrungBinh,
      replayed,
    });
    const sameKey = (existing: repo.EvaluationRow | null): CompletionResult | null => {
      if (!existing) return null;
      if (existing.maHdpv !== maHdpv || existing.maUngVien !== maUngVien) throw keyReused();
      return toResult(existing, true);
    };

    let result: CompletionResult;
    try {
      result = await this.d.db.withTransaction(async (tx) => {
        const replay = sameKey(await repo.findByKey(tx, caller.userId, input.idempotencyKey));
        if (replay) return replay;
        if (await repo.findByTriple(tx, caller.userId, maHdpv, maUngVien)) throw alreadyCompleted();

        const evaluationId = randomUUID();
        const submittedAt = this.d.clock();
        await repo.insertEvaluation(tx, {
          evaluationId,
          userId: caller.userId,
          maHdpv,
          maUngVien,
          nhanXet: input.nhanXet ?? null,
          idempotencyKey: input.idempotencyKey,
          submittedAt,
          ketLuan: input.ketLuan,
          referMaViTri,
          referLyDo,
          diemTrungBinh,
        });
        await repo.insertScores(tx, evaluationId, input.diem);
        return {
          evaluationId,
          submittedAt,
          trangThai: 'SUBMITTED' as const,
          ketLuan: input.ketLuan,
          diemTrungBinh,
          replayed: false,
        };
      });
    } catch (err) {
      if (!(err instanceof UniqueViolationError)) throw err;
      // Hai request đồng thời: ràng buộc duy nhất ở DB là rào cuối (SC-5). Đọc lại để phân biệt 200 và 409.
      const replay = sameKey(await repo.findByKey(this.d.db, caller.userId, input.idempotencyKey));
      if (replay) {
        result = replay;
      } else {
        throw alreadyCompleted();
      }
    }

    // Sự kiện kiểm toán phát sau commit (SD-9); chỉ có kết luận và cờ refer, không có điểm, nhận xét hay lý do (BR8.5).
    this.d.audit.event(result.replayed ? 'evaluation_replayed' : 'evaluation_completed', {
      userId: caller.userId,
      maHdpv,
      maUngVien,
      evaluationId: result.evaluationId,
      ketLuan: result.ketLuan,
      ...(result.replayed ? {} : { coRefer: referMaViTri !== null }),
    });
    return result;
  }
}
