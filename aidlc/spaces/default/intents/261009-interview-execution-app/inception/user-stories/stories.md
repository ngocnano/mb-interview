# User Stories — App thực hiện phỏng vấn (MVP 2 ngày)

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/requirements-analysis/requirements.md` — FR-A0..A7, BR-A1, BR-A2, quy ước lỗi API
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/practices-discovery/team-practices.md` — TDD, trunk-based, Node.js + Flutter
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/user-stories/user-stories-questions.md` — Q1..Q7 (phạm vi, nhân vật, cách chia, trạng thái HĐPV)
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/user-stories/personas.md` — P1 Người phỏng vấn, P2 Người vận hành

## Cách đọc tài liệu này

- **Phạm vi:** chỉ MVP 2 ngày (Q1 = A). Các yêu cầu phạm vi đầy đủ (FR-1..FR-31) không có story; chúng nằm trong bảng truy vết `traceability.json` với trạng thái `N/A` và lý do.
- **Cách chia:** theo từng chức năng và màn hình (Q3 = A, Q4 = theo chức năng, màn hình). Mỗi nhóm `US{n}` ứng với một màn hình hoặc một chức năng.
- **Cỡ story:** `S` = vài giờ, `M` = khoảng nửa ngày, `L` = lớn hơn nửa ngày (US5.6, cần tích hợp nhà cung cấp AI). Ước lượng thô, chưa phải cam kết lịch; Delivery Planning sẽ chốt.
- **Tiêu chí chấp nhận:** dạng Given / When / Then, mỗi tiêu chí có ID `AC{nhóm}.{story}.{số}` để viết test trước (TDD).
- **Mã lỗi API:** `400` dữ liệu sai, `401` chưa đăng nhập hoặc token sai, `403` không có quyền, `404` không tìm thấy hoặc không được phép mở, `409` xung đột. Ngữ nghĩa theo `requirements.md`.
- **Ưu tiên:** MoSCoW. Toàn bộ nội dung đã nằm trong lát cắt 2 ngày nên hầu hết là Must Have.

## Danh sách story

| ID | Story | Nhân vật | Ưu tiên | Cỡ | Yêu cầu nguồn |
|---|---|---|---|---|---|
| US1.1 | Đăng nhập bằng email và mật khẩu | P1 | Must Have | M | FR-A0 |
| US1.2 | Đăng xuất | P1 | Should Have | S | FR-A0 |
| US2.1 | Xem danh sách HĐPV đang phỏng vấn của tôi | P1 | Must Have | M | FR-A2, BR-A2 |
| US4.1 | Xem danh sách ứng viên của HĐPV, có vị trí, sắp theo giờ | P1 | Must Have | M | FR-A4, BR-A1, BR-A2 |
| US5.1 | Xem thông tin ứng viên và bộ tiêu chí | P1 | Must Have | M | FR-A5, FR-A7, BR-A1, BR-A2 |
| US5.2 | Chấm điểm từng tiêu chí và ghi nhận xét | P1 | Must Have | M | FR-A5 |
| US5.3 | Chọn kết luận Đạt / Loại / Cân nhắc / Khác | P1 | Must Have | S | FR-A5, FR-A6, BR-A3 |
| US5.4 | Giới thiệu ứng viên sang vị trí khác (khi chọn kết luận Khác) | P1 | Should Have | S | FR-A5, FR-A6, BR-A3 |
| US5.5 | Xem CV của ứng viên | P1 | Should Have | M | FR-A8, BR-A1, BR-A2 |
| US5.6 | Tóm tắt CV bằng AI và làm nổi bật kinh nghiệm, trình độ, chứng chỉ | P1 | Could Have | L | FR-A9, BR-A4, NFR-8 |
| US5.7 | Xem câu hỏi gợi ý thêm từ CV | P1 | Could Have | S | FR-A10, BR-A4 |
| US5.8 | Xem điểm trung bình của ứng viên khi chấm điểm | P1 | Must Have | S | FR-A4, FR-A5, FR-A6, BR-A5 |
| US6.1 | Hoàn thành đánh giá và khóa | P1 | Must Have | M | FR-A6, BR-A1, BR-A2 |
| US6.2 | Hoàn thành đánh giá an toàn khi mất mạng hoặc bấm nhiều lần | P1 | Must Have | S | FR-A6 |
| US6.3 | Xem lại bài đã hoàn thành | P1 | Must Have | S | FR-A5, FR-A6, FR-A7 |
| US7.1 | Nạp dữ liệu HĐPV, CBQL, ứng viên và lịch | P2 | Must Have | M | FR-A1, BR-A2 |
| US7.2 | Nạp bộ tiêu chí chấm điểm | P2 | Must Have | S | FR-A7, FR-A1 |
| US7.3 | Tạo tài khoản cho người phỏng vấn | P2 | Must Have | S | FR-A0, FR-A1 |
| US7.4 | Bật/tắt tính năng AI và cấu hình nhà cung cấp | P2 | Could Have | S | FR-A9, NFR-8 |
| US8.1 | Phông chữ sans-serif đồng nhất và giao diện tiếng Việt | P1 | Must Have | S | NFR-9, NFR-6 |
| US8.2 | Bố cục thích ứng điện thoại và web | P1 | Must Have | M | NFR-11 |
| US8.3 | Bố cục hai khung trên máy tính để bàn | P1 | Should Have | M | NFR-11 |
| US8.4 | Giao diện sáng và tối theo hệ thống | P1 | Should Have | S | NFR-10 |
| US8.5 | Truy cập cơ bản theo WCAG 2.1 AA | P1 | Must Have | M | NFR-6 |
| US8.6 | Khung xương khi tải và giảm chuyển động | P1 | Should Have | S | NFR-12 |

## Nhóm 1 — Truy cập

### US1.1 — Đăng nhập bằng email và mật khẩu

**Là** người phỏng vấn, **tôi muốn** đăng nhập bằng email và mật khẩu, **để** app biết tôi là ai và chỉ cho tôi thấy việc của mình.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** US7.3 (có tài khoản)
- **Tiêu chí chấp nhận:**
  - **AC1.1.1** Given tài khoản hợp lệ và đang hoạt động, When nhập đúng email và mật khẩu, Then nhận token đăng nhập và vào màn danh sách HĐPV, có hiển thị tên của tôi.
  - **AC1.1.2** Given nhập sai email hoặc sai mật khẩu, When bấm đăng nhập, Then thấy thông báo chung "Email hoặc mật khẩu không đúng" và không biết được email đó có tồn tại hay không (API trả `401`).
  - **AC1.1.3** Given tài khoản bị khóa, When nhập đúng email và mật khẩu, Then bị từ chối với `403` và thông báo tài khoản bị khóa.
  - **AC1.1.4** Given email sai định dạng hoặc mật khẩu để trống, When bấm đăng nhập, Then app chặn ngay, chỉ ra trường lỗi và không gửi request.
  - **AC1.1.5** Given không có token hoặc token đã hết hạn (sau 8 giờ), When gọi bất kỳ API nghiệp vụ nào, Then nhận `401`, app xóa token và quay về màn đăng nhập.
  - **AC1.1.6** Given bất kỳ lần đăng nhập nào, When kiểm tra DB và log, Then DB chỉ lưu mật khẩu đã băm bằng bcrypt và log không chứa mật khẩu dạng rõ.
  - **AC1.1.7** Given đang nhập mật khẩu, When bấm nút hiện/ẩn, Then mật khẩu chuyển giữa dạng chấm và dạng chữ và tiêu điểm vẫn ở ô mật khẩu; nút có nhãn "Hiện mật khẩu" / "Ẩn mật khẩu" cho trình đọc màn hình.
  - **AC1.1.8** Given đã đăng nhập và token còn hạn, When làm mới trang web (F5), Then vẫn ở trạng thái đăng nhập; Given token hết hạn, Then về màn đăng nhập.
  - **AC1.1.9** Given nhập sai mật khẩu 5 lần liên tiếp với cùng một email, When đăng nhập lần thứ 6 (kể cả đúng mật khẩu) trong vòng 15 phút, Then nhận `429` mã `LOGIN_LOCKED` kèm `Retry-After` và app hiển thị "Đăng nhập tạm khóa, thử lại sau 15 phút"; Given hết 15 phút hoặc đã đăng nhập đúng trước khi đủ 5 lần sai, Then bộ đếm được đặt lại.
