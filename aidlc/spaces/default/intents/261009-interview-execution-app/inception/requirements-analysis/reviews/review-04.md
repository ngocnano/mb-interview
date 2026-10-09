**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần sau khi PO thay giả định A-3: ứng viên `Xác nhận = N` không hiển thị trên màn chấm điểm.

Nhận định: quy tắc được nâng thành BR-A1 và áp dụng nhất quán ở FR-A2 (số đếm), FR-A3 (vị trí), FR-A4 (danh sách), FR-A5 và FR-A6 (API từ chối `404`), kèm tiêu chí chấp nhận kiểm ở server. Không còn mâu thuẫn giữa giả định và FR.

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
| R-08 | Medium | FR-A3 / A-2 | Vị trí suy ra từ trường `Vị trí` của ứng viên; nếu team nghiệp vụ hiểu "vị trí" là thuộc tính của HĐPV thì luồng chọn vị trí sẽ sai | PO xác nhận A-2 tại gate trước khi sang User Stories | New |
| R-09 | Medium | FR-A2 / A-1 | Lọc HĐPV theo bảng Chi tiết HĐPV – CBQL yêu cầu `employedId` của user khớp `Mã CBQL`; dữ liệu seed phải nhất quán | Seed user demo với `employedId` trùng `Mã CBQL` trong dữ liệu mẫu | New |
| R-10 | Low | FR-A0 / A-6 | Không có refresh token; phiên dài hơn 8 giờ sẽ phải đăng nhập lại | Chấp nhận cho MVP; ghi chú cho increment sau | New |
| R-11 | Low | FR-A5 | Rời màn khi chưa submit làm mất dữ liệu đã nhập (MVP không có autosave) | Chấp nhận cho MVP; autosave thuộc north star FR-8 | New |
| R-12 | Low | BR-A1 / FR-A6 | Nếu ứng viên đã được chấm khi còn `Y` rồi sau đó nạp lại thành `N`, đánh giá đã nộp sẽ bị ẩn khỏi danh sách; requirements chưa nói đánh giá đó được giữ hay xử lý thế nào | Chấp nhận cho MVP: đánh giá đã nộp vẫn được giữ nguyên trong DB, chỉ bị ẩn; làm rõ ở increment sau | New |

> R-03 Not re-checked this round

> R-04 Not re-checked this round

> R-05 Not re-checked this round

> R-06 Not re-checked this round

> R-07 Not re-checked this round

> R-08 Not re-checked this round

> R-09 Not re-checked this round

> R-10 Not re-checked this round

> R-11 Not re-checked this round
