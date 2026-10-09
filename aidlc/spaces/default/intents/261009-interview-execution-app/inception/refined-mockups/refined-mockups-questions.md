# Câu hỏi — Refined Mockups

> Classic không có bước rough mockups, nên màn hình được thiết kế trực tiếp từ user stories (US1.1..US7.3) và requirements (FR-A0..A7, BR-A1, BR-A2). Chỉ hỏi những điểm quyết định hình dạng giao diện.
> Trả lời vào tag `[Answer]:` (chọn chữ cái, hoặc "A hết" nếu đồng ý mặc định).

## Q1 — Thiết bị chạy app

App Flutter chạy trên thiết bị nào?

- A. Điện thoại, dọc, một cột (gợi ý mặc định)
- B. Điện thoại và máy tính bảng (bố cục rộng hơn trên máy tính bảng)
- C. Web (Flutter Web) trên máy tính để bàn, thêm điện thoại
- X. Other (please specify)

[Answer]: C

## Q2 — Bộ giao diện

- A. Material 3 mặc định của Flutter, một màu chủ đạo, không tạo bộ thiết kế riêng (gợi ý mặc định, nhanh nhất trong 2 ngày)
- B. Theo bộ nhận diện/thiết kế có sẵn của công ty (vui lòng cho biết file hoặc mã màu)
- X. Other (please specify)

[Answer]: A, theo kiểu dáng hot trend 2026 (Material 3 làm nền; thêm điểm nhấn theo xu hướng 2026: bố cục thẻ kiểu bento, header kính mờ nhẹ, chế độ sáng/tối, hiệu ứng chuyển động nhỏ, khung xương khi tải)

## Q3 — Cách chọn điểm 1 đến 5 cho mỗi tiêu chí

- A. Hàng 5 nút số 1..5 bấm một chạm, nút đã chọn được tô màu (gợi ý mặc định, thao tác nhanh, hợp thang rời rạc)
- B. Thanh trượt (slider) có 5 mức
- C. Danh sách chọn thả xuống
- X. Other (please specify)

[Answer]: A

## Q4 — Hiển thị danh sách ứng viên (US4.1)

Mỗi dòng ứng viên hiển thị gì và nhấn mạnh gì?

- A. Dạng thẻ: giờ bắt đầu nổi bật bên trái; tên, mã, vị trí ở giữa; nhãn `Chưa chấm` / `Đã chấm` bên phải; ứng viên đã chấm hiển thị nhạt hơn (gợi ý mặc định)
- B. Dạng bảng gọn, nhiều dòng trên một màn hình
- X. Other (please specify)

[Answer]: A

## Q5 — Mức hỗ trợ truy cập (accessibility)

- A. Mức cơ bản theo WCAG 2.1 AA: tương phản màu đủ, vùng chạm tối thiểu 48dp, nhãn đọc được cho trình đọc màn hình ở các màn cốt lõi, không chỉ dùng màu để báo trạng thái (gợi ý mặc định)
- B. Chỉ mặc định của Flutter, không kiểm tra thêm
- X. Other (please specify)

[Answer]: A

## Q6 — Ngôn ngữ giao diện

- A. Chỉ tiếng Việt; chuỗi chữ để trong một nơi chung để dễ thêm ngôn ngữ sau (gợi ý mặc định)
- B. Tiếng Việt và tiếng Anh ngay từ MVP
- X. Other (please specify)

[Answer]: A

## Yêu cầu bổ sung của PO (2026-10-09, khi xem bản HTML) — cần làm rõ trước khi sửa mockup

PO yêu cầu thêm: (1) trường cân nhắc `Đạt` / `Loại` / `Cân nhắc`; (2) một cột "refer" để chọn vị trí khác; (3) xem thông tin ứng viên dạng CV. Ba mục này mở rộng phạm vi MVP (FR-A5, FR-A6, FR-A1, US5.x, US6.x, US7.x), nên cần chốt các điểm sau.

## Q7 — Trường cân nhắc Đạt / Loại / Cân nhắc

- A. Bắt buộc chọn một trong ba khi nộp bài; đây là đề xuất cá nhân của người phỏng vấn, không phải kết luận cuối (HR chốt ở giai đoạn sau); hiển thị ở phiếu chấm, ở bài đã nộp và thành nhãn kết quả trên thẻ ứng viên đã chấm (gợi ý mặc định)
- B. Tùy chọn, có thể để trống
- X. Other (please specify)

[Answer]: A (PO trả lời "yes")

## Q8 — Nhận xét khi chọn Loại hoặc Cân nhắc

- A. Giữ nhận xét tùy chọn như hiện tại (gợi ý mặc định)
- B. Bắt buộc nhập nhận xét khi chọn `Loại` hoặc `Cân nhắc`
- X. Other (please specify)

[Answer]: A