- **INVEST:** độc lập (chỉ cần có tài khoản), kiểm thử được bằng test API và test màn hình, đủ nhỏ cho nửa ngày.

### US1.2 — Đăng xuất

**Là** người phỏng vấn, **tôi muốn** đăng xuất, **để** người khác dùng chung máy không xem được việc của tôi.

- **Ưu tiên:** Should Have · **Cỡ:** S · **Phụ thuộc:** US1.1
- **Tiêu chí chấp nhận:**
  - **AC1.2.1** Given đã đăng nhập, When bấm đăng xuất, Then token bị xóa khỏi máy và app quay về màn đăng nhập.
  - **AC1.2.2** Given vừa đăng xuất, When bấm nút quay lại của thiết bị, Then không xem lại được màn nghiệp vụ nào và request kế tiếp không còn kèm token.
- **INVEST:** độc lập sau US1.1, rất nhỏ.

## Nhóm 2 — Chọn HĐPV

### US2.1 — Xem danh sách HĐPV đang phỏng vấn của tôi

**Là** người phỏng vấn, **tôi muốn** thấy các hội đồng phỏng vấn đang diễn ra mà tôi được gán, **để** chọn đúng hội đồng cần làm việc hôm nay.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** US1.1, US7.1
- **Tiêu chí chấp nhận:**
  - **AC2.1.1** Given tôi được gán vào 2 HĐPV `Inprogress` trong tổng 5 HĐPV, When mở màn, Then chỉ thấy đúng 2 HĐPV đó.
  - **AC2.1.2** Given tôi được gán vào 3 HĐPV có trạng thái `Draft`, `Inprogress`, `Completed`, When mở màn, Then chỉ thấy HĐPV `Inprogress`; HĐPV ở trạng thái `Sent` và `Xác nhận` cũng không hiển thị.
  - **AC2.1.3** Given danh sách có HĐPV, When xem một dòng, Then thấy mã HĐPV, tên, ngày, hình thức (`Online`/`Offline`), địa điểm, và số đã chấm / tổng số ứng viên đã xác nhận lịch (chỉ tính của tôi).
  - **AC2.1.4** Given có nhiều HĐPV, When mở màn, Then sắp theo ngày tăng dần, rồi theo mã.
  - **AC2.1.5** Given không có HĐPV `Inprogress` nào được gán cho tôi, When mở màn, Then thấy thông báo rỗng "Bạn chưa được gán vào hội đồng phỏng vấn nào đang diễn ra".
  - **AC2.1.6** Given tôi gọi trực tiếp API chi tiết một HĐPV mà tôi không được gán, When gửi request, Then nhận `403`; nếu HĐPV tôi được gán nhưng không `Inprogress`, Then nhận `404`.
  - **AC2.1.7** Given mất mạng hoặc server lỗi, When mở màn, Then thấy thông báo lỗi và nút Thử lại.
- **INVEST:** kiểm thử được độc lập bằng dữ liệu mẫu; quy tắc lọc nằm ở server nên test API được.

## Nhóm 3 — (Đã bỏ) Chọn vị trí

PO bỏ màn chọn vị trí ngày 2026-10-09 (story US3.1 cũ không còn). Thông tin vị trí hiển thị ngay trên từng dòng ứng viên ở US4.1. ID nhóm 3 được giữ trống để các ID story và tiêu chí khác không đổi.

## Nhóm 4 — Danh sách ứng viên

### US4.1 — Xem danh sách ứng viên của HĐPV, có vị trí, sắp theo giờ

**Là** người phỏng vấn, **tôi muốn** thấy tất cả ứng viên của hội đồng đã chọn, mỗi người kèm vị trí ứng tuyển và sắp theo giờ phỏng vấn từ sớm đến muộn, **để** biết ai là người tiếp theo, ứng tuyển vị trí nào và ai tôi đã chấm.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** US2.1
- **Tiêu chí chấp nhận:**
  - **AC4.1.1** Given 3 ứng viên đã xác nhận lúc 10:00, 08:30, 09:15, When mở màn, Then thứ tự là 08:30, 09:15, 10:00.
  - **AC4.1.2** Given HĐPV có 4 ứng viên và 1 người `Xác nhận = N`, When mở màn, Then chỉ thấy 3 ứng viên.
  - **AC4.1.3** Given tôi đã hoàn thành đánh giá cho một ứng viên, When mở màn, Then dòng của ứng viên đó hiển thị `Đã chấm`; ứng viên chưa chấm hiển thị `Chưa chấm`.
  - **AC4.1.4** Given danh sách có ứng viên, When xem một dòng, Then thấy mã, tên, vị trí và khung giờ đầy đủ `dd/mm/yyyy hh:mm – hh:mm`.
  - **AC4.1.5** Given không còn ứng viên nào đã xác nhận lịch, When mở màn, Then thấy thông báo "Chưa có ứng viên xác nhận lịch".
  - **AC4.1.6** Given HĐPV không `Inprogress`, When gọi API, Then nhận `404`.
  - **AC4.1.7** Given HĐPV có ứng viên thuộc 2 vị trí khác nhau, When mở màn, Then tất cả nằm chung một danh sách (không có bước chọn vị trí) và mỗi dòng hiển thị `job` và đơn vị của chính ứng viên đó.
  - **AC4.1.8** Given hai ứng viên có cùng giờ bắt đầu, When mở màn, Then ứng viên có mã nhỏ hơn đứng trước.
  - **AC4.1.9** Given tôi không được gán vào HĐPV, When gọi API danh sách ứng viên của HĐPV đó, Then nhận `403`; Given HĐPV không tồn tại, Then nhận `404`.
  - **AC4.1.10** Given mất mạng hoặc server lỗi, When mở màn, Then thấy thông báo lỗi và nút Thử lại.
  - **AC4.1.11** Given tôi đã hoàn thành đánh giá với kết luận `Đạt`, `Loại`, `Cân nhắc` hoặc `Khác`, When xem dòng ứng viên đó, Then thấy nhãn `Đã chấm` kèm nhãn kết luận tương ứng (chữ và biểu tượng, không chỉ màu).
  - **AC4.1.12** Given danh sách có cả ứng viên đã chấm và chưa chấm, When xem, Then ứng viên đã hoàn thành có cột Điểm TB hiển thị một chữ số thập phân với dấu phẩy (ví dụ "Điểm TB 3,8") và ứng viên chưa chấm không có Điểm TB.
- **INVEST:** kiểm thử được độc lập; quy tắc BR-A1 và BR-A2 được kiểm ở server. Cỡ tăng từ S lên M vì US3.1 được gộp vào. Cách hiểu "sắp từ gần tới xa" là từ sớm đến muộn theo giờ bắt đầu, không phụ thuộc giờ hiện tại của thiết bị, cần PO xác nhận.

## Nhóm 5 — Màn phỏng vấn và chấm điểm

### US5.1 — Xem thông tin ứng viên và bộ tiêu chí

**Là** người phỏng vấn, **tôi muốn** xem thông tin cơ bản của ứng viên và các tiêu chí cần chấm, **để** phỏng vấn và chấm đúng thang đã thống nhất.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** US4.1, US7.2
- **Tiêu chí chấp nhận:**
  - **AC5.1.1** Given tôi chọn một ứng viên đã xác nhận lịch, When mở màn, Then thấy mã, tên, vị trí, kinh nghiệm, trình độ, khung giờ, hình thức và địa điểm.
  - **AC5.1.2** Given màn đang mở, When kiểm tra màn hình và nội dung API trả về, Then không có số điện thoại, ngày sinh và giới tính của ứng viên.
  - **AC5.1.3** Given có 5 tiêu chí đang hoạt động, When mở màn, Then hiển thị đủ 5 tiêu chí đúng thứ tự cấu hình, mỗi tiêu chí có mã, tên và bộ chọn điểm 1 đến 5.
  - **AC5.1.4** Given ứng viên `Xác nhận = N`, When gọi API mở màn chấm, Then nhận `404` và app không mở màn.
  - **AC5.1.5** Given HĐPV không `Inprogress`, When mở bài chấm mới, Then nhận `404`.
  - **AC5.1.6** Given chưa có tiêu chí nào đang hoạt động, When mở màn, Then thấy lỗi "Chưa cấu hình tiêu chí" và không cho chấm.
