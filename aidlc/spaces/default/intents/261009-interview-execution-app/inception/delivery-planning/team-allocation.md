# Phân công Bolt

Bolt = một lượt xây dựng một phần công việc, kết thúc bằng thứ chạy được. Mob = nhóm (người hoặc agent) cùng sở hữu một Bolt.

## Sources

- `inception/delivery-planning/delivery-planning-questions.md` — Q4 = A (nối tiếp), Q8 = A (một phiên làm việc)
- `inception/delivery-planning/bolt-plan.md` — danh sách Bolt B1..B5
- `aidlc/spaces/default/memory/team.md` — trunk-based, squash-merge, TDD

Team Formation (1.5) không chạy ở scope classic, nên mọi Bolt do aidlc-developer-agent (AI) thực hiện, người dùng duyệt tại các điểm kiểm tra.

| Bolt | Mob | Người duyệt |
|---|---|---|
| B1 `b1-scoring-skeleton` | aidlc-developer-agent | Người dùng (điểm kiểm tra walking skeleton) |
| B2 `b2-scoring-complete` | aidlc-developer-agent | Người dùng |
| B3 `b3-ui-experience` | aidlc-developer-agent | Người dùng |
| B4 `b4-cv-viewer` | aidlc-developer-agent | Người dùng |
| B5 `b5-ai-assist` | aidlc-developer-agent | Người dùng (kèm Legal/Security cho nhà cung cấp AI) |

- Thực thi nối tiếp, mỗi lúc một Bolt, nên không có Program Board (bảng điều phối nhiều nhóm).
- Sở hữu Construction: một phiên làm việc (solo), không giao Unit cho nhiều nhóm.

## Assumptions & Open Questions

- **[assumption]** Một người dùng duy nhất đóng vai chủ sản phẩm và người duyệt.
- **Open question:** Không có.
