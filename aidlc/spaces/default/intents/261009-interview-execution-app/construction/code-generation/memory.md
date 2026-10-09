<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Trạng thái HĐPV lưu mã ASCII (DRAFT, SENT, CONFIRMED, INPROGRESS, COMPLETED) trong DB và lệnh nạp ánh xạ từ năm giá trị tiếng Việt; tránh phụ thuộc mã hóa ký tự trong ràng buộc CHECK.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Lược đồ DB được viết trước test nên bước Red của lớp DB không có thất bại thật; cần DDL để dựng Oracle và chứng minh runner sẵn sàng. Các lớp sau có Red thật.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Một phiên workflow thứ hai do Kiro tạo đã sửa package.json và ghi đè kế hoạch đã duyệt khi chạy song song; phát hiện nhờ timestamp tệp và khôi phục bằng testing-posture restore. Nên kiểm tra phiên đang chạy trước khi ghi vào thư mục dùng chung.
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — verify:e2e chạy trên Oracle XE tạm (project Compose riêng, cổng ngẫu nhiên) thay vì DB demo, vì lệnh tạo phiếu mẫu và sẽ lẫn vào dữ liệu thật; đổi lại mỗi lần chạy mất vài phút dựng DB.
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Luồng Flutter Web gọi API thật trong trình duyệt (đăng nhập, chấm, hoàn thành) chưa được kiểm tự động; ảnh chụp màn hẹp 420 px cho thấy ô nhập bị cắt mép phải, chưa rõ lỗi bố cục hay do cửa sổ headless.
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