- **INVEST:** phụ thuộc dữ liệu tiêu chí nhưng test được bằng dữ liệu mẫu.

### US5.2 — Chấm điểm từng tiêu chí và ghi nhận xét

**Là** người phỏng vấn, **tôi muốn** chọn điểm cho từng tiêu chí và ghi nhận xét, **để** phản ánh đúng đánh giá của tôi về ứng viên.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** US5.1
- **Tiêu chí chấp nhận:**
  - **AC5.2.1** Given còn ít nhất 1 tiêu chí chưa có điểm, When xem màn, Then nút Hoàn thành đánh giá ở trạng thái khóa; When bấm vào nút khóa, Then các tiêu chí còn thiếu được đánh dấu và tiêu điểm chuyển tới tiêu chí thiếu đầu tiên.
  - **AC5.2.2** Given điểm nằm ngoài thang của tiêu chí hoặc không phải số nguyên, When nhập trên app, Then app chặn; When gửi điểm 6 trực tiếp qua API, Then nhận `400`.
  - **AC5.2.3** Given đã chấm đủ mọi tiêu chí với điểm hợp lệ và đã chọn kết luận (US5.3), When xem màn, Then nút Hoàn thành đánh giá được bật, kể cả khi nhận xét để trống.
  - **AC5.2.4** Given tôi nhập nhận xét, When gần đến 2000 ký tự, Then thấy bộ đếm ký tự; Given đã đủ 2000 ký tự, Then không nhập thêm được.
  - **AC5.2.5** Given tôi đã nhập dữ liệu nhưng chưa hoàn thành, When rời màn, Then thấy cảnh báo "Dữ liệu chưa lưu sẽ mất" và được chọn ở lại hoặc rời đi.
  - **AC5.2.6** Given máy tính để bàn đang chia hai khung và tôi đã nhập dữ liệu chưa hoàn thành, When bấm một ứng viên khác ở khung trái, Then thấy cùng cảnh báo trước khi chuyển; chọn Ở lại thì giữ nguyên dữ liệu.
  - **AC5.2.7** Given tôi dùng bàn phím trên web, When đứng ở một hàng điểm, Then phím mũi tên trái phải đổi điểm và Enter hoặc Space chọn điểm.
- **INVEST:** kiểm thử được bằng test màn hình và test kiểm tra dữ liệu đầu vào.

### US5.3 — Chọn kết luận Đạt / Loại / Cân nhắc / Khác

**Là** người phỏng vấn, **tôi muốn** chọn kết luận cá nhân `Đạt`, `Loại`, `Cân nhắc` hoặc `Khác` cho ứng viên, **để** ghi lại đề xuất của tôi sau khi chấm điểm.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** US5.2
- **Tiêu chí chấp nhận:**
  - **AC5.3.1** Given màn chấm điểm đang mở, When xem khối Kết luận, Then thấy bốn lựa chọn `Đạt`, `Loại`, `Cân nhắc`, `Khác`, chọn được đúng một, và có chú thích rõ đây là đề xuất của người phỏng vấn, không phải kết luận cuối.
  - **AC5.3.2** Given đã chấm đủ tiêu chí nhưng chưa chọn kết luận, When xem màn, Then nút Hoàn thành đánh giá ở trạng thái khóa; When bấm vào nút khóa, Then khối Kết luận được đánh dấu "Chưa chọn kết luận".
  - **AC5.3.3** Given chọn `Loại`, `Cân nhắc` hoặc `Khác` và để trống nhận xét, When hoàn thành đánh giá, Then vẫn hoàn thành được (nhận xét tùy chọn).
  - **AC5.3.4** Given mỗi lựa chọn kết luận, When xem, Then lựa chọn đã chọn có dấu tích và chữ, không chỉ khác màu.
  - **AC5.3.5** Given chọn kết luận `Loại` hoặc `Khác`, When hoàn thành đánh giá, Then dữ liệu và vị trí của ứng viên không đổi (BR-A3).
  - **AC5.3.6** Given màn hình điện thoại, When xem khối Kết luận, Then bốn lựa chọn xếp hai hàng hai cột, mỗi lựa chọn cao tối thiểu 48 px; Given máy tính để bàn, Then xếp một hàng.
  - **AC5.3.7** Given bốn lựa chọn, When xem, Then mỗi lựa chọn có biểu tượng và chữ riêng (`Đạt` dấu tích, `Loại` dấu gạch chéo, `Cân nhắc` dấu hỏi, `Khác` mũi tên chéo).
- **INVEST:** nhỏ, kiểm thử độc lập qua test màn hình và test API (xem AC6.1.8).

### US5.4 — Giới thiệu ứng viên sang vị trí khác (khi chọn kết luận Khác)

**Là** người phỏng vấn, **tôi muốn** khi chọn kết luận `Khác` thì được đề xuất giới thiệu ứng viên sang một vị trí khác, **để** không bỏ lỡ ứng viên phù hợp với vị trí khác.

- **Ưu tiên:** Should Have · **Cỡ:** S · **Phụ thuộc:** US5.3, US7.1 (có bảng vị trí)
- **Tiêu chí chấp nhận:**
  - **AC5.4.0** Given chưa chọn kết luận hoặc đã chọn `Đạt`, `Loại` hoặc `Cân nhắc`, When xem màn chấm điểm, Then khối "Giới thiệu sang vị trí khác (tùy chọn)" ẩn.
  - **AC5.4.1** Given đã chọn kết luận `Khác`, When xem khối Giới thiệu, Then khối hiện ra với ô chọn "Giới thiệu sang vị trí khác" mặc định "Không refer" và ô lý do ngắn (tối đa 500 ký tự); không bắt buộc chọn vị trí để hoàn thành.
  - **AC5.4.2** Given ứng viên đang ở vị trí A, When mở danh sách chọn, Then thấy các vị trí đang hoạt động trừ vị trí A, tối đa chọn 1 vị trí.
  - **AC5.4.3** Given chưa chọn vị trí refer, When xem ô lý do, Then ô lý do bị vô hiệu.
  - **AC5.4.4** Given chọn vị trí B và hoàn thành đánh giá, When xem lại bài đã hoàn thành, Then thấy vị trí refer B và lý do ở dạng chỉ đọc.
  - **AC5.4.5** Given refer là tùy chọn, When không chọn vị trí refer, Then vẫn hoàn thành được.
  - **AC5.4.6** Given refer sang vị trí B, When hoàn thành đánh giá, Then chỉ lưu đề xuất cùng đánh giá và vị trí của ứng viên không đổi (BR-A3).
  - **AC5.4.7** Given đã chọn `Khác` và nhập vị trí cùng lý do, When đổi sang `Đạt`, `Loại` hoặc `Cân nhắc`, Then khối ẩn, giá trị đã nhập bị xóa và không được gửi khi hoàn thành.
  - **AC5.4.8** Given khối vừa hiện ra sau khi chọn `Khác`, When dùng trình đọc màn hình, Then nghe thông báo "Đã hiện ô giới thiệu sang vị trí khác".
- **INVEST:** nhỏ; phụ thuộc bảng vị trí do script nạp (AC7.1.8).

### US5.5 — Xem CV của ứng viên

**Là** người phỏng vấn, **tôi muốn** mở CV của ứng viên ngay trong app, **để** đối chiếu hồ sơ khi phỏng vấn và chấm điểm.

