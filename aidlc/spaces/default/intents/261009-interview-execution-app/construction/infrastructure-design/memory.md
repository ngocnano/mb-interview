<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Ảnh Oracle XE faststart báo healthy trước khi script khởi tạo tạo xong lược đồ; healthcheck của Compose phải kiểm thêm bảng ứng dụng tồn tại (phát hiện khi verify:e2e lỗi một lần ở code-generation).
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-10-09T15:46:44Z [unit u1-scoring-skeleton] — Bước phát hành chạy verify:e2e trên Oracle tạm thay vì trên môi trường demo như câu trả lời Q5, vì lệnh tạo dữ liệu mẫu và sẽ lẫn vào dữ liệu thật của demo.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
