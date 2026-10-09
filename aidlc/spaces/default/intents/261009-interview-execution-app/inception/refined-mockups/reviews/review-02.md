**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho bộ Refined Mockups sau ba đợt bổ sung của PO: (1) kết luận `Đạt` / `Loại` / `Cân nhắc`, refer sang vị trí khác và xem CV; (2) AI tóm tắt CV, làm nổi bật và gợi ý câu hỏi; (3) phông sans-serif đồng nhất, thêm lựa chọn `Khác` cho kết luận với khối refer chỉ hiện khi chọn `Khác`, và quy tắc mọi thứ thêm trong thiết kế phải có requirement và story.

Nhận định về tính nhất quán: mockup (`mockups.md`, `mockups-preview.html`), đặc tả tương tác, ánh xạ giao diện, danh mục truy cập, `requirements.md`, `stories.md` và `traceability.json` khớp nhau. Kiểm tra bằng script: 54 ID FR/NFR trong requirements đều có trong bảng truy vết, và 24 story được tham chiếu đều tồn tại. Phần giao diện chung vốn chỉ có trong mockup (sáng/tối, hai khung, khung xương, truy cập, hiện/ẩn mật khẩu, giữ đăng nhập khi làm mới trang) đã có NFR-9..12 và nhóm 8 tương ứng. Quy tắc `Khác` và refer có cả ở giao diện, API (`400` khi refer mà kết luận khác `Khác`) và tiêu chí chấp nhận. Bản HTML chạy được và hiển thị đúng các trạng thái chính theo kiểm tra trên trình duyệt.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | mockups.md | Mockup là wireframe chữ kèm đặc tả, chưa phải ảnh giao diện đồ họa; stage này kỳ vọng mức trung đến cao về độ chi tiết hình ảnh, nên người duyệt khó hình dung màu, kính mờ và bento | PO cho biết có cần bản đồ họa không; nếu cần, tạo ở bước sau hoặc từ giao diện Flutter thật | New |
| R-02 | Medium | mockups.md, bố cục hai khung | Hai khung trên máy tính để bàn, lưới bento và đổi sáng/tối cộng thêm công sức trong lát cắt 2 ngày đang đã chật | Quyết định giữ hay bỏ ở Delivery Planning; phương án dự phòng chuyển trang một cột đã được ghi | New |
| R-03 | Low | design-system-mapping.md | Chưa tính tương phản cho viền ô nhập chế độ tối và chữ trên kính mờ thật | Kiểm khi dựng giao diện (đã ghi trong A11Y-2, A11Y-14) | New |
| R-04 | Low | interaction-spec.md, ScoreSelector | `SegmentedButton` của Material 3 có thể khó tùy chỉnh để cao 48 px và có dấu tích cho 5 đoạn hẹp trên điện thoại | Nếu vướng, dùng hàng 5 nút tự viết; không đổi thiết kế | New |
| R-05 | Low | accessibility-checklist.md | Nhiều mục ở trạng thái "Cần kiểm khi dựng"; danh mục chưa phải kết quả kiểm | Giữ lời giới hạn đã ghi; đưa các mục này vào kế hoạch kiểm thử ở Construction | New |
| R-06 | High | stories.md toàn bộ | Phạm vi đã tăng từ 8 yêu cầu lên 24 story (15 Must Have) so với mục tiêu "dựng trong 2 ngày"; không có đánh giá nào cho thấy khối lượng này vừa 2 ngày | PO và Delivery Planning quyết định đường cắt phạm vi; ưu tiên làm các story Must Have trước, cân nhắc đưa AI, hai khung, sáng/tối, refer, CV sang đợt sau | New |
| R-07 | Medium | US5.6, US5.7, US7.4, NFR-8 | Tính năng AI mâu thuẫn với tài liệu nguồn Phase 2 mục 11.2 (không dùng AI phân tích ứng viên trong MVP khi chưa có cơ sở pháp lý, consent, rà soát thiên lệch); nhà cung cấp, nơi lưu dữ liệu và consent chưa quyết | Giữ cờ tắt mặc định; PO xác nhận chấp nhận rủi ro này và giao Legal / Security trả lời OQ-AI-1..4 trước khi bật | New |
| R-08 | Medium | FR-A5, FR-A6, US5.3, US5.4 | Ý nghĩa nghiệp vụ của kết luận `Khác` chưa được PO mô tả (nhãn chỉ là "Khác"); dễ bị hiểu lẫn với `Cân nhắc` khi HR đọc kết quả sau này | PO xác nhận ý nghĩa của `Khác` và có đổi nhãn thành rõ hơn (ví dụ "Phù hợp vị trí khác") không | New |
| R-09 | Medium | stories.md, cột Ưu tiên | Mức ưu tiên Should Have và Could Have của US5.4, US5.5, US5.6, US5.7, US7.4 và nhóm 8 là đề xuất của người soạn, PO chưa xác nhận | PO xác nhận hoặc đổi mức ưu tiên tại cổng | New |
| R-10 | Medium | requirements.md, stories.md | Hai tài liệu đã được duyệt ở stage trước bị sửa trực tiếp nhiều lần (trạng thái HĐPV, bỏ chọn vị trí, CV, kết luận, refer, AI, giao diện chung) mà không mở lại vòng duyệt stage đó | Ghi nhận cho PO; nên có một lượt rà soát tổng thể tài liệu ở Delivery Planning | New |
| R-11 | Low | NFR-9 | Phông chữ đồng nhất không áp dụng được cho chữ bên trong tệp CV PDF (dùng phông nhúng trong tệp); họ phông Roboto là đề xuất chưa được PO xác nhận | Giữ ghi chú đã có; PO xác nhận họ phông | New |
| R-12 | Low | design-system-mapping.md | Làm nổi bật đoạn trích trong CV phụ thuộc gói xem PDF hỗ trợ tọa độ chữ; gói chưa chọn | Chọn gói ở thiết kế kỹ thuật, kiểm trên cả web và điện thoại; phương án dự phòng là hiển thị bản văn bản của trang | New |
| R-13 | Low | mockups-preview.html | Nội dung AI và CV trong bản HTML là dữ liệu giả lập; chất lượng AI thật chưa được đánh giá | Đánh giá chất lượng với CV thật khi có nhà cung cấp | New |

> R-01 Not re-checked this round

> R-02 Not re-checked this round

> R-03 Not re-checked this round

> R-04 Not re-checked this round

> R-05 Not re-checked this round

### Suggestions

- Cân nhắc tách phạm vi thành hai đợt: đợt 1 gồm luồng chấm điểm cốt lõi (đăng nhập, chọn HĐPV, danh sách ứng viên, chấm điểm, kết luận, nộp, nạp dữ liệu, giao diện chung Must Have); đợt 2 gồm CV, refer, AI và các story Should/Could còn lại.
