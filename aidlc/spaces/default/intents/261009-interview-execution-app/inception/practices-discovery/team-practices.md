# Thực hành của nhóm

> Bộ thực hành đã được khẳng định qua phỏng vấn cho stage Practices Discovery.
> Dự án greenfield; các giá trị dưới đây là lựa chọn đã chốt với người dùng.

## Sources

- `aidlc/spaces/default/memory/org.md` (mặc định khung làm gợi ý)
- `D:\Kiro\phase-2-app-phong-van.md` (mô tả sản phẩm Phase 2 — app thực hiện phỏng vấn)
- `practices-discovery-questions.md` (câu trả lời phỏng vấn đã khẳng định)

## Way of Working

Phát triển theo trunk-based: mọi thay đổi hợp nhất vào `main` qua các nhánh
feature ngắn (1–2 ngày). Squash-merge mỗi nhánh thành một commit trên trunk.
Nếu cần nhiều môi trường, vẫn giữ một trunk và kiểm soát phát hành bằng tag hoặc
cấu hình triển khai theo môi trường, không dùng nhánh release dài hạn.

## Walking Skeleton

Dựng một lát cắt mỏng chạy xuyên suốt (walking skeleton) trước khi làm tính năng
đầy đủ. Với domain nhiều luồng và tích hợp của app phỏng vấn, skeleton đi từ
"nhận đầu vào Phase 1 → hiển thị phiên → chấm nháp → submit đánh giá → tổng hợp
tối giản" là lát cắt chứng minh các mảnh ghép (backend Node.js + client Flutter)
kết nối được trước khi làm sâu từng tính năng.

## Testing Posture

- **Methodology**: tdd
- **Methodology evidence**: Nhóm khẳng định viết test trước, rồi mới hiện thực
  (phỏng vấn Q3 = B). Domain có nhiều business rule trọng yếu (Definition of
  Ready, blind scoring, idempotency submit, không gửi kết quả trước HR duyệt)
  nên dẫn dắt bằng test giúp khóa hành vi đúng ngay từ đầu.
- **Ordering**: Viết test thất bại cho hành vi mong muốn trước, hiện thực mã tối
  thiểu để test xanh, rồi refactor — cho từng lớp có thể kiểm thử.
- Sàn coverage: 80% dòng lệnh và chạy CI trước khi merge (scope classic).
- Áp dụng cho cả backend (Node.js) và frontend (Flutter); các business rule
  trọng yếu phải có test tương ứng.

## Deployment

Phát hành thủ công theo đợt/lịch (phỏng vấn Q4 = C): các thay đổi được gom lại
và phát hành theo đợt do người phụ trách kích hoạt, không tự động deploy mỗi
commit. Mỗi đợt phát hành cần bước xác nhận trước khi đưa lên môi trường đích.

## Code Style

Theo cấu hình ở cấp dự án (phỏng vấn Q5 = A):
- Backend Node.js: ESLint + Prettier; frontend Flutter: `dart format` +
  `flutter analyze` (linter theo `analysis_options.yaml`).
- Linter/formatter chạy trong CI trước khi merge; lỗi lint chặn PR.
- Quy ước đặt tên theo idiom từng ngôn ngữ (camelCase cho JS/TS, lowerCamelCase
  cho Dart).

## Tech Stack

- **Backend**: Node.js
- **Frontend**: Flutter

(Chi tiết framework/thư viện/DB sẽ được chốt ở stage thiết kế.)