## Q9 — Refer: chọn vị trí khác

"Refer" hiểu là người phỏng vấn đề xuất giới thiệu ứng viên sang một vị trí khác.

- A. Một ô tùy chọn trong phiếu đánh giá: chọn tối đa 1 vị trí khác, kèm lý do ngắn tùy chọn; chỉ lưu đề xuất, không tự chuyển ứng viên (gợi ý mặc định)
- B. Chọn được nhiều vị trí
- C. Như A nhưng chỉ bật khi kết luận là `Loại` hoặc `Cân nhắc`
- X. Other (please specify)

[Answer]: A

## Q10 — Danh sách vị trí để refer

- A. Bảng vị trí riêng (job + đơn vị) do script nạp dữ liệu, thêm vào US7.1 (gợi ý mặc định)
- B. Lấy các vị trí phân biệt từ dữ liệu ứng viên đang có
- X. Other (please specify)

[Answer]: A

## Q11 — Xem CV của ứng viên

Bảng thiết kế `Kiro_bang (1).xlsx` chưa có trường CV.

- A. CV là file PDF; dữ liệu nạp có đường dẫn tới file; app mở xem trong app ở chế độ chỉ đọc (không tải xuống, không in); server cấp liên kết ngắn hạn và chỉ cho người được gán vào HĐPV `Inprogress` với ứng viên đã xác nhận lịch (gợi ý mặc định)
- B. CV là văn bản lưu trong DB, hiển thị dạng văn bản
- C. CV là liên kết ngoài, mở bằng tab mới
- X. Other (please specify)

[Answer]: A

## Q12 — Dữ liệu cá nhân trong CV và nhật ký xem

CV thường có số điện thoại, ngày sinh. Hiện khối thông tin ứng viên cố ý ẩn các trường này.

- A. Chấp nhận CV hiển thị nguyên văn vì cần cho phỏng vấn; khối thông tin vẫn ẩn số điện thoại, ngày sinh, giới tính; ghi nhật ký mỗi lần xem CV (ai, ứng viên nào, lúc nào) (gợi ý mặc định, khớp quy tắc cứng về audit)
- B. Như A nhưng không ghi nhật ký xem CV trong MVP
- X. Other (please specify)

[Answer]: A

## Yêu cầu bổ sung đợt 2 của PO (2026-10-09): AI tóm tắt CV

PO yêu cầu thêm tính năng AI tóm tắt CV, làm nổi bật thông tin về kinh nghiệm, trình độ, chứng chỉ và gợi ý thêm câu hỏi liên quan tới ứng viên; cập nhật mockup trước, sau đó bổ sung trường dữ liệu, requirement và user story.

PO chưa trả lời các điểm dưới đây; người soạn đã đặt giả định để làm tiếp và ghi vào `requirements.md` (A-11..A-15, OQ-AI-1..4):

- Nhà cung cấp AI và nơi chạy mô hình: chưa chọn (thiết kế không phụ thuộc nhà cung cấp cụ thể).
- Tính năng tắt theo mặc định bằng cờ cấu hình; chỉ bật sau khi Legal và Security đồng ý, vì tài liệu nguồn Phase 2 (mục 11.2) nói không dùng AI phân tích ứng viên trong MVP khi chưa có cơ sở pháp lý, consent và rà soát thiên lệch.
- Tạo theo yêu cầu của người dùng, lưu kết quả theo nội dung CV; kết quả bằng tiếng Việt, chỉ đọc; câu hỏi gợi ý không lưu cùng đánh giá.
- Mức ưu tiên đề xuất: Could Have.

[Answer]:

## Yêu cầu bổ sung đợt 3 của PO (2026-10-09)

1. Dùng phông chữ sans-serif đồng nhất trên mọi màn hình.
2. Kết luận của bạn thêm danh mục `Khác`; chọn `Khác` mới hiển thị "Giới thiệu sang vị trí khác (tùy chọn)". Cách hiểu này thay câu trả lời Q9 = A trước đó (khối refer luôn hiện).
3. Quy tắc làm việc: những gì bổ sung trong thiết kế phải bổ sung tính năng trong requirement và user story.

Người soạn đã đặt giả định và ghi vào `requirements.md` (NFR-9, NFR-10, NFR-11, NFR-12, FR-A5, FR-A6, BR-A3) và `stories.md` (US5.3, US5.4, nhóm 8). Chưa có câu trả lời của PO cho các điểm sau:

- Họ phông cụ thể (người soạn đề xuất Roboto, đóng gói trong app).
- Nhãn lựa chọn thứ tư là "Khác" đúng như PO viết; chưa rõ ý nghĩa nghiệp vụ với HR (ví dụ "phù hợp vị trí khác" hay "kết luận khác") nên người soạn chỉ dùng đúng nhãn "Khác".

[Answer]:
