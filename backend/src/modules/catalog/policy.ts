import type { Db } from '../../db/pool.js';
import type { Caller } from '../identity/service.js';
import * as repo from './repo.js';

export type DenialReason =
  | 'NOT_ASSIGNED'
  | 'PANEL_NOT_FOUND'
  | 'PANEL_NOT_AVAILABLE'
  | 'CANDIDATE_NOT_FOUND'
  | 'CANDIDATE_NOT_CONFIRMED';

export interface Denial {
  reason: DenialReason;
  httpStatus: 403 | 404;
}
export type Allowed<T> = { ok: true; value: T };
export type Denied = { ok: false; denial: Denial };
export type PolicyResult<T> = Allowed<T> | Denied;

const deny = (reason: DenialReason): Denied => ({
  ok: false,
  denial: { reason, httpStatus: reason === 'NOT_ASSIGNED' ? 403 : 404 },
});

/**
 * Điểm duy nhất áp dụng chính sách truy cập (ADR-004, SD-4): được gán (403), HĐPV tồn tại và đúng trạng thái (404),
 * ứng viên thuộc HĐPV và Xác nhận = Y (404). Thứ tự kiểm tra: tồn tại, được gán, trạng thái, ứng viên (BR2.10).
 */
export class CatalogPolicy {
  constructor(private readonly db: Db) {}

  private async checkPanel(
    caller: Caller,
    maHdpv: string,
    allowed: readonly repo.PanelStatus[],
  ): Promise<PolicyResult<repo.PanelRow>> {
    const panel = await repo.findPanel(this.db, maHdpv);
    if (!panel) return deny('PANEL_NOT_FOUND');
    if (!(await repo.isAssigned(this.db, maHdpv, caller.employedId))) return deny('NOT_ASSIGNED');
    if (!allowed.includes(panel.trangThai)) return deny('PANEL_NOT_AVAILABLE');
    return { ok: true, value: panel };
  }

  private async checkCandidate(
    caller: Caller,
    maHdpv: string,
    maUngVien: string,
    allowed: readonly repo.PanelStatus[],
  ): Promise<PolicyResult<{ maViTri: string }>> {
    const panel = await this.checkPanel(caller, maHdpv, allowed);
    if (!panel.ok) return panel;
    const pc = await repo.findPanelCandidate(this.db, maHdpv, maUngVien);
    if (!pc) return deny('CANDIDATE_NOT_FOUND');
    if (pc.xacNhan !== 'Y') return deny('CANDIDATE_NOT_CONFIRMED');
    return { ok: true, value: { maViTri: pc.viTri.maViTri } };
  }

  /** Được phép mở phiếu chấm: HĐPV Inprogress (BR2.2). */
  canOpenForScoring(caller: Caller, maHdpv: string, maUngVien: string) {
    return this.checkCandidate(caller, maHdpv, maUngVien, ['INPROGRESS']);
  }

  /** Được phép hoàn thành đánh giá: HĐPV Inprogress hoặc Completed (BR3.5). */
  canComplete(caller: Caller, maHdpv: string, maUngVien: string) {
    return this.checkCandidate(caller, maHdpv, maUngVien, ['INPROGRESS', 'COMPLETED']);
  }

  /** Vị trí có thể giới thiệu sang: đang hoạt động, khác vị trí hiện tại của ứng viên (BR5.3, BR5.6). */
  listReferablePositions(currentMaViTri: string) {
    return repo.listReferablePositions(this.db, currentMaViTri);
  }

  /** Tên vị trí để hiển thị lại bài đã hoàn thành, kể cả vị trí đã ngừng (BR7.5). */
  findPosition(maViTri: string) {
    return repo.findPosition(this.db, maViTri);
  }

  /** Được phép xem HĐPV và danh sách ứng viên: được gán và Inprogress. */
  async canViewPanel(caller: Caller, maHdpv: string): Promise<PolicyResult<void>> {
    const r = await this.checkPanel(caller, maHdpv, ['INPROGRESS']);
    return r.ok ? { ok: true, value: undefined } : r;
  }
}
