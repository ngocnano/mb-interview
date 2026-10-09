# Yêu cầu quan sát — U1 scoring-skeleton

Mã `NFR14.x` kế thừa NFR-14 (Quan sát và vận hành). Số mã tiếp theo bắt đầu từ NFR14.4 để không trùng `reliability-requirements.md`.

## Sources

- `inception/requirements-analysis/requirements.md` — NFR-14, NFR-1
- `construction/u1-scoring-skeleton/nfr-requirements/nfr-requirements-questions.md` — Q4 = A
- `construction/u1-scoring-skeleton/nfr-requirements/security-requirements.md` — NFR1.11 (kiểm toán)
- `aidlc/spaces/default/memory/project.md` — audit bất biến

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR14.4 | Định dạng log | JSON một dòng ra stdout; trường tối thiểu: thời điểm, mức, mã tương quan, đường dẫn, mã trạng thái, thời gian xử lý (ms), userId nếu đã xác thực | Test định dạng log | NFR-14 |
| NFR14.5 | Mức log | `info` cho request thành công, `warn` cho 4xx bất thường (đăng nhập thất bại, tạm khóa), `error` cho 5xx và lỗi DB | Test mức log | NFR-14 |
| NFR14.6 | Không ghi dữ liệu nhạy cảm | Log không chứa mật khẩu, token, sdt, ngày sinh, giới tính, nội dung nhận xét | Test quét log sau chạy `verify:e2e` | NFR-1 |
| NFR14.7 | Sự kiện kiểm toán | Ghi sự kiện riêng (loại, userId, mã HĐPV, mã ứng viên nếu có, thời điểm, mã tương quan) cho: đăng nhập thất bại, tạm khóa, hoàn thành đánh giá, gửi lại cùng khóa, chạy nạp dữ liệu | Test có sự kiện tương ứng | NFR1.11 |
| NFR14.8 | Kiểm tra sức khỏe | `GET /health` không cần xác thực, trả `200` khi tiến trình chạy và DB truy vấn được, `503` khi DB không dùng được; không lộ chi tiết nội bộ | Test hai trạng thái | NFR-14 |
| NFR14.9 | Giữ log | 30 ngày: backend chỉ ghi ra stdout; việc thu thập stdout vào tệp xoay vòng theo ngày hoặc vào hệ thống log do hạ tầng quyết định ở Infrastructure Design | Kiểm cấu hình xoay vòng | NFR-14 |
| NFR14.10 | Chỉ số theo dõi (SLI) tối thiểu | Đếm theo mã trạng thái, p95 thời gian xử lý mỗi API, số lần tạm khóa đăng nhập, số lần hoàn thành đánh giá; lấy từ log, chưa có nền tảng giám sát | Truy vấn log bằng script khi cần | NFR-14 |
| NFR14.11 | Ngưỡng cảnh báo thủ công | Xem lại log khi tỷ lệ 5xx trên 1% trong 5 phút hoặc `/health` trả 503; chưa gửi cảnh báo tự động | Quy trình vận hành | NFR-14 |

## Assumptions & Open Questions

- **[assumption]** Chưa dùng nền tảng giám sát hay cảnh báo bên ngoài (Q4 = A); thêm khi triển khai thật.
- **Open question:** None.
