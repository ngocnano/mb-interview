**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho bộ NFR Requirements của U1 `u1-scoring-skeleton`: sáu tài liệu và `traceability.json`, đối chiếu `functional-spec.md`, `rules.md`, `requirements.md`, `contract-summary.md`, `team.md` và câu trả lời Q1..Q6.

Nhận định: 14 mã NFR gốc đều được xử lý (8 mã có chỉ tiêu đo được, 6 mã `N/A` kèm lý do thuộc U4 hoặc U5 hoặc ngoài MVP); sensor truy vết pass sau khi bảng ánh xạ `NFR-n` sang `NFRn` được thêm vào `requirements.md`. Các chỉ tiêu có số đo và cách kiểm: p95 500 ms và 1 giây, 50 người dùng đồng thời, RPO 24 giờ, RTO 4 giờ, log 30 ngày, độ phủ 80%. Bảo mật khớp quy tắc nghiệp vụ (BR1.1..BR1.8, BR2.x, BR3.6..BR3.8) và các quy tắc cố định của dự án (RBAC phía server, audit, idempotency, không ghi đè bài đã nộp). Hai mã NFR-13 và NFR-14 mới được bổ sung vào `requirements.md` đúng quy tắc của PO. Lựa chọn công nghệ có phương án thay thế và lý do, phù hợp môi trường (Node.js 22, Docker; Flutter chưa cài đã được nêu như điều kiện của B1).

Ba lỗi nhỏ được sửa ngay trong lúc rà soát, trước khi ghi kết luận: (1) NFR1.16 ghi token web ở "bộ nhớ trình duyệt", mâu thuẫn với AC1.1.8 (giữ đăng nhập khi làm mới trang); nay ghi rõ `localStorage`; (2) NFR1.10 nói DB không cấp quyền sửa cho tài khoản ứng dụng, quá rộng vì các bảng khác cần cập nhật khi nạp dữ liệu; nay giới hạn ở bảng phiếu đánh giá và bảng điểm; (3) NFR14.9 vừa nói ghi ra stdout vừa nói xoay vòng tệp; nay backend chỉ ghi stdout, thu thập do hạ tầng quyết định.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | `tech-stack-decisions.md` | Flutter SDK chưa có trên máy; nếu không cài, phần app của B1 không dựng và không chạy được lệnh xác minh đầu cuối | Cài Flutter SDK trước khi bắt đầu Code Generation phần app; ghi vào phụ thuộc của B1 | New |
| R-02 | Low | `security-requirements.md` NFR1.16 | Token trong `localStorage` dễ bị lấy nếu có lỗ hổng XSS | Chấp nhận cho MVP; NFR Design cân nhắc cookie HttpOnly nếu cần | New |
| R-03 | Low | `scalability-requirements.md` NFR13.9 | Giới hạn 100 request mỗi phút mỗi IP lưu trong bộ nhớ nên mỗi bản backend đếm riêng | Chấp nhận khi chỉ chạy một bản; ghi lại khi mở rộng | New |
| R-04 | Low | `performance-requirements.md` NFR13.3 | Chỉ tiêu 2 giây trên 4G đo thủ công, khó lặp lại | Giữ làm kiểm tra thủ công; không đưa vào CI | New |

### Suggestions

- Gộp các chỉ tiêu có thể tự động hóa (NFR13.1, NFR13.2, NFR14.6) vào một kịch bản phụ của `verify:e2e` để chạy cùng lệnh đã duyệt.
