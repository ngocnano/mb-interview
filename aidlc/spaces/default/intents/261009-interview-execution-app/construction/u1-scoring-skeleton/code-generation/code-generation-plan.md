# Kế hoạch Code Generation — U1 scoring-skeleton

## Summary

- Builds: walking skeleton của app phỏng vấn: backend Node.js + TypeScript (đăng nhập, danh sách HĐPV và ứng viên, tiêu chí, hoàn thành đánh giá, lệnh nạp dữ liệu), lược đồ Oracle XE chạy bằng Docker Compose, và app Flutter với 4 màn S1..S4.
- Touches: thư mục mới ở gốc workspace: `backend/`, `app/`, `docker/`, `data/sample/`, `scripts/`, `docker-compose.yml`, `.env.example`, `package.json`; không sửa mã nào có sẵn (dự án mới).
- Tests: khoảng 70 test, viết trước theo TDD: đơn vị và tích hợp với Oracle XE thật cho backend (Vitest + Supertest), test widget và đơn vị cho Flutter, một lệnh đầu cuối `verify:e2e`; mục tiêu độ phủ ≥ 80% mỗi bên.

## Điều kiện cần có trước khi bắt đầu

- Docker chạy được (đã có trên máy); ảnh Oracle XE sẽ được kéo về lần đầu (khoảng 1 đến 2 GB).
- Flutter SDK chưa có trên máy: bước 1 cài Flutter SDK bản ổn định (tải khoảng 1 GB) vào `C:\src\flutter` và thêm vào PATH của phiên làm việc. Nếu bạn muốn tự cài hoặc đặt ở chỗ khác, chọn "I'll edit the files" hoặc Request Changes và nói đường dẫn.
- Các gói npm và pub được ghim phiên bản cụ thể khi cài.

## Testing Contract
```json
{
  "version": 1,
  "methodology": "tdd",
  "source": "team",
  "ordering": "Viết test thất bại cho hành vi mong muốn trước, hiện thực mã tối thiểu để test xanh, rồi refactor — cho từng lớp có thể kiểm thử.",
  "scope": "classic",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: tdd\n- **Methodology evidence**: Nhóm khẳng định viết test trước, rồi mới hiện thực\n  (phỏng vấn Q3 = B). Domain có nhiều business rule trọng yếu (Definition of\n  Ready, blind scoring, idempotency submit, không gửi kết quả trước HR duyệt)\n  nên dẫn dắt bằng test giúp khóa hành vi đúng ngay từ đầu.\n- **Ordering**: Viết test thất bại cho hành vi mong muốn trước, hiện thực mã tối\n  thiểu để test xanh, rồi refactor — cho từng lớp có thể kiểm thử.\n- Sàn coverage: 80% dòng lệnh và chạy CI trước khi merge (scope classic).\n- Áp dụng cho cả backend (Node.js) và frontend (Flutter); các business rule\n  trọng yếu phải có test tương ứng."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "tdd",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - Red: write the failing tests and record the failing command output.",
      "Data model / database behavior - Green: implement only enough behavior to pass.",
      "Data model / database behavior - Refactor: improve the implementation while tests stay green.",
      "Repository / data access - Red: write the failing tests and record the failing command output.",
      "Repository / data access - Green: implement only enough behavior to pass.",
      "Repository / data access - Refactor: improve the implementation while tests stay green.",
      "Business logic - Red: write the failing tests and record the failing command output.",
      "Business logic - Green: implement only enough behavior to pass.",
      "Business logic - Refactor: improve the implementation while tests stay green.",
      "API / endpoint - Red: write the failing tests and record the failing command output.",
      "API / endpoint - Green: implement only enough behavior to pass.",
      "API / endpoint - Refactor: improve the implementation while tests stay green.",
      "Frontend behavior - Red: write the failing tests and record the failing command output.",
      "Frontend behavior - Green: implement only enough behavior to pass.",
      "Frontend behavior - Refactor: improve the implementation while tests stay green.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:4a4d3d46e159d9443694d51976fa16b9685146cea34c81f8b23b5b67b6ae56bd",
  "contract_sha256": "sha256:c16b7462bf2983a5fc0c4044fdf4695c77f37aac92c907569aaefca479025ce1"
}
```

## Các bước

Mỗi bước tick `[x]` khi xong. Với mỗi lớp có thể kiểm thử, bước Red ghi lại đầu ra thất bại của lệnh test vào `code-summary.md`.

### Khung dự án

- [x] **Step 1 — Khung dự án và cấu hình sản xuất** (NFR1.2, NFR1.15, NFR14.4; IS-1, IS-5, IS-7, IS-11, IS-12): kiểm và cài Flutter SDK; tạo `backend/` (package.json ghim phiên bản, tsconfig, ESLint, Prettier), `docker-compose.yml`, `docker/init/01-users.sql`, `.env.example`, `.gitignore` bổ sung (`.env`, `data/import/`, `backups/`, `logs/`), `package.json` gốc với script `ci`, cấu trúc thư mục `backend/src/{config,db,http,modules,import,jobs}`.
- [x] **Step 2 — Dựng bộ chạy test và ghi lệnh có phạm vi đơn vị** (NFR4.1; TD-2): Vitest + Supertest + coverage-v8; `flutter test`; lệnh scoped ghi trong `unit-test-instructions.md`; một test "khói" chạy xanh để chứng minh runner sẵn sàng; Oracle XE khởi động bằng Compose và kết nối được từ test.

