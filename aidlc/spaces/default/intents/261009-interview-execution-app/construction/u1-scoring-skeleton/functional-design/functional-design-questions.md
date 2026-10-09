# Câu hỏi Functional Design — U1 scoring-skeleton

Phạm vi: lát cắt mỏng chạy xuyên suốt (US7.1, US7.2, US7.3, US1.1, US2.1, US4.1, US5.1, US5.2, US6.1). Mặc định là A. Những gì đã chốt ở Inception (BR-A1, BR-A2, idempotency, bcrypt, JWT 8 giờ, 409 khi trùng, tiêu chí kết luận thuộc U2) không hỏi lại.

## Sources

- `inception/units-generation/unit-of-work.md` — phạm vi và ranh giới U1
- `inception/user-stories/stories.md` — AC của 9 story thuộc U1
- `inception/domain-design/components.md` — khối và thực thể
- `inception/contract-design/contract-summary.md` — API C1, truy vấn chính sách C2

## Q1. Đăng nhập sai nhiều lần

A. Không khóa trong MVP; chỉ ghi log mỗi lần đăng nhập sai (email, thời điểm, không ghi mật khẩu). Đơn giản, đủ cho demo nội bộ.
B. Tạm khóa 15 phút sau 5 lần sai liên tiếp cho cùng email (trả `429`).
X. Other (please specify)

[Answer]: B

## Q2. Phiếu chấm dở dang

A. Không lưu nháp ở server. Điểm và nhận xét chỉ nằm trên app cho tới khi Hoàn thành đánh giá (khớp AC5.2.5: rời màn thì mất). Trong U1 phiếu chỉ có một trạng thái `SUBMITTED`.
B. Lưu nháp ở server (thêm trạng thái `DRAFT` và API lưu nháp).
X. Other (please specify)

[Answer]: A

## Q3. Giờ phỏng vấn lưu thế nào?

A. Giờ địa phương Việt Nam, không múi giờ: ngày nằm ở HĐPV, giờ bắt đầu và kết thúc là `hh:mm` của dòng lịch ứng viên. Sắp xếp theo giờ bắt đầu rồi mã ứng viên.
B. Lưu thời điểm đầy đủ có múi giờ (UTC) cho từng dòng lịch.
X. Other (please specify)

[Answer]: A

## Q4. Nạp lại dữ liệu có xóa bản ghi không còn trong file không?

A. Không xóa. Nạp chỉ thêm mới hoặc cập nhật theo mã; muốn ẩn một bản ghi thì đổi trạng thái (ví dụ tiêu chí hoặc tài khoản ngừng hoạt động).
B. Đồng bộ hoàn toàn: bản ghi không có trong file thì bị xóa hoặc ngừng.
X. Other (please specify)

[Answer]: A

## Q5. Quy tắc mật khẩu khi tạo tài khoản bằng script nạp

A. Tối thiểu 8 ký tự; mật khẩu ngắn hơn bị từ chối và ghi vào báo cáo lỗi. Mật khẩu chỉ nằm trong file nạp, được băm bcrypt khi ghi và không in ra log hay báo cáo.
B. Không kiểm độ dài (chỉ yêu cầu không rỗng).
X. Other (please specify)

[Answer]: A

## Q6. Dữ liệu mẫu cho demo và lệnh xác minh

A. Bộ mẫu nhỏ: 5 tiêu chí (thang 1–5), 3 vị trí, 3 CBQL có tài khoản, 5 HĐPV (`Draft`, `Sent`, `Xác nhận`, `Inprogress`, `Completed`, đủ để kiểm bộ lọc trạng thái), khoảng 6 ứng viên trong đó có 1 người `Xác nhận = N` và 2 người ở hai vị trí khác nhau trong cùng một HĐPV.
B. Chỉ dữ liệu tối thiểu cho một luồng (1 HĐPV, 2 ứng viên).
X. Other (please specify)

[Answer]: A
