# Yêu cầu — App thực hiện phỏng vấn (Phase 2)

> Lead: product-agent. Nguồn gốc: mô tả sản phẩm `D:\Kiro\phase-2-app-phong-van.md`.
> Mỗi yêu cầu có ID ổn định và tiêu chí pass/fail để kiểm thử (phù hợp TDD).
> Giả định được đánh dấu rõ; câu hỏi mở nằm ở `## Assumptions & Open Questions`.

## Sources

- `D:\Kiro\phase-2-app-phong-van.md` — mô tả sản phẩm Phase 2 (mục 1–16)
- `aidlc/spaces/default/memory/team.md` — thực hành nhóm đã khẳng định (TDD, trunk-based, Node.js + Flutter)
- `aidlc/spaces/default/memory/project.md` — quy tắc cứng (HR duyệt trước khi gửi, audit, idempotency, RBAC server-side)

## Phạm vi (tóm tắt)

Trong phạm vi: nhận bàn giao HĐPV đủ điều kiện từ Phase 1; hiển thị lịch/agenda/hồ sơ theo quyền; scorecard + chấm điểm + autosave + hoàn thành đánh giá/lock; theo dõi hoàn thành + nhắc/escalation; tổng hợp + cờ chênh lệch; HR review + chốt; preview/duyệt/gửi kết quả; xử lý ngoại lệ; audit.

Ngoài phạm vi: tạo HĐPV/gán thành viên ban đầu (Phase 1); job posting/screening; offer/onboarding/background check; thay thế nền tảng video; tự động ra quyết định không có HR review.

## Actor

- **AC-1 Recruiter/HR** — điều phối, review, chốt kết quả, duyệt/gửi thông báo.
- **AC-2 Chủ tịch HĐPV** — điều hành phiên, quyền thành viên, theo dõi hoàn thành, đề nghị calibration.
- **AC-3 Thành viên HĐPV** — phỏng vấn, chấm điểm độc lập theo tiêu chí được giao.
- **AC-4 CBQL không thuộc HĐPV** — xem/tham gia theo phạm vi được cấp; không chấm điểm.
- **AC-5 Ứng viên** — xem lịch/hướng dẫn, check-in (tùy chọn), nhận kết quả sau khi HR duyệt.
- **AC-6 Hệ thống** — kiểm tra điều kiện, autosave, khóa phiên bản, nhắc/escalation, tổng hợp, audit, gửi thông báo.

## Functional Requirements

### Nhận bàn giao & Definition of Ready

- **FR-1 Tiếp nhận hồ sơ từ Phase 1.** Hệ thống nhận hồ sơ HĐPV (mã HĐPV, vị trí, vòng, đơn vị, danh sách ứng viên, thành viên, lịch, scorecard, deadline) từ Phase 1.
  - Pass/fail: khi nhận payload hợp lệ, hệ thống tạo bản ghi phiên và chuyển trạng thái về `Sẵn sàng phỏng vấn` nếu đạt Definition of Ready; nếu không, chuyển `Chờ bổ sung đầu vào` kèm danh sách lỗi có nguyên nhân.
- **FR-2 Kiểm tra Definition of Ready.** Hệ thống chỉ cho phiên `Sẵn sàng phỏng vấn` khi đồng thời: (1) lịch đã xác nhận, chưa hủy/hoãn, thời gian/múi giờ không mâu thuẫn; (2) ứng viên + người tham gia bắt buộc đã chấp nhận; (3) đủ số thành viên hợp lệ tối thiểu + Chủ tịch nếu yêu cầu; (4) scorecard đã gắn và đóng phiên bản; (5) hồ sơ ứng viên sẵn sàng và quyền đã tính; (6) deadline + tuyến nhắc + HR phụ trách đã xác định; (7) không có lỗi tích hợp chặn truy cập.
  - Pass/fail: thiếu bất kỳ điều kiện nào → trạng thái `Chờ bổ sung đầu vào`, không tự suy đoán thành viên/lịch/tiêu chí.
- **FR-3 Đóng phiên bản scorecard.** Khi vào Phase 2, scorecard dùng cho phiên được đóng phiên bản; thay đổi cấu hình về sau không làm đổi kết quả đã tính.

### Hiển thị lịch, agenda, hồ sơ theo quyền

- **FR-4 Trang Lịch/Agenda của người phỏng vấn.** Thành viên hợp lệ xem danh sách phiên theo ngày/tuần, múi giờ rõ, bộ lọc vị trí/vòng/trạng thái; mỗi card có thời gian, ứng viên, vai trò, hình thức, trạng thái tham dự, hạn chấm, và CTA theo ngữ cảnh.
  - Pass/fail: thành viên hợp lệ thấy đúng phiên của mình; người không thuộc HĐPV hoặc đã bị thu hồi quyền truy cập deep link bị từ chối và ghi audit.
- **FR-5 Workspace phỏng vấn.** Hiển thị header phiên (thời gian/thời lượng/link họp/địa điểm/trạng thái kết nối), hồ sơ ứng viên theo tab và theo RBAC (che thông tin nhạy cảm), agenda/câu hỏi gợi ý và tiêu chí được giao.
  - Pass/fail: trường nằm ngoài phạm vi quyền của người dùng không được render và không trả về từ API.
- **FR-6 RBAC server-side.** Mọi truy cập hồ sơ/scorecard/nhận xét được kiểm tra quyền ở server theo least privilege, kết hợp phạm vi tổ chức, HĐPV, ứng viên và trạng thái hồ sơ.
  - Pass/fail: request thiếu quyền bị từ chối ở server kể cả khi client gửi trực tiếp; ghi audit.

### Chấm điểm, nháp, hoàn thành đánh giá

- **FR-7 Scorecard & chấm điểm.** Thành viên chấm theo thang điểm có anchor, trọng số, trường bắt buộc, lựa chọn N/A kèm lý do; ghi nhận xét theo tiêu chí hoặc chung.
  - Pass/fail: N/A không có lý do bị chặn; tiêu chí bắt buộc còn trống bị đánh dấu.
- **FR-8 Autosave nháp.** App autosave nháp với chỉ báo trạng thái `Đang lưu/Đã lưu/Lưu thất bại`.
  - Pass/fail: nhập điểm/nhận xét → nháp được lưu; mất kết nối → cảnh báo rõ dữ liệu chưa đồng bộ, không báo "đã lưu" khi server chưa xác nhận.
- **FR-9 Màn hình rà soát trước khi hoàn thành đánh giá.** Trước khi hoàn thành đánh giá, hệ thống liệt kê tiêu chí thiếu, N/A thiếu lý do, nhận xét bắt buộc, khuyến nghị tổng thể.
  - Pass/fail: thiếu trường bắt buộc → hoàn thành đánh giá bị chặn với danh sách trường cần hoàn thành.
- **FR-10 Hoàn thành đánh giá & khóa phiên bản.** Khi dữ liệu hợp lệ và người dùng xác nhận, đánh giá cá nhân được đóng phiên bản, khóa chỉnh sửa, ghi thời gian + người hoàn thành.
  - Pass/fail: sau khi hoàn thành đánh giá, bản đánh giá ở chế độ chỉ đọc; sửa phải qua quy trình mở lại tạo phiên bản mới.
- **FR-11 Idempotency khi hoàn thành đánh giá.** Mỗi lần hoàn thành đánh giá có idempotency key; nhấn lại/timeout không tạo hai bản đánh giá.
  - Pass/fail: hai request hoàn thành đánh giá cùng key trả về cùng kết quả/phiên bản, chỉ một bản ghi hiệu lực.
- **FR-12 Blind scoring.** Khi blind scoring bật và người dùng chưa hoàn thành, họ không thấy điểm/nhận xét của thành viên khác.
  - Pass/fail: trước khi hoàn thành đánh giá, API không trả dữ liệu đánh giá của người khác; thời điểm được xem sau khi hoàn thành đánh giá theo chính sách đã chốt (OQ-4).
- **FR-13 Một đánh giá hiệu lực/người/ứng viên/vòng.** Mỗi thành viên có tối đa một đánh giá hiệu lực cho một ứng viên trong một vòng; các lần sửa là phiên bản, không phải bản ghi độc lập cùng hiệu lực.

### Theo dõi hoàn thành, nhắc việc, escalation

- **FR-14 Dashboard hoàn thành (HR).** HR thấy phiên sắp diễn ra/đang diễn ra/thiếu đánh giá/quá hạn/chờ review/có chênh lệch; ma trận hoàn thành ứng viên × thành viên (hiển thị trạng thái thay nội dung điểm khi blind scoring còn hiệu lực).
- **FR-15 Nhắc việc & escalation.** Hệ thống gửi nhắc theo nhịp cấu hình (sau phiên nếu chưa có nháp; trước hạn; tại hạn; quá hạn → escalation cho Chủ tịch và HR); hiển thị hành động + deadline + deep link.
  - Pass/fail: thành viên đã hoàn thành hoặc được miễn/thay thế hợp lệ, hoặc phiên hoãn/hủy → ngừng nhận nhắc; preview thông báo không lộ dữ liệu ứng viên nếu chính sách cấm.

### Tổng hợp

- **FR-16 Điều kiện tổng hợp.** Tổng hợp chỉ chạy khi đủ quorum/điều kiện hoặc có override hợp lệ của HR (kèm lý do + audit).
- **FR-17 Tính tổng hợp.** Hệ thống tính điểm cá nhân (tổng điểm tiêu chí × trọng số hiệu lực; N/A loại khỏi mẫu số, chuẩn hóa lại trọng số nếu chính sách cho phép) và điểm tổng hợp theo rule phiên bản hiện hành; hiển thị phân bố Pass/Fail/Reserve và điểm từng tiêu chí.
  - Pass/fail: kết quả tổng hợp dùng đúng phiên bản scorecard/rule gắn với phiên; không suy ra kết luận cuối chỉ từ một ngưỡng điểm.
- **FR-18 Cờ chênh lệch lớn.** Hệ thống gắn cờ khi: chênh lệch điểm vượt ngưỡng; cùng ứng viên có cả Pass và Fail; tiêu chí trọng yếu phân cực; quá nhiều N/A; hoặc thiếu quorum.
  - Pass/fail: khi bị gắn cờ, hệ thống không tự kết luận, HR vẫn review được và thấy dữ liệu nguồn.

### HR review & chốt

- **FR-19 HR review.** HR xem điểm cá nhân, tổng hợp, cảnh báo, biên bản giải trình; có thể yêu cầu bổ sung/mở lại đánh giá theo quyền.
- **FR-20 Chốt kết quả.** HR chọn kết luận cuối Pass/Fail/Reserve; nếu khác đề xuất tổng hợp, lý do override là bắt buộc; lưu kết luận + lý do + audit.
  - Pass/fail: không có HR chốt thì không có kết luận cuối; override thiếu lý do bị chặn.
- **FR-21 Mở lại đánh giá.** Mở lại tạo phiên bản mới, lưu bản trước + lý do + người duyệt + thời gian; quyền và điều kiện mở lại theo OQ-5.

### Thông báo & gửi kết quả

- **FR-22 Guardrail gửi kết quả.** Không gửi thông báo kết quả cho ứng viên trước khi HR đã chốt và duyệt nội dung; "Đã chốt" và "Đã gửi" là hai sự kiện riêng có audit.
  - Pass/fail: tác vụ gửi chạy khi chưa chốt+duyệt → không gửi gì cho ứng viên.
- **FR-23 Preview & gửi theo mẫu.** HR chọn mẫu, preview, approve; hệ thống gửi đúng đối tượng theo mẫu/ngôn ngữ đã duyệt và ghi trạng thái giao nhận; email ứng viên không chứa điểm/nhận xét nội bộ/danh tính người chấm trừ khi có chính sách rõ ràng.
  - Pass/fail: lỗi gửi được retry, hiển thị trạng thái, không làm đổi kết luận đã chốt.
