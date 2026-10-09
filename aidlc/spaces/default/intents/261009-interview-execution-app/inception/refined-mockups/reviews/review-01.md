**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho bộ Refined Mockups: `mockups.md`, `interaction-spec.md`, `design-system-mapping.md`, `accessibility-checklist.md`, `refined-mockups-questions.md`.

Nhận định: 5 màn hình (S1..S5) và 5 lớp phủ (D1..D3, B1, B2) phủ đủ các story US1.1 đến US6.3; bảng truy vết story sang màn hình ở cuối `mockups.md` khớp với `stories.md`. Mọi quyết định của PO (Q1 = C web và điện thoại, Q2 = A Material 3 theo xu hướng 2026, Q3..Q6 = A) được thể hiện. Các quy tắc BR-A1 và BR-A2 hiện ra ở trạng thái rỗng và thông báo lỗi của S3, S4. Tỷ lệ tương phản được tính từ màu thật, không ước chừng. Chỗ lệch giữa dòng ứng viên ở S3 và AC4.1.4 (ngày giờ đầy đủ) đã được sửa trong mockup.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | mockups.md | Mockup là wireframe chữ kèm đặc tả, chưa phải ảnh giao diện đồ họa; stage này kỳ vọng mức trung đến cao về độ chi tiết hình ảnh, nên người duyệt khó hình dung màu, kính mờ và bento | PO cho biết có cần bản đồ họa không; nếu cần, tạo ở bước sau hoặc từ giao diện Flutter thật | New |
| R-02 | Medium | mockups.md, bố cục hai khung | Hai khung trên máy tính để bàn, lưới bento và đổi sáng/tối cộng thêm công sức trong lát cắt 2 ngày đang đã chật | Quyết định giữ hay bỏ ở Delivery Planning; phương án dự phòng chuyển trang một cột đã được ghi | New |
| R-03 | Low | design-system-mapping.md | Chưa tính tương phản cho viền ô nhập chế độ tối và chữ trên kính mờ thật | Kiểm khi dựng giao diện (đã ghi trong A11Y-2, A11Y-14) | New |
| R-04 | Low | interaction-spec.md, ScoreSelector | `SegmentedButton` của Material 3 có thể khó tùy chỉnh để cao 48 px và có dấu tích cho 5 đoạn hẹp trên điện thoại | Nếu vướng, dùng hàng 5 nút tự viết; không đổi thiết kế | New |
| R-05 | Low | accessibility-checklist.md | Nhiều mục ở trạng thái "Cần kiểm khi dựng"; danh mục chưa phải kết quả kiểm | Giữ lời giới hạn đã ghi; đưa các mục này vào kế hoạch kiểm thử ở Construction | New |

### Suggestions

- Cân nhắc làm trước chế độ sáng, hoãn chế độ tối nếu thiếu thời gian, vì bảng tương phản chế độ tối chưa có viền ô nhập.
