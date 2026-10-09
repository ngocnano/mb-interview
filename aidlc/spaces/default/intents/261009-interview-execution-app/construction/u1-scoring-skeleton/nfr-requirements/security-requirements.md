# Yêu cầu bảo mật — U1 scoring-skeleton

Mã `NFR1.x` kế thừa NFR-1 (Bảo mật và quyền riêng tư) trong `requirements.md`; `NFR1` viết liền số nghĩa là NFR-1. Mã `NFR5.x` kế thừa NFR-5 và `NFR6.x` kế thừa NFR-6 ở các bảng khác.

## Sources

- `inception/requirements-analysis/requirements.md` — NFR-1, FR-A0, BR-A1, BR-A2
- `construction/u1-scoring-skeleton/functional-design/rules.md` — BR1.1..BR1.8, BR2.1..BR2.6, BR3.5..BR3.8
- `construction/u1-scoring-skeleton/nfr-requirements/nfr-requirements-questions.md` — Q6 = A, Q4 = A
- `aidlc/spaces/default/memory/project.md` — RBAC phía server, audit bất biến, không ghi đè bài đã nộp

## Xác thực và phiên

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR1.1 | Băm mật khẩu | bcrypt cost 10; không lưu mật khẩu rõ ở DB, log, báo cáo nạp | Test: DB chỉ có băm; quét log không có mật khẩu (AC1.1.6) | BR1.5 |
| NFR1.2 | Khóa ký JWT | HS256, khóa tối thiểu 32 byte lấy từ biến môi trường, không có giá trị mặc định; thiếu hoặc ngắn hơn thì server không khởi động | Test khởi động với khóa thiếu và khóa ngắn | BR1.4 |
| NFR1.3 | Hạn token | 8 giờ, không có refresh token | Test token hết hạn trả 401 (AC1.1.5) | BR1.4 |
| NFR1.4 | Chống dò mật khẩu | Tạm khóa email 15 phút sau 5 lần sai; thêm giới hạn chung 100 request mỗi phút mỗi IP | Test BR1.6 và test giới hạn IP | BR1.6 |
| NFR1.5 | Thông báo lỗi đăng nhập không lộ email tồn tại và thời gian phản hồi của email không tồn tại gần bằng email tồn tại (vẫn chạy một phép so sánh băm giả) | Chênh lệch thời gian không đáng kể trong test | Test thời gian | BR1.1 |

## Phân quyền và dữ liệu

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR1.6 | Phân quyền phía server theo nguyên tắc ít quyền nhất | Mọi API nghiệp vụ qua middleware xác thực rồi chính sách của InterviewCatalog; không module nào khác tự đọc bảng của InterviewCatalog | Test API cho các mã 401, 403, 404; rà soát mã | BR2.1..BR2.3, BR3.5 |
| NFR1.7 | Bảo vệ dữ liệu cá nhân của ứng viên | Không trả sdt, ngày sinh, giới tính qua API; không có trong log | Test hợp đồng kiểm các phản hồi (AC5.1.2) | BR2.6 |
| NFR1.8 | Chống tiêm mã SQL | Mọi truy vấn dùng biến ràng buộc (bind variable); không nối chuỗi từ đầu vào | Rà soát mã và test với đầu vào có ký tự đặc biệt | BR3.2, BR3.3 |
| NFR1.9 | Kiểm tra đầu vào ở biên hệ thống | Mọi payload đi qua lược đồ kiểm (độ dài, kiểu, giá trị cho phép) trước khi vào nghiệp vụ; JSON tối đa 100 KB | Test với payload sai và quá cỡ | BR1.3, BR3.2..BR3.4 |
| NFR1.10 | Phiếu đã hoàn thành không thể sửa hoặc xóa | Không có API sửa hoặc xóa; tài khoản DB của ứng dụng chỉ được thêm (không sửa, không xóa) trên bảng phiếu đánh giá và bảng điểm | Test API và kiểm quyền DB của tài khoản ứng dụng | BR3.8 |
| NFR1.11 | Kiểm toán bất biến cho hành động ảnh hưởng kết quả | Ghi sự kiện đăng nhập thất bại, tạm khóa, hoàn thành đánh giá, chạy nạp dữ liệu kèm userId, thời điểm, mã tương quan | Test sự kiện có trong log kiểm toán | project.md, BR1.6, BR3.9 |

## Truyền tải và cấu hình

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR1.12 | Mã hóa khi truyền | HTTP cho dev; HTTPS bắt buộc khi triển khai | Kiểm ở Infrastructure Design | NFR-1 |
| NFR1.13 | CORS | Chỉ cho các nguồn được liệt kê trong cấu hình | Test từ nguồn không có trong danh sách bị từ chối | NFR-1 |
| NFR1.14 | Không lưu bộ nhớ đệm dữ liệu nghiệp vụ | Mọi API nghiệp vụ trả `Cache-Control: no-store` | Test header | contract-summary |
| NFR1.15 | Bí mật chỉ từ biến môi trường | Khóa JWT, chuỗi kết nối DB không nằm trong mã nguồn; tệp `.env` và tệp nạp chứa mật khẩu được loại khỏi git | Rà soát mã; kiểm `.gitignore` | NFR-1 |
| NFR1.16 | Lưu token trên app | Điện thoại dùng kho an toàn của hệ điều hành; web dùng `localStorage` của trình duyệt để giữ đăng nhập khi làm mới trang (AC1.1.8; chấp nhận rủi ro XSS vì nội dung do app kiểm soát) | Rà soát mã | FR-A0 |
| NFR1.17 | Lỗi không rò rỉ chi tiết nội bộ | Phản hồi lỗi chỉ có `code` và `message`; stack trace chỉ nằm trong log | Test lỗi 500 | contract-summary |

## Quyền riêng tư theo thời gian

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR5.1 | Giờ phỏng vấn lưu và hiển thị là giờ địa phương Việt Nam, không múi giờ (Q3 = A của Functional Design) | `tuThoiGian`, `denThoiGian` dạng `hh:mm`; ngày ở HĐPV | Test sắp xếp và hiển thị | NFR-5 |
| NFR6.1 | Mức truy cập cơ bản ở các màn S1..S4 | Mọi ô nhập có nhãn; lỗi hiển thị bằng chữ chứ không chỉ màu; vùng chạm tối thiểu 48 px; thông báo thành công đọc được bằng trình đọc màn hình (AC6.1.13). Phần đầy đủ WCAG 2.1 AA thuộc U5 | Test màn hình và kiểm tra thủ công | NFR-6 |

## Mối đe dọa chính đã cân nhắc

| Mối đe dọa | Biện pháp |
|---|---|
| Dò mật khẩu hoặc dò email | NFR1.4, NFR1.5 |
| Người phỏng vấn xem hội đồng hoặc ứng viên không được gán | NFR1.6 |
| Lộ dữ liệu cá nhân của ứng viên | NFR1.7 |
| Gửi lại hoặc bấm trùng tạo hai phiếu | BR3.6, BR3.7 và ràng buộc duy nhất ở DB |
| Sửa bài đã hoàn thành | NFR1.10 |
| Lộ khóa bí mật qua mã nguồn hoặc git | NFR1.15 |

## Assumptions & Open Questions

- **[assumption]** Khóa theo email có thể bị lợi dụng để khóa nhầm một người (đã chấp nhận ở Functional Design, R-02); giới hạn theo IP của NFR1.4 giảm một phần rủi ro.
- **[assumption]** Token trên web nằm trong `localStorage`; nếu cần chặt hơn, chuyển sang cookie HttpOnly ở NFR Design.
- **Open question:** None.
