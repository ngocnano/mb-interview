# Personas — App thực hiện phỏng vấn (MVP 2 ngày)

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/requirements-analysis/requirements.md` (Actor AC-3, AC-4, AC-6; FR-A0..A7; BR-A1, BR-A2)
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/user-stories/user-stories-questions.md` (Q2 = A: hai nhân vật)

## P1 — Người phỏng vấn (ưu tiên 1)

- **Vai trò:** CBQL được gán vào HĐPV qua bảng Chi tiết HĐPV – CBQL. Có tài khoản đăng nhập liên kết với `EmployedID`.
- **Bối cảnh:** Dùng app Flutter trong ngày phỏng vấn, thường ngồi cùng ứng viên hoặc trong phòng họp online. Có ít thời gian giữa hai ứng viên, cần thao tác nhanh.
- **Mục tiêu:**
  - Biết hôm nay mình phỏng vấn ở hội đồng nào, vị trí nào, ứng viên nào vào lúc mấy giờ.
  - Chấm điểm từng tiêu chí và ghi nhận xét ngay sau buổi phỏng vấn.
  - Hoàn thành đánh giá một lần, chắc chắn bài đã được lưu.
- **Khó khăn hiện tại:**
  - Phiếu chấm giấy hoặc file rời dễ thất lạc, khó tổng hợp.
  - Không rõ mình đã chấm ứng viên nào, còn ai chưa chấm.
  - Lo bấm hoàn thành hai lần hoặc mất mạng giữa chừng.
- **Không được làm:** xem đánh giá của người khác, chấm ứng viên chưa xác nhận lịch, mở HĐPV không ở trạng thái `Inprogress`, sửa bài đã hoàn thành.

## P2 — Người vận hành hệ thống (ưu tiên 2)

- **Vai trò:** Developer hoặc admin chuẩn bị môi trường cho buổi phỏng vấn (MVP chưa có màn quản trị trên app).
- **Bối cảnh:** Làm việc trên máy chạy Oracle XE (Docker) và backend Node.js; nhận dữ liệu từ bảng thiết kế `Kiro_bang (1).xlsx`.
- **Mục tiêu:**
  - Nạp nhanh dữ liệu HĐPV (kèm trạng thái), CBQL, ứng viên và lịch vào DB của app.
  - Nạp bộ tiêu chí chấm điểm.
  - Tạo tài khoản cho người phỏng vấn, khớp với `EmployedID`.
  - Biết bản ghi nào bị lỗi để sửa.
- **Khó khăn hiện tại:**
  - Dữ liệu nguồn có thể thiếu trường hoặc tham chiếu sai.
  - Nạp lại nhiều lần khi chuẩn bị demo dễ làm trùng dữ liệu.

## Quan hệ và ưu tiên

- P2 chuẩn bị dữ liệu và tài khoản; P1 dùng chúng để chấm điểm. Không có tương tác trực tiếp trên app giữa hai nhân vật.
- Ưu tiên: P1 là người dùng chính, mọi story Must Have của luồng chấm điểm phục vụ P1. Story của P2 là điều kiện để demo được luồng của P1.
- Ngoài MVP 2 ngày: HR/Recruiter, Chủ tịch HĐPV, CBQL không thuộc HĐPV, Ứng viên (theo AC-1, AC-2, AC-4, AC-5 trong requirements) — chưa có story ở đợt này.
