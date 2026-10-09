# Phỏng vấn — Requirements Analysis

> Tài liệu nguồn Phase 2 đã rất đầy đủ. Trọng tâm làm rõ ở stage này là ràng buộc mới
> do PO đưa ra: dựng một app chạy được trong 2 ngày từ đầu vào tối giản. Các quyết định
> dưới đây định hình mục "MVP 2 ngày (Walking Skeleton)" trong `requirements.md`.
> Trả lời vào tag `[Answer]:`.

## Q1 — Phạm vi MVP 2 ngày

App 2 ngày dừng ở đâu trong luồng?

- A. Chỉ tới submit đánh giá cá nhân (chọn HĐPV → vị trí → ứng viên → chấm điểm → submit); chưa làm tổng hợp/HR chốt/gửi kết quả (gợi ý mặc định)
- B. Làm thêm tổng hợp và HR chốt
- X. Other (please specify)

[Answer]: A

## Q2 — Nguồn dữ liệu đầu vào (Phase 1) & database

Dữ liệu HĐPV/vị trí/ứng viên lấy từ đâu, dùng chung hay riêng DB?

- A. Seed JSON tĩnh nhúng trong app
- B. Dùng chung một database với team Phase 1 (đọc read-only)
- C. Database RIÊNG của app Phase 2; dữ liệu kiểu Phase 1 (theo `Kiro_bang (1).xlsx`) được seed/import vào DB riêng
- X. Other (please specify)

[Answer]: C — DB riêng, không dùng chung với team Phase 1; dữ liệu Phase 1 seed/import vào DB riêng.

## Q3 — Scorecard

Cấu trúc chấm điểm cho MVP?

- A. Cố định cứng vài tiêu chí trong code
- B. Bảng tiêu chí cấu hình được: `mã tiêu chí`, `tên tiêu chí`, `thang điểm` (1–5); mỗi phiên có một ô nhận xét chung
- X. Other (please specify)

[Answer]: B

## Q4 — Login

Đăng nhập trong 2 ngày làm thế nào?

- A. JWT tự xây — email + mật khẩu, bảng user trong Oracle, hash bcrypt, backend phát JWT
- B. OTP email tự xây
- C. Bỏ login, chọn interviewer từ dropdown
- X. Other (please specify)

[Answer]: A — JWT tự xây (email + mật khẩu, bcrypt, bảng user Oracle, phát JWT).

## Q5 — Backend / Database

Nền tảng backend và DB?

- A. Node.js + Express + SQLite
- B. Node.js + Express + Oracle XE (Docker, local), driver `oracledb`
- C. Supabase (Postgres + Auth + API tự sinh)
- X. Other (please specify)

[Answer]: B — Node.js + Express + `oracledb` → Oracle XE chạy local trong Docker. Frontend Flutter gọi REST API; phân quyền ở tầng API.
