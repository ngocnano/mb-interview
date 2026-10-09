# Kế hoạch Code Generation — U2 scoring-complete

## Summary

- Builds: hoàn thiện phiếu chấm điểm trên nền U1: kết luận Đạt / Loại / Cân nhắc / Khác (bắt buộc), refer sang vị trí khác khi chọn Khác, điểm trung bình xem trước ngay và do server tính khi hoàn thành (công thức số nguyên dùng chung Node.js và Dart), gửi lại an toàn khi mất mạng, màn S5 xem lại bài đã hoàn thành, đăng xuất, nhãn kết luận và Điểm TB trên S3, "đã chấm / tổng" trên S2, migration DB chạy lại được.
- Touches: `backend/src/modules/evaluation/*`, `backend/src/modules/catalog/*` (chỉ đọc vị trí refer), `backend/src/http/{routes,validate,presenters}.ts`, `backend/openapi.yaml`, `backend/scripts/verify-e2e.ts`, `docker/schema/schema.sql`, `docker/schema/migrate/002-u2-constraints.sql` (mới), `scripts/migrate.mjs` (mới), `scripts/deploy.mjs`, `data/sample/seed.json`, `shared/average-score-examples.json` (mới), `app/lib/{app.dart,core/*,features/{panels,candidates,scoring,shared}}`, `app/test/*`, `README.md`, `inception/contract-design/contract-summary.md`.
- Tests: khoảng 60 test mới viết trước theo TDD (backend Vitest + Supertest với Oracle XE thật, Flutter widget và đơn vị), cộng mở rộng `verify:e2e`; 99 test backend và 39 test app của U1 phải vẫn xanh; độ phủ dòng lệnh mỗi bên ≥ 80%.

## Điều kiện cần có trước khi bắt đầu

- Docker và container Oracle dev `kiro-oracle-1` đang chạy (đã có). DB dev có dữ liệu U1 nên được dùng để thử migration (bước 3..5).
- Flutter SDK ở `C:\src\flutter`, thêm `C:\src\flutter\bin` vào PATH cho từng lệnh.
- Chưa có thay đổi nào của U1 được commit lên nhánh Bolt (chỉ có commit khởi tạo `7fad95d`); kế hoạch này không commit. Việc tạo nhánh `bolt/<slug>` và squash-merge làm khi bạn yêu cầu.
- Không cài thêm gói npm hoặc pub mới; mọi thứ cần đã có từ U1 (xác nhận ở bước 1).

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

- [x] **Step 1 — Khung và dữ liệu dùng chung** (BR6.6; không thêm gói mới): kiểm `package.json` và `pubspec.yaml` đã đủ phụ thuộc; tạo `shared/average-score-examples.json` (các ví dụ: 4,3,4 thang 5 ra stored100 = 367 và display10 = 37; 4,3,5,4,5 ra 420 và 42; thang trộn 1..3 và 1..5; một tiêu chí; làm tròn nửa lên ở chữ số thứ hai; không có điểm nào ra rỗng); tạo thư mục `docker/schema/migrate/` và `backend/src/modules/evaluation/average-score.ts` rỗng chưa có logic.
- [x] **Step 2 — Xác nhận bộ chạy test và ghi lệnh có phạm vi đơn vị** (NFR4.1): chạy `npm --prefix backend run test` và `flutter test` trong `app/` để xác nhận nền U1 xanh (99 và 39 test); ghi lệnh có phạm vi U2 vào `unit-test-instructions.md`.

### Dữ liệu và lược đồ (data model / database behavior)

- [x] **Step 3 — Red:** test tích hợp `backend/test/integration/schema-u2.test.ts`: DB có ràng buộc refer chỉ khi `KHAC`, lý do refer cần vị trí refer, vị trí refer phải tồn tại; `migrate.mjs` áp dụng 002 lên DB có bài U1 không kết luận và điền bù `diem_trung_binh` đúng công thức (BR9.1, BR9.3); chạy lại không đổi gì (BR9.2). Ghi lỗi thất bại.
- [x] **Step 4 — Green:** `docker/schema/migrate/002-u2-constraints.sql` (thêm hai CHECK, điền bù, đánh dấu), `scripts/migrate.mjs` (bảng `SCHEMA_MIGRATIONS`, chạy theo thứ tự, tài khoản chủ lược đồ, thoát khác 0 khi lỗi), cập nhật `docker/schema/schema.sql` thành trạng thái sau migration và đánh dấu 002 đã áp dụng cho DB dựng mới.
- [x] **Step 5 — Refactor:** gom hằng số tên ràng buộc, kiểm lại trên DB dev có dữ liệu U1 bằng `node scripts/migrate.mjs`, test xanh.