- **FR-24 Thông báo theo sự kiện.** Hệ thống gửi thông báo cho các sự kiện ở mục 9 (phiên sắp diễn ra, đến hạn/chậm, quá hạn/escalation, đủ đánh giá/chờ review, yêu cầu sửa/mở lại, hoãn/hủy/no-show, kết quả đã chốt) đúng đối tượng và kênh.

### Xử lý ngoại lệ

- **FR-25 No-show.** HR đánh dấu no-show, lưu lý do + người xác nhận; hệ thống không tự động gán Fail.
- **FR-26 Hoãn/hủy.** Hoãn → trạng thái `Đã hoãn`, giữ dữ liệu hợp lệ, vô hiệu link cũ, chỉ trở lại `Sẵn sàng` khi lịch mới từ Phase 1 đạt Definition of Ready. Hủy → bắt buộc lý do/quyền, dừng nhắc, vô hiệu truy cập không cần thiết, thông báo đúng đối tượng.
- **FR-27 Đổi thành viên.** Không sửa âm thầm; nhận cập nhật hợp lệ, thu hồi quyền người cũ, cấp quyền người mới, bảo toàn audit, xử lý nháp theo chính sách.
- **FR-28 Xung đột lợi ích.** Thành viên tự khai báo hoặc HR ghi nhận; khóa quyền xem/chấm nếu cần, thay người, lưu audit.
- **FR-29 Dữ liệu Phase 1 đổi khi đang chấm.** Cảnh báo phiên bản; thay đổi ảnh hưởng lịch/thành viên/scorecard phải đi qua quy tắc chuyển trạng thái, không làm mất dữ liệu đã có.

### Lifecycle

- **FR-30 Máy trạng thái phiên.** Hệ thống quản lý vòng đời: `Chờ bổ sung đầu vào → Sẵn sàng phỏng vấn → Đang phỏng vấn → Chờ đánh giá → Đủ đánh giá → Đang tổng hợp → Chờ HR review → Đã chốt → Đã kết thúc`, cùng các nhánh `Đã hoãn / Đã hủy / No-show` với lý do + audit; chỉ cho phép chuyển trạng thái hợp lệ (mục 5.2).

### Audit

- **FR-31 Audit bất biến.** Ghi audit bất biến cho: xem/tải hồ sơ nhạy cảm, hoàn thành đánh giá, mở lại, sửa phiên bản, miễn đánh giá, override quorum, chốt, duyệt/gửi kết quả, đổi quyền/thành viên. Mỗi bản ghi gồm actor, hành động, đối tượng, thời gian, phiên bản trước/sau, lý do, correlation ID.

## Non-Functional Requirements

- **NFR-1 Bảo mật & quyền riêng tư.** Mã hóa khi truyền và lưu; session/MFA theo chuẩn doanh nghiệp; deep link không chứa dữ liệu nhạy cảm hoặc token dài hạn; tách ghi chú nội bộ / nhận xét chia sẻ / nội dung gửi ứng viên; áp dụng retention, legal hold, xuất/xóa dữ liệu theo luật.
- **NFR-2 Độ tin cậy mất mạng.** Autosave + chỉ báo sync + retry có kiểm soát; không báo hoàn thành đánh giá thành công khi server chưa xác nhận; đồng bộ theo phiên bản, xung đột giữ cả bản server và local để người dùng chọn/ghép.
- **NFR-3 Tích hợp.** Mọi tích hợp (ATS/HRM/Phase 1, SSO/directory, calendar/meeting, document service, notification, reporting) có idempotency, versioning, correlation ID, retry giới hạn, dead-letter/monitoring; phân biệt thay đổi hợp lệ từ Phase 1 với cập nhật lỗi thời.
- **NFR-4 Khả năng kiểm thử (TDD).** Mọi FR có tiêu chí pass/fail; business rule trọng yếu (FR-2, FR-11, FR-12, FR-20, FR-22) phải có test; sàn 80% line coverage, chạy CI trước merge.
- **NFR-5 Múi giờ.** Thời gian hiển thị theo múi giờ người dùng và múi giờ phiên; không mâu thuẫn khi tính Definition of Ready.
- **NFR-6 Accessibility & đa ngôn ngữ.** Luồng cốt lõi dùng được bằng bàn phím/screen reader; hỗ trợ đa ngôn ngữ ở mức MVP là nền tảng để mở rộng (nâng cao thuộc post-MVP). Mức MVP đã chọn (Q5 = A, Q6 = A): WCAG 2.1 AA cơ bản (chữ đạt 4,5:1, thành phần giao diện đạt 3:1, vùng chạm tối thiểu 48 px, nhãn cho trình đọc màn hình ở các màn chính, không chỉ dùng màu để báo trạng thái, thao tác được bằng bàn phím trên web); giao diện chỉ tiếng Việt với toàn bộ chữ gom về một nơi. App không cam kết tuân thủ WCAG đầy đủ; việc đó cần kiểm với công nghệ hỗ trợ thật và rà soát chuyên gia.
- **NFR-7 Báo cáo/KPI.** Dữ liệu báo cáo được tối thiểu hóa, phân quyền và ẩn danh phù hợp; không dùng để xếp hạng nhân sự ngoài mục đích đã công bố.
- **NFR-8 Quyền riêng tư và nhà cung cấp AI.** (PO bổ sung 2026-10-09.) Mọi lần gọi dịch vụ AI gửi dữ liệu CV ra khỏi hệ thống của app nếu nhà cung cấp là dịch vụ bên ngoài. Vì vậy: (1) chỉ dùng nhà cung cấp đã được Security và Legal duyệt (hợp đồng xử lý dữ liệu, nơi lưu dữ liệu, không dùng dữ liệu để huấn luyện); (2) văn bản CV được che số điện thoại, email, ngày sinh và địa chỉ trước khi gửi (che theo quy tắc mẫu, không bảo đảm tuyệt đối); (3) có giới hạn thời gian chờ và giới hạn số lần gọi theo người dùng; (4) mỗi lần gọi được ghi nhật ký; (5) tính năng tắt theo mặc định bằng cờ cấu hình cho đến khi các bên liên quan đồng ý; (6) kết quả AI lưu theo `cvHash` để tránh gửi lại cùng một CV nhiều lần. Chi tiết nhà cung cấp, vùng lưu trữ và thời gian lưu giữ chốt ở stage `nfr-requirements`.
- **NFR-9 Phông chữ đồng nhất.** (PO yêu cầu 2026-10-09.) Toàn bộ giao diện của app (mọi màn hình, hộp thoại, thông báo, trình xem CV và khung AI, trên web lẫn điện thoại) dùng **một họ phông sans-serif duy nhất**, đồng nhất giữa các thiết bị. Họ phông phải hỗ trợ đầy đủ dấu tiếng Việt và được đóng gói cùng ứng dụng (không tải từ máy chủ ngoài lúc chạy) để hiển thị giống nhau trên web và điện thoại. [assumption: dùng Roboto, họ phông mặc định của Material 3, giấy phép Apache 2.0, bốn độ đậm 400 / 500 / 600 / 700; PO có thể đổi họ phông]. Nội dung bên trong tệp CV PDF dùng phông nhúng trong tệp và nằm ngoài phạm vi này.
- **NFR-10 Giao diện sáng và tối.** (Theo thiết kế, Q2.) App có chế độ sáng và tối, theo cài đặt hệ thống của thiết bị; mọi cặp chữ và nền đạt tương phản tối thiểu 4,5:1 (3:1 cho thành phần giao diện) ở cả hai chế độ.
- **NFR-11 Bố cục thích ứng.** (Theo thiết kế, Q1 = C.) Một mã nguồn chạy trên điện thoại và web (Flutter Web) trên máy tính để bàn. Dưới 768 px: một cột; 768 đến 1024 px: một cột căn giữa tối đa 720 px; trên 1024 px: danh sách HĐPV dạng lưới thẻ, danh sách ứng viên và chi tiết chấm điểm chia hai khung, trình xem CV dạng lớp phủ có khung AI cạnh CV.
- **NFR-12 Trạng thái tải và giảm chuyển động.** (Theo thiết kế.) Danh sách và CV hiển thị khung xương khi đang tải thay vì màn hình trống; mọi hiệu ứng chuyển động (nhún nút, trượt thẻ, thanh tiến độ, khung xương) tắt khi người dùng bật "giảm chuyển động" của hệ thống.
- **NFR-13 Hiệu năng và quy mô (MVP).** (Bổ sung ở NFR Requirements U1, Q1 = A, Q2 = A.) p95 ≤ 500 ms cho API đọc; p95 ≤ 1 giây cho đăng nhập và hoàn thành đánh giá; mở một màn trong ≤ 2 giây trên mạng 4G. Chịu tối đa 50 người dùng đồng thời, 20 HĐPV `Inprogress`, 200 ứng viên mỗi HĐPV; một backend, một Oracle XE, danh sách không phân trang.
- **NFR-14 Quan sát và vận hành (MVP).** (Bổ sung ở NFR Requirements U1, Q3 = A, Q4 = A.) Log JSON có mã tương quan cho từng request, không ghi mật khẩu, token, sdt, ngày sinh, giới tính; sự kiện kiểm toán có userId; điểm kiểm tra sức khỏe `/health`; log giữ 30 ngày. Mục tiêu sẵn sàng 99% trong giờ phỏng vấn; sao lưu thủ công trước mỗi đợt phát hành; RPO 24 giờ, RTO 4 giờ.

**Mã NFR dùng cho truy vết ở Construction.** Công cụ truy vết đọc mã viết liền số (`NFR1`), còn tài liệu này viết có gạch (`NFR-1`). Hai cách viết là cùng một yêu cầu: NFR1 = NFR-1, NFR2 = NFR-2, NFR3 = NFR-3, NFR4 = NFR-4, NFR5 = NFR-5, NFR6 = NFR-6, NFR7 = NFR-7, NFR8 = NFR-8, NFR9 = NFR-9, NFR10 = NFR-10, NFR11 = NFR-11, NFR12 = NFR-12, NFR13 = NFR-13, NFR14 = NFR-14. Các yêu cầu chi tiết ở Construction kế thừa mã này và thêm số phụ (ví dụ NFR1.1).

## Business Rules (tham chiếu mục 11.1)

- **BR-1** Chỉ hồ sơ đạt Definition of Ready mới bắt đầu Phase 2.
- **BR-2** Chỉ thành viên được gán hợp lệ mới có đánh giá tính vào tổng hợp.
- **BR-3** Mỗi thành viên tối đa một đánh giá hiệu lực/ứng viên/vòng; sửa là phiên bản.
- **BR-4** Không hoàn thành đánh giá khi thiếu dữ liệu bắt buộc; N/A phải có lý do.
- **BR-5** Tổng hợp chỉ chạy khi đủ quorum hoặc override hợp lệ của HR.
- **BR-6** Điểm tổng hợp/khuyến nghị không thay thế kết luận cuối của HR.
- **BR-7** Không gửi kết quả ứng viên trước khi chốt và duyệt nội dung.
- **BR-8** Mọi thay đổi ảnh hưởng kết quả sau khi hoàn thành đánh giá/chốt phải có quyền + lý do + lịch sử.
- **BR-9** Quy tắc, scorecard, mẫu thông báo dùng đúng phiên bản gắn với phiên.

## Mô hình dữ liệu khái niệm (tham chiếu mục 13)