- **Ưu tiên:** Should Have · **Cỡ:** M · **Phụ thuộc:** US5.1, US7.1 (có `cvPath`)
- **Tiêu chí chấp nhận:**
  - **AC5.5.1** Given ứng viên đã xác nhận lịch, có CV, trong HĐPV `Inprogress` mà tôi được gán, When bấm Xem CV, Then CV mở trong app ở chế độ chỉ đọc và không có nút tải xuống, in hay chia sẻ.
  - **AC5.5.2** Given ứng viên chưa có CV, When mở màn chấm điểm, Then nút hiển thị "Chưa có CV" và không bấm được.
  - **AC5.5.3** Given mỗi lần xem CV thành công, When kiểm tra DB, Then có một dòng nhật ký gồm người xem, HĐPV, ứng viên và thời điểm.
  - **AC5.5.4** Given tôi không được gán vào HĐPV, When gọi API xem CV, Then nhận `403` và không có nhật ký xem.
  - **AC5.5.5** Given ứng viên `Xác nhận = N` hoặc HĐPV không `Inprogress`, When gọi API xem CV, Then nhận `404` và không trả nội dung.
  - **AC5.5.6** Given liên kết xem đã quá 5 phút, When dùng lại liên kết cũ, Then bị từ chối; khi đang xem mà liên kết hết hạn, app tự xin liên kết mới một lần.
  - **AC5.5.7** Given tệp CV không đọc được, When bấm Xem CV, Then thấy "Không mở được CV" và nút Thử lại.
  - **AC5.5.8** Given CV chứa số điện thoại hoặc ngày sinh, When xem, Then CV hiển thị nguyên văn trong trình xem, còn khối thông tin ứng viên vẫn không hiển thị các trường đó (AC5.1.2).
  - **AC5.5.9** Given CV đang mở, When bấm phóng to, thu nhỏ hoặc chuyển trang, Then CV đổi cỡ và trang tương ứng; phóng to trong khoảng 75% đến 200%; nút trang trước vô hiệu ở trang đầu và nút trang sau vô hiệu ở trang cuối.
  - **AC5.5.10** Given trình xem CV, When mở trên điện thoại hoặc cửa sổ hẹp, Then CV hiển thị toàn màn hình; When mở trên máy tính để bàn, Then hiển thị dạng lớp phủ bên phải; Esc hoặc nút Đóng đóng trình xem và đưa tiêu điểm về nút Xem CV.
- **INVEST:** là story tốn công nhất trong nhóm vì cần lưu tệp, cấp liên kết ngắn hạn và trình xem PDF cho web và điện thoại. Việc không có nút tải/in chỉ là biện pháp giao diện; không ngăn tuyệt đối chụp màn hình (nhật ký xem là biện pháp truy vết thay thế).

### US5.6 — Tóm tắt CV bằng AI và làm nổi bật kinh nghiệm, trình độ, chứng chỉ

**Là** người phỏng vấn, **tôi muốn** AI tóm tắt CV và làm nổi bật kinh nghiệm, trình độ, chứng chỉ ngay trong trình xem CV, **để** nắm nhanh hồ sơ và kiểm chứng từng thông tin với đoạn gốc trong CV.

- **Ưu tiên:** Could Have (đề xuất, xem Assumptions) · **Cỡ:** L · **Phụ thuộc:** US5.5, US7.4
- **Tiêu chí chấp nhận:**
  - **AC5.6.1** Given cờ AI bật, CV có chữ, tôi được gán vào HĐPV `Inprogress` và ứng viên đã xác nhận lịch, When bấm Tạo tóm tắt AI, Then thấy tóm tắt và ba nhóm Kinh nghiệm (KN), Trình độ (TĐ), Chứng chỉ (CC).
  - **AC5.6.2** Given mỗi mục trong ba nhóm, When bấm Xem trong CV, Then trình xem chuyển tới đúng trang và nhấn mạnh đoạn trích tương ứng.
  - **AC5.6.3** Given mỗi mục AI nêu, When kiểm tra, Then đoạn trích xuất hiện nguyên văn trong văn bản CV; mục không kiểm chứng được không hiển thị.
  - **AC5.6.4** Given bật Làm nổi bật trong CV, When xem CV, Then các đoạn trích được đánh dấu kèm nhãn chữ KN, TĐ hoặc CC và kiểu gạch chân khác nhau, không chỉ khác màu.
  - **AC5.6.5** Given trình xem CV, When xem khung AI, Then luôn thấy lưu ý "Do AI tạo từ nội dung CV, có thể sai sót, chỉ để tham khảo, không dùng để chấm điểm hay quyết định".
  - **AC5.6.6** Given đã có kết quả cho cùng nội dung CV, When mở lại, Then hiển thị kết quả đã lưu ngay và không có lần gọi AI mới; When bấm Tạo lại, Then có lần gọi mới.
  - **AC5.6.7** Given nhà cung cấp AI lỗi hoặc quá thời gian chờ, When bấm Tạo tóm tắt AI, Then thấy "Không tạo được tóm tắt AI" và nút Thử lại; CV vẫn xem được bình thường.
  - **AC5.6.8** Given CV dạng ảnh không có lớp chữ, When bấm Tạo tóm tắt AI, Then thấy "CV dạng ảnh, chưa hỗ trợ tóm tắt".
  - **AC5.6.9** Given tôi gọi quá giới hạn số lần mỗi giờ, When bấm Tạo, Then thấy "Bạn tạo tóm tắt quá nhiều lần. Thử lại sau" (`429`).
  - **AC5.6.10** Given mỗi lần gọi AI, When kiểm tra DB, Then có một dòng nhật ký gồm người dùng, HĐPV, ứng viên, thời điểm, kết quả và thời gian xử lý.
  - **AC5.6.11** Given CV có số điện thoại, email, ngày sinh, When kiểm tra nội dung gửi tới nhà cung cấp, Then các trường đó đã bị che.
  - **AC5.6.12** Given người dùng không được gán, ứng viên `Xác nhận = N` hoặc HĐPV không `Inprogress`, When gọi API tạo tóm tắt, Then nhận `403` hoặc `404` như xem CV và không có dữ liệu gửi tới nhà cung cấp.
  - **AC5.6.13** Given kết quả AI, When hoàn thành đánh giá, Then điểm, kết luận, nhận xét và refer không bị AI tự điền (BR-A4).
- **INVEST:** là story lớn nhất của nhóm; nên làm sau các story Must Have. Kết quả hiển thị phụ thuộc quyết định nhà cung cấp, Legal và Security (OQ-AI-1..4); do đó phải có cờ tắt mặc định.

### US5.7 — Xem câu hỏi gợi ý thêm từ CV

**Là** người phỏng vấn, **tôi muốn** thấy các câu hỏi gợi ý bám vào kinh nghiệm, trình độ, chứng chỉ của ứng viên, **để** hỏi sâu thêm những điểm cần làm rõ.

- **Ưu tiên:** Could Have (đề xuất) · **Cỡ:** S · **Phụ thuộc:** US5.6
- **Tiêu chí chấp nhận:**
  - **AC5.7.1** Given kết quả AI hợp lệ, When xem khung Tóm tắt AI, Then thấy từ 3 đến 6 câu hỏi, mỗi câu có nhãn loại (Kinh nghiệm, Trình độ, Chứng chỉ) và dòng "Dựa trên: <mục nguồn>".
  - **AC5.7.2** Given mỗi câu hỏi, When kiểm tra dữ liệu, Then câu hỏi tham chiếu tới một mục kinh nghiệm, trình độ hoặc chứng chỉ có trong kết quả; câu không tham chiếu mục nào không hiển thị.
  - **AC5.7.3** Given câu hỏi sinh ra đề cập tuổi, giới tính, tình trạng hôn nhân hoặc gia đình, tôn giáo, dân tộc, sức khỏe hay quốc tịch, When server lọc, Then câu hỏi đó không hiển thị.
  - **AC5.7.4** Given sau khi lọc còn dưới 3 câu, When xem khung AI, Then vẫn thấy các câu còn lại và tóm tắt; nếu không còn câu nào thì nhóm câu hỏi ẩn.
  - **AC5.7.5** Given tôi hoàn thành đánh giá, When kiểm tra dữ liệu đánh giá, Then không chứa câu hỏi gợi ý (MVP không lưu và không có đánh dấu đã hỏi).
- **INVEST:** nhỏ nhưng chỉ có giá trị khi US5.6 xong; sinh cùng một lần gọi AI với US5.6.

### US5.8 — Xem điểm trung bình của ứng viên khi chấm điểm

