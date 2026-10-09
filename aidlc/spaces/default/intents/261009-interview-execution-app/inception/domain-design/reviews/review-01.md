**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho Domain Design: `components.md`, `decisions.md`, `traceability.json`, đối chiếu với `requirements.md`, `stories.md` và các câu trả lời Q1..Q3.

Nhận định: danh mục gồm 7 khối (6 backend và ứng dụng Flutter), 14 thực thể. Kiểm tra tự động bằng script cho thấy danh mục hợp lệ: tên khối không trùng, phụ thuộc khai báo hai chiều, không có vòng phụ thuộc, mỗi thực thể có đúng một khối sở hữu và có định danh, mọi tham chiếu trỏ tới thực thể đã khai báo. 25 story đều có trong bảng truy vết, và mọi đích truy vết là khối hoặc thực thể có thật. Hạ tầng (Oracle, kho tệp, nhà cung cấp AI) nằm đúng ở phụ thuộc bên ngoài, không bị coi là khối. Bảy ADR đều có Context, Decision, Consequences, Alternatives Rejected theo quy định của giai đoạn Inception. Các quy tắc cứng đã khẳng định (RBAC ở server, idempotency, HR chốt kết luận) được đặt vào khối cụ thể: chính sách truy cập ở InterviewCatalog (ADR-004), chống gửi trùng ở Evaluation, AI không chấm điểm (BR-A4 trong AiAssist).

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | decisions.md ADR-007, components.md DataImport | Giao dịch nạp dữ liệu trải qua bốn khối giả định các khối chạy chung một tiến trình và chung kết nối DB; đây là quyết định triển khai thuộc Units Generation | Units Generation xác nhận chạy chung tiến trình, hoặc chọn cách nạp khác (theo từng khối, có thể chạy lại) | New |
| R-02 | Medium | components.md InterviewCatalog | InterviewCatalog có năm khối gọi tới (gọi kiểm quyền); giao diện truy vấn chính sách là điểm hỏng chung và cần ổn định | Contract Design định nghĩa rõ các truy vấn chính sách (được mở, được hoàn thành, vị trí hiện tại, vị trí hợp lệ) và mã lỗi | New |
| R-03 | Medium | decisions.md ADR-002 | App ghép dữ liệu từ hai API nên số đếm "đã chấm / tổng" có thể lệch tạm thời; logic ghép nằm ở client cần test | Viết test ghép ở app; chấp nhận độ lệch tạm thời cho MVP | New |
| R-04 | Medium | decisions.md ADR-003 | Hai bản cài đặt công thức điểm trung bình (Dart và Node.js) có thể lệch ở quy tắc làm tròn | Bộ ví dụ test chung là bắt buộc ở cả hai phía; nêu rõ kiểu số dùng khi lưu (thập phân, không dùng số thực) ở Functional Design | New |
| R-05 | Low | components.md CandidateDocuments | Thực thể Candidate có các thuộc tính nhạy cảm (sdt, ngaySinh, gioiTinh) dù không hiển thị; lưu chúng là quyết định dữ liệu | Functional Design và NFR xác nhận có cần lưu các trường này không (tối thiểu hóa dữ liệu) | New |
| R-06 | Low | components.md AiAssist | Kết quả AI được khóa theo maUngVien + cvHash + promptVersion, không gắn với người yêu cầu; người phỏng vấn khác cùng HĐPV sẽ thấy kết quả đã lưu | Xác nhận ở Functional Design rằng chia sẻ kết quả giữa người phỏng vấn cùng quyền là chấp nhận được (liên quan OQ-AI-4) | New |
| R-07 | Low | components.md | Gói xem PDF và nhà cung cấp AI chưa chọn | Chọn ở thiết kế kỹ thuật; không đổi ranh giới khối | New |

### Suggestions

- Ở Units Generation, cân nhắc một đơn vị triển khai backend duy nhất (Node.js) chứa sáu khối backend, cộng một đơn vị ứng dụng Flutter; cách này khớp ADR-007 và lịch 2 ngày.
