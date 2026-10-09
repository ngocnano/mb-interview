/** Kênh sự kiện kiểm toán (SD-9, OD-4). Không bao giờ truyền mật khẩu, token hay dữ liệu cá nhân của ứng viên. */
export interface Audit {
  event(type: string, data?: Record<string, unknown>): void;
}

export const noopAudit: Audit = { event() {} };
