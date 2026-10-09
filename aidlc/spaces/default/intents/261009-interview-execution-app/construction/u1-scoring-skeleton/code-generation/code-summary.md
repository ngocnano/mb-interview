# Tóm tắt mã — U1 scoring-skeleton

## Sources

- `construction/u1-scoring-skeleton/code-generation/code-generation-plan.md` — kế hoạch 19 bước đã được duyệt
- `construction/u1-scoring-skeleton/code-generation/unit-test-instructions.md` — lệnh test theo Unit
- `construction/u1-scoring-skeleton/functional-design/` — `rules.md` (BR1.1..BR4.9), `entities.md`, `functional-spec.md`
- `construction/u1-scoring-skeleton/nfr-design/` và `infrastructure-design/` — PD, SD, SC, RD, TD, OD, LC, IS, MD, CP
- `inception/contract-design/contract-summary.md` — C1 (OpenAPI), C2, C3, C6

## Kết quả

Walking skeleton chạy xuyên suốt: nạp dữ liệu → đăng nhập → danh sách HĐPV → danh sách ứng viên → chấm điểm → hoàn thành đánh giá (idempotent, một giao dịch) → lưu Oracle. Lệnh xác minh đã được duyệt `npm --prefix backend run verify:e2e` cho 21/21 kiểm tra đạt trên một Oracle XE tạm. Đã chạy 4 lần: lần đầu đạt, lần hai lỗi do điều kiện đua khi dựng DB (xem Quyết định 7), hai lần sau khi sửa đều đạt 21/21.

| Đo | Kết quả |
|---|---|
| Test backend | 99 test, 12 tệp, đạt cả 99 |
| Độ phủ dòng lệnh backend | 92,95% (ngưỡng 80% đặt trong `backend/vitest.config.ts`, không hạ) |
| Test app Flutter | 39 test, đạt cả 39 |
| Độ phủ dòng lệnh app | 95,5% (614/643) |
| ESLint, Prettier, kiểm kiểu (backend) | sạch |
| `dart format`, `flutter analyze` (app) | sạch |
| `npm run ci` | xanh (kèm kiểm bí mật) |
| Đầu cuối `verify:e2e` | 21/21 |
| Bản Docker Compose thật | `backend` và `oracle` healthy; `/health` 200; Flutter Web được backend phục vụ; đăng nhập và danh sách bằng dữ liệu mẫu qua cổng 8080 |
| Sao lưu và khôi phục thật | `scripts/backup.mjs` (64 giây) và `scripts/restore.mjs` (35 giây) chạy được trên DB dev, đăng nhập và danh sách vẫn đúng sau khôi phục |

## Tệp đã tạo

Dự án mới nên mọi thứ là tệp mới (danh sách đầy đủ trong `source-manifest.json`):

- `backend/`: `src/` gồm `config.ts`, `errors.ts`, `app.ts`, `server.ts`, `db/` (pool, errors, upsert), `http/` (routes, validate, presenters, error-handler), `modules/identity|catalog|evaluation/` (repo, service, policy, validation), `import/` (importer, cli), `jobs/cleanup.ts`, `observability/` (audit, correlation, logger); `test/` (unit, integration, helpers); `scripts/verify-e2e.ts`; `openapi.yaml`; `Dockerfile`; cấu hình TypeScript, ESLint, Prettier, Vitest.
- `app/`: ứng dụng Flutter với `lib/core/` (models, api_client, interview_api, token_store, auth, providers, strings, config), `lib/features/` (login S1, panels S2, candidates S3, scoring S4, shared), `lib/app.dart`, `lib/main.dart`; `test/` (core, features, support); cấu hình nền tảng web và android do `flutter create` sinh.
- `docker/` (`init/01-users.sh`, `init/02-schema.sh`, `schema/schema.sql`, `healthcheck.sh`), `docker-compose.yml`, `.dockerignore`, `.env.example`, `.gitattributes`, `.gitignore` (bổ sung).
- `scripts/`: `init-env`, `ci`, `check-secrets`, `backup`, `restore`, `deploy`, `archive-logs`, `log-report`, `lib`.
- `data/sample/seed.json`, `package.json` (gốc), `README.md`.

## Bằng chứng Red trước Green (TDD)

| Lớp | Bước Red | Lệnh | Kết quả Red | Green |
|---|---|---|---|---|
| Repository và pool | 6 | `npm --prefix backend run test -- test/integration/db-pool.test.ts test/integration/repositories.test.ts` | 2 tệp lỗi: `Cannot find module '../../src/db/pool.js'`, 0 test chạy | 17 test đạt |
| Logic nghiệp vụ | 9 | `npm --prefix backend run test -- test/unit/config.test.ts test/integration/identity.test.ts … cleanup.test.ts` | 6 tệp lỗi: `Cannot find module` (`src/config.js`, `identity/service.js`, `catalog/policy.js`, `import/importer.js`, `jobs/cleanup.js`), 0 test chạy | 49 test đạt |
| API | 12 | `npm --prefix backend run test -- test/integration/api.test.ts test/integration/contract.test.ts` | 2 tệp lỗi: `Cannot find module '../../src/app.js'`, 0 test chạy | 23 test đạt (sau khi sửa lỗi xác thực ở mục Quyết định 5) |
| Frontend | 15 | `flutter test test/core/api_client_test.dart` | Lỗi biên dịch: `Undefined name 'tokenStoreProvider'`, `'idGeneratorProvider'`, `Method not found: 'InterviewApp'` | 39 test đạt |

## Quyết định thực thi

