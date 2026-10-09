# Đặc tả hạ tầng — U1 scoring-skeleton

Hạ tầng của dự án gồm hai dịch vụ chạy bằng Docker Compose (Oracle XE và backend Node.js), cộng app Flutter. Mã `IS-n` là các quyết định hạ tầng, được `traceability.json` dẫn chiếu.

## Sources

- `construction/u1-scoring-skeleton/infrastructure-design/infrastructure-design-questions.md` — Q1..Q5 = A
- `construction/u1-scoring-skeleton/nfr-design/logical-components.md` — LC-1..LC-11
- `construction/u1-scoring-skeleton/nfr-design/security-design.md` — SD-8, SD-10, SD-11, SD-13
- `construction/u1-scoring-skeleton/nfr-design/reliability-design.md` — RD-5, RD-6, RD-9, RD-10, RD-11
- `construction/u1-scoring-skeleton/nfr-design/scalability-design.md` — SC-1, SC-7
- `construction/u1-scoring-skeleton/nfr-design/observability-design.md` — OD-5, OD-6
- `inception/domain-design/components.md` — Oracle XE, kho tệp CV (U3), nhà cung cấp AI (U4)
- `inception/contract-design/contract-summary.md` — C1 (API), C6 (tệp nạp)

## Triển khai

| Mã | Khía cạnh | Lựa chọn | Lý do |
|---|---|---|---|
| IS-1 | Mô hình chạy | Docker Compose, hai dịch vụ: `oracle` và `backend`; không điều phối đa máy | Khớp kiến trúc một bản (SC-1); chạy giống nhau ở dev và demo |
| IS-2 | Mạng | Mạng nội bộ của Compose; chỉ `backend` công khai cổng 8080; cổng 1521 của `oracle` chỉ mở trên `127.0.0.1` ở dev và không mở ra ngoài ở demo | Giảm bề mặt tấn công |
| IS-3 | Lưu trữ | Volume Docker có tên `oracle-data` cho dữ liệu DB (cần tối thiểu 12 GB trống, giới hạn dữ liệu của XE); thư mục `./backups` gắn vào container để chứa bản xuất Data Pump; thư mục kho CV (U3) thêm ở lượt sau | Dữ liệu sống sót khi tạo lại container |
| IS-4 | Môi trường | `dev` (máy mỗi người, dữ liệu mẫu) và `demo` (một máy chạy Compose, dữ liệu nạp từ tệp thật); production thật chưa định | Q3 = A |
| IS-5 | Cách mô tả hạ tầng | `docker-compose.yml`, `docker/init/*.sql`, `.env.example`; không dùng IaC đám mây | Quy mô nhỏ, chạy cục bộ |
| IS-6 | Kích thước | `oracle`: tối thiểu 2 GB bộ nhớ và 2 CPU (yêu cầu của XE); `backend`: giới hạn 512 MB và 1 CPU; nhóm kết nối tối đa 10, tổng phiên dưới giới hạn của XE | NFR13.7, NFR13.14 |
| IS-7 | Khởi động lại và dừng êm | `restart: unless-stopped` cho cả hai dịch vụ; `stop_grace_period: 15s` cho `backend` (dừng êm 10 giây của RD-6) | RD-6, RD-9 |
| IS-8 | HTTPS | Dev dùng HTTP. Trên demo, HTTPS do lớp phía trước đảm nhiệm (reverse proxy kết thúc TLS, chọn khi biết máy và tên miền demo); backend chỉ nhận HTTP từ proxy và bật `Strict-Transport-Security` khi `NODE_ENV=production` | SD-10 |
| IS-9 | Giữ log 30 ngày | Trình điều khiển log `json-file` của Docker giới hạn `max-size: 50m`, `max-file: 10` để bảo vệ đĩa; script `scripts/archive-logs` chạy hằng ngày (Task Scheduler hoặc cron) chép log trong ngày vào `logs/AAAA-MM-DD.jsonl` và xóa tệp cũ hơn 30 ngày | OD-6 |
| IS-10 | Sao lưu và khôi phục | `scripts/backup` chạy `expdp` (Oracle Data Pump) trong container `oracle`, xuất lược đồ ứng dụng ra `./backups/AAAAMMDD-HHmm.dmp`; `scripts/restore` nhập lại bằng `impdp` vào lược đồ rỗng; sao lưu bắt buộc trước mỗi đợt phát hành (RPO 24 giờ, RTO 4 giờ) | RD-10, RD-11 |
| IS-11 | Bí mật và cấu hình | Biến môi trường nạp từ `.env` trên máy chủ (nằm trong `.gitignore`); `.env.example` được commit với giá trị giả; gồm `JWT_SECRET` (≥ 32 byte, bắt buộc), `DB_*` cho hai tài khoản DB, `CORS_ORIGINS` (rỗng thì từ chối nguồn khác), `NODE_ENV`; xoay khóa thủ công khi có người rời nhóm hoặc nghi lộ | SD-11, SD-13 |
| IS-12 | Tài khoản và lược đồ DB | `docker/init/01-users.sql` chạy lần đầu tạo `INTERVIEW_OWNER` (tạo bảng, nạp dữ liệu) và `INTERVIEW_APP` (quyền tối thiểu theo SD-8); `docker/init/02-schema.sql` tạo bảng, khóa duy nhất và chỉ mục theo PD-3 bằng tài khoản chủ lược đồ; script cũng tạo đối tượng thư mục (DIRECTORY) của Oracle trỏ tới `/opt/oracle/backups` cho Data Pump (IS-10); thay đổi cấu trúc về sau thêm tệp đánh số | SD-8, PD-3 |
| IS-13 | Kiểm tra sức khỏe | `oracle` dùng kiểm tra sức khỏe có sẵn của ảnh; `backend` kiểm tra `GET /health`; `backend` chờ `oracle` ở trạng thái `service_healthy` trước khi chạy | OD-5, RD-5, RD-9 |

