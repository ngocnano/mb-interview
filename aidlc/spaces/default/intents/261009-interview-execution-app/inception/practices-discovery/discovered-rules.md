# Quy tắc phát hiện (bản nháp)

> Chỉ ghi các ràng buộc cứng do con người nêu rõ. Bản nháp lead; sẽ chốt ở phỏng vấn.

## Sources

- `D:\Kiro\phase-2-app-phong-van.md` (mục 9, 11 — guardrail và business rules)
- `aidlc/spaces/default/memory/org.md`

## Mandated

- ALWAYS yêu cầu HR chốt và duyệt nội dung trước khi gửi bất kỳ kết quả nào cho ứng viên.
- ALWAYS ghi audit bất biến cho mọi hành động ảnh hưởng kết quả (submit, mở lại, sửa phiên bản, miễn đánh giá, override quorum, chốt, duyệt/gửi, đổi quyền/thành viên).
- ALWAYS dùng idempotency key cho thao tác submit đánh giá để tránh tạo hai bản ghi khi nhấn lại hoặc timeout.
- ALWAYS kiểm tra quyền (RBAC) ở phía server theo least privilege, kết hợp phạm vi tổ chức, HĐPV, ứng viên và trạng thái hồ sơ.

## Forbidden

- NEVER tự động ra kết luận tuyển dụng cuối cùng mà không có HR review.
- NEVER gửi điểm số, nhận xét nội bộ hoặc danh tính người chấm cho ứng viên nếu không có chính sách rõ ràng cho phép.
- NEVER ghi đè âm thầm dữ liệu đánh giá đã nộp; mọi sửa đổi phải tạo phiên bản mới có lý do và audit.
- NEVER cho phép CBQL không thuộc HĐPV chấm điểm hồ sơ nếu chưa được gán vai trò hợp lệ.
