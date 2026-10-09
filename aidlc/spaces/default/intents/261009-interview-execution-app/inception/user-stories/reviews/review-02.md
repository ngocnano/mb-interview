**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần sau khi PO bỏ nhóm 3 "Chọn vị trí": app chỉ hiển thị danh sách ứng viên của HĐPV, mỗi dòng có vị trí, sắp theo giờ phỏng vấn từ gần tới xa.

Nhận định: thay đổi được áp dụng nhất quán ở `requirements.md` (FR-A3 đánh dấu đã bỏ, FR-A4 viết lại, A-2 bỏ, thêm A-7), `stories.md` (US3.1 xóa, US4.1 gộp thông tin vị trí và sắp xếp, phụ thuộc US5.1 vẫn đúng), `traceability.json` (FR-A3 chuyển `N/A` kèm lý do, FR-6 bỏ tham chiếu US3.1) và `user-stories-assessment.md`. Giữ trống ID nhóm 3 là hợp lý để không đổi ID các story còn lại. Các quy tắc BR-A1 và BR-A2 vẫn được kiểm ở server trong US4.1.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | stories.md, bảng danh sách story | 13 story (6 cỡ M, 7 cỡ S) có thể vượt 2 ngày nếu một người làm tuần tự; ước lượng chưa kiểm tra với số người thực tế | Delivery Planning đối chiếu số người và chia song song backend/Flutter; US1.2 là điểm cắt đầu tiên | New |
| R-02 | Medium | US3.1 | Nghĩa của "vị trí" dựa trên giả định A-2 (suy ra từ trường `Vị trí` của ứng viên); nếu sai thì US3.1 và AC3.1.1..AC3.1.3 phải viết lại | PO xác nhận A-2 tại cổng này | New |
| R-03 | Low | US2.1 / AC2.1.3 | "Số đã chấm / tổng" chỉ tính ứng viên đã xác nhận lịch; định nghĩa này chỉ nằm trong tiêu chí, chưa có test mẫu cụ thể | Viết test dữ liệu mẫu có cả ứng viên `Y` và `N` khi làm US2.1 | New |
| R-04 | Low | AC1.2.2 | Hành vi nút quay lại của thiết bị phụ thuộc cách Flutter điều hướng, khó kiểm tra tự động | Chấp nhận cho MVP; đây là story Should Have | New |
| R-05 | Low | traceability.json | Bộ kiểm truy vết chưa chạy riêng, định dạng ID `FR-A0`, `NFR-1` giữ nguyên như trong `requirements.md` | Nếu cảm biến báo thiếu hoặc sai ID, sửa lại theo báo cáo của cổng | New |
| R-06 | Low | Open question cuối stories.md | Đánh giá đã nộp vẫn nằm trong DB nhưng ẩn khỏi app khi HĐPV rời `Inprogress` hoặc ứng viên đổi sang `N`; chưa có cách xem lại | Chấp nhận cho MVP; ghi cho increment sau | New |
| R-07 | Medium | US4.1 / AC4.1.1, AC4.1.8 | "Từ gần tới xa" được hiểu là giờ bắt đầu từ sớm đến muộn, không theo giờ hiện tại; nếu PO muốn ứng viên gần giờ hiện tại nhất lên đầu thì thứ tự và hai tiêu chí này phải viết lại | PO xác nhận cách hiểu A-7 tại cổng này | New |
| R-08 | Low | US4.1 | Danh sách gộp mọi vị trí của HĐPV vào một màn; HĐPV nhiều ứng viên sẽ dài, MVP chưa có lọc hay tìm kiếm | Chấp nhận cho MVP; cân nhắc lọc theo vị trí ở increment sau | New |
| R-09 | Low | stories.md, nhóm 3 | ID nhóm 3 để trống nên số story (12) và số nhóm không liền mạch | Chấp nhận; đã ghi chú rõ trong tài liệu | New |
| R-10 | Low | requirements.md | Nội dung đã duyệt của Requirements Analysis được sửa trực tiếp (FR-A3, FR-A4) theo chỉ đạo PO ở Q7, không mở lại vòng duyệt | Ghi rõ nguồn thay đổi đã có trong tài liệu; PO nắm tại cổng này | New |

> R-01 Not re-checked this round

> R-02 Not re-checked this round

> R-03 Not re-checked this round

> R-04 Not re-checked this round

> R-05 Not re-checked this round

> R-06 Not re-checked this round

### Suggestions

- Cân nhắc cho US4.1 lọc nhanh theo `Chưa chấm` ở increment sau để người phỏng vấn tìm ứng viên tiếp theo nhanh hơn.
