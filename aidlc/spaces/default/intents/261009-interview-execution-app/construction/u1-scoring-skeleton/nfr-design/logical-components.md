# Thành phần logic — U1 scoring-skeleton

Danh mục thành phần hạ tầng logic mà các thiết kế NFR của U1 dựa vào, ranh giới lỗi và phạm vi ảnh hưởng. Đây là cầu nối sang Infrastructure Design. Mã `LC-n` được các tài liệu thiết kế khác dẫn chiếu.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/tech-stack-decisions.md` — công nghệ đã chọn
- `construction/u1-scoring-skeleton/nfr-design/nfr-design-questions.md` — Q1..Q4 = A
- `inception/domain-design/components.md` — khối IdentityAccess, InterviewCatalog, Evaluation, DataImport, InterviewerApp
- `inception/contract-design/contract-summary.md` — C2, C3
- `construction/u1-scoring-skeleton/functional-design/functional-spec.md` — WF-1..WF-6

## Danh mục

| Mã | Thành phần | Vai trò | Khối domain | Trạng thái |
|---|---|---|---|---|
| LC-1 | Vỏ HTTP (Express) | Chuỗi trung gian theo thứ tự: mã tương quan → log request → CORS → giới hạn tốc độ IP → giới hạn kích thước JSON → tiêu đề bảo mật → xác thực token → định tuyến → xử lý lỗi | — | Không trạng thái |
| LC-2 | Module IdentityAccess | Đăng nhập, phát và kiểm tra token, bộ đếm đăng nhập sai | IdentityAccess | Trạng thái ở DB |
| LC-3 | Module InterviewCatalog | Danh sách HĐPV, ứng viên, chính sách truy cập (`canOpenForScoring`, `canComplete`, `canViewPanel`) | InterviewCatalog | Trạng thái ở DB |
| LC-4 | Module Evaluation | Tiêu chí, hoàn thành đánh giá, danh sách bài đã hoàn thành | Evaluation | Trạng thái ở DB |
| LC-5 | Lệnh DataImport | Chương trình dòng lệnh dùng chung mã và kết nối DB với backend | DataImport | Chạy theo yêu cầu |
| LC-6 | Lớp truy cập DB | Nhóm kết nối, `withTransaction(fn)` truyền đối tượng giao dịch `tx` cho module, ánh xạ lỗi Oracle (ví dụ ORA-00001) sang lỗi miền | — | Giữ nhóm kết nối |
| LC-7 | Bộ nạp cấu hình | Đọc biến môi trường, kiểm tra bằng lược đồ, từ chối khởi động nếu thiếu hoặc sai (khóa JWT, chuỗi kết nối, danh sách CORS) | — | Chỉ đọc sau khi khởi động |
| LC-8 | Nhật ký và kiểm toán | Log JSON (pino), che trường nhạy cảm, mã tương quan qua ngữ cảnh bất đồng bộ, kênh sự kiện kiểm toán | — | Ghi ra stdout |
| LC-9 | Công việc bảo trì | Dọn `LoginThrottle` hết hạn, chạy khi khởi động và mỗi giờ trong tiến trình backend | IdentityAccess | Hẹn giờ trong tiến trình |
| LC-10 | Ứng dụng Flutter | Gồm: ApiClient (dio) có bộ chặn gắn token, mã tương quan, thử lại GET, xử lý 401; AuthStore; kho dữ liệu cho S2, S3, S4; màn hình S1..S4 với nhãn trợ năng, vùng chạm ≥ 48 px, báo lỗi bằng chữ | InterviewerApp | Chỉ giữ token lâu dài |
| LC-11 | Oracle Database XE (Docker) | Lưu mọi dữ liệu của U1; hai tài khoản DB: chủ lược đồ (tạo bảng, nạp dữ liệu) và tài khoản chạy ứng dụng (quyền tối thiểu) | — | Dữ liệu bền vững |

## Ranh giới lỗi và phạm vi ảnh hưởng

| Thành phần hỏng | Ảnh hưởng | Ràng buộc |
|---|---|---|
| LC-11 Oracle | Mọi API nghiệp vụ lỗi `503`; `/health` báo `503`; app hiện lỗi và nút Thử lại; không mất bài đã nhận `201` | Điểm lỗi duy nhất của hệ thống (chấp nhận cho MVP) |
| LC-1..LC-4, LC-6 (tiến trình backend) | Hết phục vụ cho đến khi tiến trình chạy lại; dữ liệu bền vững không mất | Trình quản lý tiến trình tự khởi động lại (chọn ở Infrastructure Design) |
| LC-5 DataImport | Không ảnh hưởng người dùng đang chấm; lỗi thì hoàn tác toàn bộ | Chạy ngoài giờ phỏng vấn |
| LC-9 bảo trì | Bảng đếm có thể phình nhưng không ảnh hưởng nghiệp vụ | Cảnh báo `warn` nếu việc dọn lỗi |
| LC-10 app | Chỉ ảnh hưởng thiết bị đó; dữ liệu chưa hoàn thành mất khi đóng app (Q2 = A của Functional Design) | — |

## Tài nguyên dùng chung

- Nhóm kết nối DB (LC-6): cả backend và lệnh nạp; lệnh nạp mở nhóm riêng khi chạy tiến trình khác.
- Khóa JWT và chuỗi kết nối: biến môi trường, chung cho backend và lệnh nạp.
- Dòng log: một luồng stdout cho mọi sự kiện, tách theo trường `type` (`access`, `audit`, `app`).

## Quy tắc phụ thuộc giữa module

IdentityAccess không phụ thuộc module nào. InterviewCatalog phụ thuộc IdentityAccess. Evaluation phụ thuộc InterviewCatalog và IdentityAccess. DataImport gọi cả ba. Mọi module chỉ nhận giao dịch `tx` từ LC-6 và không tự mở kết nối.

## Assumptions & Open Questions

- **[assumption]** Một máy chạy cả backend lẫn Oracle XE khi demo; tách máy là quyết định của Infrastructure Design.
- **Open question:** None.