### Truy cập dữ liệu (repository / data access)

- [x] **Step 6 — Red:** test cho `modules/evaluation/repo.ts`: `insertEvaluation` ghi `ket_luan`, `refer_*`, `diem_trung_binh`; `findByKey` và `findByTriple` trả thêm các trường đó; `listMine` trả `ketLuan`, `diemTrungBinh`; `findDetail` trả điểm kèm tên và thang tiêu chí kể cả tiêu chí INACTIVE, tên vị trí refer; `listReferablePositions` loại vị trí INACTIVE và vị trí hiện tại của ứng viên, sắp theo `job` rồi `maViTri` (BR5.6, BR6.4, BR7.5).
- [x] **Step 7 — Green:** mở rộng `repo.ts` và `catalog/repo.ts` (vị trí refer, tìm vị trí theo mã) chỉ đủ để test xanh, dùng biến ràng buộc.
- [x] **Step 8 — Refactor:** gom cột chọn, tách ánh xạ dòng sang đối tượng, test xanh.

### Logic nghiệp vụ (business logic)

- [x] **Step 9 — Red:** test đơn vị `average-score.test.ts` chạy toàn bộ `shared/average-score-examples.json` (BR6.1, BR6.2); test `validateCompletion` cho `ketLuan` bắt buộc, refer chỉ khi KHAC, lý do cần vị trí, lý do ≤ 500, chuỗi toàn khoảng trắng thành rỗng (BR5.1, BR5.2, BR5.4); test `EvaluationService` cho vị trí refer tồn tại, ACTIVE, khác vị trí hiện tại (BR5.3), tự tính và lưu điểm trung bình, bỏ qua giá trị client (BR6.3), gửi lại cùng khóa trả bản đã lưu kèm kết luận và điểm trung bình (BR7.4), hoàn thành không ghi bảng ứng viên (BR5.5), sự kiện audit có `ketLuan` và `coRefer` nhưng không có điểm hay nhận xét (BR8.5), `getMine` đúng chủ và đúng chính sách (BR7.5), `referablePositions` (BR5.6).
- [x] **Step 10 — Green:** `average-score.ts` (số nguyên, mẫu số chung 60), mở rộng `validation.ts` và `service.ts` (`complete`, `getMine`, `referablePositions`) chỉ đủ để test xanh.
- [x] **Step 11 — Refactor:** tách quy tắc thuần khỏi truy cập DB, đặt tên theo `rules.md`, test xanh.

### API (API / endpoint)

- [x] **Step 12 — Red:** test Supertest và hợp đồng cho: `POST .../evaluation` (thiếu hoặc sai `ketLuan` 400, refer sai 400, `201` trả `ketLuan`, `diemTrungBinh`; `diemTrungBinh` từ client bị bỏ qua; `200` khi gửi lại), `GET .../evaluation` (200, 403, 404 `EVALUATION_NOT_FOUND`, người khác không đọc được bài của mình), `GET .../referable-positions` (200, 403, 404), `GET /my-evaluations` có `ketLuan`, `diemTrungBinh`; phản hồi vẫn không có `sdt`, `ngaySinh`, `gioiTinh`; `Cache-Control: no-store`; so khớp OpenAPI (AC5.3.x, AC5.4.x, AC6.1.8..AC6.1.16, AC6.2.1, AC6.3.1..AC6.3.6, AC4.1.11, AC4.1.12).
- [x] **Step 13 — Green:** thêm route và schema `zod` (`completeBody` có `ketLuan`, `referMaViTri`, `referLyDo`), presenters, cập nhật `backend/openapi.yaml` và mã lỗi `EVALUATION_NOT_FOUND`.
- [x] **Step 14 — Refactor:** giảm lặp trong route, test xanh, ESLint và Prettier sạch.

### Ứng dụng Flutter (frontend behavior)