Các entity chính: InterviewPanel, InterviewSession, ParticipantAssignment, CandidateProfileRef, ScorecardTemplateVersion, IndividualEvaluation, AggregateResult, FinalDecision, Attendance/Exception, Reminder/Escalation, Notification, AuditEvent. (Chi tiết trường + ánh xạ dữ liệu nguồn Phase 1 ở mục 13.1–13.3 của tài liệu nguồn; sẽ chi tiết hóa ở stage domain-design.)

## MVP 2 ngày (Walking Skeleton) — phạm vi thực thi ngay

> Đây là lát cắt mỏng chạy xuyên suốt (walking skeleton đã chốt ở Practices Discovery),
> phải dựng xong trong 2 ngày. Toàn bộ FR-1..FR-31 ở trên là lộ trình đầy đủ (north star);
> phần dưới là tập con duy nhất được thực thi trong 2 ngày.

### Quyết định đã chốt với PO

- **DEC-1 Phạm vi:** dừng ở bước hoàn thành đánh giá cá nhân; CHƯA làm tổng hợp, HR review/chốt, notification/gửi kết quả, nhắc việc, offline, xử lý ngoại lệ.
- **DEC-2 Dữ liệu Phase 1 & database riêng:** App Phase 2 dùng **database Oracle riêng** (KHÔNG dùng chung với team Phase 1). App sở hữu toàn bộ bảng. Dữ liệu đầu vào kiểu Phase 1 (HĐPV, vị trí, ứng viên + khung giờ/ngày — theo cấu trúc `Kiro_bang (1).xlsx`) được **seed/import vào DB riêng** của app (script seed hoặc import file). Nhờ DB riêng, MVP không phụ thuộc lịch của team Phase 1.
- **DEC-3 Scorecard cấu hình được:** bảng tiêu chí gồm `mã tiêu chí`, `tên tiêu chí`, `thang điểm` (1–5); mỗi phiên có một ô nhận xét chung.
- **DEC-4 Login:** JWT tự xây — email + mật khẩu, bảng user trong Oracle, hash mật khẩu bằng bcrypt, backend phát JWT; client lưu token và gắn vào mỗi request. `userId` trong token dùng để gắn danh tính người chấm vào bản đánh giá.
- **DEC-5 Stack & kiến trúc:** Frontend Flutter → REST API (Node.js + Express, driver `oracledb`) → **Oracle Database XE chạy local trong Docker**. Không dùng Supabase. Phân quyền được kiểm ở tầng API (middleware xác thực JWT + kiểm quyền), thay cho Row Level Security: người chấm chỉ đọc/ghi đánh giá của chính mình.

### Kiến trúc MVP

`Flutter (http/dio + lưu JWT)` → `Node.js/Express REST API (middleware JWT, oracledb pool)` → `Oracle XE (Docker, local)`. Backend chịu trách nhiệm auth, phân quyền và mọi truy cập DB; client không nối trực tiếp Oracle.

### Luồng người dùng MVP

Đăng nhập (email + mật khẩu → JWT) → chọn HĐPV → danh sách ứng viên (có thông tin vị trí, sắp theo giờ phỏng vấn từ sớm đến muộn) → chọn 1 ứng viên → màn phỏng vấn (xem CV nếu cần; có thể tạo tóm tắt AI và xem câu hỏi gợi ý khi cờ AI bật) → chấm điểm theo tiêu chí → chọn kết luận `Đạt` / `Loại` / `Cân nhắc` / `Khác` (chọn `Khác` mới hiện ô giới thiệu sang vị trí khác, tùy chọn) → nhận xét → hoàn thành đánh giá → khóa. (Không còn bước chọn vị trí; PO bỏ ngày 2026-10-09.)

### Yêu cầu MVP 2 ngày

> Mỗi FR mô tả: **Actor/Kích hoạt**, **Đầu vào**, **Xử lý**, **Đầu ra**, **Lỗi/Ngoại lệ**, **Tiêu chí chấp nhận**.
> Tên trường bám theo `Kiro_bang (1).xlsx` (mục 13.3 tài liệu nguồn). Tên bảng/cột vật lý chốt ở domain-design.
> Quy ước lỗi API chung: `400` dữ liệu không hợp lệ, `401` chưa đăng nhập/token sai, `403` không có quyền, `404` không tìm thấy, `409` xung đột (đã tồn tại/đã khóa), `500` lỗi hệ thống. Mọi lỗi trả về `{ code, message }`, `message` hiển thị được bằng tiếng Việt.

#### FR-A0 — Đăng nhập (email + mật khẩu, JWT)

- **Actor/Kích hoạt:** Người phỏng vấn (CBQL được gán vào HĐPV) mở app khi chưa có token hợp lệ.
- **Đầu vào:**
  - `email` (bắt buộc, đúng định dạng email, ≤ 255 ký tự)
  - `password` (bắt buộc, 1–128 ký tự)
  - Dữ liệu sẵn có: bảng user trong Oracle gồm `userId`, `email` (duy nhất), `passwordHash` (bcrypt), `employedId` (liên kết `EmployedID` của CBQL), `hoTen`, `trangThai` (hoạt động/khóa). Tài khoản demo được seed sẵn (FR-A1).
- **Xử lý:** Backend tìm user theo email (không phân biệt hoa/thường) → so khớp mật khẩu bằng bcrypt → nếu đúng và tài khoản hoạt động, phát JWT ký bằng secret lấy từ biến môi trường, chứa `userId`, `employedId`, hạn dùng (đề xuất 8 giờ). Client lưu token ở bộ nhớ an toàn (`flutter_secure_storage`) và gắn header `Authorization: Bearer <token>` vào mọi request sau đó. Đăng xuất = xóa token phía client. Ô mật khẩu có nút hiện/ẩn mật khẩu. Làm mới trang trên web (F5) khi token còn hạn giữ nguyên đăng nhập [assumption: token lưu ở bộ nhớ trình duyệt/thiết bị; nơi lưu cụ thể chốt ở thiết kế kỹ thuật].
- **Đầu ra:**
  - Thành công `200`: `{ token, expiresAt, user: { userId, employedId, hoTen, email } }` → app chuyển sang màn chọn HĐPV (FR-A2) và hiển thị tên người dùng.
- **Lỗi/Ngoại lệ:**
  - Thiếu trường/sai định dạng → `400`, chặn ngay ở client.
  - Sai email hoặc mật khẩu → `401` với thông báo chung "Email hoặc mật khẩu không đúng" (không tiết lộ email có tồn tại hay không).
  - Tài khoản bị khóa → `403`.
  - Đăng nhập sai 5 lần liên tiếp với cùng email → tạm khóa đăng nhập email đó 15 phút, trả `429` mã `LOGIN_LOCKED` kèm `Retry-After` (kể cả khi lần thử tiếp theo đúng mật khẩu); đăng nhập đúng trước đó thì đặt lại bộ đếm; khóa tự hết hạn. Bổ sung ở Functional Design U1 (Q1 = B).
  - Token hết hạn/không hợp lệ ở bất kỳ API nào → `401`, app xóa token và quay về màn login.
- **Tiêu chí chấp nhận:**
  - Given tài khoản demo hợp lệ, When nhập đúng email + mật khẩu, Then nhận JWT và vào màn chọn HĐPV.
  - Given sai mật khẩu, When đăng nhập, Then nhận `401` và thông báo chung.
  - Given không có token hoặc token hết hạn, When gọi bất kỳ API nghiệp vụ nào, Then nhận `401`.
  - Mật khẩu không bao giờ được lưu hoặc ghi log ở dạng rõ.
  - Given đang nhập mật khẩu, When bấm nút hiện/ẩn, Then mật khẩu chuyển giữa dạng chấm và dạng chữ, tiêu điểm vẫn ở ô mật khẩu.
  - Given đã đăng nhập và token còn hạn, When làm mới trang web, Then vẫn ở trạng thái đăng nhập; Given token hết hạn, Then về màn đăng nhập.

#### FR-A1 — Nạp dữ liệu đầu vào vào DB riêng (seed/import)

- **Actor/Kích hoạt:** Developer/Admin chạy script seed (dòng lệnh) trước khi demo hoặc khi cần nạp lại dữ liệu.
- **Đầu vào:** Dữ liệu theo 5 nhóm của `Kiro_bang (1).xlsx` (file seed định dạng JSON/CSV xuất từ bảng thiết kế):
  - **Ứng viên:** `Mã`*, `Tên`*, `Vị trí`* (tham chiếu `Mã vị trí` trong nhóm Vị trí bên dưới), `SĐT`, `email`, `Ngày sinh`, `Giới tính`, `Kinh nghiệm`, `Trình độ`, `Đường dẫn CV` (`cvPath`, tùy chọn; đường dẫn tới tệp PDF, cột bổ sung chưa có trong `Kiro_bang (1).xlsx`; xem FR-A8).
  - **Vị trí** (danh sách chọn của `Vị trí`; cũng là nguồn cho ô refer ở FR-A5): `Mã vị trí`*, `job`*, `ĐVQL`*, `ĐVTT1`, `ĐVTT2`, `ĐVTT3`, `Trạng thái` (hoạt động/ngừng).
  - **CBQL:** `EmployedID`*, `Tên`*, `job`, `đơn vị`, `Email`*.
  - **HĐPV:** `Mã`*, `Tên`*, `Địa điểm`, `Ngày`* (dd/mm/yyyy), `Hình thức` (`Online`/`Offline`), `Đã gửi email` (`Y`/`N`), `Trạng thái`* (một trong `Draft`, `Sent`, `Xác nhận`, `Inprogress`, `Completed` — cột bổ sung, chưa có trong `Kiro_bang (1).xlsx`; xem BR-A2).
  - **Chi tiết HĐPV – Ứng viên:** `ID`, `Mã HĐPV`*, `Mã ứng viên`*, `Từ thời gian`* (`hh:mm`), `Đến thời gian`* (`hh:mm`), `Xác nhận` (`Y`/`N`).
  - **Chi tiết HĐPV – CBQL:** `ID`, `Mã HĐPV`*, `Mã CBQL`*, `Từ thời gian`, `Đến thời gian`, `Xác nhận` (`Y`/`N`).
  - **Tiêu chí** (FR-A7) và **tài khoản user demo** (FR-A0, mật khẩu được hash khi seed).
  - (`*` = bắt buộc)
- **Xử lý:** Script tạo schema nếu chưa có → kiểm tra dữ liệu (trường bắt buộc, khóa ngoại tồn tại, `Từ thời gian` < `Đến thời gian`, định dạng ngày/giờ, giá trị enum) → ghi vào Oracle trong một transaction theo thứ tự: tiêu chí, vị trí, CBQL, user, ứng viên, HĐPV, chi tiết. Chạy lại được nhiều lần (idempotent): bản ghi trùng mã thì cập nhật, không nhân đôi.
- **Đầu ra:**
  - Dữ liệu nằm trong các bảng Oracle của app; API ở FR-A2, FR-A4, FR-A5 đọc được.
  - Báo cáo trên console: số bản ghi thêm/cập nhật/lỗi theo từng nhóm.
- **Lỗi/Ngoại lệ:**
  - Bản ghi thiếu trường bắt buộc, sai định dạng, hoặc khóa ngoại không tồn tại (ví dụ `Mã ứng viên` không có trong nhóm Ứng viên) → bỏ qua bản ghi đó, ghi vào báo cáo lỗi với số dòng và lý do.
  - Lỗi kết nối Oracle → dừng, rollback, thoát với mã lỗi khác 0.
  - `Vị trí` của ứng viên tham chiếu `Mã vị trí` không tồn tại → bỏ qua ứng viên đó, ghi vào báo cáo lỗi.
  - `cvPath` trỏ tới tệp không tồn tại hoặc không phải PDF → vẫn nạp ứng viên, ghi cảnh báo vào báo cáo; ứng viên đó hiển thị "Chưa có CV" (FR-A8).