### Dữ liệu và lược đồ (data model / database behavior)

- [x] **Step 3 — Red:** test tích hợp lược đồ Oracle (`backend/test/integration/schema.test.ts`): khóa duy nhất email, ràng buộc duy nhất `(userId, maHdpv, maUngVien)` và `(userId, idempotencyKey)`, khóa ngoại, miền giá trị trạng thái, thang tiêu chí, chỉ mục theo PD-3, quyền INSERT-only của `INTERVIEW_APP` trên bảng phiếu và điểm (BR3.6, BR3.8, BR4.7; NFR1.10, NFR13.5). Ghi lỗi thất bại.
- [x] **Step 4 — Green:** `docker/init/02-schema.sql` (bảng, ràng buộc, chỉ mục, DIRECTORY cho Data Pump) và cấp quyền cho hai tài khoản DB.
- [x] **Step 5 — Refactor:** gom script khởi tạo, đặt tên ràng buộc rõ, chạy lại test xanh.

### Truy cập dữ liệu (repository / data access)

- [x] **Step 6 — Red:** test cho `db/pool` (`withTransaction` hoàn tác khi lỗi, ánh xạ ORA-00001 và lỗi kết nối sang lỗi miền `DB_UNAVAILABLE`) và các repository IdentityAccess (tài khoản, `LoginThrottle`), InterviewCatalog (HĐPV được gán, ứng viên đã xác nhận, sắp xếp), Evaluation (tiêu chí, phiếu, điểm) (BR2.4, BR2.5, BR3.9; NFR2.3, NFR2.5; PD-1, PD-2, RD-3).
- [x] **Step 7 — Green:** `db/pool.ts`, `db/errors.ts` và ba repository dùng biến ràng buộc, không nối chuỗi (SD-6).
- [x] **Step 8 — Refactor:** gom truy vấn nối bảng, thêm quy tắc ESLint chống nối chuỗi vào truy vấn (NFR1.8), test xanh.

### Logic nghiệp vụ (business logic)

- [x] **Step 9 — Red:** test đơn vị và tích hợp cho: IdentityAccess (chuẩn hóa email, bcrypt, thông báo chung, tài khoản khóa, tạm khóa 5 lần sai trong 15 phút, đặt lại bộ đếm, JWT 8 giờ, khóa thiếu thì không khởi động; BR1.1..BR1.7, SD-1..SD-3), InterviewCatalog policy (`canOpenForScoring`, `canComplete`, `canViewPanel`, 403/404 theo C2; BR2.1..BR2.3, BR2.10), Evaluation (điểm nguyên trong thang, đủ tiêu chí, nhận xét ≤ 2000, một phiếu cho mỗi bộ ba, idempotency `200`/`409`, khóa dùng cho cặp khác `409`, đua ghi đồng thời; BR3.2..BR3.9, RD-4, SC-5), DataImport (thứ tự, kiểm tra từng nhóm, báo cáo lỗi, chạy lại không nhân đôi, rollback khi mất kết nối, mật khẩu ≥ 8 ký tự, không xóa; BR4.1..BR4.9), công việc dọn `LoginThrottle` (SC-6). Stories: US1.1, US2.1, US4.1, US5.1, US5.2, US6.1, US7.1, US7.2, US7.3.
- [x] **Step 10 — Green:** `modules/identity`, `modules/catalog`, `modules/evaluation`, `import/importer.ts`, `jobs/cleanup.ts` với chỉ phần tối thiểu để test xanh.
- [x] **Step 11 — Refactor:** tách quy tắc thuần khỏi truy cập DB, đặt tên theo `rules.md`, test xanh.

### API và lệnh nạp (API / endpoint)

- [x] **Step 12 — Red:** test Supertest cho 7 API của U1 và `/health`: mã trạng thái 200/201/400/401/403/404/409/429/503 theo AC (AC1.1.1..AC1.1.9, AC2.1.1..AC2.1.7, AC4.1.1..AC4.1.10, AC5.1.1..AC5.1.6, AC5.2.2, AC6.1.1..AC6.1.7), không có `sdt`/`ngaySinh`/`gioiTinh` trong phản hồi (AC5.1.2), `Cache-Control: no-store`, `X-Correlation-Id`, giới hạn kích thước JSON và tốc độ, log không chứa mật khẩu/token, kiểm hợp đồng so với OpenAPI (NFR1.4, NFR1.7, NFR1.9, NFR1.14, NFR3.1, NFR3.2, NFR14.6, NFR14.8).
- [x] **Step 13 — Green:** `config.ts` (kiểm biến môi trường, từ chối khởi động), `app.ts` với chuỗi trung gian LC-1, các route, schema `zod`, bộ xử lý lỗi, `/health`, `server.ts` (dừng êm), `import/cli.ts`, `backend/openapi.yaml` rút từ `contract-summary.md` (C1 phần U1), phục vụ Flutter Web tĩnh ở `/`.
- [x] **Step 14 — Refactor:** gom trung gian, giảm lặp trong route, test xanh, ESLint và Prettier sạch.

