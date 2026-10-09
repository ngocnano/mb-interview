**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho bộ Infrastructure Design của U1 `u1-scoring-skeleton`: `infrastructure-specification.md`, `monitoring-design.md`, `cicd-pipeline.md` và `traceability.json`, đối chiếu sáu tài liệu NFR Design, `components.md`, `functional-spec.md`, `contract-summary.md`, `team.md` và câu trả lời Q1..Q5.

Nhận định: hạ tầng phù hợp quy mô (Docker Compose hai dịch vụ, một Oracle XE, không thêm thành phần thừa) và khớp thiết kế NFR: quyền DB tối thiểu (IS-12 với SD-8), bí mật chỉ từ môi trường (IS-11), dừng êm và khởi động lại (IS-7), kiểm tra sức khỏe (IS-13), sao lưu và khôi phục có RPO, RTO (IS-10), giữ log 30 ngày (IS-9). Cả 58 mã NFR đều có mặt trong `traceability.json`: 35 mã ánh xạ tới quyết định hạ tầng, 23 mã `N/A` kèm lý do (xử lý trong mã hoặc thuộc ứng dụng Flutter); sensor truy vết pass. Quy trình CI/CD khớp team.md: trunk-based, squash-merge một commit mỗi Bolt, TDD, độ phủ 80%, phát hành thủ công theo đợt.

Hai lỗi được sửa ngay trong lúc rà soát, trước khi ghi kết luận: (1) bước 6 của `deploy` chạy `verify:e2e` trên môi trường `demo`, trong khi lệnh này tạo phiếu đánh giá mẫu và `demo` chứa dữ liệu nạp từ tệp thật, nên sẽ lẫn dữ liệu kiểm thử vào dữ liệu thật; nay chạy trên một Oracle XE tạm, còn `demo` chỉ kiểm `/health` và đăng nhập thử bằng tài khoản chỉ đọc; (2) đặc tả sao lưu dùng Data Pump nhưng chưa nói tới đối tượng thư mục (DIRECTORY) mà Data Pump cần; nay `02-schema.sql` tạo đối tượng này. Thay đổi (1) lệch một chút so với mô tả của Q5 và đã được ghi lại.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | `infrastructure-specification.md` IS-8 | HTTPS trên `demo` phụ thuộc máy và tên miền chưa có; nếu demo chạy HTTP trong mạng nội bộ thì mật khẩu và token đi dạng rõ | Chốt máy và tên miền demo, hoặc chấp nhận bằng văn bản rằng demo chỉ chạy HTTP trong mạng tin cậy; không đưa dữ liệu thật ra Internet khi chưa có HTTPS | New |
| R-02 | Medium | `infrastructure-specification.md` IS-3, IS-10 | Một máy duy nhất chứa cả dữ liệu và bản sao lưu (cùng ổ đĩa) nên mất ổ đĩa là mất cả hai | Sao chép tệp `.dmp` sang nơi khác (ổ ngoài hoặc kho chung) trong quy trình phát hành | New |
| R-03 | Low | `infrastructure-specification.md` IS-2 | Cổng DB 1521 mở trên 127.0.0.1 ở dev, an toàn nhưng cần chắc chắn Compose không gắn `0.0.0.0` | Kiểm tệp Compose khi dựng ở Code Generation | New |
| R-04 | Low | `infrastructure-specification.md` IS-11 | Xoay khóa JWT làm mọi token hiện hành mất hiệu lực, người dùng phải đăng nhập lại | Chấp nhận; ghi vào hướng dẫn vận hành | New |
| R-05 | Low | `monitoring-design.md` | Không có cảnh báo tự động nên sự cố ngoài giờ không ai biết | Chấp nhận cho MVP; thêm khi lên production thật | New |

### Suggestions

- Thêm một lệnh `npm run doctor` kiểm Docker, Node.js, Flutter SDK, cổng và dung lượng đĩa trước khi bắt đầu Bolt B1 để phát hiện thiếu Flutter SDK sớm.