## Dịch vụ hạ tầng

| Dịch vụ | Vai trò | Cấu hình | Ghi chú |
|---|---|---|---|
| `oracle` | Cơ sở dữ liệu | Ảnh `gvenzl/oracle-xe` bản `slim` (Oracle XE 21c), ghim theo phiên bản cụ thể khi dựng (Q2 = A); volume `oracle-data`; biến mật khẩu quản trị từ `.env` | Ảnh cộng đồng do bên thứ ba duy trì; kiểm tra điều khoản sử dụng Oracle XE trước khi dùng ngoài nội bộ |
| `backend` | API Node.js 22 và phục vụ Flutter Web tĩnh ở `/` | Ảnh dựng từ `backend/Dockerfile` đa tầng; chạy bằng người dùng không phải root; biến môi trường theo IS-11; cổng 8080 | Cùng nguồn với web nên web không cần CORS (SD-11 chỉ phục vụ nguồn khác) |
| Ứng dụng Flutter điện thoại | Máy khách | Gọi trực tiếp API của `backend`; địa chỉ API đặt khi build | Phát hành ngoài Compose |
| Bộ nhớ đệm, hàng đợi, tìm kiếm, CDN | Không dùng | — | Không cần ở quy mô này (SC-1) |

## Hạ tầng dùng chung

| Tài nguyên | Đơn vị sở hữu | Đơn vị dùng | Ranh giới truy cập |
|---|---|---|---|
| Oracle XE `oracle` và lược đồ ứng dụng | U1 | U2, U3, U4, U5 (qua backend) | Chỉ backend dùng tài khoản `INTERVIEW_APP`; chỉ lệnh nạp và script khởi tạo dùng `INTERVIEW_OWNER` |
| Backend Node.js | U1 | U2, U3, U4 thêm module và API | Cùng một tiến trình, ranh giới module theo `components.md` |
| Tệp `.env` và bí mật | U1 | U2, U3, U4 | Chỉ trên máy chủ, không vào git |

## Assumptions & Open Questions

- **[assumption]** Máy demo có Docker, tối thiểu 4 GB bộ nhớ trống và 12 GB đĩa trống.
- **[assumption]** Ảnh `gvenzl/oracle-xe` còn được duy trì và hỗ trợ XE 21c vào thời điểm dựng; có thể đổi sang ảnh chính thức mà không đổi thiết kế (chỉ đổi dòng `image` và biến).
- **Open question:** Máy và tên miền demo (cho HTTPS ở IS-8) chưa có; cần chốt trước buổi demo thật.