**Là** người phỏng vấn, **tôi muốn** thấy điểm trung bình của ứng viên tự cập nhật khi tôi chọn điểm từng tiêu chí, và thấy lại điểm trung bình trên danh sách ứng viên đã hoàn thành, **để** nắm nhanh mặt bằng điểm của mình trước khi chọn kết luận.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** US5.2, US4.1
- **Tiêu chí chấp nhận:**
  - **AC5.8.1** Given chưa chọn điểm nào, When xem khối Điểm trung bình, Then thấy "—" và dòng "Chưa chọn điểm nào".
  - **AC5.8.2** Given đã chọn điểm 4, 3, 4 cho ba tiêu chí trong tổng năm, When xem khối Điểm trung bình, Then thấy "3,7 / 5" và dòng "Tạm tính theo 3/5 tiêu chí đã chọn".
  - **AC5.8.3** Given đã chọn đủ năm tiêu chí với điểm 4, 3, 5, 4, 5, When xem khối Điểm trung bình, Then thấy "4,2 / 5" và dòng "Trung bình 5 tiêu chí".
  - **AC5.8.4** Given đã chọn điểm, When đổi điểm của một tiêu chí, Then điểm trung bình cập nhật ngay không cần tải lại và trình đọc màn hình nghe giá trị mới.
  - **AC5.8.5** Given khối Điểm trung bình, When xem, Then thấy chú thích "Chỉ để tham khảo, không thay thế kết luận của bạn" và khối không có ô nhập.
  - **AC5.8.6** Given điểm trung bình bất kỳ, When chọn kết luận, Then kết luận không bị đặt sẵn hay bị chặn theo điểm trung bình (BR-A5).
  - **AC5.8.7** Given tôi đã hoàn thành đánh giá một ứng viên, When xem danh sách ứng viên, Then dòng đó có cột Điểm TB (ví dụ "Điểm TB 3,8"); ứng viên chưa chấm không có Điểm TB.
  - **AC5.8.8** Given đã hoàn thành, When mở lại bài, Then khối Điểm trung bình hiển thị giá trị đã lưu ở dạng chỉ đọc.
- **INVEST:** nhỏ; công thức thuần tính toán nên kiểm thử đơn vị được trước khi làm giao diện (khớp TDD). Server tính lại khi hoàn thành (AC6.1.14), con số trên giao diện chỉ là xem trước.

## Nhóm 6 — Hoàn thành đánh giá

### US6.1 — Hoàn thành đánh giá và khóa

**Là** người phỏng vấn, **tôi muốn** hoàn thành đánh giá và biết nó đã được lưu và khóa lại, **để** chắc chắn kết quả của tôi không bị mất hay bị sửa.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** US5.2
- **Tiêu chí chấp nhận:**
  - **AC6.1.1** Given form hợp lệ, When bấm Hoàn thành đánh giá rồi xác nhận ở hộp thoại "Sau khi hoàn thành sẽ không sửa được", Then API trả `201` kèm mã đánh giá và thời điểm hoàn thành, dữ liệu được lưu trong Oracle, màn chuyển sang chỉ đọc và dòng ứng viên hiển thị `Đã chấm`.
  - **AC6.1.2** Given tôi đã hoàn thành cho ứng viên này, When hoàn thành đánh giá lại với `idempotencyKey` mới, Then nhận `409` "Bạn đã hoàn thành đánh giá cho ứng viên này" và không có bản ghi mới.
  - **AC6.1.3** Given thiếu điểm cho một tiêu chí đang hoạt động hoặc có mã tiêu chí lạ, When gửi qua API, Then nhận `400` kèm danh sách tiêu chí lỗi và không lưu gì (giao dịch được hoàn tác).
  - **AC6.1.4** Given HĐPV đang `Inprogress` hoặc `Completed`, When hoàn thành đánh giá đang chấm dở, Then đánh giá được lưu (`201`); Given HĐPV ở `Draft`, `Sent` hoặc `Xác nhận`, Then nhận `404`.
  - **AC6.1.5** Given ứng viên `Xác nhận = N`, When gọi API hoàn thành đánh giá, Then nhận `404` và không tạo bản ghi nào.
  - **AC6.1.6** Given đánh giá đã lưu, When kiểm tra DB, Then có đúng một bản ghi cho cặp (người chấm, HĐPV, ứng viên) nhờ ràng buộc duy nhất ở DB, kèm trạng thái `SUBMITTED`, thời điểm hoàn thành và điểm từng tiêu chí.
  - **AC6.1.7** Given đánh giá đã hoàn thành, When gọi API sửa hoặc xóa đánh giá, Then không có chức năng tương ứng (trả `404` hoặc `405`).
  - **AC6.1.8** Given thiếu kết luận hoặc kết luận ngoài `DAT` / `LOAI` / `CAN_NHAC` / `KHAC`, When gọi API hoàn thành đánh giá, Then nhận `400` và không lưu gì.
  - **AC6.1.9** Given hoàn thành đánh giá với kết luận `Khác` và refer sang vị trí B, When kiểm tra DB, Then đánh giá lưu kết luận `KHAC`, vị trí refer B và lý do refer; vị trí hiện tại của ứng viên không đổi.
  - **AC6.1.12** Given kết luận `Đạt`, `Loại` hoặc `Cân nhắc` mà có vị trí hoặc lý do refer, When gọi API hoàn thành đánh giá, Then nhận `400` và không lưu gì.
  - **AC6.1.13** Given hoàn thành đánh giá thành công, When app nhận phản hồi `201`, Then hiển thị thông báo ngắn "Đã hoàn thành đánh giá" trong 3 giây và trình đọc màn hình nghe thông báo đó.
  - **AC6.1.14** Given điểm 4, 3, 5, 4, 5, When hoàn thành đánh giá, Then DB lưu `diemTrungBinh` = 4,20 do server tính và phản hồi `201` trả cùng giá trị.
  - **AC6.1.15** Given payload có `diemTrungBinh` do client gửi khác với giá trị thật, When hoàn thành đánh giá, Then server bỏ qua giá trị client và lưu giá trị tự tính.
  - **AC6.1.16** Given đã hoàn thành và bộ tiêu chí thay đổi về sau, When xem lại bài, Then điểm trung bình vẫn là giá trị đã lưu.
  - **AC6.1.10** Given vị trí refer không tồn tại, đã ngừng hoặc trùng vị trí hiện tại của ứng viên, When gọi API hoàn thành đánh giá, Then nhận `400` và không lưu gì.
  - **AC6.1.11** Given lý do refer mà không có vị trí refer, hoặc lý do dài hơn 500 ký tự, When gọi API hoàn thành đánh giá, Then nhận `400` và không lưu gì.
- **INVEST:** là story giá trị cốt lõi; test API kiểm các quy tắc BR-A1, BR-A2 và ràng buộc duy nhất.

### US6.2 — Hoàn thành đánh giá an toàn khi mất mạng hoặc bấm nhiều lần

**Là** người phỏng vấn, **tôi muốn** bấm hoàn thành đánh giá nhiều lần hoặc hoàn thành khi mạng chập chờn mà không bị trùng, **để** không lo mất bài hay hoàn thành đánh giá hai lần.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** US6.1
- **Tiêu chí chấp nhận:**
  - **AC6.2.1** Given cùng một `idempotencyKey` được gửi hai lần, When kiểm tra DB, Then chỉ có một bản đánh giá; lần gửi thứ hai trả `200` với cùng mã đánh giá.
  - **AC6.2.2** Given mất mạng hoặc hết thời gian chờ khi hoàn thành, When chưa nhận được phản hồi từ server, Then app giữ nguyên dữ liệu trên form, báo "Chưa hoàn thành được" và không báo thành công; khi bấm Thử lại, Then app gửi lại với cùng `idempotencyKey`.
  - **AC6.2.3** Given request hoàn thành đánh giá đang chạy, When bấm Hoàn thành đánh giá lần nữa, Then nút bị vô hiệu và không gửi request thứ hai.
- **INVEST:** nhỏ, test API và test màn hình được độc lập.

### US6.3 — Xem lại bài đã hoàn thành

