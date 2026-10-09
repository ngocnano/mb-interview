# Câu hỏi — Contract Design

> Stage này chốt các "hợp đồng" giữa các phần của hệ thống: dữ liệu nào đi qua, theo dạng nào, lỗi trả về ra sao. Có hai loại ranh giới: giữa app Flutter và backend (API HTTP), và giữa các module trong backend.
> Trả lời vào tag `[Answer]:`, hoặc "A hết" nếu đồng ý gợi ý.

## Q1 — Kiểu API giữa app Flutter và backend

- A. **REST / JSON qua HTTPS**, tiền tố `/api/v1`, mô tả bằng OpenAPI 3; xác thực bằng header `Authorization: Bearer <JWT>`; mọi lỗi trả `{ code, message }` với `message` tiếng Việt; mã HTTP theo quy ước đã có (`400`, `401`, `403`, `404`, `409`, `422`, `429`, `5xx`) (gợi ý)
- B. GraphQL một điểm vào
- X. Other (please specify)

[Answer]: A

## Q2 — Hợp đồng giữa các module trong backend

Sáu module chạy chung một tiến trình Node.js (Units Generation, Q2 = A).

- A. **Gọi hàm trong tiến trình qua interface TypeScript** do module cung cấp định nghĩa (ví dụ `InterviewCatalog.canOpenForScoring(...)`); module khác không đọc bảng của nhau. Mô tả bằng khối shared-schema (gợi ý)
- B. Mỗi module gọi nhau qua HTTP nội bộ như các dịch vụ riêng
- X. Other (please specify)

[Answer]: A

## Q3 — Thay đổi hợp đồng, thời gian chờ và thử lại

- A. **Mặc định đơn giản** (gợi ý):
  - Trong `v1` chỉ thêm trường hoặc thêm API (client bỏ qua trường lạ); thay đổi phá vỡ thì sang `v2`. Trước lần phát hành đầu tiên được sửa tự do nếu cả app và backend cùng đổi trong một đợt.
  - App chờ tối đa 10 giây cho mỗi request, riêng tạo tóm tắt AI chờ tối đa 25 giây.
  - App chỉ tự thử lại các request đọc dữ liệu (tối đa 2 lần). Hoàn thành đánh giá chỉ gửi lại khi người dùng bấm Thử lại, luôn với cùng `idempotencyKey`.
- B. Áp dụng phiên bản ngay từ đầu, không sửa tự do trước phát hành
- X. Other (please specify)

[Answer]: A
