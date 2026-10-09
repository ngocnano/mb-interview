# Bản đồ phụ thuộc bên ngoài

Bolt = một lượt xây dựng một phần công việc, kết thúc bằng thứ chạy được.

## Sources

- `inception/delivery-planning/delivery-planning-questions.md` — Q6 = A
- `inception/delivery-planning/bolt-plan.md` — Bolt B1..B5
- `inception/units-generation/unit-of-work.md` — ghi chú về AI, gói PDF, kho tệp CV
- `inception/requirements-analysis/requirements.md` — OQ-AI-1..4

| # | Phụ thuộc | Chủ sở hữu | Thời gian chờ | Bolt bị chặn | Nếu trễ |
|---|---|---|---|---|---|
| E-1 | Docker và ảnh Oracle XE trên máy phát triển | Người dùng | Cài một lần | B1 | Không làm tiếp được; xử lý trước khi bắt đầu B1 |
| E-2 | Dữ liệu thật nạp từ nguồn Phase 1 (nếu có) | Người dùng / nhóm Phase 1 | Chưa rõ | B1 | Dùng dữ liệu mẫu |
| E-3 | Nhà cung cấp AI, Legal, Security (OQ-AI-1..4) | Người dùng, Legal, Security | Chưa rõ | B5 | Dựng với nhà cung cấp giả lập và cờ tắt |
| E-4 | Gói xem PDF chạy trên web và điện thoại | Nhóm phát triển (chọn ở thiết kế kỹ thuật) | Trong B4 | B4, B5 | Nếu không có tọa độ chữ, bỏ làm nổi bật trong CV |
| E-5 | Kho tệp CV (thư mục trên máy chủ) và PDF mẫu | Người dùng | Chưa rõ | B4 | Dùng PDF mẫu tự tạo |

## Assumptions & Open Questions

- **[assumption]** Không có nhóm khác cần bàn giao cho B1, B2, B3.
- **Open question:** Có dữ liệu thật từ Phase 1 để nạp không (E-2)?