**Là** người phỏng vấn, **tôi muốn** mở lại bài tôi đã hoàn thành ở chế độ chỉ đọc, **để** kiểm tra điều đã ghi nhận mà không sửa nhầm.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** US6.1
- **Tiêu chí chấp nhận:**
  - **AC6.3.1** Given tôi đã hoàn thành cho một ứng viên, When mở ứng viên đó, Then thấy điểm từng tiêu chí, nhận xét và thời điểm hoàn thành, không có nút sửa hay hoàn thành lại.
  - **AC6.3.2** Given một tiêu chí bị ngừng hoạt động sau khi tôi hoàn thành, When xem lại bài, Then tiêu chí đó vẫn hiển thị cùng điểm đã chấm.
  - **AC6.3.3** Given người phỏng vấn B, When gọi API đọc đánh giá của người phỏng vấn A, Then nhận `403`.
  - **AC6.3.4** Given tôi đã hoàn thành với kết luận và refer, When xem lại bài, Then thấy kết luận (`Đạt` / `Loại` / `Cân nhắc` / `Khác`) ở dạng chỉ đọc; khi kết luận là `Khác` thì thấy thêm vị trí refer và lý do refer (nếu có), các kết luận còn lại không hiển thị khối refer.
  - **AC6.3.5** Given tôi đã hoàn thành đánh giá, When xem lại bài, Then thấy điểm trung bình đã lưu ở dạng chỉ đọc; Given người dùng B gọi API đọc đánh giá của A, Then nhận `403` và không thấy điểm trung bình.
- **INVEST:** nhỏ; xác nhận quy tắc "không xem đánh giá của người khác" trong MVP.

## Nhóm 7 — Dữ liệu nền (Người vận hành)

### US7.1 — Nạp dữ liệu HĐPV, CBQL, ứng viên và lịch

**Là** người vận hành, **tôi muốn** nạp dữ liệu theo bảng thiết kế vào DB của app, **để** người phỏng vấn thấy đúng hội đồng, ứng viên và lịch khi demo.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** không
- **Tiêu chí chấp nhận:**
  - **AC7.1.1** Given file nạp mẫu hợp lệ theo `Kiro_bang (1).xlsx` (có thêm cột Trạng thái của HĐPV), When chạy script nạp, Then toàn bộ bản ghi được ghi vào Oracle và báo cáo ghi 0 lỗi.
  - **AC7.1.2** Given chạy script lần thứ hai với cùng file, When kiểm tra DB, Then số bản ghi không đổi.
  - **AC7.1.3** Given một dòng chi tiết HĐPV tham chiếu ứng viên hoặc CBQL không tồn tại, When chạy script, Then dòng đó bị bỏ qua và xuất hiện trong báo cáo lỗi kèm số dòng và lý do; các dòng còn lại vẫn được nạp.
  - **AC7.1.4** Given HĐPV có `Trạng thái` ngoài 5 giá trị `Draft`, `Sent`, `Xác nhận`, `Inprogress`, `Completed`, When chạy script, Then bản ghi bị từ chối và ghi vào báo cáo lỗi.
  - **AC7.1.5** Given `Từ thời gian` không nhỏ hơn `Đến thời gian` hoặc sai định dạng `hh:mm`, When chạy script, Then bản ghi bị từ chối và ghi vào báo cáo lỗi.
  - **AC7.1.6** Given mất kết nối Oracle giữa chừng, When chạy script, Then giao dịch được hoàn tác và script thoát với mã lỗi khác 0.
  - **AC7.1.7** Given script chạy xong, When đọc console, Then thấy số bản ghi thêm, cập nhật và lỗi theo từng nhóm.
  - **AC7.1.8** Given file nạp có nhóm Vị trí (`Mã vị trí`, `job`, `ĐVQL`, `ĐVTT1..3`, trạng thái), When chạy script, Then các vị trí được nạp trước ứng viên; ứng viên có `Vị trí` tham chiếu `Mã vị trí` không tồn tại bị bỏ qua và ghi vào báo cáo lỗi.
  - **AC7.1.9** Given ứng viên có `cvPath` trỏ tới tệp không tồn tại hoặc không phải PDF, When chạy script, Then ứng viên vẫn được nạp, báo cáo có cảnh báo và ứng viên đó hiển thị "Chưa có CV" trên app.
- **INVEST:** độc lập với app; chạy bằng dòng lệnh nên test tự động được.

### US7.2 — Nạp bộ tiêu chí chấm điểm

**Là** người vận hành, **tôi muốn** nạp danh sách tiêu chí gồm mã, tên và thang điểm, **để** màn chấm điểm hiển thị đúng bộ tiêu chí.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** không
- **Tiêu chí chấp nhận:**
  - **AC7.2.1** Given nạp thêm một tiêu chí đang hoạt động, When mở form chấm mới, Then tiêu chí mới xuất hiện đúng thứ tự.
  - **AC7.2.2** Given một tiêu chí chuyển sang ngừng hoạt động, When mở form chấm mới, Then tiêu chí đó không xuất hiện; các đánh giá đã hoàn thành trước đó không đổi.
  - **AC7.2.3** Given tiêu chí có thang không thỏa `1 ≤ điểm tối thiểu < điểm tối đa ≤ 5` hoặc trùng mã, When chạy script, Then bản ghi bị từ chối và ghi vào báo cáo lỗi.
- **INVEST:** nhỏ, độc lập.

### US7.3 — Tạo tài khoản cho người phỏng vấn

**Là** người vận hành, **tôi muốn** tạo tài khoản gắn với mã nhân sự của CBQL, **để** người phỏng vấn đăng nhập và thấy đúng hội đồng mình được gán.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** US7.1 (cần có CBQL)
- **Tiêu chí chấp nhận:**
  - **AC7.3.1** Given dữ liệu tài khoản gồm email, mật khẩu và `EmployedID`, When chạy script nạp, Then mật khẩu được lưu dạng băm bcrypt và tài khoản liên kết với CBQL có `EmployedID` tương ứng.
  - **AC7.3.2** Given `EmployedID` không khớp CBQL nào, When chạy script, Then tài khoản bị từ chối và ghi vào báo cáo lỗi.
  - **AC7.3.3** Given email đã tồn tại, When nạp lại, Then tài khoản được cập nhật và không tạo bản thứ hai.
  - **AC7.3.4** Given tài khoản có `EmployedID` trùng `Mã CBQL` của một HĐPV `Inprogress`, When đăng nhập, Then thấy HĐPV đó trong danh sách (kiểm tra xuyên suốt với US2.1).
- **INVEST:** nhỏ; điều kiện để demo luồng của P1.

### US7.4 — Bật/tắt tính năng AI và cấu hình nhà cung cấp

**Là** người vận hành, **tôi muốn** bật hoặc tắt tính năng AI tóm tắt CV và cấu hình nhà cung cấp bằng cấu hình, **để** chỉ bật khi Legal và Security đã đồng ý.

- **Ưu tiên:** Could Have (đề xuất) · **Cỡ:** S · **Phụ thuộc:** không
- **Tiêu chí chấp nhận:**
  - **AC7.4.1** Given cấu hình mới, When khởi động server, Then `ai.cvSummary.enabled` mặc định `false`.
  - **AC7.4.2** Given cờ tắt, When người phỏng vấn mở trình xem CV, Then khung AI hiển thị "Tính năng AI đang tắt. Liên hệ người vận hành để bật." và không có nút tạo.
  - **AC7.4.3** Given cờ bật nhưng thiếu nhà cung cấp hoặc khóa truy cập hợp lệ, When khởi động server, Then ghi cảnh báo rõ trong log và tính năng coi như tắt.
  - **AC7.4.4** Given khóa truy cập nhà cung cấp, When kiểm tra mã nguồn và log, Then khóa chỉ lấy từ biến môi trường và không xuất hiện trong mã nguồn hay log.
  - **AC7.4.5** Given thay đổi `ai.timeoutMs` hoặc `ai.maxPerUserPerHour`, When khởi động lại server, Then giá trị mới được áp dụng.
- **INVEST:** nhỏ, độc lập; không có giao diện (cấu hình qua môi trường).

## Nhóm 8 — Giao diện chung

