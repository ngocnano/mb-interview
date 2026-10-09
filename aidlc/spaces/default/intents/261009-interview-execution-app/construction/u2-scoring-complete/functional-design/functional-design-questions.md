# Câu hỏi Functional Design — U2 scoring-complete

Phạm vi U2: US5.3 (kết luận), US5.4 (refer), US5.8 (điểm trung bình), US6.2 (hoàn thành an toàn khi mất mạng), US6.3 (xem lại bài), US1.2 (đăng xuất), cộng phần U2 của US4.1 (nhãn kết luận, cột Điểm TB), US2.1 (đã chấm / tổng) và US6.1 (kết luận bắt buộc, refer, điểm trung bình). Công thức điểm trung bình, quy tắc kết luận và refer đã chốt ở Inception (ADR-003, BR-A3, BR-A5, AC6.1.8..AC6.1.16), nên không hỏi lại. Mặc định là A.

## Sources

- `inception/user-stories/stories.md` — AC5.3.x, AC5.4.x, AC5.8.x, AC6.1.8..AC6.1.16, AC6.2.x, AC6.3.x, AC1.2.x, AC4.1.11, AC4.1.12
- `inception/domain-design/decisions.md` — ADR-002, ADR-003
- `inception/contract-design/contract-summary.md` — C1, C5 (`averageScoreSpec`)
- `construction/u1-scoring-skeleton/functional-design/rules.md` — BR3.x, BR2.11 làm nền
- `docker/schema/schema.sql` — cột `ket_luan`, `refer_*`, `diem_trung_binh` đã có (nullable)

## Q1. Dữ liệu chấm dở khi mất mạng hoặc đóng app

A. Chỉ giữ trong phiên đang mở (đúng AC6.2.2: giữ nguyên dữ liệu trên form khi gửi lỗi). Đóng hoặc tải lại app thì mất, như quyết định "không lưu nháp" ở U1.
B. Lưu bản nháp cục bộ trên thiết bị (kèm khóa idempotency) để khôi phục sau khi mở lại app.
X. Other (please specify)

[Answer]: A

## Q2. Thay đổi lược đồ DB ở U2 cho DB đã có dữ liệu

U2 thêm ràng buộc ở DB: refer chỉ khi kết luận là `KHAC`, lý do refer chỉ khi có vị trí refer.

A. Thêm vào `schema.sql` (DB mới) và thêm tệp migration đánh số `docker/schema/migrate/002-u2-constraints.sql` cùng lệnh `node scripts/migrate.mjs` chạy được nhiều lần, dùng tài khoản chủ lược đồ. DB đang chạy chỉ cần chạy lệnh này.
B. Chỉ sửa `schema.sql`; DB đã có phải tạo lại (mất dữ liệu).
X. Other (please specify)

[Answer]: A

## Q3. Danh sách vị trí để refer

A. Tải khi người dùng chọn kết luận `Khác` (API `referable-positions`), vì đa số ứng viên không dùng đến.
B. Tải cùng lúc mở màn chấm điểm.
X. Other (please specify)

[Answer]: A
