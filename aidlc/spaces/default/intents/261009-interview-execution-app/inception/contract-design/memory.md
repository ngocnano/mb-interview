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
2026-10-09T21:10:00Z — PO trả lời Q1 = A, Q2 = A, Q3 = A. Bảy hợp đồng: C1 REST/OpenAPI app ↔ backend; C2..C5 interface TypeScript giữa module; C6 tệp nạp; C7 bộ chuyển đổi nhà cung cấp AI. Đã kiểm 7 khối yaml bằng js-yaml (cài tạm ngoài workspace): parse được, OpenAPI không thiếu $ref.

## Tradeoffs
2026-10-09T21:10:00Z — ketLuan chuyển từ không có (U1) sang bắt buộc (U2) là thay đổi phá vỡ; chấp nhận nhờ ngoại lệ trước phát hành (Q3 = A), với điều kiện U1 và U2 phát hành cùng nhau.
2026-10-09T21:10:00Z — /cv-files/{token} vẫn đòi JWT để liên kết lộ ra không mở được; đổi lại phụ thuộc gói xem PDF có gửi header được không trên web.

## Open questions
2026-10-09T21:10:00Z — Gói xem PDF và header trên web; nhà cung cấp AI (OQ-AI-1..4).