- **Tiêu chí chấp nhận:**
  - Given file seed mẫu hợp lệ, When chạy script, Then toàn bộ bản ghi được nạp và báo cáo 0 lỗi.
  - Given ứng viên có `cvPath` hợp lệ, When nạp xong, Then FR-A8 mở được CV của ứng viên đó.
  - Given chạy script lần thứ hai với cùng file, Then số bản ghi trong DB không đổi.
  - Given một bản ghi chi tiết tham chiếu ứng viên không tồn tại, Then bản ghi đó bị bỏ qua và xuất hiện trong báo cáo lỗi; các bản ghi khác vẫn được nạp.

#### FR-A2 — Chọn HĐPV

- **Actor/Kích hoạt:** Người phỏng vấn đã đăng nhập, sau FR-A0.
- **Đầu vào:** JWT (lấy `employedId`); tùy chọn bộ lọc `ngay` (mặc định: hôm nay trở đi) và ô tìm kiếm theo mã/tên.
- **Xử lý:** API trả các HĐPV thỏa đồng thời: (1) người dùng được gán qua **Chi tiết HĐPV – CBQL** (`Mã CBQL` = `employedId` của người dùng) [assumption: người phỏng vấn chỉ thấy HĐPV mình được gán]; (2) `Trạng thái = Inprogress` (BR-A2). Lọc ở server. Sắp xếp theo `Ngày` tăng dần, rồi theo `Mã`.
- **Đầu ra:** Danh sách, mỗi dòng gồm: `Mã HĐPV`, `Tên HĐPV`, `Ngày`, `Hình thức` (`Online`/`Offline`), `Địa điểm`, số ứng viên đã xác nhận lịch, số đã chấm / tổng đã xác nhận (của chính người dùng; chỉ tính ứng viên `Xác nhận = Y` theo BR-A1). Chạm vào một HĐPV → mở FR-A4 với `maHdpv` đã chọn.
- **Lỗi/Ngoại lệ:**
  - Không có HĐPV nào được gán → hiển thị trạng thái rỗng "Bạn chưa được gán vào hội đồng phỏng vấn nào".
  - Lỗi mạng/`500` → thông báo và nút Thử lại.
- **Tiêu chí chấp nhận:**
  - Given người dùng được gán vào 2 HĐPV `Inprogress` trong tổng 5, When mở màn, Then chỉ thấy đúng 2 HĐPV đó.
  - Given người dùng được gán vào 3 HĐPV có trạng thái `Draft`, `Inprogress`, `Completed`, When mở màn, Then chỉ thấy HĐPV `Inprogress`.
  - Given gọi trực tiếp API chi tiết một HĐPV không được gán, Then nhận `403`.

#### FR-A3 — (ĐÃ BỎ) Chọn vị trí phỏng vấn

PO bỏ màn chọn vị trí ngày 2026-10-09. Giữ lại ID để các tài liệu khác truy vết được. Thông tin vị trí của ứng viên hiển thị ngay trên danh sách ứng viên ở FR-A4. Không có API hay màn hình nào cho FR-A3.

#### FR-A4 — Danh sách ứng viên của HĐPV (có thông tin vị trí, sắp theo giờ)

- **Actor/Kích hoạt:** Người phỏng vấn chọn một HĐPV ở FR-A2.
- **Đầu vào:** JWT; `maHdpv`.
- **Xử lý:** Kiểm tra quyền với HĐPV (như FR-A2) và HĐPV đang `Inprogress` (nếu không → `404`, BR-A2). Lấy **tất cả** ứng viên thuộc HĐPV qua **Chi tiết HĐPV – Ứng viên**, **chỉ lấy các dòng có `Xác nhận = Y`** (ứng viên đã xác nhận lịch); dòng `Xác nhận = N` bị loại ở phía server (BR-A1). Ghép `Ngày` của HĐPV với `Từ thời gian`/`Đến thời gian` (`hh:mm`) để tạo khung giờ đầy đủ; sắp theo `Từ thời gian` tăng dần, tức giờ phỏng vấn sớm nhất ở trên cùng [assumption: "từ gần tới xa" hiểu là từ sớm tới muộn, không phụ thuộc giờ hiện tại]. Nếu hai ứng viên cùng giờ bắt đầu thì sắp theo `Mã ứng viên`. Xác định trạng thái chấm của chính người dùng với từng ứng viên.
- **Đầu ra:** Danh sách ứng viên đã xác nhận lịch của HĐPV, mỗi dòng gồm: `Mã ứng viên`, `Tên`, **vị trí** (`job` và đơn vị quản lý `ĐVQL`; các cấp `ĐVTT1..3` nếu có), khung giờ (`dd/mm/yyyy hh:mm – hh:mm`), trạng thái chấm của tôi (`Chưa chấm` / `Đã chấm`); với bài đã hoàn thành thêm cột **Điểm TB** (điểm trung bình đã lưu, ví dụ "3,8") và nhãn kết luận của tôi (`Đạt` / `Loại` / `Cân nhắc` / `Khác`, xem FR-A6). Ứng viên chưa chấm không có Điểm TB. Chạm vào một ứng viên → mở FR-A5.
- **Lỗi/Ngoại lệ:**
  - Ứng viên có `Xác nhận = N` **không hiển thị** trong danh sách và không mở được màn chấm điểm (BR-A1).
  - HĐPV không có ứng viên nào đã xác nhận lịch → trạng thái rỗng "Chưa có ứng viên xác nhận lịch".
  - HĐPV không tồn tại → `404`; tôi không được gán → `403`; HĐPV không `Inprogress` → `404`.
  - Lỗi mạng/`500` → thông báo và nút Thử lại.
- **Tiêu chí chấp nhận:**
  - Given 3 ứng viên đã xác nhận lúc 10:00, 08:30, 09:15, When mở màn, Then thứ tự hiển thị là 08:30, 09:15, 10:00.
  - Given HĐPV có 4 ứng viên thuộc 2 vị trí khác nhau, trong đó 1 ứng viên `Xác nhận = N`, When mở màn, Then thấy 3 ứng viên trong cùng một danh sách và mỗi dòng có thông tin vị trí của ứng viên đó.
  - Given hai ứng viên cùng giờ bắt đầu, Then ứng viên có mã nhỏ hơn đứng trước.
  - Given tôi đã hoàn thành đánh giá cho một ứng viên với kết luận `Cân nhắc`, Then dòng đó hiển thị `Đã chấm` và nhãn `Cân nhắc`.

#### FR-A5 — Màn phỏng vấn và chấm điểm

- **Actor/Kích hoạt:** Người phỏng vấn chọn một ứng viên ở FR-A4.
- **Đầu vào:**
  - JWT; `maHdpv`; `maUngVien`.
  - Danh sách tiêu chí đang hoạt động (FR-A7).
  - Người dùng nhập: điểm cho **từng** tiêu chí (số nguyên trong thang của tiêu chí, mặc định 1–5); `ketLuan` (**bắt buộc**, một trong `Đạt`, `Loại`, `Cân nhắc`, `Khác`; BR-A3); `nhanXet` (văn bản, tùy chọn kể cả khi chọn `Loại`, `Cân nhắc` hoặc `Khác`, ≤ 2000 ký tự); `referMaViTri` (tùy chọn, tối đa 1 vị trí khác để giới thiệu ứng viên, **chỉ nhập được khi `ketLuan` = `Khác`**); `referLyDo` (tùy chọn, ≤ 500 ký tự, chỉ khi `ketLuan` = `Khác` và đã chọn vị trí refer).
  - Danh sách vị trí để refer: các vị trí ở trạng thái hoạt động trong nhóm Vị trí, trừ vị trí hiện tại của ứng viên.
- **Xử lý:** Kiểm tra quyền. Kiểm tra HĐPV đang `Inprogress` (nếu không → `404` "Hội đồng không còn đang phỏng vấn", không mở bài chấm mới; BR-A2). Kiểm tra ứng viên có `Xác nhận = Y` trong HĐPV; nếu `N` → API trả `404` "Ứng viên chưa xác nhận lịch" và app không mở màn chấm (BR-A1). Nếu ứng viên đã có đánh giá của tôi → mở ở chế độ chỉ đọc (xem FR-A6). Nếu chưa → hiển thị form trống. Kiểm tra dữ liệu ngay khi nhập ở client; nút Hoàn thành đánh giá chỉ bật khi mọi tiêu chí có điểm hợp lệ **và đã chọn kết luận**.
- **Đầu ra (màn hình):**
  - Nút **Xem CV** ở khối thông tin ứng viên, mở trình xem CV (FR-A8). Khi ứng viên chưa có CV, nút hiển thị "Chưa có CV" và không bấm được.
  - Khối **Điểm trung bình** (PO bổ sung 2026-10-09): nằm ngay dưới danh sách tiêu chí, hiển thị điểm trung bình của ứng viên và tự cập nhật mỗi khi chọn hoặc đổi điểm một tiêu chí. Công thức: tổng điểm các tiêu chí đã chọn chia cho số tiêu chí đã chọn, mỗi điểm quy về thang 5 theo `điểm × 5 / diemToiDa` (với thang 1–5 là điểm gốc), làm tròn một chữ số thập phân theo quy tắc làm tròn lên từ 0,5, hiển thị dấu phẩy ("3,8 / 5"). Khi chưa chọn đủ tiêu chí: dòng phụ ghi "Tạm tính theo n/N tiêu chí đã chọn"; chưa chọn tiêu chí nào: hiển thị "—". Khi chọn đủ: "Trung bình N tiêu chí". Kèm chú thích "Chỉ để tham khảo, không thay thế kết luận của bạn" (BR-A5). Khối không có trường nhập; người dùng không sửa trực tiếp điểm trung bình.
  - Khối **Kết luận** (bắt buộc): bốn lựa chọn `Đạt` / `Loại` / `Cân nhắc` / `Khác`, chọn một; mô tả rõ đây là đề xuất của người phỏng vấn, không phải kết luận cuối.
  - Khối **Giới thiệu sang vị trí khác (tùy chọn)**: **chỉ hiển thị khi đã chọn kết luận `Khác`**. Gồm ô chọn vị trí (danh sách vị trí ở mục Đầu vào, mặc định "Không refer") và ô lý do ngắn. Khi chuyển sang kết luận khác `Khác`, khối này ẩn và giá trị đã nhập bị xóa, không được gửi đi.
  - Khối thông tin ứng viên: `Mã`, `Tên`, `Vị trí`, `Kinh nghiệm`, `Trình độ`, khung giờ, `Hình thức` + `Địa điểm`. Không hiển thị `SĐT`, `Ngày sinh`, `Giới tính` trong MVP (tối thiểu hóa dữ liệu cá nhân).
  - Khối scorecard: mỗi tiêu chí hiển thị `Mã tiêu chí`, `Tên tiêu chí`, bộ chọn điểm 1..5.
  - Ô nhận xét và bộ đếm ký tự.
  - Nút Hoàn thành đánh giá, kèm cảnh báo nếu rời màn khi chưa hoàn thành ("Dữ liệu chưa lưu sẽ mất").
- **Lỗi/Ngoại lệ:**
  - Điểm ngoài thang hoặc không phải số nguyên → chặn ở client; backend kiểm tra lại và trả `400`.
  - Còn tiêu chí chưa chấm hoặc chưa chọn kết luận → Hoàn thành đánh giá bị khóa; bấm vào nút khóa đánh dấu các mục còn thiếu và đưa tiêu điểm tới mục thiếu đầu tiên.
  - Nhận xét vượt 2000 ký tự, lý do refer vượt 500 ký tự → chặn nhập thêm.
  - Chọn vị trí refer trùng vị trí hiện tại hoặc vị trí đã ngừng → không có trong danh sách chọn; gửi trực tiếp qua API → `400` (xem FR-A6).
  - Chưa có tiêu chí nào đang hoạt động → hiển thị lỗi "Chưa cấu hình tiêu chí", không cho chấm.
