# Hướng dẫn kiểm thử đơn vị — U1 scoring-skeleton

Chiến lược kiểm thử: Standard (5 đến 8 test mỗi thành phần, cộng test tích hợp ở các ranh giới chính), phương pháp TDD, độ phủ dòng lệnh tối thiểu 80% (scope classic).

## Thiết lập khung kiểm thử

| Phần | Công cụ | Ghi chú |
|---|---|---|
| Backend | Vitest, Supertest, `@vitest/coverage-v8` | TypeScript, cấu hình ở `backend/vitest.config.ts` |
| Cơ sở dữ liệu cho test tích hợp | Oracle XE chạy bằng Docker Compose (`docker compose up -d oracle`) | Lược đồ tạo từ `docker/init/*.sql`; test dùng DB sạch, mật khẩu ngẫu nhiên sinh khi chạy |
| App | `flutter_test` | Cần Flutter SDK trong PATH |

## Lệnh chạy chỉ cho Unit này

Tất cả lệnh nằm trong phạm vi U1 (đường dẫn tệp cụ thể hoặc bộ lọc); không dùng lệnh toàn dự án.

| Mục đích | Lệnh |
|---|---|
| Test "khói" của runner (Step 2) | `npm --prefix backend run test -- test/unit/smoke.test.ts` |
| Lược đồ DB (Step 3..5) | `npm --prefix backend run test -- test/integration/schema.test.ts` |
| Repository và pool (Step 6..8) | `npm --prefix backend run test -- test/integration/db-pool.test.ts test/integration/repositories.test.ts` |
| Logic nghiệp vụ (Step 9..11) | `npm --prefix backend run test -- test/unit test/integration/identity.test.ts test/integration/catalog-policy.test.ts test/integration/evaluation.test.ts test/integration/importer.test.ts test/integration/cleanup.test.ts` |
| API (Step 12..14) | `npm --prefix backend run test -- test/integration/api.test.ts test/integration/contract.test.ts` |
| App Flutter (Step 15..17) | `flutter test test/` chạy trong thư mục `app/` (cần `cwd = app`) |
| Độ phủ backend | `npm --prefix backend run test:coverage` |
| Độ phủ app | `flutter test --coverage` trong `app/` |
| Đầu cuối (đã duyệt) | `npm --prefix backend run verify:e2e` |

## Mục tiêu độ phủ

- Backend: ≥ 80% dòng lệnh; riêng các quy tắc BR1.6, BR2.1..BR2.3, BR3.2..BR3.9, BR4.x có test trực tiếp.
- App: ≥ 80% dòng lệnh; widget S1..S4 và `ApiClient`, `AuthStore` có test.
- Không hạ ngưỡng trong cấu hình để cho qua (NFR4.2).

## Số test dự kiến

| Thành phần | Loại | Số test |
|---|---|---|
| Lược đồ DB | Tích hợp | 8 |
| `db/pool` và ánh xạ lỗi | Tích hợp | 6 |
| IdentityAccess | Đơn vị và tích hợp | 12 |
| InterviewCatalog policy và truy vấn | Đơn vị và tích hợp | 10 |
| Evaluation | Đơn vị và tích hợp | 12 |
| DataImport | Đơn vị và tích hợp | 8 |
| Công việc dọn `LoginThrottle` | Tích hợp | 3 |
| API và hợp đồng | Tích hợp (Supertest) | 14 |
| App Flutter | Đơn vị và widget | 20 |
| Đầu cuối | `verify:e2e` | 1 kịch bản |

## Giả lập và dữ liệu kiểm thử

- Không giả lập Oracle trong test tích hợp (dùng DB thật qua Docker). Test đơn vị của quy tắc thuần không chạm DB.
- Thời gian (hết khóa 15 phút) dùng đồng hồ giả của Vitest; bcrypt dùng cost thấp (4) chỉ trong test qua biến cấu hình, còn mặc định sản xuất là 10.
- App giả lập API bằng một `ApiClient` giả (fake) trả dữ liệu cố định; không gọi mạng.
- Dữ liệu kiểm thử: `data/sample/seed.json` (Q6 = A); test tự tạo thêm dữ liệu riêng khi cần và dọn sau mỗi test.
- Mật khẩu mẫu chỉ nằm trong tệp mẫu và test, không dùng ở môi trường thật.

## Ghi nhận Red trước Green

Với mỗi lớp, đầu ra thất bại của bước Red được dán vào `code-summary.md` (lệnh, mã thoát, tóm tắt các test thất bại) trước khi viết mã ở bước Green.
