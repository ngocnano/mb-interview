# Lý do chọn thứ tự và rủi ro

Bolt = một lượt xây dựng một phần công việc. Walking skeleton = lát cắt mỏng chạy xuyên suốt, dựng trước để chứng minh các mảnh ghép nối được.

## Sources

- `inception/delivery-planning/delivery-planning-questions.md` — Q1 = A, Q2 = A, Q5 = A, Q7 = A
- `inception/delivery-planning/bolt-plan.md` — thứ tự B1..B5
- `inception/units-generation/unit-of-work-dependency.md` — DAG phụ thuộc
- `aidlc/spaces/default/memory/team.md` — walking skeleton, TDD

## Thứ tự và lý do

Thứ tự: B1 (U1) → B2 (U2) → B3 (U5) → B4 (U3) → B5 (U4). Không chấm điểm WSJF (Q2 = A); lý do thuần theo phụ thuộc, giá trị Must Have và rủi ro.

- **Skeleton trước (Cockburn).** U1 là Unit duy nhất không phụ thuộc gì và chứa rủi ro tích hợp lớn nhất: Node.js ↔ Oracle XE ↔ Flutter. Lộ lỗi sớm ở đây rẻ hơn nhiều so với lộ ở U3 hay U4.
- **U2 ngay sau U1.** U1 chưa bắt buộc kết luận (BR-A3), nên chưa dùng thật được. U2 mới tạo ra giá trị cốt lõi dùng được, nên B1 + B2 phát hành chung (R1).
- **U5 trước U3 và U4.** U5 chứa ba story Must Have (US8.1, US8.2, US8.5); U3 và U4 chỉ chứa Should và Could Have. Làm U5 trước cũng để màn hình U3 và U4 dùng ngay chủ đề chung, khỏi chỉnh lại.
- **U3 trước U4.** U4 phụ thuộc văn bản CV và `cvHash` do U3 cung cấp (ADR-006).
- **Phù hợp DAG.** U1 → U2 → U5 → U3 → U4 là một thứ tự tô-pô hợp lệ (đã đối chiếu `unit-of-work-dependency.md`); không có chỗ lệch thứ tự cần biện minh.

## Đường cắt phạm vi

R1 = B1 + B2 trong khung 2 ngày: 13 story Must Have và 2 Should Have. B3 thêm 3 Must Have còn lại nếu kịp; B4 và B5 để lượt sau (Q5 = A). Rủi ro của đường cắt này: 3 story Must Have (US8.1, US8.2, US8.5) có thể trượt khỏi R1.

## Rủi ro

| # | Rủi ro | Mức | Xử lý | Bolt |
|---|---|---|---|---|
| R-1 | Node.js kết nối Oracle XE (Docker) không ổn định hoặc cài driver khó trên Windows | Cao | Xử lý ngay trong B1 (Q7 = A); lệnh xác minh đầu cuối chạy thật trên Oracle | B1 |
| R-2 | Khung thời gian 2 ngày quá chặt | Cao | Đường cắt R1; B3, B4, B5 là phần có thể hoãn | B1, B2 |
| R-3 | Điểm trung bình lệch giữa Node.js và Dart | Trung bình | Bộ ví dụ test dùng chung (ADR-003) | B2 |
| R-4 | Gói xem PDF không chạy ổn trên cả web và điện thoại, hoặc không có tọa độ chữ | Trung bình | Chọn gói ở thiết kế kỹ thuật B4; có thể bỏ làm nổi bật | B4, B5 |
| R-5 | Chưa có quyết định AI, Legal, Security (OQ-AI-1..4) | Trung bình | Cờ tắt mặc định, nhà cung cấp giả lập | B5 |
| R-6 | Mức ưu tiên Should và Could Have chưa được PO xác nhận | Thấp | Xác nhận trước khi cắt phạm vi | B2..B5 |

## Assumptions & Open Questions

- **[assumption]** Không dùng WSJF; nếu PO muốn thứ tự khác theo giá trị, chấm lại ở bước này.
- **Open question:** Không có.