- [x] **Step 15 — Red:** test đơn vị Dart `average_score_test.dart` chạy cùng tệp `shared/average-score-examples.json` (BR6.1, BR6.2, BR6.7); test widget: khối Kết luận bốn lựa chọn có biểu tượng và chữ, không chọn sẵn, 2×2 trên điện thoại và một hàng trên máy tính, ô cao ≥ 48 px; khối Điểm trung bình ở ba trạng thái và thông báo cho trình đọc màn hình; khối refer ẩn, hiện khi Khác, tải vị trí một lần, ô lý do vô hiệu khi chưa chọn vị trí, xóa giá trị khi đổi kết luận, lỗi tải có Thử lại; nút khóa khi thiếu kết luận và đánh dấu "Chưa chọn kết luận"; gửi lỗi giữ form và Thử lại dùng cùng `idempotencyKey`, `200` coi như thành công, `409` chuyển sang chỉ đọc; chống bấm đúp; S5 chỉ đọc đủ nội dung, "Chưa ghi kết luận" cho bài cũ; S3 có nhãn kết luận và Điểm TB; S2 có "đã chấm/tổng" và lỗi cục bộ; đăng xuất xóa token, về S1, nút quay lại không mở lại màn nghiệp vụ (BR5.7..BR5.9, BR6.5, BR7.1..BR7.3, BR7.6..BR7.8, BR8.1, BR8.3, BR8.4).
- [x] **Step 16 — Green:** `core/average_score.dart`; mở rộng `models.dart` (`EvaluationDetail`, `MyEvaluation` thêm trường, `ReferablePosition` dùng `Position`, `CompleteRequest` thêm kết luận và refer), `interview_api.dart` (`getEvaluation`, `referablePositions`), `strings.dart`, `scoring_screen.dart` (khối kết luận, refer, điểm trung bình, lỗi gửi), `features/scoring/evaluation_view_screen.dart` (S5) và tuyến `/panels/:maHdpv/candidates/:maUngVien/review`, `candidates_screen.dart`, `panels_screen.dart`, nút Đăng xuất và hủy dữ liệu khi đăng xuất, bỏ `completedProvider` tạm của U1.
- [x] **Step 17 — Refactor:** tách widget dùng chung (nhãn kết luận, khối điểm trung bình), `dart format` và `flutter analyze` sạch, test xanh.

### Môi trường và tài liệu

- [x] **Step 18 — Cấu hình môi trường và xác minh đầu cuối** (BR9.2): thêm vị trí thứ hai ACTIVE và một vị trí INACTIVE vào `data/sample/seed.json`; mở rộng `backend/scripts/verify-e2e.ts` theo `functional-spec.md` mục "Dữ liệu mẫu và lệnh xác minh"; `scripts/deploy.mjs` gọi `migrate.mjs` trước khi khởi động lại backend; `scripts/ci.mjs` chạy được test dùng `shared/`; chạy `npm run ci` và `npm --prefix backend run verify:e2e`.
- [x] **Step 19 — Tài liệu và truy vết:** cập nhật `README.md` (lệnh migrate, S5, đăng xuất), `contract-summary.md` (mã lỗi, `ketLuan` nullable cho bài cũ), `code-summary.md`, `source-manifest.json`, `traceability.json` của stage này.

## Rủi ro và cách xử lý

- **Lệch làm tròn giữa Node.js và Dart:** loại bỏ bằng tính số nguyên với mẫu số chung 60 và một tệp ví dụ dùng chung đọc bởi cả hai bộ test (BR6.2, BR6.6).
- **Migration chạm dữ liệu thật:** chỉ thêm ràng buộc và điền bù cột trống; chạy trước trên DB dev, ghi vào `SCHEMA_MIGRATIONS`, chạy lại không đổi gì; DB demo được sao lưu bằng `scripts/backup.mjs` trước khi chạy.
- **Chạy song song nhiều phiên agent trên cùng thư mục:** kiểm danh sách phiên trước khi ghi (quy tắc đã học ở U1).
- **Chưa kiểm thử trình duyệt thật của Flutter Web:** vẫn ngoài phạm vi U2 như đã ghi ở U1; test widget thay thế.

## Assumptions & Open Questions

- **[assumption]** `GET .../evaluation` dùng chính sách `canComplete` (HĐPV Inprogress hoặc Completed, được gán, ứng viên Xác nhận = Y) và `referable-positions` dùng `canOpenForScoring` (chỉ Inprogress), đúng `rules.md` BR5.6 và BR7.5.
- **[assumption]** Không thêm gói mới; `uuid`, `intl` hoặc tương tự nếu app cần định dạng số dùng cách viết tay vì chỉ cần dấu phẩy thập phân (BR6.7).
- **Open question:** None.
