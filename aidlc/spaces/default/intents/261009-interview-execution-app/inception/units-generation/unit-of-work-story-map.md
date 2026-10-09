# Bản đồ story → Unit

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/user-stories/stories.md` — 25 story
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/units-generation/unit-of-work.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/units-generation/units-generation-questions.md` — kế hoạch đã duyệt

## Bảng gán

| Story | Tên story | Unit | Thư mục | Ưu tiên |
|---|---|---|---|---|
| US7.1 | Nạp dữ liệu HĐPV, CBQL, ứng viên và lịch | U1 | u1-scoring-skeleton | Must Have |
| US7.2 | Nạp bộ tiêu chí chấm điểm | U1 | u1-scoring-skeleton | Must Have |
| US7.3 | Tạo tài khoản cho người phỏng vấn | U1 | u1-scoring-skeleton | Must Have |
| US1.1 | Đăng nhập bằng email và mật khẩu | U1 | u1-scoring-skeleton | Must Have |
| US2.1 | Xem danh sách HĐPV đang phỏng vấn của tôi | U1 | u1-scoring-skeleton | Must Have |
| US4.1 | Xem danh sách ứng viên của HĐPV, có vị trí, sắp theo giờ | U1 | u1-scoring-skeleton | Must Have |
| US5.1 | Xem thông tin ứng viên và bộ tiêu chí | U1 | u1-scoring-skeleton | Must Have |
| US5.2 | Chấm điểm từng tiêu chí và ghi nhận xét | U1 | u1-scoring-skeleton | Must Have |
| US6.1 | Hoàn thành đánh giá và khóa | U1 | u1-scoring-skeleton | Must Have |
| US5.3 | Chọn kết luận Đạt / Loại / Cân nhắc / Khác | U2 | u2-scoring-complete | Must Have |
| US5.4 | Giới thiệu ứng viên sang vị trí khác (khi chọn kết luận Khác) | U2 | u2-scoring-complete | Should Have |
| US5.8 | Xem điểm trung bình của ứng viên khi chấm điểm | U2 | u2-scoring-complete | Must Have |
| US6.2 | Hoàn thành đánh giá an toàn khi mất mạng hoặc bấm nhiều lần | U2 | u2-scoring-complete | Must Have |
| US6.3 | Xem lại bài đã hoàn thành | U2 | u2-scoring-complete | Must Have |
| US1.2 | Đăng xuất | U2 | u2-scoring-complete | Should Have |
| US5.5 | Xem CV của ứng viên | U3 | u3-cv-viewer | Should Have |
| US5.6 | Tóm tắt CV bằng AI và làm nổi bật kinh nghiệm, trình độ, chứng chỉ | U4 | u4-ai-assist | Could Have |
| US5.7 | Xem câu hỏi gợi ý thêm từ CV | U4 | u4-ai-assist | Could Have |
| US7.4 | Bật/tắt tính năng AI và cấu hình nhà cung cấp | U4 | u4-ai-assist | Could Have |
| US8.1 | Phông chữ sans-serif đồng nhất và giao diện tiếng Việt | U5 | u5-ui-experience | Must Have |
| US8.2 | Bố cục thích ứng điện thoại và web | U5 | u5-ui-experience | Must Have |
| US8.3 | Bố cục hai khung trên máy tính để bàn | U5 | u5-ui-experience | Should Have |
| US8.4 | Giao diện sáng và tối theo hệ thống | U5 | u5-ui-experience | Should Have |
| US8.5 | Truy cập cơ bản theo WCAG 2.1 AA | U5 | u5-ui-experience | Must Have |
| US8.6 | Khung xương khi tải và giảm chuyển động | U5 | u5-ui-experience | Should Have |

Mỗi story gán cho đúng một Unit chịu trách nhiệm chính.

## Story trải nhiều Unit (xuyên suốt)

| Story | Unit chính | Unit liên quan | Lý do |
|---|---|---|---|
| US7.1 | U1 | U3 | U3 thêm bước nạp `cvPath` và cảnh báo tệp CV (AC7.1.9) |
| US6.1 | U1 | U2 | U2 thêm kết luận bắt buộc, refer và điểm trung bình vào thao tác hoàn thành (AC6.1.8..AC6.1.16) |
| US4.1 | U1 | U2 | U2 thêm nhãn kết luận và cột Điểm TB (AC4.1.11, AC4.1.12) |
| US2.1 | U1 | U2 | Số "đã chấm / tổng" ghép từ tóm tắt đánh giá theo HĐPV (ADR-002) |
| US5.2 | U1 | U2, U5 | U2 thêm cảnh báo chuyển ứng viên ở hai khung (AC5.2.6) cùng U5; phím mũi tên (AC5.2.7) thuộc U5 |
| US8.1..US8.6 | U5 | U1..U4 | Áp dụng lên mọi màn hình |

Tiêu chí chấp nhận của story xuyên suốt được kiểm ở Unit chịu phần đó.

## Thứ tự làm trong từng Unit

Thứ tự gợi ý bên trong Unit theo phụ thuộc kỹ thuật (thứ tự giữa các Unit thuộc Delivery Planning):

- **U1:** US7.2 → US7.1 → US7.3 → US1.1 → US2.1 → US4.1 → US5.1 → US5.2 → US6.1 (dữ liệu và tài khoản trước, rồi theo luồng màn hình).
- **U2:** US5.3 → US5.8 → US5.4 → US6.2 → US6.3 → US1.2.
- **U3:** US5.5.
- **U4:** US7.4 → US5.6 → US5.7 (cờ bật/tắt trước, rồi tóm tắt, rồi câu hỏi).
- **U5:** US8.1 → US8.2 → US8.5 → US8.4 → US8.3 → US8.6.

## Kiểm tra độ phủ

- Tổng story trong `stories.md`: 25. Đã gán: 25. Chưa gán: 0.
- Mỗi Unit có story: U1 có 9, U2 có 6, U3 có 1, U4 có 3, U5 có 6.
- Story Must Have nằm ở U1, U2 và U5; U3 và U4 chỉ chứa story Should Have và Could Have.

## Assumptions & Open Questions

- **[assumption]** Mức ưu tiên lấy từ `stories.md` (một phần là đề xuất của người soạn chưa được PO xác nhận).
- **Open question:** Không có.
