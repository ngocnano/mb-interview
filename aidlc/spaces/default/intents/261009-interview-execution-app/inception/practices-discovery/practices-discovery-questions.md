# Phỏng vấn — Thực hành của nhóm

> Trả lời bằng cách điền vào tag `[Answer]:` dưới mỗi câu (chọn chữ cái, hoặc dùng `X. Other` để tự ghi).
> Bạn có thể trả lời theo 3 cách: (1) hướng dẫn từng bước ở đây, (2) tự sửa trực tiếp file này, (3) trả lời tự do trong chat. Cả ba đều quy về file này.

## Q1 — Cách làm việc & hợp nhất mã (Way of Working)

Nhóm bạn hợp nhất mã vào nhánh chính như thế nào?

- A. Trunk-based: nhánh feature ngắn (1–2 ngày), squash-merge vào `main` (gợi ý mặc định)
- B. GitHub Flow: nhánh feature sống vài ngày, merge qua pull request
- C. Gitflow: có nhánh develop/release/hotfix riêng
- X. Other (please specify)

[Answer]: A

## Q2 — Dựng lát cắt mỏng xuyên suốt trước? (Walking Skeleton)

Có nên dựng một "walking skeleton" trước không? Walking skeleton là một phiên bản tối giản chạy xuyên suốt toàn bộ luồng, dựng đầu tiên để chứng minh các mảnh ghép kết nối được, trước khi làm tính năng thật.

- A. Có — dựng skeleton đi xuyên luồng (nhận đầu vào → phiên → chấm → submit → tổng hợp) trước (gợi ý mặc định)
- B. Không — bỏ qua skeleton, làm thẳng theo kế hoạch
- X. Other (please specify)

[Answer]: A

## Q3 — Cách viết kiểm thử (Testing Posture)

Nhóm viết test theo cách nào?

- A. Test-after: hiện thực trước, viết test sau cho từng lớp; sàn 80% coverage, chạy CI trước merge (gợi ý mặc định)
- B. TDD: viết test trước, rồi mới hiện thực
- C. BDD: viết kịch bản hành vi (Given/When/Then) trước, dẫn dắt code
- D. Kết hợp (ví dụ BDD cho luồng nghiệp vụ + unit test sau cho lớp thấp)
- X. Other (please specify)

[Answer]: B

## Q4 — Triển khai (Deployment)

Phần mềm được đưa lên môi trường như thế nào?

- A. Deploy khi merge lên staging; production có cổng phê duyệt thủ công riêng (gợi ý mặc định)
- B. Continuous deployment: mỗi commit tự động lên production
- C. Phát hành thủ công theo đợt/lịch
- X. Other (please specify)

[Answer]: C

## Q5 — Quy ước mã nguồn (Code Style)

Quy ước định dạng và lint như thế nào?

- A. Theo chuẩn ngôn ngữ: formatter + linter chạy trong CI, lỗi lint chặn PR; đặt tên theo idiom ngôn ngữ (gợi ý mặc định)
- B. Có bộ quy ước riêng của nhóm vượt ngoài linter (vui lòng ghi rõ ở Other)
- X. Other (please specify)

[Answer]: A

## Q6 — Tech stack (tùy chọn, giúp chốt linter/formatter cụ thể)

Dự án dự kiến dùng ngôn ngữ/framework nào? (Nếu chưa quyết, để trống và sẽ chốt ở stage sau.)

- A. Chưa quyết — chốt sau ở stage thiết kế
- X. Other (please specify) — ví dụ: "Backend Node.js/TypeScript + NestJS, Frontend React, DB PostgreSQL"

[Answer]: X. Backend Node.js, Frontend Flutter
