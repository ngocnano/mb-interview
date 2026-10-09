# Quy tắc nghiệp vụ — U1 scoring-skeleton

Các quy tắc áp dụng cho lát cắt U1. Quy tắc kết luận, refer, điểm trung bình và gửi lại khi mất mạng thuộc U2 (xem `rules.md` của U2).

## Sources

- `inception/requirements-analysis/requirements.md` — FR-A0, FR-A1, FR-A2, FR-A4, FR-A5, FR-A6, FR-A7, BR-A1, BR-A2
- `inception/user-stories/stories.md` — AC của 9 story thuộc U1
- `inception/domain-design/decisions.md` — ADR-002, ADR-004
- `construction/u1-scoring-skeleton/functional-design/functional-design-questions.md` — Q1 = B, Q2 = A, Q3 = A, Q4 = A, Q5 = A
- `aidlc/spaces/default/memory/project.md` — idempotency, RBAC phía server, audit, không ghi đè bài đã nộp

## Khối nguồn chính thức

```yaml
rules:
  - id: BR1.1
    statement: Đăng nhập chuẩn hóa email rồi so khớp mật khẩu bằng bcrypt; sai email hoặc sai mật khẩu đều trả cùng một thông báo chung.
    category: validation
    applies_to: [UserAccount, LoginThrottle]
    trigger: POST /auth/login
    logic: "IF email (đã chuẩn hóa) không có tài khoản HOẶC mật khẩu không khớp THEN trả 401 với thông báo chung 'Email hoặc mật khẩu không đúng' VÀ tăng bộ đếm sai (BR1.6)"
    violation: "401, không tiết lộ email có tồn tại"
    source: [FR-A0]
  - id: BR1.2
    statement: Tài khoản ở trạng thái LOCKED bị từ chối đăng nhập.
    category: authorization
    applies_to: [UserAccount]
    trigger: POST /auth/login với thông tin đúng
    logic: "IF mật khẩu đúng VÀ trangThai = LOCKED THEN trả 403 và thông báo tài khoản bị khóa"
    violation: "403"
    source: [FR-A0]
  - id: BR1.3
    statement: Email và mật khẩu phải hợp lệ về định dạng trước khi xử lý.
    category: validation
    applies_to: [UserAccount]
    trigger: POST /auth/login và nhập liệu ở client
    logic: "IF email sai định dạng hoặc dài hơn 255 ký tự HOẶC mật khẩu rỗng hoặc dài hơn 128 ký tự THEN client chặn không gửi; server trả 400 nếu vẫn nhận được"
    violation: "400; client chỉ ra trường lỗi"
    source: [FR-A0]
  - id: BR1.4
    statement: Mọi API nghiệp vụ yêu cầu token JWT còn hạn 8 giờ; token thiếu, sai, hết hạn hoặc thuộc tài khoản đã bị khóa bị từ chối.
    category: authorization
    applies_to: [UserAccount]
    trigger: Mọi request tới API trừ /auth/login
    logic: "IF không có token hợp lệ còn hạn THEN trả 401; client xóa token và về màn đăng nhập; token còn hạn thì giữ đăng nhập khi làm mới trang"
    violation: "401"
    source: [FR-A0]
  - id: BR1.5
    statement: Mật khẩu chỉ được lưu dưới dạng băm bcrypt; mật khẩu rõ không bao giờ vào DB, log hay báo cáo nạp.
    category: constraint
    applies_to: [UserAccount]
    trigger: Mọi lần tạo tài khoản, đăng nhập và ghi log
    logic: "IF cần lưu hoặc ghi mật khẩu THEN chỉ lưu giá trị băm; log và báo cáo không chứa mật khẩu"
    violation: "Lỗi kiểm thử; không thể có đường ghi mật khẩu rõ"
    source: [FR-A0, NFR-1]
  - id: BR1.6
    statement: Sau 5 lần đăng nhập sai liên tiếp với cùng một email, email đó bị tạm khóa đăng nhập 15 phút; đăng nhập đúng trước khi đủ 5 lần sai thì đặt lại bộ đếm.
    category: policy
    applies_to: [LoginThrottle]
    trigger: POST /auth/login
    logic: "IF khoaDen còn hiệu lực THEN trả 429 mã LOGIN_LOCKED kèm Retry-After, kể cả khi mật khẩu đúng; IF đăng nhập sai THEN soLanSai tăng 1 và khi soLanSai đạt 5 THEN khoaDen = bây giờ + 15 phút; IF đăng nhập đúng và không bị khóa THEN soLanSai = 0; khoaDen hết hạn thì bộ đếm được đặt lại"
    violation: "429 LOGIN_LOCKED"
    source: [FR-A0]
  - id: BR1.7
    statement: Đăng nhập thành công trả token, thời điểm hết hạn và thông tin người dùng tối thiểu.
    category: policy
    applies_to: [UserAccount]
    trigger: POST /auth/login thành công
    logic: "IF thông tin đúng, tài khoản ACTIVE và không bị tạm khóa THEN trả 200 với token, expiresAt, user gồm userId, employedId, hoTen, email"
    violation: "Không áp dụng"
    source: [FR-A0]
  - id: BR1.8
    statement: Màn đăng nhập có nút hiện hoặc ẩn mật khẩu mà không làm mất tiêu điểm ở ô mật khẩu.
    category: policy
    applies_to: [UserAccount]
    trigger: Người dùng bấm nút hiện/ẩn
    logic: "IF bấm nút THEN chuyển giữa dạng chấm và dạng chữ; nhãn 'Hiện mật khẩu' hoặc 'Ẩn mật khẩu' cho trình đọc màn hình"
    violation: "Không áp dụng"
    source: [FR-A0, NFR-6]

  - id: BR2.1
    statement: Người phỏng vấn chỉ thấy và mở HĐPV mà mình được gán qua Chi tiết HĐPV – CBQL; chính sách này chỉ đặt ở InterviewCatalog.
    category: authorization
    applies_to: [InterviewPanel, PanelInterviewer]
    trigger: Mọi API về HĐPV, ứng viên, tiêu chí theo HĐPV
    logic: "IF HĐPV tồn tại và không có dòng PanelInterviewer với maCbql = employedId của người gọi THEN trả 403"
    violation: "403"
    source: [FR-A2, FR-A4, BR-A1, BR-A2]
  - id: BR2.2
    statement: Chỉ HĐPV có trạng thái Inprogress được liệt kê và mở để chấm.
    category: constraint
    applies_to: [InterviewPanel]
    trigger: Liệt kê HĐPV, liệt kê ứng viên, mở ứng viên
    logic: "IF người dùng được gán nhưng trangThai khác Inprogress THEN không đưa vào danh sách và trả 404 khi gọi trực tiếp"
    violation: "404"
    source: [FR-A2, BR-A2]
  - id: BR2.3
    statement: Chỉ ứng viên có Xác nhận = Y được liệt kê và mở; ứng viên có Xác nhận = N bị ẩn.
    category: constraint
    applies_to: [PanelCandidate]
    trigger: Liệt kê và mở ứng viên, hoàn thành đánh giá
    logic: "IF dòng PanelCandidate có xacNhan = N THEN không liệt kê, trả 404 khi mở hoặc hoàn thành"
    violation: "404"
    source: [FR-A4, BR-A1]
  - id: BR2.4
    statement: Danh sách HĐPV sắp theo ngày tăng dần rồi theo mã.
    category: policy
    applies_to: [InterviewPanel]
    trigger: GET /panels
    logic: "Sắp theo ngay tăng dần, cùng ngày thì theo maHdpv tăng dần"
    violation: "Không áp dụng"
    source: [FR-A2]
  - id: BR2.5
    statement: Danh sách ứng viên của HĐPV sắp theo giờ bắt đầu từ sớm đến muộn; cùng giờ thì mã ứng viên nhỏ hơn đứng trước.
    category: policy
    applies_to: [PanelCandidate]
    trigger: GET /panels/{maHdpv}/candidates
    logic: "Sắp theo tuThoiGian tăng dần, rồi maUngVien tăng dần, không phụ thuộc giờ hiện tại của thiết bị"
    violation: "Không áp dụng"
    source: [FR-A4]
  - id: BR2.6
    statement: API của app không bao giờ trả số điện thoại, ngày sinh, giới tính của ứng viên.
    category: constraint
    applies_to: [Candidate]
    trigger: Mọi response chứa thông tin ứng viên
    logic: "IF trả thông tin ứng viên THEN chỉ gồm mã, tên, vị trí, kinh nghiệm, trình độ, khung giờ, hình thức và địa điểm; không có sdt, ngaySinh, gioiTinh"
    violation: "Lỗi kiểm thử hợp đồng"
    source: [FR-A5, NFR-1]
  - id: BR2.7
    statement: Danh sách ứng viên gộp mọi vị trí vào một danh sách; mỗi dòng hiển thị vị trí và đơn vị của chính ứng viên đó cùng khung giờ đầy đủ.
    category: policy
    applies_to: [Candidate, Position, PanelCandidate]
    trigger: GET /panels/{maHdpv}/candidates
    logic: "Trả mã, tên, vị trí (job, dvql, dvtt) và khung giờ; app hiển thị khung giờ dạng dd/mm/yyyy hh:mm – hh:mm bằng ngày của HĐPV"
    violation: "Không áp dụng"
    source: [FR-A4]
  - id: BR2.8
    statement: Dòng HĐPV hiển thị mã, tên, ngày, hình thức, địa điểm và tổng số ứng viên đã xác nhận.
    category: policy
    applies_to: [InterviewPanel]
    trigger: GET /panels
    logic: "Trả maHdpv, ten, ngay, hinhThuc, diaDiem, soUngVienXacNhan (đếm PanelCandidate có xacNhan = Y); phần 'đã chấm' ghép ở U2"
    violation: "Không áp dụng"
    source: [FR-A2]
  - id: BR2.9
    statement: Các màn danh sách xử lý trạng thái rỗng và lỗi mạng rõ ràng.
    category: policy
    applies_to: [InterviewPanel, PanelCandidate]
    trigger: Mở màn S2, S3
    logic: "IF danh sách rỗng THEN hiển thị thông báo rỗng đúng nội dung từng màn; IF mất mạng hoặc server lỗi THEN hiển thị thông báo lỗi và nút Thử lại"
    violation: "Không áp dụng"
    source: [FR-A2, FR-A4]
  - id: BR2.10
    statement: HĐPV không tồn tại trả 404, khác với HĐPV có tồn tại nhưng người gọi không được gán (403).
    category: authorization
    applies_to: [InterviewPanel]
    trigger: Mọi API theo maHdpv
    logic: "IF maHdpv không có trong dữ liệu THEN 404; ELSE áp dụng BR2.1 rồi BR2.2"
    violation: "404"
    source: [FR-A4, BR-A2]
  - id: BR2.11
    statement: Nhãn Đã chấm hoặc Chưa chấm trên danh sách ứng viên được app ghép từ danh sách bài tôi đã hoàn thành của HĐPV; ở U1 danh sách đó chỉ có mã ứng viên và thời điểm hoàn thành.
    category: policy
    applies_to: [InterviewEvaluation, PanelCandidate]
    trigger: Mở màn S3 và sau khi hoàn thành đánh giá
    logic: "IF có phiếu SUBMITTED của tôi cho ứng viên THEN dòng ứng viên hiển thị Đã chấm, ELSE Chưa chấm; U2 thêm ketLuan và diemTrungBinh vào cùng API (chỉ thêm trường)"
    violation: "Không áp dụng"
    source: [FR-A4, ADR-002]

  - id: BR3.1
    statement: Phiếu chấm hiển thị các tiêu chí đang hoạt động theo thứ tự cấu hình, mỗi tiêu chí có bộ chọn điểm trong thang của nó.
    category: policy
    applies_to: [Criterion]
    trigger: GET /criteria và mở màn chấm điểm
    logic: "Trả tiêu chí ACTIVE sắp theo thuTu; tiêu chí INACTIVE không xuất hiện ở phiếu mới; IF không có tiêu chí ACTIVE THEN app báo 'Chưa cấu hình tiêu chí' và không cho chấm"
    violation: "Không áp dụng"
    source: [FR-A7]
  - id: BR3.2
    statement: Điểm của một tiêu chí là số nguyên nằm trong thang của tiêu chí đó.
    category: validation
    applies_to: [EvaluationScore]
    trigger: Nhập điểm ở app và hoàn thành đánh giá
    logic: "IF diem không phải số nguyên HOẶC nằm ngoài [diemToiThieu, diemToiDa] THEN app chặn; server trả 400"
    violation: "400"
    source: [FR-A5]
  - id: BR3.3
    statement: Hoàn thành đánh giá cần có điểm cho mọi tiêu chí đang hoạt động và không có tiêu chí lạ; nút hoàn thành bị khóa khi còn thiếu.
    category: validation
    applies_to: [InterviewEvaluation, EvaluationScore]
    trigger: Bấm hoặc gọi hoàn thành đánh giá
    logic: "IF thiếu điểm của tiêu chí ACTIVE hoặc có maTieuChi không tồn tại hoặc không ACTIVE THEN server trả 400 kèm danh sách trường lỗi và hoàn tác, không lưu gì; app khóa nút và khi bấm vào nút khóa thì đánh dấu và chuyển tiêu điểm tới tiêu chí thiếu đầu tiên"
    violation: "400"
    source: [FR-A5, FR-A6]
  - id: BR3.4
    statement: Nhận xét là tùy chọn, tối đa 2000 ký tự.
    category: validation
    applies_to: [InterviewEvaluation]
    trigger: Nhập nhận xét và hoàn thành đánh giá
    logic: "IF nhận xét dài hơn 2000 ký tự THEN app không cho nhập thêm và server trả 400; nhận xét trống vẫn hoàn thành được; app hiển thị bộ đếm khi gần giới hạn"
    violation: "400"
    source: [FR-A5]
  - id: BR3.5
    statement: Chỉ cho hoàn thành đánh giá khi người gọi được gán, HĐPV đang Inprogress hoặc Completed và ứng viên có Xác nhận = Y.
    category: authorization
    applies_to: [InterviewPanel, PanelCandidate]
    trigger: POST /panels/{maHdpv}/candidates/{maUngVien}/evaluation
    logic: "IF không được gán THEN 403; IF HĐPV khác Inprogress và khác Completed HOẶC ứng viên không thuộc HĐPV hoặc xacNhan = N THEN 404; mở bài chấm mới chỉ khi HĐPV Inprogress (BR2.2)"
    violation: "403 hoặc 404, không tạo bản ghi"
    source: [FR-A6, BR-A1, BR-A2]
  - id: BR3.6
    statement: Mỗi (người chấm, HĐPV, ứng viên) chỉ có đúng một phiếu; hoàn thành lại với khóa idempotency khác bị từ chối.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: POST hoàn thành đánh giá
    logic: "IF đã có phiếu của tôi cho cặp (HĐPV, ứng viên) với idempotencyKey khác THEN trả 409 'Bạn đã hoàn thành đánh giá cho ứng viên này' và không tạo bản ghi; ràng buộc duy nhất ở DB là rào chắn cuối khi hai request đồng thời"
    violation: "409"
    source: [FR-A6]
  - id: BR3.7
    statement: Gửi lại cùng idempotencyKey không tạo bản ghi thứ hai mà trả bản đã lưu.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: POST hoàn thành đánh giá với khóa đã dùng
    logic: "IF (userId, idempotencyKey) đã có phiếu cho đúng cặp (HĐPV, ứng viên) này THEN trả 200 với cùng evaluationId, submittedAt; không ghi gì mới; IF khóa đó đã dùng cho cặp (HĐPV, ứng viên) khác THEN trả 409 và không trả dữ liệu của phiếu kia"
    violation: "Không áp dụng"
    source: [FR-A6, project.md Mandated]
  - id: BR3.8
    statement: Phiếu đã hoàn thành (SUBMITTED) không thể sửa hoặc xóa bằng bất kỳ API nào.
    category: constraint
    applies_to: [InterviewEvaluation, EvaluationScore]
    trigger: Mọi request sửa hoặc xóa phiếu
    logic: "API sửa và xóa phiếu không tồn tại; request như vậy trả 404 hoặc 405"
    violation: "404 hoặc 405"
    source: [FR-A6, project.md Forbidden]
  - id: BR3.9
    statement: Hoàn thành đánh giá ghi phiếu và các dòng điểm trong một giao dịch duy nhất, trạng thái SUBMITTED kèm thời điểm hoàn thành.
    category: constraint
    applies_to: [InterviewEvaluation, EvaluationScore]
    trigger: Hoàn thành đánh giá hợp lệ
    logic: "Ghi phiếu và toàn bộ dòng điểm cùng lúc; IF bất kỳ bước nào lỗi THEN hoàn tác toàn bộ; thành công trả 201 với evaluationId, submittedAt, trangThai"
    violation: "Hoàn tác, 500 nếu lỗi hệ thống"
    source: [FR-A6, NFR-1]
  - id: BR3.10
    statement: Màn chấm điểm bảo vệ người dùng khỏi mất dữ liệu và hoàn thành nhầm.
    category: policy
    applies_to: [InterviewEvaluation]
    trigger: Rời màn khi đã nhập, bấm hoàn thành, hoàn thành xong
    logic: "IF đã nhập dữ liệu chưa hoàn thành mà rời màn THEN cảnh báo 'Dữ liệu chưa lưu sẽ mất' cho chọn ở lại hoặc rời đi; bấm Hoàn thành đánh giá hiện hộp thoại 'Sau khi hoàn thành sẽ không sửa được'; thành công thì chuyển màn sang chỉ đọc, dòng ứng viên hiện Đã chấm và thông báo 'Đã hoàn thành đánh giá' trong 3 giây cho cả trình đọc màn hình; không lưu nháp ở server"
    violation: "Không áp dụng"
    source: [FR-A5, FR-A6]
  - id: BR3.11
    statement: Thông tin ứng viên và tiêu chí hiển thị trước khi chấm chỉ gồm các trường được phép.
    category: policy
    applies_to: [Candidate, Criterion]
    trigger: Mở màn S4
    logic: "Hiển thị mã, tên, vị trí, kinh nghiệm, trình độ, khung giờ, hình thức, địa điểm và đủ tiêu chí ACTIVE; không hiển thị sdt, ngaySinh, gioiTinh (BR2.6)"
    violation: "Không áp dụng"
    source: [FR-A5, FR-A7]

  - id: BR4.1
    statement: Lệnh nạp ghi theo thứ tự tiêu chí, vị trí, CBQL, tài khoản, ứng viên, HĐPV, chi tiết trong một giao dịch; chạy lại không nhân đôi.
    category: constraint
    applies_to: [Criterion, Position, Interviewer, UserAccount, Candidate, InterviewPanel, PanelCandidate, PanelInterviewer]
    trigger: Chạy lệnh nạp
    logic: "Bản ghi trùng mã thì cập nhật, không thì thêm; chạy lại cùng file thì số bản ghi không đổi"
    violation: "Không áp dụng"
    source: [FR-A1]
  - id: BR4.2
    statement: Dòng tham chiếu tới bản ghi không tồn tại bị bỏ qua và ghi vào báo cáo lỗi; các dòng còn lại vẫn được nạp.
    category: validation
    applies_to: [Candidate, PanelCandidate, PanelInterviewer, UserAccount]
    trigger: Nạp ứng viên, chi tiết HĐPV, tài khoản
    logic: "IF ứng viên có maViTri không tồn tại, hoặc dòng chi tiết trỏ ứng viên hoặc CBQL không tồn tại, hoặc tài khoản có EmployedID không khớp CBQL nào THEN bỏ qua dòng và ghi báo cáo kèm số dòng và lý do"
    violation: "Báo cáo lỗi, không dừng nạp"
    source: [FR-A1]
  - id: BR4.3
    statement: Trạng thái HĐPV phải là một trong Draft, Sent, Xác nhận, Inprogress, Completed.
    category: validation
    applies_to: [InterviewPanel]
    trigger: Nạp HĐPV
    logic: "IF trạng thái ngoài 5 giá trị THEN từ chối bản ghi và ghi báo cáo lỗi"
    violation: "Báo cáo lỗi"
    source: [FR-A1]
  - id: BR4.4
    statement: Giờ phỏng vấn đúng định dạng hh:mm và giờ bắt đầu nhỏ hơn giờ kết thúc.
    category: validation
    applies_to: [PanelCandidate, PanelInterviewer]
    trigger: Nạp chi tiết HĐPV
    logic: "IF tuThoiGian hoặc denThoiGian sai định dạng hoặc tuThoiGian không nhỏ hơn denThoiGian THEN từ chối bản ghi và ghi báo cáo lỗi"
    violation: "Báo cáo lỗi"
    source: [FR-A1]
  - id: BR4.5
    statement: Mất kết nối Oracle giữa chừng thì hoàn tác toàn bộ và thoát với mã lỗi khác 0.
    category: constraint
    applies_to: [InterviewPanel]
    trigger: Lệnh nạp mất kết nối DB
    logic: "IF mất kết nối THEN rollback giao dịch và thoát với mã lỗi khác 0"
    violation: "Mã thoát khác 0"
    source: [FR-A1]
  - id: BR4.6
    statement: Lệnh nạp in báo cáo số bản ghi thêm, cập nhật và lỗi theo từng nhóm; báo cáo không chứa mật khẩu.
    category: policy
    applies_to: [InterviewPanel]
    trigger: Kết thúc lệnh nạp
    logic: "In số thêm, cập nhật, lỗi theo nhóm (tiêu chí, vị trí, CBQL, tài khoản, ứng viên, HĐPV, chi tiết)"
    violation: "Không áp dụng"
    source: [FR-A1]
  - id: BR4.7
    statement: Thang tiêu chí thỏa 1 ≤ điểm tối thiểu < điểm tối đa ≤ 5 và mã tiêu chí không trùng trong một lần nạp.
    category: validation
    applies_to: [Criterion]
    trigger: Nạp tiêu chí
    logic: "IF thang không thỏa hoặc trùng mã trong cùng file THEN từ chối bản ghi và ghi báo cáo lỗi; tiêu chí đổi sang INACTIVE không ảnh hưởng phiếu đã hoàn thành"
    violation: "Báo cáo lỗi"
    source: [FR-A7, FR-A1]
  - id: BR4.8
    statement: Tài khoản nạp theo email; mật khẩu tối thiểu 8 ký tự và được băm bcrypt khi ghi.
    category: validation
    applies_to: [UserAccount]
    trigger: Nạp tài khoản
    logic: "IF email đã có THEN cập nhật tài khoản, không tạo bản thứ hai; IF mật khẩu ngắn hơn 8 ký tự THEN từ chối dòng và ghi báo cáo lỗi (không in mật khẩu); employedId phải khớp một CBQL (BR4.2)"
    violation: "Báo cáo lỗi"
    source: [FR-A0, FR-A1]
  - id: BR4.9
    statement: Nạp lại chỉ thêm hoặc cập nhật; bản ghi vắng trong file không bị xóa.
    category: policy
    applies_to: [Criterion, UserAccount, InterviewPanel]
    trigger: Chạy lại lệnh nạp với file khác
    logic: "Không xóa bản ghi nào; muốn ẩn thì nạp trạng thái INACTIVE hoặc LOCKED"
    violation: "Không áp dụng"
    source: [FR-A1, Q4 = A]
```

## Tóm tắt

| Nhóm | Quy tắc | Nội dung chính |
|---|---|---|
| BR1 | BR1.1..BR1.8 | Đăng nhập, token, bcrypt, tạm khóa 15 phút sau 5 lần sai |
| BR2 | BR2.1..BR2.11 | Truy cập theo được gán, Inprogress, Xác nhận = Y; sắp xếp; không lộ dữ liệu nhạy cảm; nhãn Đã chấm |
| BR3 | BR3.1..BR3.11 | Tiêu chí, kiểm điểm, hoàn thành đánh giá, duy nhất, idempotency, không sửa bài đã hoàn thành |
| BR4 | BR4.1..BR4.9 | Nạp dữ liệu: thứ tự, kiểm tra, giao dịch, báo cáo, tài khoản, không xóa |

## Assumptions & Open Questions

- **[assumption]** Bộ đếm đăng nhập sai tính theo email đã chuẩn hóa, không theo địa chỉ IP; giới hạn theo IP để thiết kế NFR quyết định.
- **[assumption]** `Retry-After` của khóa đăng nhập tính bằng giây còn lại tới `khoaDen`.
- **Open question:** None.