- **Tiêu chí chấp nhận:**
  - Given 5 tiêu chí đang hoạt động, When mở màn, Then hiển thị đủ 5 tiêu chí đúng thứ tự cấu hình.
  - Given còn 1 tiêu chí chưa chấm, Then nút Hoàn thành đánh giá bị khóa và tiêu chí đó được đánh dấu.
  - Given gửi điểm 6 trực tiếp qua API, Then nhận `400`.
  - Given đã chấm đủ tiêu chí nhưng chưa chọn `Đạt` / `Loại` / `Cân nhắc`, Then nút Hoàn thành đánh giá bị khóa và khối Kết luận được đánh dấu.
  - Given chọn kết luận `Loại` và để trống nhận xét, Then vẫn hoàn thành được.
  - Given ứng viên đang ở vị trí A, When mở ô refer, Then danh sách không có vị trí A và không có vị trí đã ngừng.
  - Given chưa chọn kết luận hoặc đã chọn `Đạt`, `Loại` hoặc `Cân nhắc`, When xem màn, Then khối Giới thiệu sang vị trí khác ẩn.
  - Given chọn kết luận `Khác`, When xem màn, Then khối Giới thiệu sang vị trí khác hiện ra (tùy chọn) và không bắt buộc chọn vị trí để hoàn thành.
  - Given đã chọn `Khác` và nhập vị trí cùng lý do refer, When đổi sang `Đạt`, Then khối ẩn, giá trị đã nhập bị xóa và hoàn thành đánh giá không gửi vị trí refer.
  - Given chưa chọn điểm nào, When xem khối Điểm trung bình, Then thấy "—" và "Chưa chọn điểm nào".
  - Given đã chọn điểm 4, 3, 4 cho ba tiêu chí trong tổng năm, When xem khối Điểm trung bình, Then thấy "3,7 / 5" và dòng "Tạm tính theo 3/5 tiêu chí đã chọn".
  - Given đã chọn đủ năm tiêu chí với điểm 4, 3, 5, 4, 5, When xem khối Điểm trung bình, Then thấy "4,2 / 5" và dòng "Trung bình 5 tiêu chí".
  - Given đã chọn điểm rồi đổi điểm một tiêu chí, When đổi xong, Then điểm trung bình cập nhật ngay và trình đọc màn hình nghe giá trị mới.

#### FR-A6 — Hoàn thành và khóa đánh giá

- **Actor/Kích hoạt:** Người phỏng vấn bấm Hoàn thành đánh giá ở FR-A5 và xác nhận ở hộp thoại "Sau khi hoàn thành sẽ không sửa được".
- **Đầu vào:**
  - JWT (`userId`, `employedId`).
  - Payload: `maHdpv`, `maUngVien`, `idempotencyKey` (UUID do client sinh một lần cho mỗi form), `diem: [{ maTieuChi, diem }]`, `ketLuan` (`DAT` | `LOAI` | `CAN_NHAC` | `KHAC`, hiển thị `Đạt` / `Loại` / `Cân nhắc` / `Khác`), `nhanXet`, `referMaViTri` (tùy chọn), `referLyDo` (tùy chọn).
- **Xử lý:** Kiểm tra quyền với HĐPV và ứng viên → kiểm tra trạng thái HĐPV là `Inprogress` hoặc `Completed` (cho phép hoàn thành đánh giá đang chấm dở khi HĐPV vừa chuyển sang `Completed`; trạng thái khác → `404`; BR-A2) → kiểm tra ứng viên có `Xác nhận = Y` (nếu `N` → `404`, không lưu; BR-A1) → kiểm tra mọi tiêu chí đang hoạt động đều có điểm hợp lệ, không có mã tiêu chí lạ → kiểm tra `ketLuan` có mặt và thuộc 4 giá trị hợp lệ → `referMaViTri` và `referLyDo` chỉ chấp nhận khi `ketLuan` = `KHAC`; nếu có `referMaViTri`: vị trí phải tồn tại, đang hoạt động và khác vị trí hiện tại của ứng viên; `referLyDo` chỉ chấp nhận khi có `referMaViTri` và ≤ 500 ký tự → ghi trong một transaction: một bản ghi đánh giá (người chấm, HĐPV, ứng viên, kết luận, nhận xét, vị trí refer, lý do refer, thời điểm hoàn thành, trạng thái `SUBMITTED`) và các dòng điểm theo tiêu chí. Kết luận và refer chỉ là đề xuất lưu cùng đánh giá; không đổi dữ liệu ứng viên, không đổi vị trí của ứng viên (BR-A3). Ràng buộc duy nhất (`userId`, `maHdpv`, `maUngVien`) ở DB. Nếu cùng `idempotencyKey` gửi lại → trả kết quả đã lưu, không tạo bản mới.
- **Điểm trung bình (PO bổ sung 2026-10-09):** Server tự tính `diemTrungBinh` từ các dòng điểm theo cùng công thức ở FR-A5 (mọi tiêu chí đang hoạt động đều có điểm khi hoàn thành, nên là trung bình của tất cả tiêu chí), lưu cùng bản đánh giá (kiểu số, tối đa 2 chữ số thập phân) và không bao giờ nhận giá trị do client gửi lên; nếu payload có trường `diemTrungBinh` thì bị bỏ qua. Giá trị đã lưu không đổi dù bộ tiêu chí thay đổi về sau. Hiển thị ở màn bài đã hoàn thành và ở cột Điểm TB của FR-A4 với một chữ số thập phân.
- **Đầu ra:**
  - Thành công `201`: `{ evaluationId, submittedAt, trangThai: "SUBMITTED", diemTrungBinh }` → app hiển thị "Đã hoàn thành", chuyển form sang chỉ đọc và quay về FR-A4 với dòng ứng viên là `Đã chấm`.
  - Gửi lại cùng `idempotencyKey` → `200` với cùng `evaluationId`.
  - Xem lại sau khi hoàn thành đánh giá: hiển thị điểm từng tiêu chí, kết luận (`Đạt` / `Loại` / `Cân nhắc`), nhận xét, vị trí refer và lý do refer (nếu có), thời điểm hoàn thành; không có nút sửa. Nút Xem CV vẫn dùng được nếu HĐPV còn `Inprogress` (FR-A8).
- **Lỗi/Ngoại lệ:**
  - Đã có đánh giá với `idempotencyKey` khác → `409` "Bạn đã hoàn thành đánh giá cho ứng viên này".
  - Thiếu điểm hoặc điểm sai → `400` kèm danh sách tiêu chí lỗi.
  - Thiếu `ketLuan` hoặc giá trị ngoài `DAT` / `LOAI` / `CAN_NHAC` / `KHAC` → `400`, không lưu gì.
  - Có `referMaViTri` hoặc `referLyDo` khi `ketLuan` khác `KHAC` → `400`, không lưu gì.
  - `referMaViTri` không tồn tại, đã ngừng hoặc trùng vị trí hiện tại của ứng viên; hoặc `referLyDo` khi không có vị trí refer, hoặc dài quá 500 ký tự → `400`, không lưu gì.
  - Mất mạng/timeout → app giữ dữ liệu trên form, báo "Chưa hoàn thành được" và cho thử lại với cùng `idempotencyKey`; **không** báo thành công khi chưa nhận phản hồi từ server.
  - API sửa/xóa đánh giá không tồn tại trong MVP.
- **Tiêu chí chấp nhận:**
  - Given form hợp lệ, When hoàn thành đánh giá, Then đánh giá được lưu trong Oracle và màn hình chuyển chỉ đọc.
  - Given gửi cùng request hai lần (cùng `idempotencyKey`), Then DB chỉ có một bản đánh giá.
  - Given đã hoàn thành, When hoàn thành đánh giá lại với key mới, Then nhận `409`.
  - Given người dùng B, When đọc đánh giá của người dùng A qua API, Then nhận `403`.
  - Given form hợp lệ với kết luận `Khác` và refer sang vị trí B, When hoàn thành đánh giá, Then DB lưu kết luận `KHAC`, `referMaViTri` = B, và vị trí hiện tại của ứng viên không đổi.
  - Given kết luận `Đạt` và có `referMaViTri`, When gọi API hoàn thành đánh giá, Then nhận `400` và không có bản ghi nào được tạo.
  - Given kết luận `Khác` và không chọn vị trí refer, When hoàn thành đánh giá, Then hoàn thành được và `referMaViTri` rỗng.
  - Given điểm 4, 3, 5, 4, 5, When hoàn thành đánh giá, Then DB lưu `diemTrungBinh` = 4,20 và màn bài đã hoàn thành cùng cột Điểm TB hiển thị "4,2".
  - Given payload có `diemTrungBinh` = 5 do client gửi trong khi điểm thật trung bình 4,2, When hoàn thành đánh giá, Then DB lưu 4,20.
  - Given đã hoàn thành và sau đó bộ tiêu chí thay đổi, When xem lại bài, Then điểm trung bình vẫn là giá trị đã lưu.
  - Given thiếu `ketLuan`, When gọi API hoàn thành đánh giá, Then nhận `400` và không có bản ghi nào được tạo.
  - Given `referMaViTri` trùng vị trí hiện tại của ứng viên, When gọi API hoàn thành đánh giá, Then nhận `400`.
  - Given đã hoàn thành, When xem lại, Then thấy kết luận, vị trí refer và lý do refer đã chọn ở dạng chỉ đọc.
  - Given bài đã hoàn thành từ trước khi có kết luận (dữ liệu cũ), When xem lại hoặc xem danh sách, Then hiển thị "Chưa ghi kết luận" và điểm trung bình đã điền bù bằng migration chạy lại được (`docker/schema/migrate/002-u2-constraints.sql`, `node scripts/migrate.mjs`). Bổ sung ở Functional Design U2 (Q2 = A); tương ứng AC6.3.6.

#### FR-A7 — Danh sách tiêu chí chấm điểm

- **Actor/Kích hoạt:** Developer/Admin nạp qua seed (FR-A1); màn chấm điểm (FR-A5) đọc khi mở. MVP **không** có màn quản trị tiêu chí trên app [assumption].
- **Đầu vào:** Mỗi tiêu chí gồm: `maTieuChi`* (duy nhất, ≤ 20 ký tự), `tenTieuChi`* (≤ 200 ký tự), `diemToiThieu` (mặc định 1), `diemToiDa` (mặc định 5), `thuTu` (thứ tự hiển thị), `trangThai` (hoạt động/ngừng).
- **Xử lý:** Kiểm tra `1 ≤ diemToiThieu < diemToiDa ≤ 5`. API trả các tiêu chí đang hoạt động, sắp theo `thuTu`. Trong MVP, một bộ tiêu chí dùng chung cho mọi HĐPV/vị trí.
- **Đầu ra:** `[{ maTieuChi, tenTieuChi, diemToiThieu, diemToiDa, thuTu }]` cho FR-A5.
- **Lỗi/Ngoại lệ:** Thang không hợp lệ hoặc trùng mã khi seed → bản ghi bị từ chối, nằm trong báo cáo lỗi FR-A1. Tiêu chí chuyển sang ngừng hoạt động không làm thay đổi các đánh giá đã hoàn thành (điểm đã lưu được giữ nguyên).
- **Tiêu chí chấp nhận:**
  - Given seed thêm một tiêu chí mới đang hoạt động, When mở form chấm mới, Then tiêu chí xuất hiện.
  - Given một tiêu chí bị chuyển sang ngừng, Then không xuất hiện trên form mới nhưng vẫn hiển thị trong đánh giá đã hoàn thành trước đó.