Các story nhóm này bắt nguồn từ quy tắc PO đặt ra ngày 2026-10-09: mọi thứ thêm trong thiết kế phải có tính năng tương ứng trong requirement và user story. Chúng áp dụng cho mọi màn hình S1..S6, nên các tiêu chí kiểm tra trên từng màn hình, không thuộc một FR-A riêng.

### US8.1 — Phông chữ sans-serif đồng nhất và giao diện tiếng Việt

**Là** người phỏng vấn, **tôi muốn** mọi màn hình dùng cùng một phông chữ sans-serif và hiển thị đúng tiếng Việt, **để** đọc dễ và giao diện nhất quán trên điện thoại lẫn web.

- **Ưu tiên:** Must Have · **Cỡ:** S · **Phụ thuộc:** không
- **Tiêu chí chấp nhận:**
  - **AC8.1.1** Given mọi màn hình S1..S6, hộp thoại, thông báo, trình xem CV (phần giao diện bao quanh) và khung AI, When kiểm tra chủ đề giao diện, Then tất cả dùng cùng một họ phông sans-serif; không có màn hình nào dùng phông serif hoặc họ phông khác.
  - **AC8.1.2** Given app chạy trên web và trên điện thoại, When so sánh cùng một màn hình, Then hình dạng chữ giống nhau vì họ phông được đóng gói cùng ứng dụng, không tải từ máy chủ ngoài lúc chạy.
  - **AC8.1.3** Given chữ có dấu tiếng Việt (ví dụ "Nguyễn Văn Ân", "Trình độ", "Cân nhắc"), When hiển thị, Then dấu hiển thị đúng, không lỗi ký tự.
  - **AC8.1.4** Given chuỗi chữ trong app, When kiểm tra mã nguồn, Then mọi chữ hiển thị lấy từ một tệp chuỗi chung bằng tiếng Việt, không viết cứng trong widget.
- **INVEST:** nhỏ; kiểm thử bằng test chủ đề giao diện và test ảnh chụp màn hình. Nội dung bên trong tệp CV PDF dùng phông nhúng trong tệp nên nằm ngoài tiêu chí này. Họ phông cụ thể (gợi ý Roboto) cần PO xác nhận.

### US8.2 — Bố cục thích ứng điện thoại và web

**Là** người phỏng vấn, **tôi muốn** app hiển thị phù hợp trên điện thoại và trên trình duyệt máy tính, **để** dùng được ở cả hai nơi.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** các story màn hình S1..S6
- **Tiêu chí chấp nhận:**
  - **AC8.2.1** Given chiều rộng dưới 768 px, When mở bất kỳ màn hình nào, Then nội dung xếp một cột, chuyển trang kiểu ngăn xếp.
  - **AC8.2.2** Given chiều rộng từ 768 đến 1024 px, When mở bất kỳ màn hình nào, Then nội dung một cột, căn giữa, rộng tối đa 720 px.
  - **AC8.2.3** Given chiều rộng trên 1024 px, When mở danh sách HĐPV, Then các thẻ xếp thành lưới 2 đến 3 cột.
  - **AC8.2.4** Given người dùng đổi kích thước cửa sổ trình duyệt qua các điểm ngắt, When đang xem một màn hình, Then bố cục đổi theo ngay mà không mất dữ liệu đã nhập.
  - **AC8.2.5** Given mọi chiều rộng, When xem, Then không có thanh cuộn ngang và không có chữ bị cắt mất nội dung.
- **INVEST:** kiểm thử bằng test widget ở ba chiều rộng.

### US8.3 — Bố cục hai khung trên máy tính để bàn

**Là** người phỏng vấn dùng máy tính, **tôi muốn** thấy danh sách ứng viên bên trái và phiếu chấm bên phải, **để** chuyển giữa các ứng viên nhanh mà không đổi trang.

- **Ưu tiên:** Should Have · **Cỡ:** M · **Phụ thuộc:** US8.2, US4.1, US5.1
- **Tiêu chí chấp nhận:**
  - **AC8.3.1** Given chiều rộng trên 1024 px, When mở danh sách ứng viên, Then danh sách ở khung trái rộng khoảng 400 px và khung phải hiển thị "Chọn một ứng viên để bắt đầu".
  - **AC8.3.2** Given chọn một ứng viên ở khung trái, When khung phải mở, Then hiển thị phiếu chấm (hoặc bài đã hoàn thành chỉ đọc) và thẻ ứng viên đang chọn có viền nhấn.
  - **AC8.3.3** Given thu hẹp cửa sổ xuống dưới 768 px khi đang mở phiếu chấm, When bố cục đổi, Then phiếu chấm hiển thị toàn màn hình với dữ liệu đã nhập được giữ.
  - **AC8.3.4** Given đang nhập dở và bấm ứng viên khác, Then áp dụng cảnh báo ở AC5.2.6.
- **INVEST:** là phần thêm công sức; nếu thiếu thời gian có thể dùng chuyển trang một cột như điện thoại ở mọi chiều rộng mà không đổi chức năng.

### US8.4 — Giao diện sáng và tối theo hệ thống

**Là** người phỏng vấn, **tôi muốn** app theo chế độ sáng hoặc tối của thiết bị, **để** dễ nhìn trong môi trường của tôi.

- **Ưu tiên:** Should Have · **Cỡ:** S · **Phụ thuộc:** US8.1
- **Tiêu chí chấp nhận:**
  - **AC8.4.1** Given thiết bị đang ở chế độ sáng hoặc tối, When mở app, Then app dùng đúng chế độ đó.
  - **AC8.4.2** Given đổi chế độ hệ thống khi app đang mở, When quay lại app, Then giao diện đổi theo mà không mất dữ liệu đã nhập.
  - **AC8.4.3** Given cả hai chế độ, When kiểm tra mọi cặp chữ và nền, Then chữ đạt tương phản tối thiểu 4,5:1 và thành phần giao diện đạt 3:1.
  - **AC8.4.4** Given trang CV, When ở chế độ tối, Then trang CV vẫn nền trắng chữ tối như tệp PDF gốc.
- **INVEST:** nhỏ; các giá trị màu và tỷ lệ tương phản đã tính ở `design-system-mapping.md`.

### US8.5 — Truy cập cơ bản theo WCAG 2.1 AA

**Là** người phỏng vấn dùng bàn phím hoặc trình đọc màn hình, **tôi muốn** các màn hình cốt lõi thao tác được, **để** không bị loại trừ khỏi việc dùng app.

- **Ưu tiên:** Must Have · **Cỡ:** M · **Phụ thuộc:** các story màn hình S1..S6
- **Tiêu chí chấp nhận:**
  - **AC8.5.1** Given mọi nút và thẻ bấm được, When đo, Then vùng chạm cao và rộng tối thiểu 48 px.
  - **AC8.5.2** Given trạng thái chấm, kết luận, điểm đã chọn và loại làm nổi bật trong CV, When xem, Then mỗi trạng thái có chữ hoặc biểu tượng, không chỉ khác màu.
  - **AC8.5.3** Given web, When đi hết luồng đăng nhập, chọn HĐPV, chọn ứng viên, chấm điểm, chọn kết luận và hoàn thành đánh giá chỉ bằng bàn phím, Then hoàn thành được mà không cần chuột; tiêu điểm luôn nhìn thấy rõ.
  - **AC8.5.4** Given hộp thoại, When mở, Then tiêu điểm vào nút mặc định, Esc đóng và khi đóng tiêu điểm trở về phần tử đã mở.
  - **AC8.5.5** Given trình đọc màn hình, When dùng thẻ HĐPV, thẻ ứng viên, nút điểm và nhóm kết luận, Then mỗi phần tử được đọc kèm tên, trạng thái và vai trò đúng như `interaction-spec.md`.
  - **AC8.5.6** Given lỗi nhập liệu hoặc lỗi hoàn thành đánh giá, When xuất hiện, Then lỗi được thông báo cho trình đọc màn hình ngay và nêu rõ ô sai.
  - **AC8.5.7** Given phóng to chữ 200%, When xem, Then không mất nội dung hay chức năng.
