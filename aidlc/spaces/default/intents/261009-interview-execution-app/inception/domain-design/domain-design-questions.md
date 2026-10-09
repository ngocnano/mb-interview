# Câu hỏi — Domain Design

> Domain Design chỉ xác định các khối logic (đoạn mã sẽ viết), không quyết định triển khai hay công nghệ. Cách gom khối thành đơn vị triển khai để stage Units Generation quyết định.
> Có 3 quyết định cần bạn chọn; mỗi câu có gợi ý mặc định. Trả lời "A hết" nếu đồng ý.

## Q1 — Cách chia các khối của backend

Backend (Node.js) có các nhóm việc: đăng nhập, dữ liệu hội đồng / ứng viên / vị trí, chấm điểm và đánh giá, xem CV, AI, nạp dữ liệu.

- A. **Sáu khối backend tách theo quyền sở hữu dữ liệu**: `IdentityAccess` (tài khoản, đăng nhập), `InterviewCatalog` (hội đồng, ứng viên, vị trí, người phỏng vấn, chính sách truy cập), `Evaluation` (tiêu chí, đánh giá, điểm, điểm trung bình), `CandidateDocuments` (CV, nhật ký xem), `AiAssist` (tóm tắt AI, nhật ký gọi AI), `DataImport` (nạp dữ liệu). Mỗi thực thể có đúng một khối sở hữu. Ưu: ranh giới rõ, tính năng tùy chọn (AI, CV) tách riêng nên tắt hoặc hoãn không ảnh hưởng lõi chấm điểm; dễ gom lại thành một đơn vị triển khai. Nhược: nhiều khối hơn cần quản lý. Dễ đảo ngược: gom lại ở Units Generation. *(gợi ý)*
- B. **Ba khối gộp**: `InterviewCore` (đăng nhập + dữ liệu + chấm điểm), `CandidateDocumentsAndAi` (CV + AI), `DataImport`. Ưu: ít khối, nhanh hơn khi dựng. Nhược: khối lõi lớn, lẫn nhiều lý do thay đổi, tính năng AI gắn với CV.
- X. Other (please specify)

[Answer]: A
## Q2 — Ai ghép "đã chấm / điểm trung bình" vào danh sách ứng viên

Danh sách ứng viên cần dữ liệu từ hai khối: ứng viên và lịch (từ `InterviewCatalog`), trạng thái chấm và điểm trung bình của tôi (từ `Evaluation`). `Evaluation` đã phải gọi `InterviewCatalog` để kiểm tra quyền, nên nếu `InterviewCatalog` lại gọi `Evaluation` sẽ tạo vòng phụ thuộc.

- A. **App Flutter tự ghép**: app gọi `InterviewCatalog` lấy danh sách và gọi `Evaluation` lấy tóm tắt đánh giá của tôi theo HĐPV, rồi ghép theo mã ứng viên. Ưu: không thêm khối, không vòng phụ thuộc. Nhược: app gọi hai API mỗi lần mở danh sách; logic ghép nằm ở client. *(gợi ý, ít việc nhất)*
- B. **Thêm khối `InterviewWorkspace` phía server** chuyên ghép dữ liệu cho màn hình (đọc từ hai khối). Ưu: một lệnh gọi, app mỏng hơn. Nhược: thêm một khối và một API cần giữ đồng bộ.
- X. Other (please specify)

[Answer]: A
## Q3 — Công thức điểm trung bình dùng ở đâu

Điểm trung bình hiển thị ngay trên app (xem trước) và được server tính lại khi hoàn thành đánh giá.

- A. **Viết một đặc tả công thức và test chung; app và server mỗi bên cài một hàm thuần giống nhau**, server là nguồn chính thức. Ưu: app tính ngay không cần mạng; test chung giữ hai bên khớp. Nhược: hai bản cài đặt cần giữ đồng bộ. *(gợi ý)*
- B. App luôn hỏi server tính (một API xem trước điểm trung bình). Ưu: một công thức duy nhất. Nhược: mỗi lần chọn điểm gọi mạng, chậm và hỏng khi mất mạng.
- X. Other (please specify)

[Answer]: A