#### FR-A8 — Xem CV của ứng viên

(PO bổ sung khi xem bản HTML, 2026-10-09.)

- **Actor/Kích hoạt:** Người phỏng vấn bấm **Xem CV** ở màn chấm điểm (FR-A5) hoặc màn bài đã hoàn thành.
- **Đầu vào:** JWT; `maHdpv`; `maUngVien`. Dữ liệu sẵn có: `cvPath` của ứng viên (FR-A1).
- **Xử lý:** Server kiểm tra theo thứ tự: người dùng được gán vào HĐPV (nếu không → `403`); HĐPV đang `Inprogress` (nếu không → `404`, BR-A2); ứng viên có `Xác nhận = Y` (nếu `N` → `404`, BR-A1); ứng viên có `cvPath` (nếu không → `404` mã `CV_NOT_FOUND`). Sau đó server **ghi nhật ký xem CV** (`userId`, `maHdpv`, `maUngVien`, thời điểm) rồi mới trả nội dung PDF. Nội dung được cấp qua liên kết ngắn hạn gắn với người dùng và ứng viên, hết hạn sau 5 phút [assumption]; client không nhận đường dẫn tệp thật.
- **Đầu ra:** Trình xem PDF ở chế độ chỉ đọc, mở trong app: trên web là khung xem nhúng trong trang, trên điện thoại là trình xem PDF trong app. Có đóng, phóng to / thu nhỏ, chuyển trang, tìm kiếm chữ nếu trình xem hỗ trợ. **Không** có nút tải xuống, in hay chia sẻ.
- **Lỗi/Ngoại lệ:**
  - Ứng viên chưa có CV → nút "Chưa có CV", không mở; nếu gọi API → `404` `CV_NOT_FOUND`.
  - Tệp CV mất hoặc không đọc được → thông báo "Không mở được CV. Thử lại" và nút Thử lại (`502` hoặc `500`).
  - Liên kết hết hạn khi đang xem → app tự xin liên kết mới một lần; nếu vẫn lỗi thì báo "Không mở được CV".
  - `401` → về màn đăng nhập (như các API khác).
- **Giới hạn đã biết:** Việc không có nút tải/in chỉ là biện pháp giao diện. Người dùng vẫn có thể chụp màn hình hoặc lưu trang bằng trình duyệt; MVP không ngăn tuyệt đối việc này. Nhật ký xem CV là biện pháp truy vết thay thế.
- **Tiêu chí chấp nhận:**
  - Given người phỏng vấn được gán vào HĐPV `Inprogress` và ứng viên `Xác nhận = Y` có CV, When bấm Xem CV, Then CV mở ở chế độ chỉ đọc, không có nút tải/in/chia sẻ.
  - Given mỗi lần xem thành công, When kiểm tra DB, Then có một dòng nhật ký (`userId`, `maHdpv`, `maUngVien`, thời điểm).
  - Given người dùng không được gán vào HĐPV, When gọi API xem CV, Then nhận `403` và không có nhật ký xem.
  - Given ứng viên `Xác nhận = N` hoặc HĐPV không `Inprogress`, When gọi API xem CV, Then nhận `404` và không trả nội dung.
  - Given ứng viên chưa có `cvPath`, When mở màn chấm điểm, Then nút hiển thị "Chưa có CV" và không bấm được.
  - Given liên kết xem đã quá 5 phút, When dùng lại liên kết cũ, Then bị từ chối.
  - Given CV đang mở, When bấm phóng to, thu nhỏ hoặc chuyển trang, Then CV đổi cỡ và trang tương ứng; phóng to trong khoảng 75% đến 200%; nút trang trước vô hiệu ở trang đầu, nút trang sau vô hiệu ở trang cuối.
  - Given trình xem CV trên điện thoại hoặc cửa sổ hẹp, When mở, Then CV hiển thị toàn màn hình; Given máy tính để bàn, Then trình xem hiển thị dạng lớp phủ bên phải.

#### FR-A9 — Tóm tắt CV bằng AI và làm nổi bật thông tin

(PO bổ sung 2026-10-09. Tính năng tắt theo mặc định, xem BR-A4 và NFR-8.)

- **Actor/Kích hoạt:** Người phỏng vấn mở trình xem CV (FR-A8) và bấm **Tạo tóm tắt AI** (hoặc **Tạo lại**). Chỉ khả dụng khi cờ cấu hình `ai.cvSummary.enabled` bật và CV đã mở thành công.
- **Đầu vào:** JWT; `maHdpv`; `maUngVien`; `tạoLại` (boolean, mặc định false). Dữ liệu sẵn có: văn bản trích từ CV PDF của ứng viên.
- **Cấu hình (người vận hành):**
  - `ai.cvSummary.enabled` (boolean, mặc định `false`)
  - `ai.provider` (nhà cung cấp và khóa truy cập lấy từ biến môi trường; không nằm trong mã nguồn)
  - `ai.timeoutMs` (mặc định 20000)
  - `ai.maxPerUserPerHour` (mặc định 30)
- **Xử lý:** Server kiểm tra như FR-A8 (được gán, HĐPV `Inprogress`, ứng viên `Xác nhận = Y`, có CV) và cờ AI bật. Trích văn bản từ PDF; nếu không có lớp chữ (CV dạng ảnh) → `422` mã `CV_NO_TEXT`. Tính `cvHash` (SHA-256 của tệp CV). Nếu đã có kết quả `READY` cho (`maUngVien`, `cvHash`, `promptVersion`) và `tạoLại` = false → trả kết quả đã lưu, không gọi AI. Ngược lại: che số điện thoại, email, ngày sinh, địa chỉ trong văn bản → gọi nhà cung cấp AI với chỉ dẫn: chỉ dùng thông tin có trong CV, không suy đoán, trả JSON theo lược đồ, tiếng Việt, không nêu hay suy ra tuổi, giới tính, tình trạng hôn nhân hoặc gia đình, tôn giáo, dân tộc, sức khỏe, quốc tịch. Server kiểm tra kết quả theo lược đồ; mỗi mục kinh nghiệm, trình độ, chứng chỉ phải có `trich` là đoạn chữ thật sự có trong văn bản CV, mục không kiểm chứng được bị loại bỏ; mục chạm tới thuộc tính nhạy cảm bị loại bỏ (lọc theo từ khóa, không bảo đảm tuyệt đối). Lưu kết quả và ghi nhật ký gọi AI.
- **Đầu ra (dữ liệu, bảng `CV_AI_SUMMARY`):**
  - `maUngVien`, `cvHash`, `promptVersion`, `model` (tên và phiên bản mô hình do nhà cung cấp trả về), `trangThai` (`READY` / `ERROR`), `taoLuc`, `taoBoi` (userId), `maLoi`.
  - `tomTat` (văn bản ≤ 800 ký tự).
  - `kinhNghiem[]`: `tieuDe` (vai trò và nơi làm việc), `thoiGian` (văn bản như trong CV), `trich` (≤ 300 ký tự, nguyên văn từ CV), `trang`.
  - `trinhDo[]`: `tieuDe` (bằng cấp, trường, ngành), `trich`, `trang`.
  - `chungChi[]`: `ten`, `tinhTrang` (ví dụ "đang chuẩn bị", để trống nếu CV không nói), `trich`, `trang`.
  - Mỗi mục trong ba mảng trên có `id` ổn định trong kết quả để FR-A10 tham chiếu.
- **Đầu ra (màn hình):** Trình xem CV có khung **Tóm tắt AI** (cạnh CV trên web, tab thứ hai trên điện thoại) gồm: lưu ý "Do AI tạo từ nội dung CV, có thể sai sót, chỉ để tham khảo, không dùng để chấm điểm hay quyết định"; Tóm tắt; ba nhóm Kinh nghiệm (KN), Trình độ (TĐ), Chứng chỉ (CC), mỗi mục có liên kết **Xem trong CV** chuyển tới đúng trang và đoạn trích; công tắc **Làm nổi bật trong CV**; thời điểm tạo; nút **Tạo lại**. Khi bật làm nổi bật, các đoạn trích trong CV được đánh dấu theo ba loại, mỗi loại có nhãn chữ (KN, TĐ, CC) và kiểu gạch chân khác nhau, không chỉ khác màu.
- **Lỗi/Ngoại lệ:**
  - Cờ AI tắt → khung hiển thị "Tính năng AI đang tắt. Liên hệ người vận hành để bật." và không có nút tạo; gọi API → `403` mã `AI_DISABLED`.
  - CV dạng ảnh → `422` `CV_NO_TEXT`, thông báo "CV dạng ảnh, chưa hỗ trợ tóm tắt".
  - Vượt giới hạn tần suất → `429`, thông báo "Bạn tạo tóm tắt quá nhiều lần. Thử lại sau".
  - Nhà cung cấp lỗi, hết thời gian chờ hoặc kết quả sai lược đồ → `502`/`504`, thông báo "Không tạo được tóm tắt AI" và nút Thử lại; CV vẫn xem bình thường; không lưu kết quả lỗi dùng như kết quả hợp lệ.
  - `403`/`404`/`401` theo quy tắc FR-A8.
- **Tiêu chí chấp nhận:**
  - Given cờ AI bật, CV có chữ, người dùng được gán và HĐPV `Inprogress`, When bấm Tạo tóm tắt AI, Then thấy tóm tắt, các nhóm KN, TĐ, CC và mỗi mục có liên kết Xem trong CV.
  - Given mỗi mục trong kết quả, When kiểm tra, Then `trich` xuất hiện nguyên văn trong văn bản CV; mục không khớp không được hiển thị.
  - Given bật Làm nổi bật, When xem CV, Then đoạn trích được đánh dấu kèm nhãn KN, TĐ hoặc CC.
  - Given đã có kết quả cho cùng `cvHash`, When mở lại, Then hiển thị ngay kết quả đã lưu và không có lần gọi AI mới trong nhật ký; When bấm Tạo lại, Then có lần gọi mới.
  - Given cờ AI tắt, When gọi API, Then nhận `403` `AI_DISABLED` và không có dữ liệu CV nào được gửi ra ngoài.
  - Given CV có số điện thoại, email, ngày sinh, When kiểm tra nội dung gửi tới nhà cung cấp, Then các trường đó đã bị che.
  - Given nhà cung cấp lỗi, When bấm Tạo tóm tắt AI, Then thấy lỗi và nút Thử lại, CV vẫn xem được.
  - Given kết quả AI, When hoàn thành đánh giá, Then kết quả AI không tự điền điểm, kết luận hay nhận xét (BR-A4).

#### FR-A10 — Gợi ý câu hỏi phỏng vấn từ CV

(PO bổ sung 2026-10-09. Phụ thuộc FR-A9.)

