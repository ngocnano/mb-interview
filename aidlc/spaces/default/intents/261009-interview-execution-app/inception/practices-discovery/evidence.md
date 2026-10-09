# Bằng chứng

## Sources

- `aidlc/spaces/default/memory/org.md`
- `D:\Kiro\phase-2-app-phong-van.md`
- `practices-discovery-questions.md` (câu trả lời phỏng vấn)
- Workspace `D:\Kiro` (greenfield: chưa có mã nguồn, git history, hay cấu hình CI/CD)

## Những gì lead đã xem xét / suy luận

- **Loại dự án**: Greenfield — workspace trống, không có artifact reverse-engineering,
  không có cấu hình build/CI để suy ra thực hành hiện có.
- **Way of Working / Code Style**: suy từ mặc định khung trong `org.md`, người dùng
  khẳng định giữ nguyên (trunk-based; linter/formatter theo ngôn ngữ trong CI).
- **Testing Posture**: domain nhiều business rule (mục 11.1 của mô tả) nên test là
  deliverable hạng nhất.
- **Walking Skeleton**: mô tả sản phẩm có luồng end-to-end rõ ràng (mục 5.1), phù hợp
  dựng skeleton mỏng xuyên suốt trước.

## Quyết định phỏng vấn

- Q1 Way of Working = A: Trunk-based, nhánh ngắn, squash-merge vào `main`.
- Q2 Walking Skeleton = A: Có — dựng skeleton xuyên luồng trước.
- Q3 Testing Posture = B: TDD — viết test trước, rồi hiện thực.
- Q4 Deployment = C: Phát hành thủ công theo đợt/lịch (không CD tự động).
- Q5 Code Style = A: Theo chuẩn ngôn ngữ; linter/formatter trong CI, lỗi lint chặn PR.
- Q6 Tech Stack = X: Backend Node.js, Frontend Flutter.

## Điểm chưa chắc chắn

- Framework backend cụ thể (Express/NestJS/Fastify...), DB và hạ tầng chưa chốt →
  sẽ quyết ở stage thiết kế.
- Chi tiết quy trình "phát hành theo đợt" (tần suất, người duyệt, môi trường đích)
  cần làm rõ ở stage vận hành/triển khai.
