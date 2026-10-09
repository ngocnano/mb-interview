# Thiết kế độ tin cậy — U1 scoring-skeleton

Mã `RD-n` là giải pháp độ tin cậy và tích hợp; mã `TD-n` là giải pháp kiểm thử.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/reliability-requirements.md` — NFR2.1..NFR2.7, NFR3.1..NFR3.3, NFR4.1..NFR4.4, NFR14.1..NFR14.3
- `construction/u1-scoring-skeleton/nfr-design/nfr-design-questions.md` — Q1 = A, Q4 = A
- `construction/u1-scoring-skeleton/functional-design/rules.md` — BR3.6, BR3.7, BR3.9, BR4.1, BR4.5
- `inception/contract-design/contract-summary.md` — thời gian chờ 10 giây, thử lại GET tối đa 2 lần
- `aidlc/spaces/default/memory/team.md` — TDD, coverage 80%, linter

## Chịu lỗi

| Mã | Giải pháp | Chi tiết | Đáp ứng |
|---|---|---|---|
| RD-1 | Không báo thành công sớm | ApiClient chỉ trả thành công cho màn hoàn thành khi nhận `201` hoặc `200`; khi hết thời gian chờ hoặc lỗi mạng, màn S4 giữ nguyên điểm, nhận xét và `idempotencyKey`, hiển thị "Chưa hoàn thành được" và nút Thử lại | NFR2.1 |
| RD-2 | Thời gian chờ và thử lại | Dio: thời gian chờ 10 giây; bộ chặn thử lại chỉ cho GET, tối đa 2 lần, chờ 300 ms rồi 900 ms; POST hoàn thành không tự thử lại, chỉ thử lại khi người dùng bấm, dùng cùng `idempotencyKey` | NFR2.2 |
| RD-3 | Giao dịch nguyên tử | LC-4 gọi `withTransaction` của LC-6: ghi phiếu và toàn bộ dòng điểm trong một giao dịch; lỗi ở bất kỳ bước nào thì hoàn tác; sự kiện kiểm toán chỉ phát sau commit | NFR2.3 |
| RD-4 | Chống ghi trùng | Trình tự trong giao dịch: tra `(userId, idempotencyKey)` → nếu đã có và cùng cặp thì trả `200`, khác cặp thì `409` → tra phiếu của cặp (userId, HĐPV, ứng viên) → nếu đã có (khóa khác) thì `409` → ghi. Khi hai request đồng thời cùng qua các bước tra, ràng buộc duy nhất làm một request nhận ORA-00001; LC-6 ánh xạ thành lỗi miền và LC-4 chạy lại bước tra để trả `200` hoặc `409` đúng | NFR2.4 |
| RD-5 | Mất kết nối DB | Lỗi kết nối hoặc hết thời gian chờ nhóm kết nối chuyển thành lỗi miền `DB_UNAVAILABLE`; bộ xử lý lỗi trả `503` kèm `{code:"DB_UNAVAILABLE", message:"Hệ thống tạm thời không khả dụng, vui lòng thử lại"}`; nhóm kết nối loại bỏ kết nối hỏng và tạo lại khi DB trở lại; `/health` báo `503` đến khi truy vấn thăm dò thành công; không dùng bộ ngắt mạch vì chỉ có một phụ thuộc và tải nhỏ (Q4 = A) | NFR2.5 |
| RD-6 | Dừng êm | Khi nhận SIGTERM hoặc SIGINT: ngừng nhận kết nối mới, chờ request đang chạy tối đa 10 giây, đóng nhóm kết nối, thoát mã 0; hết hạn chờ thì thoát mã khác 0 | NFR2.6 |
| RD-7 | Nạp dữ liệu an toàn | LC-5 mở một `tx` từ LC-6 rồi truyền cho IdentityAccess, InterviewCatalog, Evaluation (Q1 = A); lỗi bản ghi đơn lẻ được gom vào báo cáo và bỏ qua; mất kết nối thì rollback và thoát mã khác 0; khóa nghiệp vụ dùng thao tác "thêm hoặc cập nhật" nên chạy lại không nhân đôi | NFR2.7, NFR3.3 |
| RD-8 | Phiên bản API | Mọi route dưới `/api/v1`; tệp OpenAPI nằm trong mã nguồn backend; test hợp đồng kiểm phản hồi của từng API theo lược đồ; client bỏ qua trường lạ | NFR3.1 |

## Sẵn sàng và khôi phục

| Mã | Giải pháp | Chi tiết | Đáp ứng |
|---|---|---|---|
| RD-9 | Mục tiêu sẵn sàng | Trình quản lý tiến trình khởi động lại backend khi sập (chọn ở Infrastructure Design); `/health` dùng để kiểm tra; thời gian ngừng bảo trì xếp ngoài giờ phỏng vấn | NFR14.1 |
| RD-10 | Sao lưu | Trước mỗi đợt phát hành chạy Oracle Data Pump xuất lược đồ ứng dụng ra tệp có đóng dấu thời gian, lưu ngoài thư mục dữ liệu của container; ghi bước này vào quy trình phát hành thủ công theo đợt; RPO 24 giờ | NFR14.2 |
| RD-11 | Khôi phục | Hướng dẫn ngắn: dừng backend, tạo lại lược đồ rỗng, nhập bản xuất bằng Data Pump, khởi động backend, chạy `/health`; thử một lần trên máy dev; RTO 4 giờ | NFR14.3 |

## Thiết kế kiểm thử (TDD)

| Mã | Giải pháp | Chi tiết | Đáp ứng |
|---|---|---|---|
| TD-1 | Trình tự TDD | Với mỗi quy tắc (BR1.6, BR2.1..BR2.5, BR3.2, BR3.3, BR3.6..BR3.9, BR4.x): viết test thất bại trước, rồi mã tối thiểu, rồi tái cấu trúc; commit của Bolt giữ thứ tự test trước ở nhánh nguồn | NFR4.1 |
| TD-2 | Tầng test | Đơn vị (quy tắc thuần, kiểm payload, ánh xạ lỗi); tích hợp (Vitest + Supertest với Oracle XE Docker thật cho API, giao dịch, ràng buộc duy nhất, đồng thời); màn hình và đơn vị Flutter (`flutter_test`); đầu cuối (`verify:e2e`); độ phủ dòng lệnh ≥ 80% bằng `@vitest/coverage-v8` và `flutter test --coverage`, gộp ở build-and-test | NFR4.2 |
| TD-3 | Kiểm tĩnh | ESLint (kèm quy tắc cấm nối chuỗi vào truy vấn) và Prettier cho backend; `dart format --set-exit-if-changed` và `flutter analyze` cho app; chạy trong CI, lỗi chặn hợp nhất | NFR4.3 |
| TD-4 | Kiểm đầu cuối | `npm --prefix backend run verify:e2e` đã được duyệt: khởi động Oracle XE, nạp dữ liệu mẫu, đăng nhập, lấy danh sách, chấm đủ tiêu chí, hoàn thành, gửi lại cùng khóa (`200`), gửi khóa mới (`409`), kiểm DB đúng một phiếu và đúng số dòng điểm; chờ DB sẵn sàng có giới hạn thời gian | NFR4.4 |

## Assumptions & Open Questions

- **[assumption]** Không có máy chủ dự phòng và không có bộ ngắt mạch; mất DB nghĩa là ngừng phục vụ cho đến khi DB trở lại.
- **[assumption]** Tên công cụ sao lưu (Data Pump) và vị trí tệp xuất cụ thể được chốt ở Infrastructure Design.
- **Open question:** None.