- **Actor/Kích hoạt:** Người phỏng vấn xem khung Tóm tắt AI sau khi FR-A9 tạo xong.
- **Đầu vào:** Kết quả FR-A9 (`kinhNghiem[]`, `trinhDo[]`, `chungChi[]`), sinh cùng một lần gọi AI với FR-A9.
- **Xử lý:** AI trả `cauHoiGoiY[]` gồm 3 đến 6 câu hỏi liên quan tới kinh nghiệm, trình độ, chứng chỉ của ứng viên. Server kiểm tra: mỗi câu có `loai` thuộc `KINH_NGHIEM` / `TRINH_DO` / `CHUNG_CHI`, `noiDung` ≤ 300 ký tự và `thamChieu` là `id` của một mục có thật; câu hỏi không tham chiếu mục nào, hoặc đề cập thuộc tính nhạy cảm, bị loại bỏ. Nếu sau khi lọc còn dưới 3 câu → vẫn hiển thị các câu còn lại kèm tóm tắt.
- **Đầu ra:** Danh sách đánh số trong khung Tóm tắt AI, mỗi câu gồm nhãn loại, nội dung câu hỏi và dòng "Dựa trên: <mục nguồn>". Câu hỏi chỉ để xem; MVP không lưu cùng đánh giá và không có chức năng đánh dấu đã hỏi.
- **Lỗi/Ngoại lệ:** Như FR-A9. Không có câu hỏi hợp lệ → ẩn nhóm "Câu hỏi gợi ý thêm" nhưng vẫn hiển thị tóm tắt.
- **Tiêu chí chấp nhận:**
  - Given kết quả AI hợp lệ, When xem khung Tóm tắt AI, Then thấy 3 đến 6 câu hỏi, mỗi câu có nhãn loại và dòng "Dựa trên".
  - Given mỗi câu hỏi, When kiểm tra, Then `thamChieu` trỏ tới một mục kinh nghiệm, trình độ hoặc chứng chỉ có trong kết quả.
  - Given câu hỏi sinh ra đề cập tuổi, giới tính, tình trạng hôn nhân hoặc gia đình, tôn giáo, dân tộc, sức khỏe hay quốc tịch, When server lọc, Then câu hỏi đó không được hiển thị.
  - Given hoàn thành đánh giá, When kiểm tra dữ liệu đánh giá, Then không chứa câu hỏi gợi ý.

#### Quy tắc nghiệp vụ MVP

- **BR-A1 Chỉ ứng viên đã xác nhận lịch.** Ứng viên có `Xác nhận = N` trong Chi tiết HĐPV – Ứng viên không hiển thị trên các màn của người phỏng vấn (FR-A4 danh sách, FR-A5 màn chấm), không được tính vào số đếm ở FR-A2, và API chấm điểm (FR-A5, FR-A6) từ chối với `404`. Quy tắc được kiểm ở server, không chỉ ẩn ở client.
  - Given ứng viên `Xác nhận = N`, When gọi trực tiếp API mở màn chấm hoặc hoàn thành đánh giá cho ứng viên đó, Then nhận `404` và không có bản ghi nào được tạo.
  - Given ứng viên chuyển từ `N` sang `Y` sau khi nạp lại dữ liệu (FR-A1), When mở danh sách, Then ứng viên xuất hiện.

- **BR-A2 Chỉ HĐPV đang phỏng vấn.** (PO bổ sung trong stage User Stories, 2026-10-09.) HĐPV có cột `Trạng thái` với 5 giá trị theo thứ tự vòng đời: `Draft` → `Sent` → `Xác nhận` → `Inprogress` → `Completed`. Giá trị do dữ liệu nạp vào (FR-A1) quyết định; app Phase 2 không đổi trạng thái HĐPV trong MVP.
  - Chỉ HĐPV `Inprogress` hiển thị ở FR-A2 và mở được ở FR-A4, FR-A5 (mở bài chấm mới) và FR-A8 (xem CV). HĐPV ở trạng thái khác → server trả `404`.
  - Hoàn thành đánh giá (FR-A6) được chấp nhận khi HĐPV là `Inprogress` hoặc `Completed`, để người phỏng vấn vẫn hoàn thành được bài đang chấm dở khi HĐPV vừa chuyển sang `Completed`. Trạng thái `Draft`, `Sent`, `Xác nhận` → `404`.
  - Đánh giá đã hoàn thành được giữ nguyên trong DB dù HĐPV đổi trạng thái.
  - Given HĐPV `Xác nhận`, When người phỏng vấn được gán mở danh sách, Then không thấy HĐPV đó; gọi trực tiếp API danh sách ứng viên của HĐPV đó → `404`.
  - Given người phỏng vấn đang mở form chấm và HĐPV chuyển sang `Completed`, When hoàn thành đánh giá, Then đánh giá được lưu (`201`).
  - Given HĐPV `Completed`, When mở bài chấm mới cho một ứng viên chưa chấm, Then nhận `404`.

- **BR-A3 Kết luận và refer chỉ là đề xuất.** (PO bổ sung khi xem bản HTML, 2026-10-09.) Mỗi đánh giá hoàn thành phải có kết luận cá nhân `Đạt` / `Loại` / `Cân nhắc` / `Khác`; chỉ khi chọn `Khác` mới có thể kèm một vị trí refer (tùy chọn). Đây là đề xuất của người phỏng vấn, không phải kết luận tuyển dụng cuối (HR chốt ở giai đoạn sau, quy tắc cứng đã khẳng định). Kết luận không tự động quyết định đỗ/trượt, không đổi vị trí hay trạng thái của ứng viên, và không tổng hợp giữa các người chấm trong MVP.
  - Given kết luận `Loại`, When hoàn thành đánh giá, Then dữ liệu ứng viên và vị trí của ứng viên không đổi.
  - Given refer sang vị trí B, When hoàn thành đánh giá, Then chỉ có đề xuất được lưu cùng đánh giá.

- **BR-A4 AI chỉ hỗ trợ, tắt theo mặc định.** (PO bổ sung 2026-10-09.) Tóm tắt CV, làm nổi bật và câu hỏi gợi ý bằng AI (FR-A9, FR-A10) chỉ là công cụ hỗ trợ người phỏng vấn đọc CV và chuẩn bị câu hỏi.
  - AI không chấm điểm, không tự chọn kết luận `Đạt` / `Loại` / `Cân nhắc`, không tự điền nhận xét hay refer, không xếp hạng hay so sánh ứng viên, và không là căn cứ quyết định tuyển dụng (khớp quy tắc cứng: HR chốt kết luận cuối).
  - Mọi mục AI nêu về kinh nghiệm, trình độ, chứng chỉ phải truy ngược được tới đoạn trích nguyên văn trong CV; AI không suy đoán thông tin không có trong CV.
  - AI không nêu và không dùng thuộc tính nhạy cảm (tuổi, giới tính, tình trạng hôn nhân hoặc gia đình, tôn giáo, dân tộc, sức khỏe, quốc tịch) trong tóm tắt, làm nổi bật hay câu hỏi.
  - Tính năng tắt theo mặc định (`ai.cvSummary.enabled = false`). Tài liệu nguồn của Phase 2 ghi rằng không dùng AI phân tích ứng viên trong MVP khi chưa có cơ sở pháp lý, sự đồng ý của ứng viên và rà soát thiên lệch / quyền riêng tư. PO đã yêu cầu đưa vào; do đó chỉ bật ở môi trường thật sau khi Legal và Security đồng ý bằng văn bản (xem Open Questions).
  - Given cờ AI tắt, When mở trình xem CV, Then không có nút tạo và không có dữ liệu CV nào gửi ra ngoài.
  - Given người dùng hoàn thành đánh giá, When kiểm tra, Then điểm, kết luận, nhận xét và refer chỉ chứa những gì người phỏng vấn đã nhập.

- **BR-A5 Điểm trung bình chỉ để tham khảo.** (PO bổ sung 2026-10-09.) Điểm trung bình của ứng viên là số tính từ điểm từng tiêu chí của chính người phỏng vấn. Nó không tự quyết định hay gợi ý kết luận `Đạt` / `Loại` / `Cân nhắc` / `Khác`, không có ngưỡng đỗ / trượt, không so sánh hay xếp hạng ứng viên, không tổng hợp giữa nhiều người chấm trong MVP và không nằm trong thông báo gửi ứng viên. Giữ nguyên quy tắc cứng: HR chốt kết luận cuối.
  - Given điểm trung bình cao hoặc thấp, When chọn kết luận, Then kết luận không bị đặt sẵn hay bị chặn theo điểm trung bình.
  - Given người dùng B, When đọc đánh giá của người dùng A qua API, Then nhận `403` và không thấy điểm trung bình của A.

#### Ma trận tóm tắt đầu vào → đầu ra

| FR | Đầu vào chính | Đầu ra chính |
|---|---|---|
| FR-A0 | email, mật khẩu | JWT + thông tin người dùng |
| FR-A1 | file seed theo `Kiro_bang (1).xlsx` + tiêu chí + user demo | dữ liệu trong Oracle + báo cáo nạp |
| FR-A2 | JWT | danh sách HĐPV được gán, trạng thái `Inprogress` |
| FR-A3 | (đã bỏ) | (đã bỏ) |
| FR-A4 | JWT, `maHdpv` | danh sách ứng viên đã xác nhận lịch (`Y`) kèm vị trí, sắp theo giờ từ sớm đến muộn + trạng thái chấm |
| FR-A5 | JWT, `maHdpv`, `maUngVien`, tiêu chí, vị trí để refer | form chấm điểm (điểm, điểm trung bình cập nhật ngay, kết luận, nhận xét, refer) / chế độ chỉ đọc; nút Xem CV |
| FR-A6 | điểm từng tiêu chí, `ketLuan`, nhận xét, `referMaViTri`, `referLyDo`, `idempotencyKey` | bản đánh giá `SUBMITTED` đã khóa kèm `diemTrungBinh` do server tính |
| FR-A7 | danh sách tiêu chí (seed) | tiêu chí đang hoạt động cho form |
| FR-A8 | JWT, `maHdpv`, `maUngVien` | CV PDF chỉ đọc + dòng nhật ký xem CV |
| FR-A9 | JWT, `maHdpv`, `maUngVien`, `tạoLại`; cờ `ai.cvSummary.enabled` | tóm tắt, kinh nghiệm, trình độ, chứng chỉ kèm đoạn trích và vị trí trang; làm nổi bật trong CV; bản ghi `CV_AI_SUMMARY` + nhật ký gọi AI |
| FR-A10 | kết quả FR-A9 | 3 đến 6 câu hỏi gợi ý, mỗi câu có loại và mục nguồn |

### Cố ý CẮT khỏi 2 ngày (ở lại north star / increment sau)

Tích hợp Phase 1 qua sự kiện có phiên bản; Definition of Ready 7 điều kiện (FR-2); blind scoring (FR-12); quorum + công thức tổng hợp có trọng số + cờ chênh lệch (FR-16..18); HR review/chốt/override (FR-19..21); notification + preview/gửi kết quả + guardrail hai bước (FR-22..24); nhắc/escalation (FR-15); xử lý ngoại lệ no-show/hoãn/hủy/đổi thành viên/xung đột (FR-25..29); audit bất biến đầy đủ (FR-31); offline-first; RBAC theo chi nhánh/vùng.

## Phạm vi đầy đủ MVP vs Post-MVP (north star, ngoài 2 ngày)

- **MVP đầy đủ**: FR-1..FR-26, FR-30, FR-31 (luồng cốt lõi + ngoại lệ cơ bản + audit); autosave online.
- **Post-MVP**: offline-first đầy đủ, calendar sync hai chiều, calibration workspace, bộ câu hỏi có cấu trúc, phân tích chất lượng, accessibility/đa ngôn ngữ nâng cao (mục 10.2, 16).

## Assumptions & Open Questions

Giả định (từ mục 14.1 của tài liệu nguồn):
- Phase 1 cung cấp dữ liệu đúng, định danh ổn định, sự kiện cập nhật có phiên bản.
- Doanh nghiệp đã có scorecard/chính sách, SLA, retention, ma trận quyền được phê duyệt.
- Người dùng nội bộ có SSO; kênh liên lạc ứng viên đã xác minh.
- Dịch vụ hồ sơ/lịch/họp/notification có API và trạng thái giao nhận đủ tin cậy.
- Legal/Security đã xác định phạm vi dữ liệu nhạy cảm, consent, nơi lưu trữ.

