# Câu hỏi — Units Generation

> Stage này gom 7 khối của Domain Design thành các đơn vị công việc (Unit) và vẽ sơ đồ phụ thuộc giữa chúng. Thứ tự làm và đường cắt phạm vi do Delivery Planning quyết định, không quyết ở đây.
> Thực hành của nhóm đã chốt dựng walking skeleton trước, nên Unit đầu tiên phải là lát cắt mỏng nhất chạy được xuyên suốt.
> Trả lời vào tag `[Answer]:`, hoặc "A hết" nếu đồng ý gợi ý.

## Q1 — Cách chia Unit

- A. **Năm Unit theo lát cắt tính năng**, mỗi Unit làm cả backend lẫn màn hình của tính năng đó, cùng dùng chung một backend và một app (gợi ý):
  - U1 `scoring-skeleton`: lát cắt mỏng nhất chạy xuyên suốt. Nạp dữ liệu, đăng nhập, danh sách HĐPV, danh sách ứng viên, chấm điểm, hoàn thành đánh giá (US7.1, US7.2, US7.3, US1.1, US2.1, US4.1, US5.1, US5.2, US6.1).
  - U2 `scoring-complete`: phần còn lại của luồng chấm. Kết luận Đạt / Loại / Cân nhắc / Khác, refer, điểm trung bình, chống gửi trùng khi mất mạng, xem lại bài, đăng xuất (US5.3, US5.4, US5.8, US6.2, US6.3, US1.2).
  - U3 `cv-viewer`: xem CV chỉ đọc và nhật ký xem (US5.5).
  - U4 `ai-assist`: tóm tắt CV bằng AI, câu hỏi gợi ý, cờ bật/tắt (US5.6, US5.7, US7.4).
  - U5 `ui-experience`: giao diện chung (US8.1..US8.6: phông chữ, bố cục thích ứng, hai khung, sáng/tối, truy cập, khung xương).

  Ưu: U1 chạy được sớm để chứng minh backend Node.js, Oracle và app Flutter nối được với nhau; CV, AI và phần giao diện nâng cao tách thành Unit riêng nên dễ cắt khi thiếu thời gian. Nhược: nhiều Unit cùng sửa chung một backend và một app.
- B. **Bốn Unit theo nơi chạy**: `backend-api` (sáu khối backend), `interviewer-app` (Flutter), `cv-documents`, `ai-assist`. Ưu: khớp ranh giới mã. Nhược: không Unit nào tự chạy xuyên suốt được, nên không có walking skeleton đúng nghĩa.
- C. **Một Unit duy nhất** chứa tất cả. Ưu: đơn giản. Nhược: không có điểm kiểm tra skeleton và không cắt phạm vi theo Unit được.
- X. Other (please specify)

[Answer]: A

## Q2 — Cách triển khai (deployment)

- A. **Một tiến trình backend Node.js** chứa cả sáu khối backend (modular monolith, mỗi khối là một module có ranh giới rõ), **một app Flutter** build ra web và điện thoại, **một Oracle XE** chạy Docker local. Khớp ADR-007 (DataImport ghi qua các khối trong một giao dịch) và lịch 2 ngày (gợi ý).
- B. Mỗi khối backend là một dịch vụ riêng. Linh hoạt hơn khi mở rộng, nhưng phải xử lý giao dịch phân tán cho DataImport và tốn công hạ tầng nhiều hơn.
- X. Other (please specify)

[Answer]: A

## Q3 — Điểm cuối của walking skeleton

Thực hành của nhóm (`team.md`) mô tả skeleton đi tới "tổng hợp tối giản", nhưng tổng hợp điểm giữa nhiều người chấm đã bị cắt khỏi MVP 2 ngày.

- A. Skeleton dừng ở **hoàn thành đánh giá và lưu vào Oracle**: đăng nhập, chọn HĐPV, mở ứng viên, chấm điểm, hoàn thành, kiểm tra bản ghi trong DB. Không có tổng hợp (gợi ý).
- B. Thêm một màn tổng hợp tối giản vào skeleton như `team.md` mô tả (thêm phạm vi ngoài MVP).
- X. Other (please specify)

[Answer]: A

## Duyệt kế hoạch chia Unit

Kế hoạch theo Q1 = A, Q2 = A, Q3 = A:

| Unit | Thư mục | Loại (kind) | Phụ thuộc | Story |
|---|---|---|---|---|
| U1 | `u1-scoring-skeleton` | service | — | US7.1, US7.2, US7.3, US1.1, US2.1, US4.1, US5.1, US5.2, US6.1 |
| U2 | `u2-scoring-complete` | service | U1 | US5.3, US5.4, US5.8, US6.2, US6.3, US1.2 |
| U3 | `u3-cv-viewer` | service | U1 | US5.5 |
| U4 | `u4-ai-assist` | service | U3 | US5.6, US5.7, US7.4 |
| U5 | `u5-ui-experience` | ui | U1 | US8.1, US8.2, US8.3, US8.4, US8.5, US8.6 |

- U1..U4 dùng loại `service` vì mỗi Unit thêm API backend kèm màn hình; Construction sẽ làm đủ bộ thiết kế (chức năng, NFR, hạ tầng). U5 dùng loại `ui` vì chỉ là giao diện chung của app.
- Sau U1, ba Unit U2, U3, U5 không phụ thuộc nhau nên làm song song được; U4 cần U3.

- A. Approve Plan
- B. Revise Plan

[Answer]: A
