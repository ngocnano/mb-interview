# App thực hiện phỏng vấn (Phase 2)

Ứng dụng cho cán bộ quản lý (CBQL) trong hội đồng phỏng vấn (HĐPV): đăng nhập, chọn HĐPV đang phỏng vấn, xem danh sách ứng viên, chấm điểm từng tiêu chí và hoàn thành đánh giá. Bản này gồm **walking skeleton (U1)** và **chấm điểm hoàn chỉnh (U2)**: kết luận Đạt / Loại / Cân nhắc / Khác, giới thiệu sang vị trí khác khi chọn Khác, điểm trung bình xem trước và do server tính, hoàn thành an toàn khi mất mạng (Thử lại cùng khóa), màn xem lại bài đã hoàn thành (S5), nhãn kết luận và Điểm TB trên danh sách, đăng xuất. Xem CV (U3), AI tóm tắt CV (U4) và giao diện chung nâng cao (U5) làm ở các Bolt sau. Công thức điểm trung bình dùng chung giữa Node.js và Dart qua `shared/average-score-examples.json`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `backend/` | API Node.js 22 + TypeScript (Express), `node-oracledb`, lệnh nạp dữ liệu, test Vitest |
| `app/` | Ứng dụng Flutter (web và điện thoại), 5 màn S1..S5, test `flutter_test` |
| `docker/` | Script tạo hai tài khoản DB, lược đồ cho Oracle XE và `schema/migrate/` (migration đánh số) |
| `shared/` | `average-score-examples.json`: bộ ví dụ điểm trung bình dùng chung cho test backend và app |
| `data/sample/seed.json` | Dữ liệu mẫu (mật khẩu giả, chỉ dùng demo) |
| `scripts/` | CI, sao lưu, khôi phục, phát hành, lưu log, báo cáo log, kiểm bí mật |
| `docker-compose.yml` | Dịch vụ `oracle` (Oracle XE) và `backend` (kèm Flutter Web) |

## Điều kiện cần có

Node.js 22, Docker, Flutter SDK (bản ổn định; đã thử với 3.47). Windows: thêm `C:\src\flutter\bin` vào PATH nếu cài ở đó.

## Chạy nhanh (phát triển)

```bash
npm run init-env                 # tạo .env với mật khẩu ngẫu nhiên (không commit .env)
npm run db:up                    # chạy Oracle XE, tạo lược đồ lần đầu (mất 1–2 phút)
npm --prefix backend install
npm --prefix backend run import -- ../data/sample/seed.json   # nạp dữ liệu mẫu
npm --prefix backend run dev     # backend tại http://localhost:8080 (cần biến môi trường từ .env)
cd app && flutter run -d chrome --dart-define=API_BASE_URL=http://localhost:8080/api/v1
```

Tài khoản mẫu: `an@mau.vn` / `MatKhauMau-001` (E001, được gán vào HĐPV `HD004` đang `Inprogress`), `binh@mau.vn` / `MatKhauMau-002`, `cuong@mau.vn` / `MatKhauMau-003`.

## Chạy cả hệ thống bằng Docker Compose

```bash
cd app && flutter build web --release --dart-define=API_BASE_URL=/api/v1 && cd ..
docker compose up -d --build --wait      # backend phục vụ luôn Flutter Web tại http://localhost:8080
```

## Kiểm tra

| Mục đích | Lệnh |
|---|---|
| Toàn bộ kiểm tra (lint, định dạng, kiểu, test, độ phủ ≥ 80%, bí mật) | `npm run ci` |
| Test backend | `npm --prefix backend run test` (cần `npm run db:up`) |
| Test app | `cd app && flutter test` |
| Kiểm tra đầu cuối trên Oracle XE tạm | `npm --prefix backend run verify:e2e` |

`verify:e2e` tự dựng một Oracle XE riêng (cổng ngẫu nhiên, DB sạch), nạp dữ liệu mẫu, chạy ứng dụng thật, đi hết luồng đăng nhập → chấm → hoàn thành → gửi lại và hủy DB tạm khi xong. Không đụng DB đang dùng.

## Vận hành

| Việc | Lệnh |
|---|---|
| Sao lưu (Data Pump) trước mỗi đợt phát hành | `node scripts/backup.mjs` |
| Khôi phục | `node scripts/restore.mjs AAAAMMDD-HHmm` |
| Nâng cấp DB đã có dữ liệu (chạy lại không đổi gì; thêm ràng buộc và điền bù điểm trung bình của bài U1) | `node scripts/migrate.mjs` |
| Phát hành thủ công theo đợt (đã gồm migrate sau khi kiểm sao lưu) | `node scripts/deploy.mjs <slug-bolt>` |
| Lưu log theo ngày (chạy hằng ngày) | `node scripts/archive-logs.mjs` |
| Báo cáo từ log | `node scripts/log-report.mjs logs/AAAA-MM-DD.jsonl` |

## Bảo mật cần nhớ

- `.env` và tệp nạp thật (`data/import/`) không được commit; `node scripts/check-secrets.mjs` kiểm việc này.
- Backend không khởi động nếu thiếu `JWT_SECRET` (tối thiểu 32 byte).
- Trên máy demo cần HTTPS ở lớp phía trước (reverse proxy) trước khi dùng dữ liệu thật; HTTP chỉ dùng cho dev.
- Lệnh nạp ghi bằng tài khoản chủ lược đồ; backend chạy bằng tài khoản `INTERVIEW_APP` chỉ được thêm vào bảng phiếu và bảng điểm.
