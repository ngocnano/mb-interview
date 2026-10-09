# Thiết kế hiệu năng — U1 scoring-skeleton

Mã `PD-n` là các giải pháp thiết kế hiệu năng; bảng ánh xạ NFR nằm ở `traceability.json`.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/performance-requirements.md` — NFR13.1..NFR13.7
- `construction/u1-scoring-skeleton/nfr-requirements/scalability-requirements.md` — NFR13.8..NFR13.14
- `construction/u1-scoring-skeleton/nfr-requirements/security-requirements.md` — NFR5.1
- `construction/u1-scoring-skeleton/nfr-design/logical-components.md` — LC-1..LC-11
- `construction/u1-scoring-skeleton/functional-design/functional-spec.md` — WF-3, WF-4, WF-6

| Mã | Giải pháp | Chi tiết | Đáp ứng |
|---|---|---|---|
| PD-1 | Nhóm kết nối Oracle | Nhóm do LC-6 quản lý: tối thiểu 2, tối đa 10 kết nối, hàng đợi chờ tối đa 5 giây rồi trả `503`; đặt thời gian chờ mỗi câu truy vấn 8 giây (nhỏ hơn thời gian chờ 10 giây của app) | NFR13.1, NFR13.2, NFR13.7, NFR13.14 |
| PD-2 | Truy vấn danh sách một lượt | S2 và S3 mỗi màn dùng một truy vấn nối bảng (không gọi lặp theo từng dòng); S3 gọi song song hai API (danh sách ứng viên và `my-evaluations`) | NFR13.1, NFR13.3 |
| PD-3 | Chỉ mục | Khóa duy nhất: `UserAccount.email`; `InterviewEvaluation(userId, maHdpv, maUngVien)` và `(userId, idempotencyKey)`; chỉ mục thường: `PanelInterviewer(maCbql, maHdpv)`, `PanelCandidate(maHdpv, xacNhan, tuThoiGian, maUngVien)`, `Criterion(trangThai, thuTu)`, `InterviewEvaluation(userId, maHdpv)` | NFR13.5 |
| PD-4 | Bộ nhớ đệm tiêu chí | Danh sách tiêu chí ACTIVE đệm trong tiến trình 60 giây (ít đổi, chỉ đổi khi nạp); không đệm dữ liệu theo người dùng | NFR13.1 |
| PD-5 | Chi phí băm mật khẩu | `bcryptjs` cost 10 dùng phiên bản bất đồng bộ (nhường vòng lặp sự kiện giữa các khối tính); đăng nhập là thao tác hiếm so với đọc nên không cần hàng đợi riêng | NFR13.2 |
| PD-6 | Nén và kích thước phản hồi | Nén gzip với phản hồi trên 1 KB; danh sách chỉ trả trường cần cho màn (không trả kinh nghiệm, trình độ ở danh sách) | NFR13.1, NFR13.3 |
| PD-7 | Phía app | Hiển thị chỉ báo tải ngay khi gọi API, giữ danh sách cũ khi làm mới; hủy request cũ khi rời màn; khung xương nâng cao thuộc U5 | NFR13.3 |
| PD-8 | Nạp dữ liệu | Ghi theo lô (batch) trong một giao dịch, nạp từng nhóm theo thứ tự cố định; không commit từng dòng | NFR13.6 |
| PD-9 | Dữ liệu thời gian | Giờ phỏng vấn lưu `hh:mm` và so sánh như chuỗi hai chữ số nên sắp xếp đúng thứ tự; ngày lưu ở HĐPV; không chuyển múi giờ ở bất kỳ lớp nào | NFR5.1 |
| PD-10 | Đo hiệu năng | Kịch bản tải nhỏ (autocannon, devDependency) chạy với bộ dữ liệu NFR13.4 sinh sẵn; ghi p95 vào báo cáo xác minh; đo 4G ở app làm thủ công | NFR13.1, NFR13.2, NFR13.3, NFR13.4 |

## Ngân sách thời gian cho một lần hoàn thành đánh giá (mục tiêu p95 ≤ 1 giây)

| Bước | Ngân sách |
|---|---|
| Xác thực token và đọc trạng thái tài khoản | 30 ms |
| Chính sách `canComplete` (một truy vấn nối) | 50 ms |
| Kiểm payload, tra idempotency | 30 ms |
| Giao dịch ghi phiếu và tối đa 20 dòng điểm | 150 ms |
| Mạng và dự phòng | 740 ms |

## Assumptions & Open Questions

- **[assumption]** Với 50 người dùng đồng thời chỉ vài người đăng nhập cùng lúc; nếu nhiều người đăng nhập cùng một thời điểm, bcrypt thuần JS có thể làm chậm tạm thời, chấp nhận cho MVP.
- **Open question:** None.
