# Đơn vị công việc (Unit) — App thực hiện phỏng vấn

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/domain-design/components.md` — 7 khối, 14 thực thể
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/domain-design/decisions.md` — ADR-001..ADR-007
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/requirements-analysis/requirements.md` — FR-A0..FR-A10, NFR-6, NFR-8..NFR-12
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/user-stories/stories.md` — 25 story
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/units-generation/units-generation-questions.md` — Q1 = A, Q2 = A, Q3 = A, kế hoạch đã duyệt
- `aidlc/spaces/default/memory/team.md` — Walking Skeleton: dựng lát cắt mỏng xuyên suốt trước

## Mô hình triển khai chung (Q2 = A)

Tất cả Unit cùng đóng góp vào **ba thành phần chạy**:

| Thành phần chạy | Chứa | Ghi chú |
|---|---|---|
| Backend Node.js (một tiến trình) | Sáu khối backend: IdentityAccess, InterviewCatalog, Evaluation, CandidateDocuments, AiAssist, DataImport, mỗi khối là một module có ranh giới rõ | Modular monolith; các module gọi nhau trong tiến trình; DataImport chạy bằng lệnh dòng lệnh của cùng mã nguồn và dùng chung kết nối DB, nên giao dịch nạp dữ liệu (ADR-007) khả thi |
| App Flutter | InterviewerApp, build ra web (Flutter Web) và điện thoại | Gọi REST API của backend |
| Oracle Database XE | Dữ liệu của năm khối có thực thể | Chạy Docker local, DB riêng của app |

Không Unit nào là một tiến trình riêng. "Unit" ở đây là một lát cắt tính năng, thêm mã vào module backend và màn hình Flutter tương ứng.

## Danh sách Unit

| Unit ID | Thư mục (cũng là tên Unit trong khối yaml) | Mô tả ngắn | Loại (kind) | Độ phức tạp | Phụ thuộc |
|---|---|---|---|---|---|
| U1 | `u1-scoring-skeleton` | Walking skeleton luồng chấm điểm | service | L | — |
| U2 | `u2-scoring-complete` | Hoàn thiện luồng chấm điểm | service | M | U1 |
| U3 | `u3-cv-viewer` | Xem CV | service | M | U1 |
| U4 | `u4-ai-assist` | Tóm tắt CV bằng AI | service | L | U3 |
| U5 | `u5-ui-experience` | Giao diện chung | ui | M | U1 |

Độ phức tạp là ước lượng tương đối giữa các Unit (S / M / L / XL), không phải số giờ.

---

## U1 — scoring-skeleton (walking skeleton)

- **Mô tả:** Lát cắt mỏng nhất chạy xuyên suốt từ dữ liệu đến màn hình: nạp dữ liệu, đăng nhập, chọn HĐPV, mở danh sách ứng viên, chấm điểm từng tiêu chí, hoàn thành đánh giá và lưu vào Oracle (Q3 = A; không có tổng hợp).
- **Khối và thực thể chạm tới:**
  - IdentityAccess: UserAccount, đăng nhập, phát và kiểm tra JWT.
  - InterviewCatalog: Position, Candidate, Interviewer, InterviewPanel, PanelCandidate, PanelInterviewer; chính sách truy cập (được gán, BR-A1, BR-A2).
  - Evaluation: Criterion, InterviewEvaluation, EvaluationScore; hoàn thành đánh giá với khóa duy nhất và idempotencyKey.
  - DataImport: nạp tiêu chí, vị trí, CBQL, tài khoản, ứng viên, HĐPV, chi tiết.
  - InterviewerApp: S1 Đăng nhập, S2 Danh sách HĐPV, S3 Danh sách ứng viên, S4 Chấm điểm (điểm từng tiêu chí, nhận xét, hoàn thành).
- **Trách nhiệm:** Dựng khung backend Node.js, kết nối Oracle, schema của các khối trên, khung app Flutter, xác thực, luồng chấm điểm tối thiểu, script nạp dữ liệu và dữ liệu mẫu.
- **Story:** US7.1, US7.2, US7.3, US1.1, US2.1, US4.1, US5.1, US5.2, US6.1.
- **Ranh giới:** Trong U1, phiếu chấm chưa có kết luận, refer, điểm trung bình; phải có chỗ để U2 thêm vào mà không đổi luồng. Giao diện ở mức dùng được (bố cục một cột); phần giao diện chung nâng cao thuộc U5.
- **Ràng buộc và ghi chú:**
  - Là walking skeleton theo `team.md`: chứng minh backend Node.js, Oracle và app Flutter nối được với nhau trước khi làm sâu.
  - Phải kiểm được bằng một lệnh xác minh thật từ đầu đến cuối (chạy Oracle, nạp dữ liệu mẫu, đăng nhập, chấm và hoàn thành một ứng viên, kiểm tra bản ghi trong DB); lệnh cụ thể chốt ở Delivery Planning.
  - Quy tắc cứng: RBAC ở server, idempotency khi hoàn thành đánh giá, không ghi đè bài đã hoàn thành.
  - TDD: viết test trước cho chính sách truy cập, kiểm tra điểm, khóa duy nhất, idempotencyKey.
  - Tiêu chí kết luận bắt buộc (BR-A3) thuộc U2. Trong U1 API hoàn thành đánh giá chưa nhận `ketLuan`; U2 thêm vào và chuyển thành bắt buộc.

## U2 — scoring-complete

- **Mô tả:** Hoàn thiện luồng chấm điểm trên nền U1.
- **Khối chạm tới:** Evaluation (kết luận, refer, điểm trung bình, tóm tắt đánh giá theo HĐPV, xem lại bài), InterviewCatalog (vị trí hợp lệ để refer, vị trí hiện tại), IdentityAccess (đăng xuất phía client), InterviewerApp (khối Kết luận, khối Giới thiệu sang vị trí khác chỉ hiện khi `Khác`, khối Điểm trung bình, cột Điểm TB, S5 bài đã hoàn thành, gửi lại khi mất mạng, đăng xuất).
- **Story:** US5.3, US5.4, US5.8, US6.2, US6.3, US1.2.
- **Ràng buộc và ghi chú:**
  - BR-A3 (kết luận và refer chỉ là đề xuất), BR-A5 (điểm trung bình chỉ để tham khảo).
  - Công thức điểm trung bình theo ADR-003: đặc tả và bộ ví dụ test chung cho bản cài đặt Node.js và Dart.
  - Ghép trạng thái chấm vào danh sách ở app theo ADR-002.
  - Thêm `ketLuan` bắt buộc vào API hoàn thành đánh giá của U1; refer chỉ khi `KHAC`.

## U3 — cv-viewer

- **Mô tả:** Xem CV PDF chỉ đọc kèm nhật ký xem.
- **Khối chạm tới:** CandidateDocuments (CvDocument, CvViewLog, liên kết ngắn hạn, trích văn bản và cvHash), InterviewCatalog (kiểm quyền), DataImport (ghi `cvPath`), InterviewerApp (nút Xem CV, S6 trình xem CV, phóng to, chuyển trang).
- **Story:** US5.5.
- **Ràng buộc và ghi chú:**
  - Cần chọn gói xem PDF chạy được trên cả web và điện thoại (thiết kế kỹ thuật).
  - Cần kho tệp CV (thư mục trên máy chủ) và dữ liệu mẫu có tệp PDF.
  - Trích văn bản và cvHash làm sẵn ở U3 để U4 dùng.
  - Không có tải xuống, in, chia sẻ; nhật ký xem ghi trước khi trả nội dung.

## U4 — ai-assist

- **Mô tả:** Tóm tắt CV bằng AI, mục kinh nghiệm / trình độ / chứng chỉ có đoạn trích, làm nổi bật trong CV, câu hỏi gợi ý; tắt mặc định bằng cờ cấu hình.
- **Khối chạm tới:** AiAssist (CvAiSummary, AiCallLog), CandidateDocuments (văn bản CV, cvHash), InterviewCatalog (kiểm quyền), InterviewerApp (khung Tóm tắt AI, làm nổi bật trong CV).
- **Story:** US5.6, US5.7, US7.4.
- **Ràng buộc và ghi chú:**
  - BR-A4 và NFR-8: không chấm điểm, không tự điền phiếu; che dữ liệu cá nhân trước khi gửi; giới hạn số lần gọi; nhật ký gọi; khóa truy cập chỉ từ biến môi trường.
  - Phụ thuộc quyết định nhà cung cấp AI, Legal và Security (OQ-AI-1..4); khi chưa có quyết định, chỉ dựng được với cờ tắt hoặc nhà cung cấp giả lập để test.
  - Làm nổi bật đoạn trích phụ thuộc gói xem PDF của U3 có hỗ trợ tọa độ chữ.

## U5 — ui-experience

- **Mô tả:** Giao diện chung của app trên mọi màn hình.
- **Khối chạm tới:** InterviewerApp.
- **Story:** US8.1, US8.2, US8.3, US8.4, US8.5, US8.6.
- **Ràng buộc và ghi chú:**
  - Phông sans-serif đóng gói (gợi ý Roboto), ba điểm ngắt, hai khung trên máy tính, sáng / tối, WCAG 2.1 AA cơ bản, khung xương, giảm chuyển động.
  - Áp dụng lên các màn hình của U1; màn hình của U2, U3, U4 làm sau U5 thì dùng ngay chủ đề chung, làm trước thì cần chỉnh lại.
  - Không thêm API backend.

## Assumptions & Open Questions

- **[assumption]** Các Unit chia theo lát cắt tính năng nên nhiều Unit sửa chung mã backend và app; ranh giới module theo `components.md` giảm xung đột khi làm song song.
- **[assumption]** U1 chưa bắt buộc kết luận; điều này tách skeleton khỏi BR-A3 để skeleton nhỏ nhất. Khi U2 xong, API hoàn thành đánh giá bắt buộc kết luận như FR-A6.
- **[assumption]** Độ phức tạp S / M / L / XL là tương đối; ước lượng thời gian và đường cắt phạm vi thuộc Delivery Planning.
- **Open question:** Nhà cung cấp AI, gói xem PDF và nơi đặt kho tệp CV chưa chọn; ảnh hưởng U3 và U4, không ảnh hưởng U1, U2, U5.