- **INVEST:** kiểm thử kết hợp test tự động nhãn ngữ nghĩa và kiểm thủ công. App không cam kết tuân thủ WCAG đầy đủ; cần kiểm với công nghệ hỗ trợ thật và rà soát chuyên gia truy cập.

### US8.6 — Khung xương khi tải và giảm chuyển động

**Là** người phỏng vấn, **tôi muốn** thấy khung xương khi dữ liệu đang tải và hiệu ứng chuyển động tắt nếu tôi đã bật giảm chuyển động, **để** biết app đang tải và không bị khó chịu bởi chuyển động.

- **Ưu tiên:** Should Have · **Cỡ:** S · **Phụ thuộc:** các story màn hình S2..S6
- **Tiêu chí chấp nhận:**
  - **AC8.6.1** Given danh sách HĐPV, danh sách ứng viên, trình xem CV hoặc khung AI đang tải, When xem, Then thấy khối khung xương thay vì màn hình trống.
  - **AC8.6.2** Given thiết bị bật giảm chuyển động, When mở màn hình, nhún nút điểm, trượt thẻ hoặc chạy thanh tiến độ, Then không có hiệu ứng chuyển động; khung xương hiển thị khối tĩnh.
  - **AC8.6.3** Given khung xương đang hiển thị, When trình đọc màn hình đọc màn hình, Then nghe thông báo trạng thái tải và không đọc các khối khung xương.
- **INVEST:** nhỏ; dùng widget khung xương dùng chung.

## Không làm trong đợt này (Won't Have)

- Mọi yêu cầu phạm vi đầy đủ FR-1..FR-31 chưa nằm trong MVP: nhận bàn giao từ Phase 1 và Definition of Ready, lưu nháp tự động, blind scoring có cấu hình, tổng hợp điểm và cờ chênh lệch, HR review và chốt kết quả, thông báo và gửi kết quả cho ứng viên, nhắc việc, xử lý no-show, hoãn, hủy, đổi thành viên, audit bất biến đầy đủ.
- Màn quản trị tiêu chí và quản trị tài khoản trên app (MVP dùng script nạp).
- Các nhân vật HR, Chủ tịch HĐPV, CBQL ngoài hội đồng, Ứng viên.

## Assumptions & Open Questions

- **[assumption]** "Sắp xếp theo giờ phỏng vấn từ gần tới xa" hiểu là giờ bắt đầu từ sớm đến muộn trong ngày của HĐPV, không phụ thuộc giờ hiện tại của thiết bị (A-7 trong `requirements.md`); PO xác nhận khi duyệt. Nếu PO muốn "gần giờ hiện tại nhất lên đầu", AC4.1.1 và AC4.1.8 phải viết lại.
- **[assumption]** Vị trí của ứng viên lấy từ trường `Vị trí` (`job` và đơn vị) và chỉ là thông tin hiển thị trên dòng ứng viên; không có bước chọn hay lọc theo vị trí (PO bỏ ngày 2026-10-09).
- **[assumption]** Người phỏng vấn chỉ thấy HĐPV mình được gán (A-1 trong `requirements.md`).
- **[assumption]** Cột `Trạng thái` của HĐPV chưa có trong `Kiro_bang (1).xlsx`; file nạp phải có thêm cột này (BR-A2).
- **[assumption]** Bổ sung của PO ngày 2026-10-09 (Q7 đến Q12 trong `refined-mockups-questions.md`): kết luận `Đạt` / `Loại` / `Cân nhắc` bắt buộc khi hoàn thành (US5.3); nhận xét tùy chọn kể cả khi `Loại` hoặc `Cân nhắc`; refer tối đa 1 vị trí kèm lý do tùy chọn, chọn từ bảng Vị trí do script nạp (US5.4); xem CV dạng PDF chỉ đọc có nhật ký xem (US5.5). Cần thêm cột `cvPath` và nhóm Vị trí vào dữ liệu nạp, cả hai chưa có trong `Kiro_bang (1).xlsx`.
- **[assumption]** Mức ưu tiên Should Have của US5.4 và US5.5 là đề xuất của tôi để có điểm cắt khi thiếu thời gian, không phải yêu cầu của PO; PO xác nhận hoặc nâng lên Must Have khi duyệt.
- **[assumption]** Liên kết xem CV hết hạn sau 5 phút (A-8 trong `requirements.md`).
- **[assumption]** Bổ sung đợt 4 của PO (2026-10-09): (1) đổi thuật ngữ "nộp đánh giá" thành "hoàn thành đánh giá" ở mọi tài liệu và bản HTML; các định danh kỹ thuật (`SUBMITTED`, `submittedAt`, tên API, `idempotencyKey`) được giữ nguyên; (2) thêm điểm trung bình ứng viên (US5.8, BR-A5): khối cập nhật ngay trên phiếu chấm và cột Điểm TB trên danh sách ứng viên đã hoàn thành. Tôi hiểu "cột điểm trung bình" là cả hai chỗ này; nếu PO chỉ muốn một chỗ thì bỏ chỗ còn lại.
- **[assumption]** Điểm trung bình là trung bình cộng không trọng số, quy về thang 5, hiển thị một chữ số thập phân với dấu phẩy và lưu hai chữ số; hiển thị tạm tính khi chưa chọn đủ tiêu chí. Mức ưu tiên Must Have của US5.8 là đề xuất của tôi vì PO yêu cầu trực tiếp và việc này nhỏ.
- **[assumption]** Bổ sung đợt 3 của PO (2026-10-09): (1) phông chữ sans-serif đồng nhất (NFR-9, US8.1; họ phông gợi ý Roboto, đóng gói cùng ứng dụng); (2) kết luận có thêm lựa chọn `Khác` và khối "Giới thiệu sang vị trí khác (tùy chọn)" chỉ hiện khi chọn `Khác` (US5.3, US5.4, thay cách hiểu cũ là khối refer luôn hiện); (3) quy tắc mọi thứ thêm trong thiết kế phải có requirement và story, nên nhóm 8 (US8.1..US8.6) được thêm cho phần giao diện chung vốn chỉ có trong mockup.
- **[assumption]** Mức ưu tiên nhóm 8 là đề xuất của tôi: US8.1, US8.2, US8.5 Must Have vì PO đã chốt phông, thiết bị web và truy cập cơ bản; US8.3, US8.4, US8.6 Should Have để có điểm cắt khi thiếu thời gian. Tổng khối lượng 2 ngày đã vượt xa ước lượng ban đầu; cần Delivery Planning xem xét.
- **[assumption]** Bổ sung đợt 2 của PO (2026-10-09): AI tóm tắt CV, làm nổi bật và gợi ý câu hỏi (US5.6, US5.7, US7.4; FR-A9, FR-A10, BR-A4, NFR-8). Tính năng tắt theo mặc định, tạo theo yêu cầu, kết quả lưu theo nội dung CV, chỉ đọc, bằng tiếng Việt, câu hỏi không lưu cùng đánh giá.
- **[assumption]** Mức ưu tiên Could Have và cỡ L của US5.6 là đề xuất của tôi vì còn phụ thuộc nhà cung cấp AI, Legal và Security; PO có thể nâng mức ưu tiên khi duyệt.
- **Open question:** Tài liệu nguồn Phase 2 (mục 11.2) ghi không dùng AI phân tích ứng viên trong MVP khi chưa có cơ sở pháp lý, consent và rà soát thiên lệch. Nhà cung cấp, nơi lưu dữ liệu, consent của ứng viên và rà soát thiên lệch chưa quyết (OQ-AI-1..4 trong `requirements.md`); không bật ở môi trường thật cho đến khi có quyết định.
- **[assumption]** Ước lượng cỡ S/M là thô; chưa kiểm tra tổng khối lượng so với 2 ngày. Delivery Planning cần đối chiếu số người làm song song giữa backend và Flutter; US1.2 là story đầu tiên có thể bỏ nếu thiếu thời gian.
- **Open question:** Đánh giá đã hoàn thành của một ứng viên bị đổi sang `Xác nhận = N` hoặc HĐPV chuyển khỏi `Inprogress` vẫn nằm trong DB nhưng không hiển thị trên app; có cần màn xem lại sau này không, chưa quyết (ngoài MVP).
