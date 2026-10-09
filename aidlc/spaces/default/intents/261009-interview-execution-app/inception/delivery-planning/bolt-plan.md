# Kế hoạch Bolt — App thực hiện phỏng vấn

Bolt = một lượt xây dựng một phần công việc (một hoặc vài Unit), kết thúc bằng thứ chạy được và có Định nghĩa hoàn thành (DoD). Walking skeleton = lát cắt mỏng nhất chạy xuyên suốt từ dữ liệu đến màn hình, dựng trước để chứng minh các mảnh ghép nối được.

## Sources

- `inception/units-generation/unit-of-work.md` — 5 Unit, phạm vi và ranh giới
- `inception/units-generation/unit-of-work-dependency.md` — U2, U3, U5 phụ thuộc U1; U4 phụ thuộc U3
- `inception/units-generation/unit-of-work-story-map.md` — gán 25 story cho Unit và mức ưu tiên
- `inception/delivery-planning/delivery-planning-questions.md` — Q1..Q8 đều chọn A
- `aidlc/spaces/default/memory/team.md` — trunk-based, squash-merge, walking skeleton, TDD, coverage 80%

## Thứ tự Bolt

Thứ tự khớp một thứ tự tô-pô hợp lệ của DAG: U1 → U2 → U5 → U3 → U4. Chạy nối tiếp (Q4 = A), mỗi Bolt là một nhánh ngắn squash-merge vào `main`, tên commit theo slug Bolt.

| Bolt | Slug | Unit | Walking skeleton | Phát hành |
|---|---|---|---|---|
| B1 | `b1-scoring-skeleton` | U1 | Có | R1 (cùng B2) |
| B2 | `b2-scoring-complete` | U2 | Không | R1 |
| B3 | `b3-ui-experience` | U5 | Không | R2 nếu kịp, nếu không thì sau R1 |
| B4 | `b4-cv-viewer` | U3 | Không | Lượt sau |
| B5 | `b5-ai-assist` | U4 | Không | Lượt sau |

Đường cắt 2 ngày (Q5 = A): R1 = B1 + B2. B1 chưa có kết luận bắt buộc nên chưa dùng thật được, vì thế B1 và B2 phát hành chung. R1 gồm 13 story Must Have (U1: 9; U2: US5.3, US5.8, US6.2, US6.3) và 2 story Should Have (US5.4, US1.2). Ba story Must Have còn lại (US8.1, US8.2, US8.5) thuộc B3; vì vậy B3 là mục đầu tiên cần làm nếu còn thời gian, và R1 chưa thỏa đủ 16 story Must Have.

---

## B1 — b1-scoring-skeleton (walking skeleton)

- **Unit:** U1 `u1-scoring-skeleton`.
- **Chứng minh:** backend Node.js, Oracle XE (Docker) và app Flutter nối được với nhau; luồng chấm điểm tối thiểu chạy xuyên suốt; RBAC ở server, idempotency, không ghi đè bài đã hoàn thành.
- **Định nghĩa hoàn thành:**
  - Oracle XE chạy bằng Docker; schema các khối IdentityAccess, InterviewCatalog, Evaluation tạo được bằng script.
  - Script nạp dữ liệu mẫu (tiêu chí, vị trí, CBQL, tài khoản, ứng viên, HĐPV) chạy được.
  - Đăng nhập JWT, danh sách HĐPV `Inprogress` của tôi, danh sách ứng viên (ẩn `Xác nhận = N`, sắp theo giờ), phiếu chấm, hoàn thành đánh giá hoạt động ở backend và app Flutter.
  - Test viết trước (TDD) cho chính sách truy cập, kiểm tra điểm, khóa duy nhất, idempotencyKey; coverage ≥ 80%; lint sạch (ESLint/Prettier, `dart format`, `flutter analyze`).
  - Lệnh xác minh đầu cuối (xem bên dưới) chạy xanh.
- **Giả thuyết cần kiểm chứng:** Node.js kết nối được Oracle XE và một người phỏng vấn đăng nhập, chấm và hoàn thành một ứng viên, bản ghi nằm đúng trong DB, hoàn thành lần hai với cùng `idempotencyKey` không tạo bản ghi thứ hai.
- **Demo:** đăng nhập → chọn HĐPV → mở ứng viên → chấm từng tiêu chí → Hoàn thành đánh giá → truy vấn DB thấy một bản ghi `SUBMITTED` cùng các dòng điểm.
- **Mob:** aidlc-developer-agent.
- **Story:** US7.2, US7.1, US7.3, US1.1, US2.1, US4.1, US5.1, US5.2, US6.1.

## B2 — b2-scoring-complete