### Ứng dụng Flutter (frontend behavior)

- [x] **Step 15 — Red:** test Flutter cho `ApiClient` (gắn Bearer và `X-Correlation-Id`, thử lại GET tối đa 2 lần, `401` xóa token), `AuthStore` (giữ đăng nhập khi mở lại), và widget test S1..S4: S1 (kiểm định dạng, hiện/ẩn mật khẩu, lỗi `401`/`403`/`429`; AC1.1.1..AC1.1.9), S2 (danh sách, rỗng, lỗi + Thử lại; AC2.1.3..AC2.1.7), S3 (sắp xếp hiển thị, vị trí từng dòng, nhãn Đã chấm/Chưa chấm ghép từ `my-evaluations`; AC4.1.1..AC4.1.10), S4 (tiêu chí, điểm 1..5, khóa nút khi thiếu điểm, hộp thoại xác nhận, cảnh báo rời màn, không báo thành công khi chưa có `201`, chỉ đọc sau khi hoàn thành; AC5.1.x, AC5.2.1..AC5.2.5, AC6.1.1, AC6.1.13, NFR2.1, NFR6.1).
- [x] **Step 16 — Green:** `app/` Flutter (go_router, riverpod, dio, flutter_secure_storage), các màn S1..S4, kho dữ liệu, chuỗi chữ tiếng Việt gom một nơi; giao diện mức dùng được (chủ đề chung nâng cao thuộc U5).
- [x] **Step 17 — Refactor:** tách widget dùng lại, `dart format` và `flutter analyze` sạch, test xanh.

### Cấu hình môi trường, kiểm tra đầu cuối, tài liệu

- [x] **Step 18 — Cấu hình môi trường và build:** `backend/Dockerfile` đa tầng chạy bằng người dùng không phải root, `docker-compose.yml` hoàn chỉnh (healthcheck, `restart`, `stop_grace_period`, giới hạn tài nguyên, log driver), `data/sample/seed.json` theo Q6 = A (5 tiêu chí, 3 vị trí, 3 CBQL có tài khoản, 5 HĐPV đủ 5 trạng thái, khoảng 6 ứng viên), `scripts/` (`deploy`, `backup`, `restore`, `archive-logs`, `check-secrets`, `log-report`), `backend/scripts/verify-e2e.ts` và script `verify:e2e` chạy trên Oracle XE tạm (không dùng DB `demo`), `npm run ci` ở gốc (NFR4.2..NFR4.4, NFR14.2, NFR14.9; IS-9, IS-10, CP-2..CP-8).
- [x] **Step 19 — Tài liệu và truy vết:** `README.md` hướng dẫn chạy; `code-summary.md`, `source-manifest.json`, `traceability.json` (AC, NFRx.y, BRx.y → tệp thực tế).

## Ánh xạ story sang bước

| Story | Bước |
|---|---|
| US7.2, US7.1, US7.3 | 3, 4, 9, 10, 13, 18 |
| US1.1 | 6, 9, 12, 15 |
| US2.1 | 6, 9, 12, 15 |
| US4.1 | 6, 9, 12, 15 |
| US5.1 | 9, 12, 15 |
| US5.2 | 9, 12, 15 |
| US6.1 | 3, 6, 9, 12, 15 |

## Mục tiêu chất lượng không được hạ

- Độ phủ dòng lệnh ≥ 80% cho backend và cho app Flutter (NFR4.2); không chỉnh ngưỡng trong cấu hình để cho qua.
- p95 API đọc ≤ 500 ms và đăng nhập, hoàn thành đánh giá ≤ 1 giây (NFR13.1, NFR13.2): đo bằng kịch bản tải nhỏ ở Build and Test.
- `npm --prefix backend run verify:e2e` xanh (lệnh đã duyệt).

## Assumptions & Open Questions

- **[assumption]** Cài Flutter SDK bằng cách tải bản ổn định từ kho chính thức của Flutter vào `C:\src\flutter`; nếu mạng hoặc quyền không cho phép, phần app (bước 15 đến 17) dừng lại và báo bạn, còn phần backend vẫn hoàn thành.
- **[assumption]** Ảnh Oracle XE `gvenzl/oracle-xe` bản `slim` được kéo về qua Docker; nếu không kéo được, các test tích hợp và `verify:e2e` không chạy được và sẽ dừng để hỏi.
- **[assumption]** Chưa dựng bản điện thoại để chạy (chỉ web và test); dựng bản điện thoại cần Android Studio hoặc Xcode, ngoài phạm vi skeleton.
- **Open question:** None.
