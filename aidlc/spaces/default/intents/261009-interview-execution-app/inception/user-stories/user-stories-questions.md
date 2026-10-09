# Kế hoạch User Stories và câu hỏi

> Requirements đã rất chi tiết (FR-A0..A7, BR-A1, tiêu chí chấp nhận), nên chỉ hỏi những điểm quyết định cách viết story.
> Story viết theo INVEST, ưu tiên MoSCoW, tiêu chí chấp nhận dạng Given/When/Then.
> Trả lời vào tag `[Answer]:`.

## Q1 — Phạm vi viết story

Viết story cho phần nào?

- A. Chỉ MVP 2 ngày (FR-A0..A7, BR-A1) viết chi tiết; các FR phạm vi đầy đủ (FR-1..FR-31) không viết story, ghi là ngoài phạm vi 2 ngày trong bảng truy vết (gợi ý mặc định)
- B. MVP 2 ngày viết chi tiết + phạm vi đầy đủ viết dạng story tóm tắt (mỗi nhóm FR một epic), ưu tiên Won't Have cho đợt này
- X. Other (please specify)

[Answer]: A

## Q2 — Nhân vật (persona)

Những nhân vật nào cần có trong story MVP?

- A. Hai nhân vật: Người phỏng vấn (CBQL thuộc HĐPV, dùng app) và Người vận hành hệ thống (nạp dữ liệu, tiêu chí, tài khoản) (gợi ý mặc định)
- B. Chỉ Người phỏng vấn; phần nạp dữ liệu coi là việc kỹ thuật, không viết story
- X. Other (please specify)

[Answer]: A

## Q3 — Cách chia story

Chia story theo cách nào?

- A. Theo luồng màn hình: mỗi bước của luồng là một nhóm story (Đăng nhập, Chọn HĐPV, Chọn vị trí, Danh sách ứng viên, Chấm điểm, Submit, Nạp dữ liệu) (gợi ý mặc định)
- B. Theo tính năng lớn (epic): Truy cập, Tra cứu phiên phỏng vấn, Chấm điểm, Dữ liệu nền
- X. Other (please specify)

[Answer]: A

## Q4 — Độ nhỏ của story

Mức độ chia nhỏ?

- A. Mỗi story làm xong được trong khoảng nửa ngày hoặc ít hơn, để vừa 2 ngày (gợi ý mặc định)
- B. Story lớn hơn, mỗi FR-A một story
- X. Other (please specify)

[Answer]: X. Theo từng chức năng, màn hình (mỗi chức năng trên một màn hình là một story).

## Q5 — Trạng thái HĐPV (yêu cầu bổ sung của PO trong stage User Stories, 2026-10-09)

PO yêu cầu: bổ sung trạng thái HĐPV, app chỉ hiển thị các HĐPV có trạng thái `inprogress`. Bảng HĐPV trong `Kiro_bang (1).xlsx` chưa có cột trạng thái, nên cần chốt danh sách giá trị.

Các giá trị trạng thái HĐPV là gì?

- A. Bốn giá trị: `draft` (đang thiết lập), `inprogress` (đang phỏng vấn), `completed` (đã xong), `cancelled` (đã hủy); chỉ `inprogress` hiển thị trên app (gợi ý mặc định)
- B. Chỉ hai giá trị: `inprogress` và `closed`
- X. Other (please specify) — liệt kê các giá trị

[Answer]: X. Draft, Sent, Xác nhận, Inprogress, Completed. Chỉ hiển thị HĐPV `Inprogress` trên app.

## Q6 — Khi HĐPV không còn ở trạng thái `inprogress`

Nếu HĐPV chuyển sang trạng thái khác trong lúc người phỏng vấn đang mở màn chấm điểm, thì sao?

- A. HĐPV biến khỏi danh sách; mọi thao tác xem/chấm/submit cho HĐPV đó bị server từ chối (`404`); đánh giá đã nộp trước đó vẫn được giữ trong DB (gợi ý mặc định)
- B. Vẫn cho submit các đánh giá đang làm dở, chỉ không cho mở mới
- X. Other (please specify)

[Answer]: B

## Q7 — Ghi yêu cầu mới vào đâu

- A. Ghi yêu cầu mới thành quy tắc BR-A2 ngay trong stage User Stories, có ghi nguồn gốc (PO bổ sung ngày 2026-10-09); các stage thiết kế sau dùng nó. Không mở lại Requirements Analysis (gợi ý mặc định, nhanh hơn)
- B. Quay lại stage Requirements Analysis để cập nhật `requirements.md`, rà soát và duyệt lại, rồi mới làm tiếp User Stories
- X. Other (please specify)

[Answer]: X. Tự động cập nhật `requirements.md` (thêm BR-A2, sửa FR-A1..A6), không mở lại vòng duyệt Requirements Analysis; tiếp tục stage User Stories với nội dung mới.

## Ghi chú thay đổi sau Q1–Q7 (PO, 2026-10-09, khi duyệt User Stories)

PO bỏ nhóm 3 "Chọn vị trí". App chỉ hiển thị danh sách ứng viên của HĐPV, mỗi dòng có thông tin vị trí, sắp theo giờ phỏng vấn từ gần tới xa. Câu trả lời Q3 = A (chia theo bước màn hình) vẫn đúng nhưng còn 6 nhóm có story thay vì 7 (nhóm 3 trống). Đã cập nhật FR-A3 (đã bỏ) và FR-A4 trong `requirements.md`.
