<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Đếm "đã chấm / tổng" ở S2 (AC2.1.3) để cho U2; U1 chỉ hiển thị tổng và nhãn Đã chấm lấy từ my-evaluations dạng tối thiểu (ADR-002).
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-09T16:30:00Z [unit u2-scoring-complete] — "Đã chấm / tổng" ở S2 ghép phía app từ my-evaluations từng HĐPV (ADR-002) thay vì thêm trường vào GET /panels; tử số bị chặn bởi tổng.
- 2026-10-09T16:30:00Z [unit u2-scoring-complete] — Làm tròn điểm trung bình bằng số nguyên với mẫu số chung 60 để Node.js và Dart khớp tuyệt đối; hiển thị lấy từ giá trị đã lưu 2 chữ số.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Khóa đăng nhập theo email (Q1 = B) cho phép người khác cố ý khóa nhầm một email trong 15 phút; chấp nhận cho MVP, đổi lại không cần địa chỉ IP đáng tin.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

- 2026-10-09T16:30:00Z [unit u2-scoring-complete] — Nháp chỉ giữ trong phiên (Q1 = A): đóng app giữa chừng mất dữ liệu đang nhập; đổi lại không có dữ liệu đánh giá nằm lại trên thiết bị. Đăng xuất không thu hồi JWT (hết hạn sau 8 giờ).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
