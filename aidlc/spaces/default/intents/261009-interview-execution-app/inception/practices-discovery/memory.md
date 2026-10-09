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
2026-10-09T12:01:08Z — Greenfield: dùng org.md làm gợi ý mặc định cho 5 lĩnh vực thực hành; người dùng khẳng định hoặc đổi qua phỏng vấn.
2026-10-09T12:01:08Z — Tech stack chốt ở practices: Backend Node.js, Frontend Flutter (Q6=X); framework/DB cụ thể để lại cho stage thiết kế.

## Tradeoffs
2026-10-09T12:01:08Z — Chọn TDD (Q3=B) thay cho test-after mặc định của khung; domain nhiều business rule trọng yếu nên dẫn dắt bằng test giảm rủi ro sai hành vi.
2026-10-09T12:01:08Z — Deployment theo đợt thủ công (Q4=C) thay cho deploy-on-merge mặc định; cần làm rõ tần suất/người duyệt/môi trường ở stage vận hành.

## Open questions
2026-10-09T12:01:08Z — Framework backend (Express/NestJS/Fastify), DB và hạ tầng chưa chốt — cần quyết ở stage thiết kế.
2026-10-09T12:01:08Z — Chi tiết quy trình "phát hành theo đợt" (cadence, approver, target env) chưa xác định.
