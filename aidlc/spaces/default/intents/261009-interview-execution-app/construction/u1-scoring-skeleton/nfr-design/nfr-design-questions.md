# Câu hỏi NFR Design — U1 scoring-skeleton

Phần lớn thiết kế đã được quyết định bởi các chỉ tiêu NFR và công nghệ đã chọn. Chỉ còn bốn lựa chọn thiết kế thật sự. Mặc định là A.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/*.md` — NFR1.x, NFR2.x, NFR13.x, NFR14.x, tech-stack-decisions
- `construction/u1-scoring-skeleton/functional-design/functional-spec.md` — WF-1..WF-6
- `inception/contract-design/contract-summary.md` — C2, C3 (giao dịch truyền vào), thời gian chờ
- `.aidlc-engine/reviews/contract-design` — R-03: cần một kiểu giao dịch dùng chung giữa các module

## Q1. Giao dịch dùng chung giữa các module (nạp dữ liệu và hoàn thành đánh giá)

A. Một lớp truy cập DB mỏng cung cấp `withTransaction(fn)`; các module nhận một đối tượng giao dịch `tx` làm tham số khi cần ghi chung giao dịch (DataImport truyền `tx` vào IdentityAccess, InterviewCatalog, Evaluation). Truy vấn đọc dùng nhóm kết nối thường.
B. Mỗi module tự mở giao dịch riêng và DataImport chạy tuần tự từng module (không còn một giao dịch duy nhất).
X. Other (please specify)

[Answer]: A

## Q2. Dọn bộ đếm đăng nhập sai (NFR13.13)

A. Công việc dọn chạy trong chính tiến trình backend: một lần khi khởi động và mỗi giờ sau đó, xóa dòng `LoginThrottle` đã hết khóa hơn 1 ngày và không có lần sai nào trong 1 ngày.
B. Lịch chạy riêng bên ngoài (cron hoặc Task Scheduler).
X. Other (please specify)

[Answer]: A

## Q3. Nơi lưu bộ đếm giới hạn tốc độ theo IP (NFR1.4)

A. Trong bộ nhớ của tiến trình (`express-rate-limit` mặc định). Đủ cho một bản backend; mất bộ đếm khi khởi động lại.
B. Lưu ở Oracle để dùng chung giữa nhiều bản backend.
X. Other (please specify)

[Answer]: A

## Q4. Cách báo lỗi khi mất kết nối DB (NFR2.5)

A. Trả `503` mã `DB_UNAVAILABLE` kèm thông báo tiếng Việt "Hệ thống tạm thời không khả dụng, vui lòng thử lại"; app hiển thị lỗi và nút Thử lại. Nhóm kết nối tự tạo lại kết nối; `/health` trả `503` đến khi DB truy vấn được. Không dùng bộ ngắt mạch (circuit breaker) vì chỉ có một phụ thuộc và tải nhỏ.
B. Thêm bộ ngắt mạch quanh DB.
X. Other (please specify)

[Answer]: A
