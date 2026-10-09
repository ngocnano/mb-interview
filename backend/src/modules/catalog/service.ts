import type { Db } from '../../db/pool.js';
import { AppError } from '../../errors.js';
import type { Caller } from '../identity/service.js';
import type { Denied } from './policy.js';
import { CatalogPolicy } from './policy.js';
import * as repo from './repo.js';

const NOT_FOUND_CODES: Record<string, string> = {
  PANEL_NOT_AVAILABLE: 'PANEL_NOT_AVAILABLE',
  CANDIDATE_NOT_CONFIRMED: 'CANDIDATE_NOT_CONFIRMED',
};

export function denialToError(d: Denied): AppError {
  return d.denial.httpStatus === 403
    ? new AppError(403, 'FORBIDDEN', 'Bạn không được gán vào hội đồng phỏng vấn này')
    : new AppError(404, NOT_FOUND_CODES[d.denial.reason] ?? 'NOT_FOUND', 'Không tìm thấy dữ liệu yêu cầu');
}

export class CatalogService {
  constructor(
    private readonly db: Db,
    private readonly policy: CatalogPolicy,
  ) {}

  listPanels(caller: Caller): Promise<repo.PanelRow[]> {
    return repo.listAssignedInprogressPanels(this.db, caller.employedId);
  }

  async listCandidates(
    caller: Caller,
    maHdpv: string,
  ): Promise<{ panel: repo.PanelRow; items: repo.CandidateRow[] }> {
    const ok = await this.policy.canViewPanel(caller, maHdpv);
    if (!ok.ok) throw denialToError(ok);
    const [panel, items] = await Promise.all([
      repo.findPanel(this.db, maHdpv),
      repo.listConfirmedCandidates(this.db, maHdpv),
    ]);
    if (!panel) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu yêu cầu');
    return { panel, items };
  }

  /** Thông tin ứng viên để chấm; không bao gồm sdt, ngày sinh, giới tính (BR2.6). */
  async getCandidate(
    caller: Caller,
    maHdpv: string,
    maUngVien: string,
  ): Promise<{ candidate: repo.PanelCandidateDetail; panel: repo.PanelRow }> {
    const ok = await this.policy.canOpenForScoring(caller, maHdpv, maUngVien);
    if (!ok.ok) throw denialToError(ok);
    const [candidate, panel] = await Promise.all([
      repo.findPanelCandidate(this.db, maHdpv, maUngVien),
      repo.findPanel(this.db, maHdpv),
    ]);
    if (!candidate || !panel) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy dữ liệu yêu cầu');
    return { candidate, panel };
  }
}
