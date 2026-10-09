<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->

## Interpretations
2026-10-09T16:10:00Z — Q1 = C: Web (Flutter Web) trên máy tính để bàn cộng điện thoại. Thiết kế một mã nguồn co giãn theo 3 điểm ngắt (dưới 768, 768 đến 1024, trên 1024 px), dùng điểm ngắt của mẫu đặc tả thành phần.
2026-10-09T16:10:00Z — "Kiểu dáng hot trend 2026" diễn giải là Material 3 làm nền cộng điểm nhấn: thẻ bento, header kính mờ nhẹ, sáng/tối, chuyển động nhỏ, khung xương. Tham khảo bài viết xu hướng 2026 qua tìm kiếm web.
2026-10-09T16:10:00Z — Dòng ứng viên ở S3 ghi cả ngày dưới khung giờ để khớp AC4.1.4 (phát hiện lệch giữa mockup và tiêu chí chấp nhận khi tự rà soát, đã sửa mockup thay vì sửa story).

## Tradeoffs
2026-10-09T16:10:00Z — Kính mờ chỉ ở thanh trên cùng và thẻ đăng nhập, có nền đặc dự phòng, để không làm giảm tương phản trên vùng nhiều chữ.
2026-10-09T16:10:00Z — Bố cục hai khung trên máy tính để bàn là phần thêm công sức; ghi rõ có thể dùng chuyển trang như điện thoại nếu thiếu thời gian, không đổi story.

## Open questions
2026-10-09T16:10:00Z — Mockup là wireframe chữ (ASCII) kèm đặc tả, chưa phải ảnh giao diện đồ họa; PO cần cho biết có muốn bản đồ họa không.

## Deviations
2026-10-09T17:30:00Z — PO thêm AI tóm tắt CV (đợt 2) trong lúc đang sửa mockup. Thực hiện theo thứ tự PO: mockup (HTML + md) trước, rồi trường dữ liệu, requirement, user story, traceability. Sửa trực tiếp requirements.md và stories.md đã duyệt, theo tiền lệ Q7 của User Stories; không mở lại các stage trước.
2026-10-09T17:30:00Z — Tính năng xung đột với tài liệu nguồn (mục 11.2: không dùng AI phân tích ứng viên trong MVP khi chưa có cơ sở pháp lý, consent, rà soát thiên lệch). Không từ chối vì PO là chủ sản phẩm, nhưng thiết kế có cờ tắt mặc định, BR-A4, NFR-8 và OQ-AI-1..4; PO phải xác nhận tại gate.

## Tradeoffs
2026-10-09T17:30:00Z — Thiết kế không phụ thuộc nhà cung cấp AI cụ thể; che SĐT, email, ngày sinh, địa chỉ trước khi gửi và bắt buộc mỗi mục AI có đoạn trích nguyên văn trong CV để người phỏng vấn kiểm chứng được. Chấp nhận không bảo đảm tuyệt đối việc che và lọc nội dung nhạy cảm.
2026-10-09T17:30:00Z — Đề xuất Could Have vì phụ thuộc quyết định nhà cung cấp và Legal, và đây là phần tốn công nhất trong các bổ sung; có thể để sau cùng hoặc ngoài 2 ngày mà không ảnh hưởng luồng chấm điểm.

## Open questions
2026-10-09T17:30:00Z — OQ-AI-1..4: nhà cung cấp và nơi lưu dữ liệu, consent của ứng viên, rà soát thiên lệch, thời gian lưu kết quả AI.

## Interpretations
2026-10-09T18:40:00Z — Đợt 3: "Kết luận của bạn *bổ sung danh mục khác, chọn khác mới hiển thị Giới thiệu sang vị trí khác" diễn giải là thêm lựa chọn thứ tư `Khác` vào Kết luận; chỉ khi chọn `Khác` khối refer mới hiện (tùy chọn). Thay Q9 = A. API chặn refer khi kết luận khác `KHAC` (400). Đổi sang kết luận khác thì xóa giá trị refer.
2026-10-09T18:40:00Z — "phông chữ sanserif đồng nhất" áp dụng cho giao diện app; trong bản HTML đổi cả trang CV giả lập từ serif sang sans-serif. Trong app thật chữ bên trong tệp CV PDF dùng phông nhúng trong tệp nên không đổi được; ghi rõ ở NFR-9. Đề xuất Roboto đóng gói trong app, chờ PO xác nhận.
2026-10-09T18:40:00Z — Quy tắc mới của PO "bổ sung trong design thì phải có trong requirement và story": rà lại toàn bộ thiết kế, phát hiện các mục chỉ có trong mockup (sáng/tối, hai khung, bố cục thích ứng, khung xương, giảm chuyển động, truy cập, hiện/ẩn mật khẩu, giữ đăng nhập khi F5, phóng to và chuyển trang CV) và bổ sung NFR-9..12, chi tiết NFR-6, FR-A0, FR-A8 và nhóm 8 (US8.1..US8.6).

## Tradeoffs
2026-10-09T18:40:00Z — Tổng khối lượng đã vượt xa lát cắt 2 ngày ban đầu (thêm CV, kết luận, refer, AI, nhóm 8). Giữ các story Should/Could Have làm điểm cắt; cần Delivery Planning quyết định phạm vi thực tế.

## Open questions
2026-10-09T18:40:00Z — Họ phông cụ thể; ý nghĩa nghiệp vụ của kết luận `Khác` với HR.

## Interpretations
2026-10-09T19:30:00Z — Đợt 4: đổi "nộp đánh giá" thành "hoàn thành đánh giá" bằng thay thế hàng loạt có kiểm soát (sao lưu trước) trên 9 tài liệu hiện hành và bản HTML; giữ định danh kỹ thuật `SUBMITTED`, `submittedAt`, `idempotencyKey`. Không đổi các tệp lịch sử (câu hỏi Q&A, nhật ký, review) và quy tắc cứng đã khẳng định trong memory/project.md.
2026-10-09T19:30:00Z — "Thêm cột điểm trung bình ứng viên sau khi chọn điểm từng tiêu chí" diễn giải là khối điểm trung bình cập nhật ngay trên phiếu chấm cộng cột Điểm TB trên danh sách ứng viên đã hoàn thành. Server tính và lưu, không nhận giá trị từ client. Ghi giả định A-16..A-18 và BR-A5.

## Tradeoffs
2026-10-09T19:30:00Z — Hiển thị điểm trung bình tạm tính khi chưa chọn đủ tiêu chí để đúng "sau khi chọn điểm từng tiêu chí", đánh đổi là con số có thể thay đổi nhiều khi chưa đủ; có nhãn "Tạm tính theo n/N".
