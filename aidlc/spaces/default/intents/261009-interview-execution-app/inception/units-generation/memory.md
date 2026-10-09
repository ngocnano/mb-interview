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
2026-10-09T20:40:00Z — PO trả lời Q1 = A, Q2 = A, Q3 = A và duyệt kế hoạch 5 Unit. Unit là lát cắt tính năng trên cùng ba thành phần chạy (một backend Node.js modular monolith, một app Flutter, một Oracle XE), không phải tiến trình riêng.
2026-10-09T20:40:00Z — Tên Unit trong khối yaml đặt trùng thư mục (u1-scoring-skeleton...) để engine ghép tên Unit với thư mục construction.

## Tradeoffs
2026-10-09T20:40:00Z — U1 chưa bắt buộc kết luận (BR-A3 chuyển sang U2) để skeleton nhỏ nhất; đổi lại API hoàn thành đánh giá thay đổi ở U2.
2026-10-09T20:40:00Z — U5 phụ thuộc U1 nên skeleton có giao diện tối thiểu; màn hình của U2..U4 có thể phải chỉnh lại nếu làm trước U5.

## Deviations
2026-10-09T20:40:00Z — Skeleton dừng ở hoàn thành đánh giá và lưu DB (Q3 = A), khác mô tả "tổng hợp tối giản" trong team.md vì tổng hợp đã bị cắt khỏi MVP.