1. **Trạng thái HĐPV** lưu mã ASCII `DRAFT`, `SENT`, `CONFIRMED` (Xác nhận), `INPROGRESS`, `COMPLETED` trong DB; lệnh nạp ánh xạ từ năm giá trị tiếng Việt của tệp C6, tránh phụ thuộc mã hóa ký tự trong ràng buộc.
2. **`my-evaluations` ở U1** trả `maUngVien`, `submittedAt` (đã sửa hợp đồng ở Functional Design); U2 sẽ thêm `ketLuan` và `diemTrungBinh`.
3. **Mã lỗi** theo hợp đồng: `VALIDATION_FAILED`, `UNAUTHENTICATED`, `ALREADY_COMPLETED`, `PANEL_NOT_AVAILABLE`, `CANDIDATE_NOT_CONFIRMED`, `LOGIN_LOCKED`, `DB_UNAVAILABLE`; mọi lỗi thêm `correlationId` (đã ghi vào `openapi.yaml`).
4. **`openapi.yaml`** trong `backend/` là bản làm việc trích từ `contract-summary.md`, thêm `LoginResponse`, mã `429` ở đăng nhập và `correlationId` ở `Error`; `contract.test.ts` kiểm phản hồi thật so với lược đồ.
5. **Express 4**: router tách lớp xác thực và nghiệp vụ trong cùng một `Router`; bài test API đầu tiên phát hiện route nghiệp vụ treo vì middleware xác thực chưa gọi `next()`, đã sửa.
6. **Nhóm kết nối**: `alter session set current_schema` đặt mỗi lần lấy kết nối để tài khoản ứng dụng đọc bảng của chủ lược đồ; tên lược đồ lấy từ cấu hình và lọc ký tự.
7. **Điều kiện đua khi dựng DB tạm**: ảnh `faststart` báo healthy trước khi script khởi tạo tạo xong lược đồ, nên lần chạy `verify:e2e` đầu tiên sau khi viết đã lỗi một lần (bảng chưa có). Đã sửa hai chỗ: `docker/healthcheck.sh` kiểm thêm bảng `criterion` tồn tại, và `verify-e2e.ts` chờ lược đồ trước khi nạp.
8. **Ảnh Oracle XE** ghim `gvenzl/oracle-xe:21.3.0-slim-faststart` (digest `sha256:f82bccdf…`), biến thể `faststart` thay cho `slim` thuần để khởi động nhanh hơn.
9. **Giao diện** ở mức dùng được (bố cục một cột tối đa 720 px, Material 3 mặc định); phông, chủ đề sáng tối, hai khung, khung xương thuộc U5.
10. **Hộp thoại và cảnh báo** của S4 dựa trên `PopScope` và `BackButton`; thông báo thành công dùng `SnackBar` 3 giây bọc `Semantics(liveRegion)`.

## Sai lệch so với kế hoạch

- **Step 3..5 (lược đồ DB) không có Red thật**: schema DDL phải có trước để dựng Oracle và chứng minh runner sẵn sàng (Step 2), nên `schema.test.ts` đạt ngay lần chạy đầu (9 test). Các lớp sau (repository, logic, API, frontend) đều có Red thật như bảng trên. Nên xem lại ở review.
- **Phiên workflow thứ hai** do Kiro tự tạo ("code-generation-u1-scoring-skeleton · run") đã chạy song song trong lúc bắt đầu: nó sửa `backend/package.json` (thêm `uuid`, đổi tên script) và ghi đè `code-generation-plan.md` đã duyệt. Người dùng đã dừng phiên đó; `package.json` được khôi phục về script đã duyệt, và kế hoạch đã duyệt được khôi phục bằng `aidlc engine testing-posture restore`. Không có tệp mã nguồn nào của phiên đó còn lại (kiểm bằng thời gian ghi tệp và danh sách thư mục).
- **Step 18 thêm hai tệp ngoài kế hoạch**: `docker/healthcheck.sh` (xem mục 7) và `.gitattributes` (ép LF cho `*.sh`, `*.sql`).

## Chưa làm hoặc chưa kiểm (ghi rõ)

- **Chỉ tiêu hiệu năng** NFR13.1, NFR13.2, NFR13.3: chưa đo p95 bằng kịch bản tải, chưa đo thời gian mở màn trên 4G; làm ở Build and Test (trạng thái `Deferred` trong `traceability.json`).
- **HTTPS (NFR1.12)**: chưa có lớp phía trước; máy và tên miền demo chưa chọn (câu hỏi mở của Infrastructure Design).
- **Bản điện thoại**: chưa dựng; cần Android Studio hoặc Xcode, ngoài phạm vi skeleton. `flutter build web` chạy được; cảnh báo "wasm dry-run" của plugin lưu trữ an toàn không chặn bản build.
- **`scripts/deploy.mjs`** mới kiểm cú pháp, chưa chạy trọn vẹn.
- **Helmet** tắt Content-Security-Policy vì Flutter Web cần worker và wasm; nên cấu hình CSP riêng ở bước hạ tầng.
- **Dòng log đường dẫn tuyệt đối**: máy dev nhận các request kiểu `GET http://steamconnecttest.com/204` trên cổng 8080 từ phần mềm khác (kiểm tra mạng); vô hại nhưng làm nhiễu `log-report`.

## Assumptions & Open Questions

- **[assumption]** `Dart 3.13`/`Flutter 3.47.7` và các gói đã ghim trong `pubspec.yaml` và `package.json` là phiên bản dùng được tại thời điểm dựng (TypeScript 6, Vitest 5, Zod 4, ESLint 10).
- **[assumption]** Mật khẩu trong `data/sample/seed.json` là giả, chỉ dùng demo; không dùng ở môi trường thật.
- **Open question:** Có muốn thêm kịch bản tải (autocannon) vào `verify:e2e` hay giữ riêng ở Build and Test?
