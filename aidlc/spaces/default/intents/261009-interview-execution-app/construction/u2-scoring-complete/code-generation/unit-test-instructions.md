# Hướng dẫn kiểm thử đơn vị — U2 scoring-complete

Chiến lược kiểm thử: Standard (5 đến 8 test mỗi thành phần, cộng test tích hợp ở các ranh giới chính), phương pháp TDD, độ phủ dòng lệnh tối thiểu 80% (scope classic). Bộ test của U1 (99 test backend, 39 test app) phải vẫn xanh.

## Thiết lập khung kiểm thử

Dùng lại nguyên khung của U1; U2 không thêm công cụ mới.

| Phần | Công cụ | Ghi chú |
|---|---|---|
| Backend | Vitest, Supertest, `@vitest/coverage-v8` | Cấu hình ở `backend/vitest.config.ts` |
| Cơ sở dữ liệu cho test tích hợp | Oracle XE chạy bằng Docker Compose (`docker compose up -d oracle`) | Lược đồ tạo từ `docker/schema/schema.sql`; test migration tự dựng DB ở trạng thái U1 rồi áp dụng 002 |
| App | `flutter_test` | Cần `C:\src\flutter\bin` trong PATH; chạy với `cwd = app` |
| Dữ liệu dùng chung | `shared/average-score-examples.json` | Đọc bởi cả test Vitest và test Dart; không có bản sao |

## Lệnh chạy chỉ cho Unit này

| Mục đích | Lệnh |
|---|---|
| Nền U1 còn xanh (Step 2) | `npm --prefix backend run test` và `flutter test test/` trong `app/` |
| Lược đồ và migration (Step 3..5) | `npm --prefix backend run test -- test/integration/schema-u2.test.ts` |
| Repository (Step 6..8) | `npm --prefix backend run test -- test/integration/evaluation-u2.test.ts test/integration/repositories.test.ts` (test repository U2 nằm trong `evaluation-u2.test.ts`) |
| Logic nghiệp vụ (Step 9..11) | `npm --prefix backend run test -- test/unit/average-score.test.ts test/unit/validation-u2.test.ts test/integration/evaluation-u2.test.ts` |
| API (Step 12..14) | `npm --prefix backend run test -- test/integration/api-u2.test.ts test/integration/contract.test.ts` |
| App Flutter (Step 15..17) | `flutter test test/core/average_score_test.dart test/features` trong `app/` |
| Độ phủ backend | `npm --prefix backend run test:coverage` |
| Độ phủ app | `flutter test --coverage` trong `app/` |
| Lint và định dạng | `npm --prefix backend run lint`, `npm --prefix backend run format:check`, `dart format --set-exit-if-changed .` và `flutter analyze` trong `app/` |
| Đầu cuối (đã duyệt) | `npm --prefix backend run verify:e2e` |

## Mục tiêu độ phủ

- Backend: ≥ 80% dòng lệnh; riêng BR5.1..BR5.6, BR6.1..BR6.4, BR7.4, BR7.5, BR8.5, BR9.1..BR9.3 có test trực tiếp.
- App: ≥ 80% dòng lệnh; `average_score.dart` và các khối kết luận, refer, điểm trung bình, màn S5, đăng xuất có test.
- Không hạ ngưỡng trong cấu hình để cho qua.

## Số test dự kiến

| Thành phần | Loại | Số test |
|---|---|---|
| Lược đồ và migration 002 | Tích hợp | 6 |
| Repository Evaluation và vị trí refer | Tích hợp | 6 |
| `average-score` (chạy tệp ví dụ dùng chung) | Đơn vị | 7 |
| Kiểm payload kết luận và refer | Đơn vị | 7 |
| `EvaluationService` (hoàn thành, đọc bài, vị trí refer, audit) | Tích hợp | 8 |
| API và hợp đồng U2 | Tích hợp (Supertest) | 10 |
| `average_score.dart` (cùng tệp ví dụ) | Đơn vị | 7 |
| App: màn S4 mở rộng, S5, S3, S2, đăng xuất | Widget | 16 |
| Đầu cuối | `verify:e2e` mở rộng | 1 kịch bản |

## Giả lập và dữ liệu kiểm thử

- Không giả lập Oracle trong test tích hợp. Test migration dùng một lược đồ riêng hoặc dựng lại bảng ở trạng thái trước 002 trong DB test rồi áp dụng migration; mọi test dọn dữ liệu sau khi chạy.
- Thời gian dùng đồng hồ giả như U1 khi cần; bcrypt cost thấp chỉ trong test.
- App giả lập API bằng `InterviewApi` giả trả dữ liệu cố định, có thể ném `ApiException` (mạng, 409, 400) để kiểm lỗi gửi và Thử lại; không gọi mạng.
- Dữ liệu mẫu: `data/sample/seed.json` (thêm vị trí ACTIVE thứ hai và một vị trí INACTIVE); test tự tạo dữ liệu riêng khi cần.

## Ghi nhận Red trước Green

Với mỗi lớp, đầu ra thất bại của bước Red được dán vào `code-summary.md` (lệnh, mã thoát, tóm tắt các test thất bại) trước khi viết mã ở bước Green.
