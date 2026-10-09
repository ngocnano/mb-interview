**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho `contract-summary.md`, đối chiếu `unit-of-work.md`, `unit-of-work-dependency.md`, `components.md`, `decisions.md`, `requirements.md` và câu trả lời Q1..Q3.

Nhận định: bảy hợp đồng phủ đủ mọi cạnh trong sơ đồ phụ thuộc Unit (U2, U3, U5 → U1; U4 → U3) và hai ranh giới ra ngoài (người vận hành nạp tệp, nhà cung cấp AI). OpenAPI C1 có 12 đường dẫn, 13 thao tác, khớp từng FR-A0..FR-A10 và cột Unit chỉ rõ Unit nào thêm API nào. Bảy khối yaml đều đọc được bằng trình phân tích YAML và OpenAPI không thiếu tham chiếu (kiểm bằng script). Quy tắc nghiệp vụ được phản ánh đúng ở hợp đồng: BR-A1, BR-A2 qua `canOpenForScoring` / `canComplete` (C2, đúng ADR-004); refer chỉ khi `KHAC`; server tự tính `diemTrungBinh` và bỏ qua giá trị client (C5, ADR-003); idempotency `200` / `409`; AI tắt mặc định trả `AI_DISABLED`; CV qua liên kết ngắn hạn, `no-store`. Bộ ví dụ dùng chung cho công thức điểm trung bình tính đúng (4, 3, 4 ra 3,67 lưu và 3,7 hiển thị; 4, 3, 5, 4, 5 ra 4,20). Quy tắc thay đổi hợp đồng, thời gian chờ và thử lại đúng Q3 = A.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | C1 `/cv-files/{token}` | Yêu cầu JWT trong header có thể không làm được với trình xem PDF nhúng trên web; khi đó U3 phải đổi cách cấp nội dung | Chọn gói xem PDF sớm ở U3 và quyết định cách cấp nội dung (tải về bộ nhớ app rồi hiển thị là phương án dự phòng) | New |
| R-02 | Medium | Quy tắc thay đổi, `ketLuan` | `ketLuan` từ không có (U1) sang bắt buộc (U2) là thay đổi phá vỡ trong `v1`; chỉ an toàn nếu U1 và U2 phát hành cùng nhau | Delivery Planning ghi rõ U1 không được phát hành riêng ra người dùng thật | New |
| R-03 | Medium | C2 `upsertImportBatch`, C3, C4 | Giao dịch nạp dữ liệu trải qua nhiều module bằng cách truyền giao dịch vào; cần một kiểu giao dịch dùng chung giữa các module | Functional Design / thiết kế kỹ thuật định nghĩa kiểu giao dịch dùng chung trong module nền | New |
| R-04 | Low | C3 `verifyToken` | Tài khoản bị khóa sau khi phát token vẫn bị từ chối nghĩa là mỗi request phải đọc trạng thái tài khoản | Chấp nhận; NFR xem xét chi phí đọc hoặc bộ đệm ngắn | New |
| R-05 | Low | C1 `/my-evaluations`, `/panels/{maHdpv}/candidates` | Không phân trang; HĐPV rất đông ứng viên có thể chậm | Chấp nhận cho MVP; ghi ở NFR | New |
| R-06 | Low | C6 | Tệp nạp chứa mật khẩu dạng rõ; đã ghi không commit vào git và không ghi log | Thêm mẫu tên tệp nạp vào `.gitignore` khi dựng U1 | New |
| R-07 | Low | C7 | Nhà cung cấp AI chưa chọn (OQ-AI-1..4) | Bộ giả lập đủ để dựng và test U4 | New |

### Suggestions

- Đặt tệp OpenAPI C1 vào mã nguồn backend và sinh kiểu dữ liệu cho cả Node.js và Dart từ đó, để app và backend không lệch trường.
