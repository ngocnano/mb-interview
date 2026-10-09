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
2026-10-09T12:20:00Z — Tài liệu Phase 2 rất đầy đủ (31 FR), nhưng PO đặt ràng buộc "dựng trong 2 ngày". Diễn giải: giữ requirements đầy đủ làm north star, đóng khung một walking skeleton MVP 2 ngày (FR-A0..A7) là tập con duy nhất được thực thi.
2026-10-09T12:20:00Z — Hai team (Phase 1 + Phase 2) dùng chung một database Supabase/Postgres; app Phase 2 đọc bảng Phase 1 read-only theo cấu trúc Kiro_bang (1).xlsx, ghi bảng riêng Phase 2.

## Tradeoffs
2026-10-09T12:20:00Z — Login chọn Supabase passwordless (magic link/OTP) thay vì email+password hay bỏ login; đủ lấy auth.uid() cho RLS, không tốn thời gian xây auth. Khuyến nghị OTP code để đỡ phụ thuộc deep-link redirect khi demo.
2026-10-09T12:20:00Z — Cắt tổng hợp/HR chốt/blind scoring/notification/ngoại lệ khỏi 2 ngày để kịp; chấp nhận MVP chỉ tới submit đánh giá cá nhân.

## Open questions
2026-10-09T12:20:00Z — Tên bảng/cột chính xác của DB dùng chung cần thống nhất với team Phase 1 trước khi code (dựa trên Kiro_bang (1).xlsx).
2026-10-09T12:20:00Z — Các OQ-1..OQ-7 (thang điểm nâng cao, quorum, tổng hợp, blind, mở lại, quyền chốt, RBAC vùng) để lại cho MVP đầy đủ, không chặn 2 ngày.

## Deviations
2026-10-09T12:45:00Z — Request Changes: PO đổi kiến trúc từ Supabase sang Oracle XE local (Docker). Hệ quả: mất Auth + API tự sinh + RLS của Supabase → thêm tầng REST API Node.js/Express + oracledb; login đổi sang JWT tự xây (bcrypt, bảng user Oracle); phân quyền ở tầng API thay RLS.
2026-10-09T12:45:00Z — DB chuyển sang RIÊNG (không dùng chung team Phase 1); dữ liệu Phase 1 seed/import vào DB riêng → bỏ rủi ro phụ thuộc lịch team Phase 1, nhưng app phải tự sở hữu toàn bộ schema.

## Interpretations
2026-10-09T13:10:00Z — Request Changes "mô tả từng FR kỹ hơn đầu ra, đầu vào": diễn giải là chi tiết hóa FR-A0..A7 của MVP 2 ngày (phần thực thi), theo cấu trúc Actor / Đầu vào / Xử lý / Đầu ra / Lỗi / Tiêu chí chấp nhận; north star FR-1..31 giữ nguyên mức chi tiết.
2026-10-09T13:10:00Z — Bảng HĐPV trong Kiro_bang không có cột vị trí → suy vị trí từ trường Vị trí của ứng viên (A-2); ghi thành giả định để PO xác nhận.

## Deviations
2026-10-09T13:25:00Z — PO bác giả định A-3: ứng viên Xác nhận = N không hiển thị trên màn chấm điểm. Diễn giải và áp dụng nhất quán thành BR-A1: loại khỏi FR-A3/A4/A5, không tính vào số đếm FR-A2/A3, API FR-A5/A6 trả 404; kiểm ở server.