- **Unit:** U2 `u2-scoring-complete`.
- **Chứng minh:** phiếu chấm hoàn chỉnh theo quy tắc nghiệp vụ; điểm trung bình khớp giữa Node.js và Dart.
- **Định nghĩa hoàn thành:**
  - API hoàn thành đánh giá nhận `ketLuan` bắt buộc; refer chỉ khi `KHAC`; điểm trung bình chuẩn hóa thang 5, lưu 2 chữ số thập phân (ADR-003).
  - Bộ ví dụ test điểm trung bình dùng chung cho Node.js và Dart đều xanh.
  - Cột Điểm TB, nhãn kết luận, màn bài đã hoàn thành, gửi lại khi mất mạng, đăng xuất.
  - Tóm tắt đánh giá theo HĐPV ghép vào danh sách (ADR-002).
  - Coverage ≥ 80%, lint sạch, lệnh xác minh vẫn xanh.
- **Giả thuyết cần kiểm chứng:** công thức điểm trung bình cho cùng kết quả ở server và client; người dùng hoàn thành đánh giá được dù mất mạng giữa chừng.
- **Demo:** chấm một ứng viên với kết luận `Khác` và refer, thấy điểm trung bình trực tiếp, hoàn thành, xem lại bài và cột Điểm TB trong danh sách.
- **Mob:** aidlc-developer-agent.
- **Story:** US5.3, US5.8, US5.4, US6.2, US6.3, US1.2.

## B3 — b3-ui-experience

- **Unit:** U5 `u5-ui-experience`.
- **Chứng minh:** giao diện chung (phông sans-serif, bố cục thích ứng, truy cập WCAG 2.1 AA cơ bản) áp dụng nhất quán lên các màn hình của B1 và B2.
- **Định nghĩa hoàn thành:** US8.1, US8.2, US8.5 đạt tiêu chí chấp nhận; US8.3, US8.4, US8.6 làm nếu còn thời gian; `flutter analyze` sạch; không thêm API backend.
- **Giả thuyết cần kiểm chứng:** một chủ đề chung dùng được trên điện thoại và web mà không phải sửa luồng.
- **Demo:** cùng luồng chấm điểm trên điện thoại và trình duyệt, không vỡ bố cục.
- **Mob:** aidlc-developer-agent.
- **Story:** US8.1, US8.2, US8.5, US8.4, US8.3, US8.6.

## B4 — b4-cv-viewer

- **Unit:** U3 `u3-cv-viewer`.
- **Chứng minh:** xem CV PDF chỉ đọc chạy trên cả web và điện thoại, nhật ký xem ghi trước khi trả nội dung.
- **Định nghĩa hoàn thành:** US5.5; không tải xuống, in, chia sẻ; có dữ liệu mẫu PDF; văn bản CV và `cvHash` được trích sẵn cho B5; bước nạp `cvPath` (AC7.1.9) hoạt động.
- **Giả thuyết cần kiểm chứng:** gói xem PDF được chọn chạy ổn trên cả hai nền tảng và hỗ trợ tọa độ chữ cho phần làm nổi bật ở B5.
- **Demo:** bấm Xem CV từ phiếu chấm, cuộn và phóng to, kiểm tra nhật ký xem.
- **Mob:** aidlc-developer-agent.
- **Story:** US5.5.

## B5 — b5-ai-assist

- **Unit:** U4 `u4-ai-assist`.
- **Chứng minh:** tóm tắt CV bằng AI chạy sau cờ cấu hình và tuân thủ BR-A4, NFR-8.
- **Định nghĩa hoàn thành:** US7.4, US5.6, US5.7; cờ tắt mặc định; che dữ liệu cá nhân trước khi gửi; giới hạn số lần gọi; nhật ký gọi; khóa API chỉ từ biến môi trường; có nhà cung cấp giả lập cho test.
- **Giả thuyết cần kiểm chứng:** tóm tắt có đoạn trích đúng nguồn và không tự chấm điểm hay điền phiếu.
- **Demo:** bật cờ, mở CV, xem tóm tắt, làm nổi bật và câu hỏi gợi ý.
- **Mob:** aidlc-developer-agent.
- **Story:** US7.4, US5.6, US5.7.

## Assumptions & Open Questions

- **[assumption]** Q5 nêu "16 story Must Have" cho U1 + U2 là chưa chính xác. Số đúng là 13 Must Have trong R1; 16 Must Have chỉ đạt khi thêm B3 (US8.1, US8.2, US8.5).
- **[assumption]** Mức ưu tiên Should Have và Could Have vẫn là đề xuất, chưa được PO xác nhận.
- **Open question:** nhà cung cấp AI, gói xem PDF, nơi đặt kho tệp CV chưa chọn; ảnh hưởng B4, B5, không ảnh hưởng B1, B2, B3.
