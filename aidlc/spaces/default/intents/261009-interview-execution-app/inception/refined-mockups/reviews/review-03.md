**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 2

### Review

Rà soát advisory lần hai sau đợt bổ sung thứ tư của PO: đổi thuật ngữ "nộp đánh giá" thành "hoàn thành đánh giá" và thêm điểm trung bình ứng viên (khối cập nhật ngay trên phiếu chấm và cột Điểm TB trên danh sách ứng viên).

Nhận định: thuật ngữ mới được áp dụng nhất quán ở bản HTML (nút, hộp thoại, thông báo, nhãn), `mockups.md`, `interaction-spec.md`, `requirements.md`, `stories.md` và `traceability.json`; không còn chữ "nộp" trong các tài liệu hiện hành. Các định danh kỹ thuật `SUBMITTED`, `submittedAt`, `idempotencyKey` được giữ nguyên có chủ đích và ghi rõ. Điểm trung bình có đủ ở bốn lớp: giao diện (khối AverageScoreCard, cột Điểm TB), yêu cầu (FR-A4, FR-A5, FR-A6, BR-A5), story (US5.8, AC4.1.12, AC6.1.14..16, AC6.3.5) và truy vết. Ví dụ tính (4, 3, 4 ra 3,7; 4, 3, 5, 4, 5 ra 4,2) kiểm tra đúng bằng tay. Điểm trung bình được server tự tính và bỏ qua giá trị do client gửi, nên không thể bị giả mạo. Kiểm tra bằng script: 54 ID FR/NFR đều có truy vết, 25 story đều được tham chiếu.

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
| R-14 | High | stories.md toàn bộ | Phạm vi đã lên 25 story (16 Must Have) cho mục tiêu "dựng trong 2 ngày"; chưa có đánh giá khối lượng nào chứng minh vừa 2 ngày | PO và Delivery Planning chốt đường cắt phạm vi trước khi vào Construction (đề xuất hai đợt như lần rà soát trước) | New |
| R-15 | Medium | requirements.md FR-A4, FR-A5; stories.md US5.8 | "Cột điểm trung bình ứng viên" được hiểu là cả khối trên phiếu chấm lẫn cột trên danh sách ứng viên; đây là diễn giải của người soạn | PO xác nhận hiểu đúng hoặc chọn một trong hai chỗ | New |
| R-16 | Medium | memory/project.md | Quy tắc cứng đã khẳng định ở practices-discovery vẫn dùng chữ "submit" (ví dụ "idempotency key cho thao tác submit đánh giá"); chưa đổi vì cần qua bước khẳng định lại | Chỉ đổi khi PO muốn; hiện không ảnh hưởng chức năng | New |
| R-17 | Medium | FR-A5, A-18 | Điểm trung bình tạm tính khi chưa chọn đủ tiêu chí có thể gây hiểu nhầm là điểm cuối | Giữ dòng phụ "Tạm tính theo n/N tiêu chí đã chọn"; PO xác nhận hiển thị tạm tính hay chỉ khi đủ | New |
| R-18 | Low | FR-A5, A-17 | Trung bình cộng không trọng số, quy về thang 5; nếu sau này có trọng số theo tiêu chí (FR-7 ở phạm vi đầy đủ) thì công thức phải đổi, và điểm đã lưu không tính lại | Ghi nhận; khi thêm trọng số cần quyết định có tính lại bài cũ không | New |
| R-19 | Low | FR-A5 | Giao diện làm tròn bằng số thực, còn server tính bằng số thập phân; với số tiêu chí khác 5 có thể lệch ở quy tắc làm tròn lên từ 0,5 | Dùng cùng một hàm tính và kiểm thử đơn vị cho cả hai phía khi hiện thực (khớp TDD) | New |
| R-20 | Low | mockups-preview.html | Thẻ ứng viên có hiệu ứng trượt vào nên ảnh chụp lúc đang chạy hiệu ứng trông mờ; không phải lỗi, tắt khi bật giảm chuyển động | Không cần xử lý | New |

> R-01 Not re-checked this round

> R-02 Not re-checked this round

> R-03 Not re-checked this round

> R-04 Not re-checked this round

> R-05 Not re-checked this round

> R-06 Not re-checked this round

> R-07 Not re-checked this round

> R-08 Not re-checked this round

> R-09 Not re-checked this round

> R-10 Not re-checked this round

> R-11 Not re-checked this round

> R-12 Not re-checked this round

> R-13 Not re-checked this round

### Suggestions

- Khi hiện thực, đặt công thức điểm trung bình thành một hàm thuần dùng chung và viết test đơn vị trước (4, 3, 4 ra 3,7; 4, 3, 5, 4, 5 ra 4,2; bảng không điểm ra rỗng).
