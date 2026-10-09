# Thiết kế bảo mật — U1 scoring-skeleton

Mã `SD-n` là các giải pháp thiết kế bảo mật.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/security-requirements.md` — NFR1.1..NFR1.17, NFR6.1
- `construction/u1-scoring-skeleton/functional-design/rules.md` — BR1.1..BR1.8, BR2.x, BR3.x
- `construction/u1-scoring-skeleton/nfr-design/logical-components.md` — LC-1, LC-2, LC-3, LC-6, LC-7, LC-8, LC-10, LC-11
- `inception/contract-design/contract-summary.md` — C2, C3
- `aidlc/spaces/default/memory/project.md` — RBAC phía server, audit, idempotency

## Luồng xác thực

1. LC-1 nhận request tới `/api/v1/auth/login`. Chuỗi trung gian chạy: mã tương quan, log, CORS, giới hạn IP, giới hạn kích thước JSON, kiểm payload bằng lược đồ.
2. LC-2 chuẩn hóa email và đọc `LoginThrottle`. Nếu còn khóa trả `429 LOGIN_LOCKED`.
3. LC-2 tìm tài khoản theo email. Nếu không có tài khoản, vẫn chạy một phép so khớp bcrypt với một giá trị băm giả để thời gian phản hồi gần như nhau (NFR1.5), rồi xử lý như sai mật khẩu.
4. Mật khẩu sai: tăng bộ đếm, có thể đặt khóa 15 phút, ghi sự kiện kiểm toán, trả `401` thông báo chung.
5. Mật khẩu đúng và tài khoản `LOCKED`: `403`. Đúng và `ACTIVE`: đặt lại bộ đếm, phát JWT, trả `200`.
6. Mọi request khác qua trung gian xác thực: kiểm chữ ký, hạn, và đọc trạng thái tài khoản theo `userId` (khóa chính); `LOCKED` hoặc không tồn tại thì `401`.

| Mã | Giải pháp | Chi tiết | Đáp ứng |
|---|---|---|---|
| SD-1 | Băm mật khẩu | `bcryptjs` cost 10; chỉ lưu băm; mật khẩu không bao giờ nằm trong đối tượng được log (cấu hình che của LC-8) | NFR1.1 |
| SD-2 | Token | JWT HS256; claim: `sub` = userId, `employedId`, `iat`, `exp` = +8 giờ; không refresh token; khóa tối thiểu 32 byte từ LC-7, thiếu hoặc ngắn thì LC-7 từ chối khởi động | NFR1.2, NFR1.3 |
| SD-3 | Chống dò mật khẩu và email | Hai lớp: tạm khóa theo email (BR1.6) và giới hạn 100 request mỗi phút mỗi IP; so khớp băm giả cho email không tồn tại | NFR1.4, NFR1.5 |
| SD-4 | Điểm kiểm soát truy cập duy nhất | Mọi API theo HĐPV gọi chính sách của LC-3 (`canOpenForScoring`, `canComplete`, `canViewPanel`); Evaluation không đọc bảng của InterviewCatalog; kết quả `Denied` ánh xạ 403 hoặc 404 theo hợp đồng C2 | NFR1.6 |
| SD-5 | Che dữ liệu cá nhân ở biên | Lớp ánh xạ phản hồi của LC-3 chỉ chọn trường cho phép; không dùng "trả cả hàng" từ DB; test hợp đồng kiểm không có `sdt`, `ngaySinh`, `gioiTinh` | NFR1.7 |
| SD-6 | Truy vấn có tham số | LC-6 chỉ cung cấp API nhận câu truy vấn và mảng biến ràng buộc; nối chuỗi từ đầu vào bị cấm bằng quy tắc ESLint và rà soát | NFR1.8 |
| SD-7 | Kiểm payload | Mọi API có lược đồ `zod` cho thân và tham số đường dẫn: kiểu, độ dài, giá trị cho phép; trường lạ bị bỏ; JSON tối đa 100 KB; lỗi đầu vào trả `400` kèm danh sách trường | NFR1.9 |
| SD-8 | Bất biến của phiếu | Không có route sửa hoặc xóa; tài khoản DB chạy ứng dụng chỉ có quyền INSERT và SELECT trên bảng phiếu và bảng điểm; chủ lược đồ dùng để tạo bảng và nạp dữ liệu riêng | NFR1.10 |
| SD-9 | Kiểm toán | LC-8 phát sự kiện kiểm toán (`login_failed`, `login_locked`, `evaluation_completed`, `evaluation_replayed`, `import_run`) với userId, mã HĐPV, mã ứng viên, thời điểm, mã tương quan; sự kiện phiếu ghi sau khi giao dịch commit | NFR1.11 |
| SD-10 | Truyền tải | HTTP chỉ cho dev; khi triển khai, HTTPS kết thúc ở lớp phía trước (quyết định ở Infrastructure Design) và backend thêm `Strict-Transport-Security` khi `NODE_ENV=production` | NFR1.12 |
| SD-11 | CORS | Danh sách nguồn cho phép đọc từ cấu hình LC-7; mặc định rỗng (từ chối mọi nguồn khác); app điện thoại không bị ảnh hưởng | NFR1.13 |
| SD-12 | Tiêu đề phản hồi | `Cache-Control: no-store` cho mọi API nghiệp vụ; `X-Content-Type-Options: nosniff`; không để lộ `X-Powered-By` (dùng `helmet`) | NFR1.14 |
| SD-13 | Quản lý bí mật | Khóa JWT, chuỗi kết nối, mật khẩu hai tài khoản DB chỉ từ biến môi trường; `.env` và tệp nạp chứa mật khẩu (`data/import/*.json` thật) nằm trong `.gitignore`; tệp mẫu `data/sample` dùng mật khẩu giả | NFR1.15 |
| SD-14 | Lưu token ở app | Điện thoại: `flutter_secure_storage`; web: `localStorage` để giữ đăng nhập sau khi làm mới trang; bộ chặn của ApiClient gắn `Authorization: Bearer`; `401` xóa token và về S1 | NFR1.16 |
| SD-15 | Xử lý lỗi | Bộ xử lý lỗi cuối của LC-1 chuyển lỗi miền thành `{code,message}`; lỗi chưa biết trả `500` thông báo chung, stack chỉ vào log kèm mã tương quan | NFR1.17 |
| SD-16 | Trợ năng cơ bản ở S1..S4 | LC-10 dùng thành phần có nhãn ngữ nghĩa (`Semantics`), vùng chạm tối thiểu 48 px, thông báo lỗi bằng chữ cạnh trường, thông báo thành công qua vùng thông báo trực tiếp (live region) | NFR6.1 |

## Mô hình đặc quyền DB

| Tài khoản DB | Quyền | Dùng bởi |
|---|---|---|
| Chủ lược đồ | Tạo, sửa bảng; INSERT, UPDATE, DELETE đầy đủ | Lệnh tạo lược đồ và LC-5 (nạp dữ liệu) |
| Tài khoản ứng dụng | SELECT trên mọi bảng; INSERT trên `InterviewEvaluation`, `EvaluationScore`; INSERT và UPDATE trên `LoginThrottle` (xóa dòng hết hạn do LC-9 qua quyền DELETE riêng chỉ trên bảng này) | Backend khi phục vụ API |

## Assumptions & Open Questions

- **[assumption]** Backend phục vụ API không cần quyền ghi lên bảng dữ liệu nguồn (HĐPV, ứng viên, tài khoản); chỉ lệnh nạp ghi vào đó bằng tài khoản chủ lược đồ.
- **[assumption]** Token trong `localStorage` chấp nhận rủi ro XSS cho MVP; cân nhắc cookie HttpOnly nếu app công khai ra Internet.
- **Open question:** None.
