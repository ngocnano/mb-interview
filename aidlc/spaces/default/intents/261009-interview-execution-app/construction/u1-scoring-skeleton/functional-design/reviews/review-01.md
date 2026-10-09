**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho `functional-spec.md` của U1 `u1-scoring-skeleton`, đối chiếu `entities.md`, `rules.md`, `traceability.json`, `unit-of-work.md`, `components.md`, `contract-summary.md`, `stories.md` và câu trả lời Q1..Q6.

Nhận định: 39 quy tắc BR1.1..BR4.9 đều có AC hoặc lý do nằm ở phần `reverse`; 73 AC của 9 story đều có trong `traceability.json` (đối chiếu bằng script với `stories.md`, không thiếu AC nào, không có mã BR đích nào sai). Mười ba AC thuộc Unit khác được ghi `N/A` kèm lý do. Hai chính sách cốt lõi được phản ánh đúng: chính sách truy cập chỉ ở InterviewCatalog (BR2.1..BR2.3, BR3.5) và hoàn thành đánh giá một giao dịch, duy nhất, idempotent, không sửa (BR3.6..BR3.9). Điều chỉnh hợp đồng được ghi rõ và đã cập nhật `contract-summary.md` (`my-evaluations` tối thiểu ở U1, `429` ở đăng nhập); các bổ sung này cũng đã được ghi vào `requirements.md` (FR-A0) và `stories.md` (AC1.1.9), đúng quy tắc của PO. Tài liệu không chứa mã hay SQL. Thứ tự kiểm tra ở WF-6 khớp quyền trước, dữ liệu sau, rồi idempotency.

Trong lúc rà soát có một vấn đề đã được sửa ngay trước khi ghi kết luận: ở bản nháp đầu, BR3.7 trả bản đã lưu cho mọi `idempotencyKey` đã dùng, kể cả khi khóa đó thuộc ứng viên khác, nghĩa là có thể lộ phiếu của cặp khác trong cùng tài khoản. Nay BR3.7 chỉ trả `200` cho đúng cặp (HĐPV, ứng viên), khác cặp thì `409`.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | `rules.md` BR1.6 | Khóa theo email cho phép người khác cố ý nhập sai 5 lần để khóa nhầm người dùng thật trong 15 phút | Chấp nhận cho MVP (đã ghi trong Assumptions); NFR cân nhắc thêm giới hạn theo IP | New |
| R-02 | Low | `entities.md` LoginThrottle | Bảng đếm có dòng cho cả email không tồn tại nên có thể phình do bị dò email | NFR hoặc thiết kế hạ tầng quyết định dọn các dòng hết hạn | New |
| R-03 | Low | `entities.md` Candidate | Vẫn lưu sdt, ngaySinh, gioiTinh dù API không bao giờ trả | Chốt có cần lưu hay bỏ khi nạp (câu hỏi mở từ domain-design) | New |
| R-04 | Low | `functional-spec.md` WF-3, AC2.1.3 | Số "đã chấm / tổng" của S2 chưa có ở U1, chỉ hiển thị tổng | Đã ghi rõ thuộc U2; xác nhận khi duyệt | New |

### Suggestions

- Dựng bộ ví dụ kiểm thử của BR1.6 (5 lần sai, lần thứ 6 đúng mật khẩu vẫn 429, hết 15 phút thì đặt lại) làm test đầu tiên của IdentityAccess theo TDD.