Quyết định đã chốt cho MVP 2 ngày: xem `## MVP 2 ngày (Walking Skeleton)` (DEC-1..DEC-5).
Vì MVP 2 ngày cố ý cắt tổng hợp/HR chốt/blind scoring, các câu OQ sau KHÔNG còn chặn MVP;
chúng được để lại cho north star (MVP đầy đủ) và cần PO chốt trước khi làm các FR tương ứng:
- OQ-1 Thang điểm/anchor/rule N/A, có cấu hình theo vị trí/vòng không (MVP: thang 1–5 cố định, chưa N/A).
- OQ-2 Quorum và thành viên/vai trò bắt buộc; ai được miễn/override (ngoài phạm vi 2 ngày).
- OQ-3 Công thức tổng hợp, trọng số, ngưỡng chênh lệch, làm tròn (ngoài phạm vi 2 ngày).
- OQ-4 Blind scoring có bắt buộc không; xem điểm người khác sau khi hoàn thành đánh giá ngay hay chờ tất cả (ngoài phạm vi 2 ngày).
- OQ-5 Ai được mở lại đánh giá; có cho mở lại sau khi HR chốt không (ngoài phạm vi 2 ngày).
- OQ-6 HR có phải người duy nhất chốt hay cần đồng phê duyệt (ngoài phạm vi 2 ngày).
- OQ-7 Phạm vi quyền theo chi nhánh/vùng — RBAC địa lý (MVP: phân quyền theo người chấm ở tầng API; chi nhánh/vùng để sau).

Giả định mới khi chi tiết hóa FR-A0..A7 (cần PO xác nhận tại gate):
- A-1 (FR-A2) Người phỏng vấn chỉ thấy HĐPV mình được gán qua bảng Chi tiết HĐPV – CBQL.
- A-2 (ĐÃ BỎ cùng FR-A3) Màn chọn vị trí không còn; vị trí lấy từ trường `Vị trí` của từng ứng viên và hiển thị trên danh sách ở FR-A4.
- A-7 (FR-A4) "Sắp xếp từ gần tới xa" hiểu là giờ bắt đầu từ sớm đến muộn trong ngày của HĐPV, không phụ thuộc giờ hiện tại của thiết bị.
- A-3 (FR-A4) ĐÃ CHỐT (PO, thay giả định cũ): ứng viên `Xác nhận = N` không hiển thị và không chấm được — xem BR-A1.
- A-4 (FR-A5) Nhận xét là tùy chọn, tối đa 2000 ký tự.
- A-5 (FR-A7) MVP không có màn quản trị tiêu chí; tiêu chí nạp qua seed, dùng chung cho mọi HĐPV/vị trí.
- A-6 (FR-A0) JWT hết hạn sau 8 giờ; không có refresh token trong MVP.

Câu hỏi mở về tính năng AI (FR-A9, FR-A10; cần PO, Legal và Security trả lời trước khi bật ở môi trường thật):
- OQ-AI-1 Dùng nhà cung cấp AI nào, đặt ở đâu (dịch vụ đám mây bên ngoài hay mô hình chạy nội bộ), dữ liệu lưu ở quốc gia nào, hợp đồng có cấm dùng dữ liệu để huấn luyện không.
- OQ-AI-2 Cần sự đồng ý (consent) của ứng viên cho việc dùng AI đọc CV không, và thông báo ở đâu.
- OQ-AI-3 Ai rà soát thiên lệch của câu hỏi gợi ý và tóm tắt, theo chu kỳ nào.
- OQ-AI-4 Kết quả AI lưu bao lâu, ai được xem ngoài người phỏng vấn đã gọi.

Còn mở cho MVP 2 ngày (không chặn, xác nhận khi triển khai):
- Schema DB riêng (tên bảng/cột) do app Phase 2 tự định nghĩa dựa trên `Kiro_bang (1).xlsx`; chốt ở stage domain-design/schema trước khi code.
- Dữ liệu seed/import mẫu để demo (vài HĐPV, vị trí, ứng viên) cần chuẩn bị.

Bổ sung khi xem bản HTML ở Refined Mockups (PO, 2026-10-09; trả lời Q7..Q12 trong `refined-mockups-questions.md`):
- Kết luận cá nhân `Đạt` / `Loại` / `Cân nhắc`, bắt buộc khi hoàn thành (FR-A5, FR-A6, BR-A3); nhận xét vẫn tùy chọn.
- Refer: tối đa 1 vị trí khác kèm lý do tùy chọn, chọn từ bảng Vị trí nạp bằng script (FR-A1, FR-A5, FR-A6); chỉ là đề xuất.
- Xem CV dạng PDF chỉ đọc trong app, ghi nhật ký mỗi lần xem (FR-A8, FR-A1 thêm `cvPath`). Đây là nhật ký tối thiểu cho việc xem CV, không thay thế audit bất biến đầy đủ (FR-31) vẫn nằm ngoài MVP.
- Giả định mới: A-8 liên kết xem CV hết hạn sau 5 phút; A-9 khối thông tin ứng viên vẫn ẩn `SĐT`, `Ngày sinh`, `Giới tính` nhưng CV hiển thị nguyên văn vì cần cho phỏng vấn; A-10 trong MVP chưa có cách ngăn tuyệt đối chụp màn hình CV.
- Rủi ro lịch: ba mục thêm công sức đáng kể cho lát cắt 2 ngày, nhất là lưu tệp CV và trình xem PDF trên web và điện thoại; FR-A8 là story đầu tiên có thể xếp Should Have nếu thiếu thời gian.

Bổ sung khi xem bản HTML, đợt 4 (PO, 2026-10-09):
- Đổi thuật ngữ "nộp đánh giá / nộp bài / submit" thành **"hoàn thành đánh giá"** ở mọi tài liệu và bản HTML (FR-A6 nay là "Hoàn thành và khóa đánh giá"; nút "Hoàn thành đánh giá"; thông báo "Đã hoàn thành đánh giá"). Các định danh kỹ thuật được giữ nguyên để không phá thiết kế dữ liệu: trạng thái `SUBMITTED`, trường `submittedAt`, tên API và `idempotencyKey`. Các quy tắc cứng đã khẳng định ở practices-discovery (lưu trong `memory/project.md`) vẫn dùng chữ "submit" và chưa đổi, vì chỉ đổi qua bước khẳng định lại.
- Thêm điểm trung bình ứng viên: khối "Điểm trung bình" cập nhật ngay trên màn chấm điểm (FR-A5), server tính và lưu `diemTrungBinh` khi hoàn thành (FR-A6), cột "Điểm TB" trên danh sách ứng viên đã hoàn thành (FR-A4), quy tắc BR-A5 (chỉ để tham khảo).
- Giả định mới: A-16 "cột" được hiểu là cột Điểm TB trên danh sách ứng viên cộng khối điểm trung bình trên phiếu chấm; A-17 điểm trung bình là trung bình cộng không trọng số, quy về thang 5, làm tròn 1 chữ số khi hiển thị và lưu 2 chữ số; A-18 điểm trung bình tạm tính hiển thị ngay khi chưa chọn đủ tiêu chí (thay vì chờ đủ).

Bổ sung khi xem bản HTML, đợt 3 (PO, 2026-10-09):
- Phông chữ sans-serif đồng nhất trên mọi màn hình (NFR-9). Trong bản HTML, trang CV giả lập trước đây dùng phông serif nay đã đổi sang cùng họ sans-serif. Trong app thật, nội dung bên trong tệp PDF của CV dùng phông nhúng trong tệp nên không đổi được.
- Kết luận có thêm lựa chọn thứ tư `Khác`; khối "Giới thiệu sang vị trí khác (tùy chọn)" chỉ hiển thị khi chọn `Khác` (FR-A5, FR-A6, BR-A3). Cách hiểu này thay Q9 = A (khối refer luôn hiển thị).
- Quy tắc PO đặt ra: mọi thứ thêm trong thiết kế phải có tính năng tương ứng trong requirement và user story. Đã rà lại thiết kế và bổ sung các mục trước đây chỉ có trong mockup: sáng/tối (NFR-10), bố cục thích ứng và hai khung (NFR-11), khung xương và giảm chuyển động (NFR-12), truy cập cơ bản và tiếng Việt (NFR-6 chi tiết hơn), hiện/ẩn mật khẩu và giữ đăng nhập khi làm mới trang (FR-A0), phóng to / chuyển trang CV (FR-A8). Story tương ứng ở nhóm 8 của `stories.md`.

Bổ sung khi xem bản HTML, đợt 2 (PO, 2026-10-09): tính năng AI tóm tắt CV, làm nổi bật kinh nghiệm / trình độ / chứng chỉ và gợi ý câu hỏi.
- Thêm FR-A9, FR-A10, BR-A4, NFR-8; thêm bảng `CV_AI_SUMMARY`, nhật ký gọi AI và các tham số cấu hình `ai.*`.
- Giả định mới: A-11 tính năng tắt theo mặc định bằng cờ cấu hình; A-12 tạo theo yêu cầu của người dùng (không tạo sẵn hàng loạt), có lưu theo `cvHash`; A-13 kết quả AI bằng tiếng Việt, chỉ đọc, người phỏng vấn không sửa; A-14 mức ưu tiên Could Have (đề xuất của tôi) vì phụ thuộc quyết định nhà cung cấp và Legal; A-15 câu hỏi gợi ý không lưu cùng đánh giá.
- Xung đột với tài liệu nguồn: mục 11.2 của tài liệu Phase 2 ghi không dùng AI phân tích ứng viên trong MVP khi chưa có cơ sở pháp lý, consent và rà soát thiên lệch; mục 16 xếp "gợi ý thông minh sau review Legal/Bias" vào Increment 3. PO yêu cầu đưa vào MVP nên đây được xem là quyết định của PO, kèm điều kiện cờ tắt mặc định (BR-A4).
- Rủi ro lịch: cộng thêm tích hợp nhà cung cấp AI, trích văn bản PDF, che dữ liệu cá nhân, kiểm tra kết quả và giao diện; đây là phần tốn công nhất trong các bổ sung; có thể làm sau cùng hoặc để ngoài 2 ngày mà không ảnh hưởng luồng chấm điểm.

Thay đổi luồng (PO yêu cầu khi duyệt User Stories, 2026-10-09):
- Bỏ màn chọn vị trí (FR-A3 đánh dấu đã bỏ, giữ ID để truy vết). Giả định A-2 (suy vị trí từ ứng viên) không còn cần: vị trí chỉ là thông tin hiển thị trên từng dòng ứng viên ở FR-A4.
- FR-A4 hiển thị tất cả ứng viên đã xác nhận lịch của HĐPV trong một danh sách, mỗi dòng có vị trí, sắp theo giờ bắt đầu từ sớm đến muộn. Cách hiểu "từ gần tới xa" là giả định cần PO xác nhận: sớm đến muộn, không phụ thuộc giờ hiện tại.

Bổ sung sau khi duyệt (PO yêu cầu trong stage User Stories, 2026-10-09):
- Thêm cột `Trạng thái` cho HĐPV (`Draft`, `Sent`, `Xác nhận`, `Inprogress`, `Completed`) và quy tắc BR-A2; cập nhật FR-A1, FR-A2, FR-A3, FR-A4, FR-A5, FR-A6. Cột này chưa có trong `Kiro_bang (1).xlsx`; dữ liệu nạp vào phải có cột này.

Thay đổi kiến trúc (ghi nhận ở lần Request Changes này):
- Chuyển từ Supabase sang **Oracle XE local (Docker)**; DB **riêng**, không dùng chung với team Phase 1.
- Login đổi từ Supabase passwordless sang **JWT tự xây** (email+mật khẩu, bcrypt, bảng user Oracle).
- Thêm tầng **REST API Node.js/Express + `oracledb`**; phân quyền ở tầng API thay cho RLS.
