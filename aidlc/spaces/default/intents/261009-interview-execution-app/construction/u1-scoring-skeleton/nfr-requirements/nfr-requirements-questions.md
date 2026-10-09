# Câu hỏi NFR Requirements — U1 scoring-skeleton

NFR (yêu cầu phi chức năng) là mục tiêu về hiệu năng, bảo mật, độ tin cậy, quan sát và công nghệ. Mặc định là A. Bảo mật mật khẩu, JWT 8 giờ, tạm khóa đăng nhập, không lộ dữ liệu nhạy cảm đã chốt ở các bước trước nên không hỏi lại.

## Sources

- `inception/requirements-analysis/requirements.md` — NFR-1..NFR-12
- `construction/u1-scoring-skeleton/functional-design/functional-spec.md`, `rules.md`
- `inception/contract-design/contract-summary.md` — thời gian chờ 10 giây, GET thử lại tối đa 2 lần
- `aidlc/spaces/default/memory/team.md` — TDD, coverage 80%, ESLint + Prettier, `dart format` + `flutter analyze`, phát hành thủ công theo đợt
- Môi trường kiểm tra trên máy: Node.js 22.13.0, npm 10.9.2, Docker có sẵn; Flutter SDK chưa thấy trong PATH

## Q1. Mục tiêu thời gian phản hồi

A. p95 ≤ 500 ms cho API đọc (danh sách HĐPV, ứng viên, tiêu chí); p95 ≤ 1 giây cho hoàn thành đánh giá và đăng nhập; mở một màn trong ≤ 2 giây trên mạng 4G. Đo bằng test tải nhỏ trên máy dev.
B. Chặt hơn: p95 ≤ 200 ms cho API đọc, ≤ 500 ms cho ghi.
X. Other (please specify)

[Answer]: A

## Q2. Quy mô cần chịu

A. Tối đa 50 người dùng đồng thời, tối đa 20 HĐPV `Inprogress`, tối đa 200 ứng viên mỗi HĐPV; một backend và một Oracle XE, không mở rộng ngang; danh sách không phân trang.
B. Tối đa 200 người dùng đồng thời và có phân trang cho danh sách.
X. Other (please specify)

[Answer]: A

## Q3. Độ sẵn sàng và sao lưu

A. Mục tiêu 99% trong giờ phỏng vấn (không cam kết SLA). Sao lưu bằng xuất dữ liệu Oracle thủ công trước mỗi đợt phát hành; RPO (mất dữ liệu tối đa) 24 giờ, RTO (thời gian khôi phục) 4 giờ. Mất DB thì app báo lỗi và cho Thử lại, không mất bài đã hoàn thành đã được xác nhận `201`.
B. Cao hơn: sao lưu tự động hằng ngày và máy chủ dự phòng.
X. Other (please specify)

[Answer]: A

## Q4. Nhật ký và theo dõi

A. Log JSON ra stdout với mã tương quan (correlation ID) cho từng request; mức info, warn, error; không ghi mật khẩu, token, sdt, ngày sinh, giới tính; ghi riêng các sự kiện kiểm toán (đăng nhập thất bại và bị khóa, hoàn thành đánh giá, chạy nạp dữ liệu) kèm userId; có điểm kiểm tra sức khỏe `/health`; log giữ 30 ngày bằng xoay vòng tệp. Chưa dùng nền tảng giám sát bên ngoài.
B. Thêm nền tảng giám sát và cảnh báo bên ngoài.
X. Other (please specify)

[Answer]: A

## Q5. Bộ công nghệ

A. Backend: Node.js 22 LTS + TypeScript, Express, `node-oracledb` (chế độ thin, không cần cài Oracle Client), `bcryptjs` (thuần JS, tránh biên dịch native trên Windows), `jsonwebtoken`, `zod` để kiểm payload; test bằng Vitest + Supertest, kiểm tích hợp với Oracle XE chạy Docker; ESLint + Prettier. App: Flutter bản ổn định mới nhất, `dio`, `flutter_secure_storage` (web dùng bộ nhớ trình duyệt), `go_router`, `riverpod`; test bằng `flutter_test`; `dart format` + `flutter analyze`. Cần cài Flutter SDK trước khi dựng app.
B. Giữ nguyên Node.js nhưng dùng Fastify thay Express.
X. Other (please specify)

[Answer]: A

## Q6. Thông số bảo mật vận hành

A. bcrypt cost 10; JWT ký HS256 bằng khóa bí mật tối thiểu 32 byte lấy từ biến môi trường, không có giá trị mặc định (thiếu khóa thì server không khởi động); CORS chỉ cho các nguồn được liệt kê; giới hạn chung 100 request mỗi phút mỗi IP; giới hạn kích thước JSON 100 KB; HTTP cho dev, HTTPS khi triển khai; `Cache-Control: no-store` cho API nghiệp vụ.
B. Nới lỏng cho dev: có khóa bí mật mặc định trong mã để chạy nhanh.
X. Other (please specify)

[Answer]: A
