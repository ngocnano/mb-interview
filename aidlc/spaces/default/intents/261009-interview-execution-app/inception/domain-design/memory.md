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
2026-10-09T20:00:00Z — PO trả lời Q1 = A, Q2 = A, Q3 = A. Thêm InterviewerApp (Flutter) làm khối vì là mã sẽ viết và cần chỗ đặt logic ghép danh sách (ADR-002) và bản cài đặt công thức điểm trung bình phía client (ADR-003).
2026-10-09T20:00:00Z — Đặt chính sách truy cập (được gán, Inprogress, Xác nhận = Y) duy nhất ở InterviewCatalog (ADR-004) để tránh vòng phụ thuộc và lặp quy tắc.

## Tradeoffs
2026-10-09T20:00:00Z — CvDocument tách khỏi Candidate (ADR-005) dù tệp nạp để cvPath trên dòng ứng viên; giữ nguyên định dạng nạp, DataImport chuyển giá trị sang CandidateDocuments.
2026-10-09T20:00:00Z — DataImport ghi qua khối sở hữu trong một giao dịch (ADR-007) giả định các khối chạy chung tiến trình; Units Generation cần xác nhận.

## Open questions
2026-10-09T20:00:00Z — Nhà cung cấp AI và gói xem PDF chưa chọn; không ảnh hưởng ranh giới khối.
