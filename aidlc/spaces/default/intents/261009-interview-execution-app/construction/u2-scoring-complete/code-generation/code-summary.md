# Tóm tắt mã — U2 scoring-complete

## Sources

- `construction/u2-scoring-complete/code-generation/code-generation-plan.md` — kế hoạch 19 bước đã được duyệt
- `construction/u2-scoring-complete/code-generation/unit-test-instructions.md` — lệnh test theo Unit
- `construction/u2-scoring-complete/functional-design/` — `rules.md` (BR5.1..BR9.3), `entities.md`, `functional-spec.md`
- `inception/contract-design/contract-summary.md` — C1 (OpenAPI), C5 (`averageScoreSpec`)
- `inception/domain-design/decisions.md` — ADR-002, ADR-003

## Kết quả

Phiếu chấm điểm hoàn chỉnh trên nền U1: kết luận Đạt / Loại / Cân nhắc / Khác (bắt buộc), giới thiệu sang vị trí khác khi chọn Khác, điểm trung bình xem trước ngay và do server tính (công thức số nguyên dùng chung Node.js và Dart), hoàn thành an toàn khi mất mạng, màn S5 xem lại bài, nhãn kết luận và Điểm TB trên S3, "đã chấm/tổng" trên S2, đăng xuất, migration DB chạy lại được. Lệnh xác minh đã được duyệt `npm --prefix backend run verify:e2e` đạt 28/28 kiểm tra trên một Oracle XE tạm.

| Đo | Kết quả |
|---|---|
| Test backend | 143 test, 17 tệp, đạt cả 143 (U1: 99; U2 thêm 44) |
| Độ phủ dòng lệnh backend | 93,21% (ngưỡng 80% đặt trong `backend/vitest.config.ts`, không hạ) |
| Test app Flutter | 89 test, đạt cả 89 (U1: 39; U2 thêm 50) |
| Độ phủ dòng lệnh app | 97,1% (959/988) |
| ESLint, Prettier, kiểm kiểu (backend) | sạch |
| `dart format`, `flutter analyze` (app) | sạch |
| `node scripts/ci.mjs` | xanh (kèm kiểm bí mật) |
| Đầu cuối `verify:e2e` | 28/28 (U1: 21; U2 thêm 7 nhóm kiểm tra kết luận, refer, điểm trung bình, xem lại) |
| Migration trên DB dev có dữ liệu U1 | `node scripts/migrate.mjs` tạo `SCHEMA_MIGRATIONS`, áp dụng 002; chạy lại báo "Không có migration mới" |

Chưa kiểm: trình duyệt thật cho Flutter Web (ngoài phạm vi, như U1), đo p95, HTTPS. Container `kiro-backend-1` đang chạy bản mã U1 cũ; DB dev đã được migrate và tương thích ngược. Dựng lại ảnh backend sẽ làm ở Build and Test hoặc khi phát hành.

## Tệp đã tạo hoặc sửa

Danh sách đầy đủ trong `source-manifest.json`. Mới: `shared/average-score-examples.json`, `docker/schema/migrate/002-u2-constraints.sql`, `scripts/migrate.mjs`, `backend/src/modules/evaluation/average-score.ts`, `app/lib/core/average_score.dart`, `app/lib/features/scoring/evaluation_view_screen.dart` (S5), `app/lib/features/shared/widgets.dart`, và các tệp test `schema-u2`, `evaluation-u2`, `api-u2`, `average-score`, `validation-u2`, `average_score_test`, `review_logout_test`. Sửa: Evaluation (`repo`, `service`, `validation`), Catalog (`repo`, `policy`: vị trí refer), `http/{routes,validate,presenters}`, `openapi.yaml`, `schema.sql`, `seed.json`, `verify-e2e.ts`, `deploy.mjs`, `README.md`, và phía app `models`, `interview_api`, `auth` (đăng xuất), `strings`, `providers` (bỏ kho bài hoàn thành tạm của U1), `app.dart` (tuyến `/review`), ba màn S2, S3, S4.

## Bằng chứng Red trước Green (TDD)

