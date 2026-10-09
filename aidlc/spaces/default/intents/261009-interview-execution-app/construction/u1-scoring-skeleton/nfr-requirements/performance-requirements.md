# Yêu cầu hiệu năng — U1 scoring-skeleton

Mã `NFR13.x` kế thừa NFR-13 (Hiệu năng và quy mô) trong `requirements.md`; trong tài liệu này `NFR13` viết liền số, nghĩa là NFR-13.

## Sources

- `inception/requirements-analysis/requirements.md` — NFR-13
- `construction/u1-scoring-skeleton/nfr-requirements/nfr-requirements-questions.md` — Q1 = A, Q2 = A
- `construction/u1-scoring-skeleton/functional-design/functional-spec.md` — luồng WF-2..WF-6
- `inception/contract-design/contract-summary.md` — thời gian chờ 10 giây

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR13.1 | Thời gian phản hồi API đọc: `GET /panels`, `GET /panels/{maHdpv}/candidates`, `GET /panels/{maHdpv}/candidates/{maUngVien}`, `GET /criteria`, `GET /panels/{maHdpv}/my-evaluations` | p95 ≤ 500 ms ở 50 người dùng đồng thời với dữ liệu tối đa của NFR13.4 | Test tải nhỏ chạy trên máy dev với Oracle XE (Docker) | NFR-13 |
| NFR13.2 | Thời gian phản hồi `POST /auth/login` và `POST .../evaluation` | p95 ≤ 1 giây (đăng nhập đã gồm bcrypt cost 10) | Test tải nhỏ cùng bộ dữ liệu | NFR-13 |
| NFR13.3 | Thời gian mở một màn trên app | ≤ 2 giây từ lúc chạm tới lúc hiện nội dung, trên mạng 4G | Đo thủ công trên một thiết bị thật và trên web; ghi kết quả vào báo cáo xác minh | NFR-13 |
| NFR13.4 | Dữ liệu mức tối đa để đo | 50 người dùng đồng thời, 20 HĐPV `Inprogress`, 200 ứng viên mỗi HĐPV, 5 tiêu chí | Bộ dữ liệu sinh cho test tải | NFR-13 |
| NFR13.5 | Truy vấn danh sách dùng chỉ mục phù hợp để không quét toàn bảng | Mỗi truy vấn của S2, S3 có đường truy cập theo `maCbql`, `maHdpv` | Xem kế hoạch thực thi của các truy vấn chính khi thiết kế NFR | NFR-13 |
| NFR13.6 | Thao tác nạp dữ liệu | Nạp bộ mẫu (khoảng 6 ứng viên) ≤ 10 giây; bộ tối đa của NFR13.4 ≤ 2 phút | Chạy lệnh nạp và đo thời gian | NFR-13 |
| NFR13.7 | Tài nguyên | Một tiến trình backend dùng ≤ 512 MB bộ nhớ ở tải của NFR13.4 | Quan sát khi chạy test tải | NFR-13 |

Thời gian chờ phía app (10 giây) và số lần thử lại (GET tối đa 2) lấy từ `contract-summary.md` và thuộc NFR2.2.

## Assumptions & Open Questions

- **[assumption]** Chỉ tiêu đo trên máy phát triển, không phải máy chủ thật; số liệu chính thức đo lại khi chọn hạ tầng triển khai (Infrastructure Design).
- **Open question:** None.
