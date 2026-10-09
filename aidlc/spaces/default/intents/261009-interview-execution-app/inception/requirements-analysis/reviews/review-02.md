**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần sau khi PO đổi kiến trúc sang Oracle XE local (Docker), DB riêng, login JWT tự xây và tầng REST API Node.js/Express. Lớp review: advisory.

Nhận định: thay đổi kiến trúc được phản ánh nhất quán trong DEC-2, DEC-4, DEC-5, mục Kiến trúc MVP, luồng người dùng, FR-A0, FR-A1 và FR-A6. Việc chuyển sang DB riêng loại bỏ rủi ro lịch phụ thuộc team Phase 1 (finding Medium ở review trước đã được giải quyết). Phạm vi 2 ngày vẫn khả thi dù tăng khối lượng do phải tự xây tầng API + auth; đây là đánh đổi hợp lý và đã được ghi nhận.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | FR-A1 / DEC-2 | Lệ thuộc schema DB dùng chung với team Phase 1; tên bảng/cột chưa chốt là rủi ro lịch cao nhất | Thống nhất tên bảng/cột theo Kiro_bang (1).xlsx ngay ngày 1; nếu chưa sẵn, seed tạm đúng cấu trúc để không chặn FE/BE | Resolved (reviewer) |
| R-02 | Medium | FR-A0 / FR-A6 | Cần ánh xạ danh tính Supabase `auth.uid()` ↔ `EmployedID` của người chấm (dữ liệu Phase 1) để gắn đánh giá và áp RLS | Seed sẵn bảng ánh xạ cho tài khoản demo trong MVP; đối chiếu đầy đủ để increment sau | Resolved (reviewer) |
| R-03 | Low | FR-A3 | "Vị trí phỏng vấn" trong flow chưa phân biệt rõ với trường `Vị trí` của ứng viên (job + ĐVQL + ĐVTT1-3) | Làm rõ ở domain-design; không chặn requirements | New |
| R-04 | Low | FR-A6 | Ràng buộc "tối đa một đánh giá/(người chấm, ứng viên)" nên hiện thực bằng unique constraint ở DB để test được | Khai báo constraint ở tầng DB khi thiết kế schema | New |
| R-05 | Medium | DEC-5 / Kiến trúc MVP | Tự xây tầng REST API + JWT auth + Oracle driver làm tăng khối lượng so với Supabase; rủi ro lịch 2 ngày | Giữ API tối thiểu (chỉ endpoint phục vụ FR-A0..A7); dùng Oracle XE Docker image dựng sẵn; bcrypt + jsonwebtoken là đủ, không thêm framework auth nặng | New |
| R-06 | Low | FR-A1 | Cần chuẩn bị script seed/import và dữ liệu mẫu theo cấu trúc Kiro_bang (1).xlsx trước khi test luồng | Viết seed script là việc ngày 1 của Construction | New |
| R-07 | Low | DEC-2 | Schema DB riêng do app tự định nghĩa — chốt tên bảng/cột ở domain-design trước khi code | Khóa schema sớm để FE/BE không lệch | New |

> R-01 Reviewer note: DB riêng + seed/import thay cho DB dùng chung; không còn phụ thuộc schema/lịch team Phase 1

> R-02 Reviewer note: Login JWT tự xây với bảng user Oracle gắn trực tiếp userId vào đánh giá; không cần ánh xạ auth.uid ↔ EmployedID ở MVP

> R-03 Not re-checked this round

> R-04 Not re-checked this round

### Suggestions

- Cân nhắc dùng kết nối Oracle qua `oracledb` thin mode (không cần Instant Client) để giảm bước cài đặt trên máy dev trong 2 ngày.
