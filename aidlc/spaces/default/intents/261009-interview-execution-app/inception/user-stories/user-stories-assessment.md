# Đánh giá nhu cầu User Stories

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/requirements-analysis/requirements.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/practices-discovery/team-practices.md`

## Quyết định

Execute.

## Lý do

- App có giao diện người dùng thực (Flutter) với luồng nhiều bước: đăng nhập → chọn HĐPV → danh sách ứng viên (có vị trí, sắp theo giờ) → chấm điểm → hoàn thành đánh giá.
- Có nhiều vai trò: người phỏng vấn dùng app hằng ngày; người vận hành (developer/admin) nạp dữ liệu và tiêu chí. Phạm vi đầy đủ còn có HR, Chủ tịch HĐPV, ứng viên.
- Nghiệp vụ có quy tắc cần khóa bằng tiêu chí chấp nhận: chỉ thấy HĐPV được gán, ẩn ứng viên chưa xác nhận lịch (BR-A1), một đánh giá cho mỗi người chấm và ứng viên, chống gửi trùng.
- Nhóm theo TDD: tiêu chí chấp nhận dạng Given/When/Then dùng làm đầu vào trực tiếp cho test.

## Các yếu tố đã xem xét

- Loại dự án: greenfield.
- Phạm vi người dùng: có giao diện, nhiều bước, nhiều vai trò.
- Độ phức tạp: trung bình ở MVP 2 ngày (FR-A0..A7, BR-A1); cao ở phạm vi đầy đủ (FR-1..FR-31).

## Story giúp ích nhiều nhất ở đâu

- Tách luồng MVP 2 ngày thành các story nhỏ, mỗi story kiểm thử độc lập được, để chia việc trong 2 ngày.
- Gắn tiêu chí chấp nhận của từng story vào FR-A và BR-A1 để truy vết đến test.
