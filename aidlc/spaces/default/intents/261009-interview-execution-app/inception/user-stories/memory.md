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

## Open questions
2026-10-09T13:40:00Z — PO bổ sung yêu cầu mới sau khi Requirements Analysis đã duyệt: thêm trạng thái HĐPV, chỉ hiển thị HĐPV `inprogress`. Bảng HĐPV trong Kiro_bang chưa có cột trạng thái; cần chốt danh sách giá trị, hành vi khi HĐPV rời `inprogress`, và nơi ghi yêu cầu (Q5–Q7).

## Deviations
2026-10-09T13:55:00Z — Theo yêu cầu PO (Q7), cập nhật trực tiếp `requirements.md` đã duyệt: thêm cột Trạng thái HĐPV (Draft, Sent, Xác nhận, Inprogress, Completed) và BR-A2; không mở lại vòng duyệt Requirements Analysis. Nguồn gốc ghi trong requirements.md.

## Interpretations
2026-10-09T13:55:00Z — Q6=B "vẫn cho submit bài đang chấm dở": MVP không có lưu nháp, nên bài dở chỉ nằm trên form của app. Diễn giải: API submit chấp nhận HĐPV `Inprogress` hoặc `Completed`; mở bài chấm mới chỉ khi `Inprogress`.

## Interpretations
2026-10-09T14:20:00Z — Chạy lead-only (support_agents rỗng, collaborators off): bỏ vòng mob, không có contribution file. 13 story chia theo màn hình/chức năng (Q3 = A, Q4 = theo chức năng màn hình); hầu hết Must Have vì lát cắt 2 ngày đã được cắt gọn từ trước.
2026-10-09T14:20:00Z — Traceability: FR-1..FR-31 ngoài MVP đánh N/A kèm lý do (Q1 = A) thay vì Deferred, vì Deferred cần tên stage downstream còn các mục này thuộc increment sau. FR-6, FR-10, FR-11, FR-13 được MVP phủ trọn nên đánh OK.

## Tradeoffs
2026-10-09T14:20:00Z — Tách đăng xuất (US1.2) thành story Should Have để có điểm cắt đầu tiên nếu thiếu thời gian; xử lý token hết hạn (401) giữ trong US1.1 vì là một phần của FR-A0.

## Open questions
2026-10-09T14:20:00Z — Tổng ước lượng 13 story (6 cỡ M, 7 cỡ S) có thể vượt 2 ngày nếu một người làm tuần tự; cần Delivery Planning đối chiếu số người và chia song song backend/Flutter.

## Deviations
2026-10-09T15:10:00Z — Request Changes: PO bỏ nhóm 3 chọn vị trí. Xóa US3.1, gộp thông tin vị trí và sắp xếp theo giờ vào US4.1 (cỡ S lên M, tổng còn 12 story). Cập nhật requirements.md: FR-A3 đánh dấu đã bỏ, FR-A4 viết lại, A-2 bỏ, thêm A-7. Giữ trống ID nhóm 3 để các ID khác không đổi.

## Interpretations
2026-10-09T15:10:00Z — "Từ gần tới xa" diễn giải là giờ bắt đầu từ sớm đến muộn, không theo giờ hiện tại; ghi thành giả định A-7 để PO xác nhận.
