# Yêu cầu quy mô — U1 scoring-skeleton

Mã `NFR13.x` kế thừa NFR-13 (Hiệu năng và quy mô). Số mã tiếp theo trong tài liệu này bắt đầu từ NFR13.8 để không trùng với `performance-requirements.md`.

## Sources

- `inception/requirements-analysis/requirements.md` — NFR-13
- `construction/u1-scoring-skeleton/nfr-requirements/nfr-requirements-questions.md` — Q2 = A
- `construction/u1-scoring-skeleton/functional-design/entities.md` — thực thể và ràng buộc

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR13.8 | Tải dự kiến | Tối đa 50 người dùng đồng thời, 20 HĐPV `Inprogress`, 200 ứng viên mỗi HĐPV, 5 tiêu chí | Dùng làm đầu vào test tải của NFR13.1 | NFR-13 |
| NFR13.9 | Mô hình mở rộng | Một backend (modular monolith) và một Oracle XE; không mở rộng ngang; backend không giữ trạng thái phiên trong bộ nhớ nên chạy thêm một bản vẫn đúng (token tự chứa) | Rà soát mã: không có trạng thái phiên cục bộ ngoài bộ đếm đăng nhập sai, vốn nằm ở DB | NFR-13 |
| NFR13.10 | Danh sách không phân trang | `GET /panels` và `GET /panels/{maHdpv}/candidates` trả toàn bộ trong giới hạn NFR13.8; nếu vượt 200 ứng viên mỗi HĐPV thì phải thêm phân trang bằng cách thêm tham số (không đổi hợp đồng v1) | Test với 200 ứng viên | NFR-13 |
| NFR13.11 | Tăng trưởng dữ liệu | Mỗi lần hoàn thành tạo 1 phiếu và tối đa 20 dòng điểm; ước tính dưới 100 000 dòng sau một năm sử dụng nội bộ; không cần phân vùng | Ước tính, ghi lại | NFR-13 |
| NFR13.12 | Đồng thời ghi | Hai người cùng hoàn thành cho cùng một ứng viên không tạo bản ghi trùng; ràng buộc duy nhất ở DB là rào cuối | Test đồng thời với nhiều request song song | BR3.6 |
| NFR13.13 | Dọn dữ liệu đếm đăng nhập sai | Dòng `LoginThrottle` hết hạn được xóa theo lịch, tối đa 1 ngày sau khi hết khóa, để bị dò email không làm bảng phình | Test công việc dọn | Functional Design R-03 |
| NFR13.14 | Giới hạn kết nối DB | Nhóm kết nối tối đa 10; yêu cầu vượt hàng đợi tối đa 5 giây rồi trả 503 | Test với nhiều request song song | NFR-13 |

## Assumptions & Open Questions

- **[assumption]** Không có tăng trưởng đột biến; nếu số người dùng đồng thời vượt 50, thiết kế lại ở lượt sau.
- **Open question:** None.