| Lớp | Bước Red | Lệnh | Kết quả Red | Green |
|---|---|---|---|---|
| Dữ liệu, repository, logic, API (backend) | 3, 6, 9, 12 | `npm --prefix backend run test -- test/unit/average-score.test.ts test/unit/validation-u2.test.ts test/integration/schema-u2.test.ts test/integration/evaluation-u2.test.ts test/integration/api-u2.test.ts` | 27 test lỗi trên 5 tệp: `Cannot find module 'average-score.js'`, `Cannot find module 'scripts/migrate.mjs'`, API trả 201 thay vì 400, `GET evaluation` trả 404 `NOT_FOUND` thay vì `EVALUATION_NOT_FOUND` | 44 test U2 đạt; toàn bộ 143 đạt |
| Frontend | 15 | không chạy riêng | Test và mã Flutter được viết liên tiếp trong cùng một lượt rồi chạy; lần chạy đầu đạt 88 test. Đây là sai lệch so với kỷ luật Red-trước-Green cho lớp này | 89 test đạt |

Bước Red của backend gộp bốn lớp vào một lần chạy vì chúng cùng chạm một luồng; từng lớp vẫn có tệp test riêng.

## Quyết định thực thi

1. **Đọc vị trí refer qua `CatalogPolicy`** (không để Evaluation đọc bảng Catalog trực tiếp), giữ nguyên ADR-004. Khi hoàn thành, vị trí refer hợp lệ nếu nằm trong danh sách vị trí ACTIVE trừ vị trí hiện tại của ứng viên; `GET referable-positions` dùng `canOpenForScoring` (chỉ Inprogress), còn `GET evaluation` dùng `canComplete` (Inprogress hoặc Completed).
2. **Ràng buộc DB `ck_eval_refer_khac`** viết là `refer IS NULL OR (ket_luan IS NOT NULL AND ket_luan = 'KHAC')`. Bản đầu `ket_luan = 'KHAC'` để lọt trường hợp kết luận rỗng kèm refer vì CHECK coi UNKNOWN là đạt; test `schema-u2` phát hiện và đã sửa.
3. **Sự kiện audit gửi lại** `evaluation_replayed` giữ từ U1 (chỉ có định danh và kết luận); `rules.md` BR8.5 đã chỉnh cho khớp. Sự kiện `evaluation_completed` có `ketLuan` và `coRefer`, không có điểm, nhận xét hay lý do.
4. **Bài hoàn thành xong chuyển sang S5 bằng `pushReplacement`**, nên không còn kho bài hoàn thành tạm của U1; S5 luôn đọc từ server. Mở ứng viên đã chấm từ S3 hoặc bằng đường dẫn trực tiếp đều vào S5.
5. **S5 không phụ thuộc thông tin ứng viên**: HĐPV đã Completed không mở được `GET candidate` (404), nên S5 hiển thị mã ứng viên khi thiếu tên.
6. **Thông báo trình đọc màn hình cho khối refer** đặt ở chính tiêu đề khối (vùng `liveRegion` mang nhãn "Đã hiện ô giới thiệu sang vị trí khác"), vì một nút ngữ nghĩa rỗng không được đưa vào cây ngữ nghĩa.
7. **`test/integration/schema-u2.test.ts` thao tác trên DB dùng chung của test**: tháo hai ràng buộc U2 và xóa dấu 002, rồi chạy `migrate.mjs` thật; `afterAll` chạy lại migrate để DB dev luôn ở trạng thái đã migrate.
8. **Một lần `verify:e2e` đầu tiên báo `DbUnavailableError`** ngay lúc nạp dữ liệu vào Oracle tạm (lỗi kết nối thoáng qua khi DB vừa dựng); hai lần chạy sau đều đạt 28/28 không đổi mã. Chưa xác định chắc nguyên nhân; theo dõi ở Build and Test vì U1 cũng từng gặp lỗi đua tương tự khi dựng DB.
9. **Đăng xuất không hủy request đang chạy** (chưa nối `CancelToken` vào `ApiClient`); BR8.1 nêu hủy request, hiện chỉ xóa token và chuyển màn nên request kế tiếp không kèm token. Ghi nhận là tồn đọng nhỏ.

## Sai lệch và tồn đọng

- Sai lệch TDD ở lớp Flutter (xem bảng trên).
- Chưa có `CancelToken` khi đăng xuất (quyết định 9); không ảnh hưởng tính đúng đắn vì token đã bị xóa.
- Số "đã chấm/tổng" ở S2 gọi `my-evaluations` cho từng HĐPV; chưa đo hiệu năng.
