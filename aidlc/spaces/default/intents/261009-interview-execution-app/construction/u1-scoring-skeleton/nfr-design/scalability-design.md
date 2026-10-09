# Thiết kế quy mô — U1 scoring-skeleton

Mã `SC-n` là các giải pháp thiết kế quy mô.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/scalability-requirements.md` — NFR13.8..NFR13.14
- `construction/u1-scoring-skeleton/nfr-requirements/performance-requirements.md` — NFR13.1..NFR13.7
- `construction/u1-scoring-skeleton/nfr-design/nfr-design-questions.md` — Q2 = A, Q3 = A
- `construction/u1-scoring-skeleton/nfr-design/logical-components.md` — LC-1, LC-6, LC-9, LC-11

| Mã | Giải pháp | Chi tiết | Đáp ứng |
|---|---|---|---|
| SC-1 | Kiến trúc một bản | Một tiến trình backend (modular monolith) và một Oracle XE; mở rộng theo chiều dọc nếu cần (tăng bộ nhớ, tăng kích thước nhóm kết nối); tải thiết kế: 50 người dùng đồng thời, 20 HĐPV `Inprogress`, 200 ứng viên mỗi HĐPV, 5 tiêu chí | NFR13.8, NFR13.9 |
| SC-2 | Không trạng thái phiên | Token tự chứa; mọi trạng thái nghiệp vụ và bộ đếm đăng nhập sai nằm ở DB; chỉ giới hạn tốc độ IP và bộ đệm tiêu chí nằm trong bộ nhớ tiến trình (Q3 = A), nên chạy thêm bản thứ hai vẫn đúng chức năng, chỉ khác là đếm IP riêng từng bản | NFR13.9 |
| SC-3 | Danh sách đầy đủ có chặn trên | S2 và S3 trả toàn bộ; LC-3 kiểm số dòng và ghi log `warn` khi một HĐPV vượt 200 ứng viên; khi cần phân trang sẽ thêm tham số `limit`, `offset` tùy chọn vào hợp đồng (chỉ thêm, không đổi v1) | NFR13.10 |
| SC-4 | Ước tính tăng trưởng | Mỗi hoàn thành tạo 1 dòng phiếu và tối đa 20 dòng điểm; dưới 100 000 dòng sau một năm nội bộ; không phân vùng bảng; chỉ mục theo PD-3 | NFR13.11 |
| SC-5 | Đồng thời khi ghi | Rào cuối là ràng buộc duy nhất ở DB; khi nhận ORA-00001, LC-4 đọc lại để phân biệt hai trường hợp: cùng `idempotencyKey` cùng cặp thì trả `200` bản đã lưu, khác khóa thì `409` | NFR13.12 |
| SC-6 | Dọn bộ đếm đăng nhập sai | LC-9 chạy trong tiến trình backend một lần khi khởi động và mỗi giờ sau đó, xóa dòng `LoginThrottle` có `khoaDen` rỗng hoặc đã qua và `lanSaiCuoi` cũ hơn 1 ngày; lỗi khi dọn chỉ ghi `warn`, không làm sập tiến trình | NFR13.13 |
| SC-7 | Nhóm kết nối | Tối thiểu 2, tối đa 10, hàng đợi 5 giây rồi `503`; hai tiến trình (backend và lệnh nạp) dùng nhóm riêng, tổng không vượt giới hạn phiên của Oracle XE | NFR13.14 |

## Ngưỡng cần thiết kế lại

| Dấu hiệu | Hành động |
|---|---|
| Hơn 50 người dùng đồng thời kéo dài | Tăng nhóm kết nối, kiểm tra p95; cân nhắc chạy hai bản backend và chuyển giới hạn IP sang kho dùng chung |
| Một HĐPV hơn 200 ứng viên | Thêm phân trang vào hai API danh sách |
| Bảng phiếu hơn 1 triệu dòng | Xem lại chỉ mục và lưu trữ lịch sử |

## Assumptions & Open Questions

- **[assumption]** Oracle XE giới hạn tài nguyên (bộ nhớ, dung lượng); ở mức tải trên là đủ, đối chiếu giới hạn cụ thể khi chọn ảnh ở Infrastructure Design.
- **Open question:** None.
