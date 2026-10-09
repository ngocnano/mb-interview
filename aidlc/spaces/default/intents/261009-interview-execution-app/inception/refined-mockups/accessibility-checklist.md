# Danh mục kiểm tra truy cập — WCAG 2.1 AA mức cơ bản

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/refined-mockups-questions.md` — Q5 = A
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/mockups.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/interaction-spec.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/refined-mockups/design-system-mapping.md` — bảng tương phản đã tính

## Phạm vi và giới hạn

Danh mục này chuẩn bị cho mức cơ bản đã chọn ở Q5 = A: tương phản, vùng chạm, nhãn cho trình đọc màn hình ở các màn chính, không chỉ dựa vào màu. Đây là kiểm tra thiết kế; chưa có giao diện thật nên chưa kiểm chứng bằng công cụ. Đánh giá tuân thủ đầy đủ WCAG cần thử với công nghệ hỗ trợ thật và rà soát bởi chuyên gia truy cập; danh mục này không thay thế việc đó.

Trạng thái: `Thiết kế đạt` = đã thể hiện trong mockup hoặc đặc tả; `Đã tính` = có số liệu; `Cần kiểm khi dựng` = kiểm bằng giao diện thật ở Construction.

## Danh mục

| ID | Tiêu chí | Cách đáp ứng | Màn hình | Trạng thái |
|---|---|---|---|---|
| A11Y-1 | Chữ đạt tương phản 4,5:1 (WCAG 1.4.3) | Bảng tương phản sáng và tối, mọi cặp chữ đạt | Tất cả | Đã tính |
| A11Y-2 | Thành phần giao diện đạt 3:1 (WCAG 1.4.11) | Viền ô nhập 4,55:1 ở chế độ sáng; nút điểm và tiêu điểm dùng màu chủ đạo | S1, S4 | Đã tính (viền ô nhập 4,55:1 chế độ sáng, 5,33:1 chế độ tối) |
| A11Y-3 | Không chỉ dùng màu để truyền thông tin (WCAG 1.4.1) | Nhãn `Đã chấm` / `Chưa chấm` có biểu tượng và chữ; nút điểm đã chọn có dấu tích; tiêu chí lỗi có chữ "Chưa chọn điểm" | S3, S4, S5 | Thiết kế đạt |
| A11Y-4 | Vùng chạm tối thiểu 48 px | Nút điểm, nút chính, thẻ bấm được cao tối thiểu 48 px | S1..S5 | Thiết kế đạt; kiểm khi dựng |
| A11Y-5 | Thao tác được bằng bàn phím (WCAG 2.1.1) | Thứ tự Tab hợp lý; mũi tên đổi điểm; Enter/Space kích hoạt; Esc đóng hộp thoại | Tất cả (web) | Thiết kế đạt; kiểm khi dựng |
| A11Y-6 | Tiêu điểm nhìn thấy rõ (WCAG 2.4.7) | Viền nổi bật 2 px quanh phần tử đang chọn | Tất cả | Thiết kế đạt |
| A11Y-7 | Thứ tự tiêu điểm khi mở/đóng hộp thoại (WCAG 2.4.3) | Mở hộp thoại: tiêu điểm vào nút mặc định; đóng: trả về phần tử đã mở | D1, D2 | Thiết kế đạt |
| A11Y-8 | Nhãn cho trình đọc màn hình (WCAG 4.1.2) | Thẻ ứng viên, thẻ HĐPV, nút điểm có nhãn đầy đủ (xem `interaction-spec.md`) | S2..S5 | Thiết kế đạt |
| A11Y-9 | Thông báo trạng thái không cần tiêu điểm (WCAG 4.1.3) | Vùng thông báo trực tiếp cho tiến độ, lỗi hoàn thành đánh giá, hoàn thành đánh giá thành công | S1, S4 | Thiết kế đạt |
| A11Y-10 | Nhãn ô nhập luôn hiển thị (WCAG 3.3.2) | Email, mật khẩu, nhận xét đều có nhãn riêng, không chỉ chữ gợi ý | S1, S4 | Thiết kế đạt |
| A11Y-11 | Nhận diện và gợi ý lỗi nhập liệu (WCAG 3.3.1, 3.3.3) | Lỗi nêu rõ ô sai và cách sửa; tiêu điểm đưa tới ô lỗi | S1, S4 | Thiết kế đạt |
| A11Y-12 | Phóng to chữ đến 200% không mất nội dung (WCAG 1.4.4) | Bố cục co giãn, không cắt chữ; thanh hoàn thành đánh giá không che nội dung | Tất cả | Cần kiểm khi dựng |
| A11Y-13 | Tôn trọng giảm chuyển động | Mọi hiệu ứng tắt khi bật cờ giảm chuyển động của hệ thống | Tất cả | Thiết kế đạt |
| A11Y-14 | Kính mờ không làm giảm khả năng đọc | Chỉ ở thanh trên cùng và thẻ đăng nhập; có nền đặc dự phòng; kiểm tương phản trên nền thật | S1, thanh trên cùng | Cần kiểm khi dựng |
| A11Y-15 | Ngôn ngữ trang khai báo đúng | Khai báo tiếng Việt cho ứng dụng web và trình đọc màn hình | Tất cả (web) | Cần kiểm khi dựng |
| A11Y-17 | Kết luận không chỉ truyền bằng màu (WCAG 1.4.1) | `Đạt` / `Loại` / `Cân nhắc` / `Khác` luôn có biểu tượng và chữ, ở phiếu chấm, bài đã hoàn thành và nhãn trên thẻ ứng viên | S3, S4, S5 | Thiết kế đạt |
| A11Y-18 | Trình xem CV dùng được bằng bàn phím và trình đọc màn hình (WCAG 2.1.1, 4.1.2) | Nút Đóng, phóng to, thu nhỏ, chuyển trang có nhãn; Esc đóng; trả tiêu điểm về nút Xem CV. Khả năng đọc nội dung PDF phụ thuộc tệp có văn bản hay chỉ là ảnh | S6 | Cần kiểm khi dựng |
| A11Y-25 | Nội dung mới xuất hiện được thông báo (WCAG 4.1.3) | Khi chọn kết luận `Khác`, vùng thông báo trực tiếp đọc "Đã hiện ô giới thiệu sang vị trí khác"; khối ẩn thì không nằm trong thứ tự Tab | S4 | Thiết kế đạt; kiểm khi dựng |
| A11Y-19 | Ô chọn vị trí refer thao tác được bằng bàn phím (WCAG 2.1.1) | Danh sách chọn bằng mũi tên, Enter xác nhận, Esc đóng; ô lý do bật sau khi chọn vị trí | S4 | Thiết kế đạt; kiểm khi dựng |
| A11Y-20 | Làm nổi bật trong CV không chỉ truyền bằng màu (WCAG 1.4.1) | Ba loại có nhãn chữ KN, TĐ, CC và kiểu gạch chân khác nhau | S6 | Thiết kế đạt |
| A11Y-21 | Chữ trên nền làm nổi bật đạt 4,5:1 (WCAG 1.4.3) | 13,13:1, 13,31:1 và 13,63:1 (đã tính) | S6 | Đã tính |
| A11Y-22 | Trạng thái tạo AI được thông báo cho trình đọc màn hình (WCAG 4.1.3) | Vùng thông báo trực tiếp: đang tạo, đã tạo, lỗi, đã chuyển tới đoạn trích | S6 | Thiết kế đạt; kiểm khi dựng |
| A11Y-23 | Tab "CV" / "Tóm tắt AI" thao tác được bằng bàn phím (WCAG 2.1.1) | Mũi tên trái phải đổi tab; tiêu điểm theo tab | S6 (điện thoại) | Thiết kế đạt; kiểm khi dựng |
| A11Y-24 | Lưu ý AI luôn nhìn thấy và đọc được | Lưu ý "có thể sai sót, chỉ để tham khảo" ở đầu khung, chữ phụ đạt tương phản | S6 | Thiết kế đạt |
| A11Y-26 | Điểm trung bình đổi được thông báo (WCAG 4.1.3) | Vùng thông báo trực tiếp lịch sự đọc giá trị mới; nhãn "Điểm trung bình x,x trên 5"; nhãn Điểm TB trên thẻ ứng viên có chữ, không chỉ số | S3, S4, S5 | Thiết kế đạt; kiểm khi dựng |
| A11Y-16 | Thời gian chờ phiên không gây mất dữ liệu bất ngờ | Hết phiên (`401`) báo rõ; dữ liệu form chưa hoàn thành có cảnh báo khi rời màn (D2) | S4 | Thiết kế đạt |

## Việc kiểm tra ở Construction

1. Chạy kiểm tra truy cập tự động của Flutter (kiểm tra nhãn ngữ nghĩa và vùng chạm) trong bộ test widget cho S1..S5.
2. Kiểm thủ công bằng bàn phím trên bản web: đi hết luồng đăng nhập → chấm → hoàn thành mà không dùng chuột.
3. Kiểm thủ công với trình đọc màn hình trên bản web và bản điện thoại cho luồng cốt lõi.
4. Đo lại tương phản trên giao diện thật cho kính mờ và viền ô nhập chế độ tối.
5. Phóng to chữ 200% và kiểm bố cục.

## Assumptions & Open Questions

- **[assumption]** Mức đạt WCAG 2.1 AA chỉ áp dụng cho các màn cốt lõi S1..S5; màn nạp dữ liệu không có giao diện.
- **[assumption]** Không cam kết WCAG đầy đủ trong MVP 2 ngày; các mục "Cần kiểm khi dựng" có thể chuyển thành việc còn lại nếu hết thời gian.
- **Open question:** Có yêu cầu pháp lý hoặc chính sách nội bộ về mức truy cập cao hơn AA không; hiện không có.
