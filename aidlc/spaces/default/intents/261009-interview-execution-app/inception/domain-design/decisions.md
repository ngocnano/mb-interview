# Nhật ký quyết định kiến trúc (ADR) — Domain Design

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/domain-design/domain-design-questions.md` — Q1 = A, Q2 = A, Q3 = A
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/requirements-analysis/requirements.md`
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/user-stories/stories.md`
- `aidlc/spaces/default/memory/project.md` — quy tắc cứng (RBAC ở server, idempotency, audit, HR chốt kết luận)

## ADR-001: Sáu khối backend tách theo quyền sở hữu dữ liệu, cộng ứng dụng Flutter

- **Context** — Backend có nhiều nhóm việc với tốc độ thay đổi và mức ưu tiên khác nhau: đăng nhập, dữ liệu hội đồng, chấm điểm (Must Have), CV (Should Have), AI (Could Have, tắt mặc định, chờ Legal), nạp dữ liệu. Phạm vi 2 ngày có rủi ro cao nên cần cắt được phần tùy chọn mà không đụng lõi.
- **Decision** — Sáu khối backend: IdentityAccess, InterviewCatalog, Evaluation, CandidateDocuments, AiAssist, DataImport; cộng khối client InterviewerApp. Mỗi thực thể có đúng một khối sở hữu (Q1 = A).
- **Consequences** — Ranh giới rõ, kiểm thử theo khối dễ (khớp TDD); CV và AI có thể hoãn bằng cách không dựng khối đó. Đổi lại có nhiều khối hơn, nhiều giao diện nội bộ hơn cần định nghĩa ở Contract Design.
- **Alternatives Rejected** — Ba khối gộp (`InterviewCore`, `CandidateDocumentsAndAi`, `DataImport`): ít khối nhưng khối lõi lớn, gắn AI với CV, khó hoãn riêng phần tùy chọn.

## ADR-002: App Flutter tự ghép trạng thái chấm vào danh sách ứng viên

- **Context** — Danh sách ứng viên (US4.1) và danh sách HĐPV (US2.1) cần dữ liệu từ InterviewCatalog (ứng viên, lịch) và Evaluation (đã chấm, điểm trung bình, kết luận). Evaluation đã phụ thuộc InterviewCatalog để kiểm quyền; nếu InterviewCatalog gọi ngược Evaluation sẽ tạo vòng phụ thuộc.
- **Decision** — InterviewerApp gọi InterviewCatalog lấy danh sách và gọi Evaluation lấy tóm tắt đánh giá của tôi theo HĐPV, rồi ghép theo mã ứng viên (Q2 = A). Evaluation cung cấp tóm tắt theo HĐPV, chỉ của người gọi.
- **Consequences** — Không vòng phụ thuộc, không thêm khối. App gọi hai API mỗi lần mở danh sách; logic ghép và số đếm "đã chấm / tổng" ở client nên cần test ở app. Số đếm có thể lệch một lúc nếu dữ liệu đổi giữa hai lệnh gọi; chấp nhận cho MVP.
- **Alternatives Rejected** — Thêm khối `InterviewWorkspace` phía server ghép sẵn: một lệnh gọi nhưng thêm một khối và một API cần đồng bộ. InterviewCatalog gọi Evaluation: tạo vòng phụ thuộc.

## ADR-003: Công thức điểm trung bình dùng chung, server là nguồn chính thức

- **Context** — Điểm trung bình cần hiện ngay khi chọn điểm (US5.8), kể cả khi mạng chập chờn, và phải được lưu đúng khi hoàn thành đánh giá, không tin giá trị client (FR-A6).
- **Decision** — Evaluation giữ đặc tả công thức (trung bình cộng các điểm đã chọn, quy về thang 5, lưu 2 chữ số thập phân, hiển thị 1 chữ số) và một bộ ví dụ test chung. InterviewerApp và Evaluation mỗi bên cài một hàm thuần theo đặc tả và cùng chạy bộ ví dụ đó; server tự tính khi hoàn thành và bỏ qua giá trị client gửi (Q3 = A).
- **Consequences** — App tính ngay không cần mạng; con số trên app có thể lệch rất nhỏ với server ở quy tắc làm tròn nếu hai bản cài đặt khác nhau, nên bộ ví dụ test chung là bắt buộc. Có hai bản cài đặt cần giữ khớp.
- **Alternatives Rejected** — App hỏi server tính mỗi lần chọn điểm: một công thức nhưng chậm và hỏng khi mất mạng.

## ADR-004: Chính sách truy cập đặt duy nhất ở InterviewCatalog

- **Context** — BR-A1 (chỉ ứng viên Xác nhận = Y), BR-A2 (chỉ HĐPV Inprogress, cho hoàn thành khi Completed) và quy tắc "chỉ HĐPV được gán" phải áp dụng giống nhau ở danh sách, chấm điểm, hoàn thành, xem CV và AI. Quy tắc cứng yêu cầu RBAC ở server.
- **Decision** — InterviewCatalog là nơi duy nhất quyết định quyền truy cập và cung cấp truy vấn chính sách cho Evaluation, CandidateDocuments, AiAssist. Các khối đó không tự đọc bảng của InterviewCatalog.
- **Consequences** — Một chỗ để sửa và kiểm thử các quy tắc truy cập; mã lỗi `403` / `404` nhất quán. InterviewCatalog trở thành phụ thuộc của nhiều khối, nên giao diện chính sách phải ổn định (định nghĩa ở Contract Design).
- **Alternatives Rejected** — Mỗi khối tự kiểm tra bằng cách đọc bảng HĐPV và chi tiết: lặp logic, dễ lệch quy tắc giữa các màn hình.

## ADR-005: CV thuộc CandidateDocuments, không thuộc Candidate

- **Context** — Requirements đặt `cvPath` là một cột của nhóm Ứng viên khi nạp dữ liệu. CV có quy tắc riêng (liên kết ngắn hạn, nhật ký xem, kho tệp) và là story Should Have.
- **Decision** — Thực thể CvDocument (đường dẫn, cvHash, có lớp chữ) do CandidateDocuments sở hữu, tham chiếu Candidate. DataImport đọc `cvPath` từ dòng ứng viên và ghi qua CandidateDocuments.
- **Consequences** — Hoãn tính năng CV không ảnh hưởng InterviewCatalog; cvHash dùng được cho AiAssist. Tệp nạp vẫn giữ `cvPath` trên dòng ứng viên như requirements nên không đổi định dạng nạp.
- **Alternatives Rejected** — Để `cvPath` trên Candidate trong InterviewCatalog: trộn dữ liệu nhạy cảm và quy tắc xem CV vào khối dữ liệu hội đồng.

## ADR-006: AiAssist là khối riêng, lấy dữ liệu CV qua CandidateDocuments

- **Context** — Tính năng AI tắt mặc định, phụ thuộc nhà cung cấp chưa chọn và quyết định Legal / Security (OQ-AI-1..4), mâu thuẫn với mục 11.2 của tài liệu nguồn. Cần đảm bảo không có đường nào gửi CV ra ngoài khi tắt.
- **Decision** — AiAssist sở hữu kết quả và nhật ký gọi AI, kiểm cờ bật/tắt trước mọi việc, lấy văn bản CV và cvHash qua CandidateDocuments (không đọc kho tệp trực tiếp), kiểm quyền qua InterviewCatalog. Nhà cung cấp là phụ thuộc bên ngoài thay được.
- **Consequences** — Một cổng duy nhất ra nhà cung cấp AI, dễ kiểm tra việc che dữ liệu và nhật ký. Hoãn hoặc bỏ AI không ảnh hưởng khối khác. Thêm một chuỗi phụ thuộc AiAssist → CandidateDocuments → InterviewCatalog.
- **Alternatives Rejected** — Gộp AI vào CandidateDocuments: khối CV phải biết nhà cung cấp AI và cờ AI, khó hoãn riêng.

## ADR-007: DataImport ghi dữ liệu qua khối sở hữu, không ghi thẳng bảng

- **Context** — DataImport nạp dữ liệu cho bốn khối. Nếu ghi thẳng vào bảng thì phá quyền sở hữu thực thể và lặp quy tắc kiểm tra (ví dụ băm mật khẩu, kiểm thang tiêu chí).
- **Decision** — DataImport không sở hữu thực thể, chỉ điều phối: kiểm tra định dạng tệp rồi gọi thao tác ghi của IdentityAccess, InterviewCatalog, Evaluation, CandidateDocuments. Toàn bộ chạy trong một giao dịch; chạy lại không nhân đôi.
- **Consequences** — Quy tắc dữ liệu nằm ở khối sở hữu, DataImport mỏng. Giao dịch trải qua nhiều khối đòi hỏi các khối dùng chung kết nối DB khi chạy cùng tiến trình; nếu sau này tách triển khai thì phải xem lại (Units Generation).
- **Alternatives Rejected** — Script ghi thẳng SQL vào mọi bảng: nhanh viết nhưng lặp quy tắc và phá ranh giới sở hữu.

## Assumptions & Open Questions

- **[assumption]** Các khối backend chạy chung một tiến trình trong MVP để giao dịch của DataImport (ADR-007) khả thi; quyết định chính thức ở Units Generation.
- **Open question:** Nhà cung cấp AI và gói xem PDF chưa chọn; không đổi các ADR trên.
