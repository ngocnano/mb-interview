# Quy tắc nghiệp vụ — U2 scoring-complete

Các quy tắc U2 thêm lên nền U1 (BR1..BR4 trong `construction/u1-scoring-skeleton/functional-design/rules.md`): kết luận và refer (BR5), điểm trung bình (BR6), hoàn thành an toàn và xem lại bài (BR7), đăng xuất và hiển thị trên danh sách (BR8), thay đổi DB (BR9). Quy tắc U1 vẫn giữ nguyên; U2 chỉ thêm, không đổi nghĩa.

## Sources

- `inception/requirements-analysis/requirements.md` — FR-A5, FR-A6, FR-A4, BR-A3, BR-A5
- `inception/user-stories/stories.md` — AC1.2.x, AC5.3.x, AC5.4.x, AC5.8.x, AC6.1.8..AC6.1.16, AC6.2.x, AC6.3.x, AC4.1.11, AC4.1.12, AC2.1.3
- `inception/domain-design/decisions.md` — ADR-002, ADR-003, ADR-004
- `inception/contract-design/contract-summary.md` — C1 (`referable-positions`, `GET evaluation`, `my-evaluations`), C5 (`averageScoreSpec`)
- `construction/u1-scoring-skeleton/functional-design/rules.md` — BR2.11, BR3.5..BR3.10
- `construction/u2-scoring-complete/functional-design/functional-design-questions.md` — Q1 = A, Q2 = A, Q3 = A
- `aidlc/spaces/default/memory/project.md` — idempotency, RBAC phía server, audit, không ghi đè bài đã nộp, không tự kết luận tuyển dụng

## Khối nguồn chính thức

```yaml
rules:
  - id: BR5.1
    statement: Kết luận là bắt buộc khi hoàn thành đánh giá và chỉ nhận một trong bốn giá trị DAT, LOAI, CAN_NHAC, KHAC.
    category: validation
    applies_to: [InterviewEvaluation]
    trigger: POST /panels/{maHdpv}/candidates/{maUngVien}/evaluation
    logic: "IF ketLuan thiếu, rỗng hoặc ngoài {DAT, LOAI, CAN_NHAC, KHAC} THEN server trả 400 kèm trường lỗi ketLuan và không lưu gì"
    violation: "400"
    source: [FR-A5, FR-A6, BR-A3]
  - id: BR5.2
    statement: Refer chỉ hợp lệ khi kết luận là KHAC; lý do refer chỉ hợp lệ khi đã có vị trí refer.
    category: validation
    applies_to: [InterviewEvaluation]
    trigger: POST hoàn thành đánh giá
    logic: "IF ketLuan khác KHAC VÀ (referMaViTri có giá trị HOẶC referLyDo có giá trị) THEN 400; IF referMaViTri rỗng VÀ referLyDo có giá trị THEN 400; chuỗi chỉ gồm khoảng trắng được chuẩn hóa thành rỗng trước khi kiểm tra"
    violation: "400, không lưu gì"
    source: [FR-A5, FR-A6]
  - id: BR5.3
    statement: Vị trí refer phải tồn tại, đang hoạt động và khác vị trí hiện tại của ứng viên; tối đa một vị trí.
    category: validation
    applies_to: [InterviewEvaluation, Position]
    trigger: POST hoàn thành đánh giá có referMaViTri
    logic: "IF referMaViTri không có trong Position HOẶC trangThai = INACTIVE HOẶC trùng maViTri của ứng viên THEN 400 kèm trường lỗi referMaViTri"
    violation: "400"
    source: [FR-A5, FR-A6]
  - id: BR5.4
    statement: Lý do refer tùy chọn, tối đa 500 ký tự.
    category: validation
    applies_to: [InterviewEvaluation]
    trigger: Nhập lý do và hoàn thành đánh giá
    logic: "IF referLyDo dài hơn 500 ký tự THEN client không cho nhập thêm và server trả 400; bộ đếm ký tự hiển thị khi gần giới hạn"
    violation: "400"
    source: [FR-A5]
  - id: BR5.5
    statement: Kết luận, refer và điểm trung bình chỉ là đề xuất của người phỏng vấn; không làm đổi dữ liệu, vị trí hay trạng thái của ứng viên, và kết luận không bị đặt sẵn hay bị chặn theo điểm trung bình.
    category: constraint
    applies_to: [InterviewEvaluation, Candidate, PanelCandidate]
    trigger: Hoàn thành đánh giá với bất kỳ kết luận nào
    logic: "Hoàn thành chỉ ghi InterviewEvaluation và EvaluationScore; không ghi Candidate, PanelCandidate, Position; không có đường mã đọc điểm trung bình để chọn hoặc chặn kết luận"
    violation: "Lỗi kiểm thử; không thể có đường ghi"
    source: [BR-A3, BR-A5, project.md Forbidden]
  - id: BR5.6
    statement: API vị trí có thể refer chỉ trả vị trí đang hoạt động trừ vị trí hiện tại của ứng viên và dùng cùng chính sách truy cập với mở phiếu chấm.
    category: authorization
    applies_to: [Position, PanelCandidate]
    trigger: GET /panels/{maHdpv}/candidates/{maUngVien}/referable-positions
    logic: "Kiểm chính sách như mở ứng viên (BR2.1, BR2.2, BR2.3, BR2.10: 403 chưa được gán, 404 HĐPV không Inprogress hoặc ứng viên Xác nhận = N hoặc không thuộc HĐPV); trả items gồm maViTri, job, dvql sắp theo job rồi maViTri; danh sách rỗng là hợp lệ"
    violation: "403 hoặc 404"
    source: [FR-A5, ADR-004]
  - id: BR5.7
    statement: Khối Kết luận có bốn lựa chọn riêng biệt, mỗi lựa chọn có biểu tượng và chữ, chọn đúng một, không đặt sẵn, kèm chú thích đây là đề xuất của người phỏng vấn.
    category: policy
    applies_to: [InterviewEvaluation]
    trigger: Mở màn chấm điểm (S4)
    logic: "Hiển thị Đạt (dấu tích), Loại (dấu gạch chéo), Cân nhắc (dấu hỏi), Khác (mũi tên chéo); lựa chọn đã chọn có dấu tích và chữ không chỉ đổi màu; điện thoại xếp hai hàng hai cột, mỗi ô cao tối thiểu 48 px; máy tính xếp một hàng; chú thích 'Đề xuất của người phỏng vấn, không phải kết luận cuối'"
    violation: "Không áp dụng"
    source: [FR-A5, NFR-6]
  - id: BR5.8
    statement: Khối Giới thiệu sang vị trí khác chỉ hiện khi kết luận là Khác; đổi sang kết luận khác thì ẩn và xóa giá trị; danh sách vị trí chỉ tải khi khối hiện lần đầu.
    category: policy
    applies_to: [InterviewEvaluation, Position]
    trigger: Chọn hoặc đổi kết luận ở S4
    logic: "IF ketLuan = KHAC THEN hiện khối (mặc định 'Không refer', ô lý do vô hiệu cho tới khi chọn vị trí), phát thông báo 'Đã hiện ô giới thiệu sang vị trí khác' cho trình đọc màn hình và gọi referable-positions một lần cho mỗi lần mở màn (Q3 = A); IF đổi sang DAT, LOAI hoặc CAN_NHAC THEN ẩn khối, xóa vị trí và lý do, không gửi lên; IF tải danh sách lỗi THEN khối báo lỗi kèm nút Thử lại và vẫn hoàn thành được với 'Không refer'"
    violation: "Không áp dụng"
    source: [FR-A5, AC5.4.x, Q3 = A]
  - id: BR5.9
    statement: Nút Hoàn thành đánh giá chỉ mở khi mọi tiêu chí đang hoạt động có điểm và đã chọn kết luận; bấm vào nút khóa thì đánh dấu mục còn thiếu.
    category: validation
    applies_to: [InterviewEvaluation]
    trigger: Nhập liệu và bấm nút khóa ở S4
    logic: "IF thiếu điểm hoặc thiếu kết luận THEN nút khóa; khi bấm nút khóa đánh dấu tiêu chí thiếu đầu tiên (BR3.3), và nếu chỉ thiếu kết luận thì đánh dấu khối Kết luận 'Chưa chọn kết luận' và chuyển tiêu điểm tới khối đó; nhận xét và refer không bao giờ chặn"
    violation: "Không áp dụng"
    source: [FR-A5, AC5.3.2]

  - id: BR6.1
    statement: Điểm trung bình là trung bình cộng không trọng số của các điểm đã chọn, mỗi điểm quy về thang 5 bằng diem * 5 / diemToiDa của tiêu chí đó.
    category: policy
    applies_to: [AverageScoreSpec, EvaluationScore, Criterion]
    trigger: Xem trước ở app và tính khi hoàn thành ở server
    logic: "avg = (tổng của diem_i * 5 / diemToiDa_i) / n, với n là số tiêu chí đã có điểm; n = 0 thì không có giá trị"
    violation: "Không áp dụng"
    source: [ADR-003, C5]
  - id: BR6.2
    statement: Làm tròn bằng số nguyên để Node.js và Dart cho kết quả giống hệt nhau: lưu 2 chữ số thập phân làm tròn nửa lên, hiển thị 1 chữ số thập phân làm tròn nửa lên từ giá trị đã lưu.
    category: constraint
    applies_to: [AverageScoreSpec]
    trigger: Mọi phép tính điểm trung bình
    logic: "Mỗi số hạng diem * 5 / diemToiDa được biểu diễn thành tử số trên mẫu số chung 60 (vì diemToiDa nằm trong 1..5): t_i = diem_i * 5 * (60 / diemToiDa_i). stored100 = floor((200 * tổng(t_i) + 60 * n) / (120 * n)) tính bằng số nguyên, là điểm trung bình nhân 100. display10 = floor((stored100 + 5) / 10). Không dùng số dấu phẩy động để quyết định làm tròn"
    violation: "Bộ ví dụ dùng chung đỏ"
    source: [ADR-003, requirements.md điểm trung bình]
  - id: BR6.3
    statement: Server tự tính điểm trung bình khi hoàn thành từ các dòng điểm đã kiểm tra, lưu cùng phiếu và bỏ qua mọi giá trị do client gửi.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: POST hoàn thành đánh giá
    logic: "Tính theo BR6.1, BR6.2 trên mọi tiêu chí đang hoạt động (đã bắt buộc đủ điểm, BR3.3); ghi diemTrungBinh cùng giao dịch với phiếu (BR3.9); trường diemTrungBinh trong payload bị bỏ qua, không gây 400; phản hồi 201 và 200 trả cùng giá trị đã lưu"
    violation: "Không áp dụng"
    source: [FR-A6, AC6.1.14, AC6.1.15]
  - id: BR6.4
    statement: Điểm trung bình đã lưu không đổi dù bộ tiêu chí hoặc thang điểm thay đổi về sau.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Xem lại bài, liệt kê my-evaluations
    logic: "Mọi API đọc trả giá trị diemTrungBinh đã lưu, không tính lại từ tiêu chí hiện tại"
    violation: "Không áp dụng"
    source: [AC6.1.16, AC5.8.8]
  - id: BR6.5
    statement: Khối Điểm trung bình trên màn chấm điểm cập nhật ngay khi đổi điểm, không cần mạng, chỉ đọc, và không ảnh hưởng đến việc chọn kết luận.
    category: policy
    applies_to: [AverageScoreSpec, InterviewEvaluation]
    trigger: Chọn hoặc đổi điểm ở S4
    logic: "IF chưa chọn điểm nào THEN hiện '—' và 'Chưa chọn điểm nào'; IF đã chọn k trong n tiêu chí (k < n) THEN hiện 'x,y / 5' và 'Tạm tính theo k/n tiêu chí đã chọn'; IF đã chọn đủ THEN hiện 'x,y / 5' và 'Trung bình n tiêu chí'; kèm chú thích 'Chỉ để tham khảo, không thay thế kết luận của bạn'; khối không có ô nhập; mỗi lần đổi giá trị trình đọc màn hình nghe giá trị mới; giá trị xem trước dùng đúng BR6.2 nên khớp con số server lưu"
    violation: "Không áp dụng"
    source: [FR-A5, AC5.8.x, BR-A5]
  - id: BR6.6
    statement: Hai bản cài đặt công thức (Node.js và Dart) cùng chạy một tệp ví dụ dùng chung.
    category: constraint
    applies_to: [AverageScoreSpec]
    trigger: Chạy test backend và test app
    logic: "Tệp shared/average-score-examples.json ở gốc kho mã chứa các bộ ví dụ (điểm, thang, stored100, display10) gồm tối thiểu 4,3,4 → 3,67 và 3,7; 4,3,5,4,5 → 4,20 và 4,2; một ví dụ thang trộn; một ví dụ làm tròn nửa lên ở chữ số thứ hai; một ví dụ một tiêu chí; cả hai bộ test đọc đúng tệp này và không có bản sao"
    violation: "Test đỏ"
    source: [ADR-003]
  - id: BR6.7
    statement: Điểm trung bình luôn hiển thị một chữ số thập phân với dấu phẩy.
    category: policy
    applies_to: [AverageScoreSpec]
    trigger: Hiển thị ở S3, S4, S5
    logic: "Hiển thị display10 theo định dạng vi-VN, ví dụ '3,8'; trên danh sách thêm nhãn 'Điểm TB 3,8'"
    violation: "Không áp dụng"
    source: [AC5.8.7, AC4.1.12]

  - id: BR7.1
    statement: Khóa idempotency được app sinh một lần cho mỗi lần mở phiếu và giữ nguyên cho mọi lần Thử lại trong cùng phiên màn hình.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Hoàn thành đánh giá, gồm cả Thử lại
    logic: "Khóa tạo khi mở S4, nằm trong bộ nhớ của màn hình, dùng lại ở mọi lần gửi; không lưu bền xuống máy; đóng hoặc tải lại app thì mất cùng dữ liệu đang nhập (Q1 = A)"
    violation: "Không áp dụng"
    source: [FR-A6, AC6.2.2, Q1 = A]
  - id: BR7.2
    statement: Khi gửi lỗi mạng, hết thời gian chờ hoặc lỗi 5xx, app giữ nguyên form, báo 'Chưa hoàn thành được' và không báo thành công; chỉ gửi lại khi người dùng bấm Thử lại.
    category: policy
    applies_to: [InterviewEvaluation]
    trigger: Phản hồi lỗi hoặc không có phản hồi trong 10 giây
    logic: "Giữ điểm, kết luận, refer, nhận xét; hiện thông báo 'Chưa hoàn thành được' kèm nút Thử lại; Thử lại gửi cùng idempotencyKey; nhận 200 hoặc 201 đều được coi là thành công như nhau; 409 'Bạn đã hoàn thành đánh giá cho ứng viên này' thì chuyển sang tải bài đã hoàn thành ở dạng chỉ đọc; 400 thì đánh dấu trường lỗi; 401 thì về đăng nhập (BR1.4)"
    violation: "Không áp dụng"
    source: [FR-A6, AC6.2.2]
  - id: BR7.3
    statement: Trong lúc một request hoàn thành đang chạy, nút Hoàn thành bị vô hiệu và không gửi request thứ hai.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Bấm nút Hoàn thành khi đang gửi
    logic: "Đặt cờ đang gửi trước khi gọi mạng; bấm lần hai bị bỏ qua; hết gửi (thành công hoặc lỗi) mới mở lại"
    violation: "Không áp dụng"
    source: [AC6.2.3]
  - id: BR7.4
    statement: Gửi lại cùng idempotencyKey cho cùng cặp trả đúng phiếu đã lưu, gồm kết luận, refer và điểm trung bình, mà không ghi gì mới.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: POST với idempotencyKey đã dùng
    logic: "Kế thừa BR3.7; phản hồi 200 mang cùng ketLuan, diemTrungBinh, submittedAt đã lưu và bỏ qua nội dung payload mới nếu khác (payload khác không sửa phiếu)"
    violation: "Không áp dụng"
    source: [FR-A6, AC6.2.1, BR3.7]
  - id: BR7.5
    statement: Người phỏng vấn chỉ đọc được bài đã hoàn thành của chính mình, gồm điểm từng tiêu chí (kể cả tiêu chí đã ngừng hoạt động), kết luận, refer, điểm trung bình, nhận xét và thời điểm hoàn thành.
    category: authorization
    applies_to: [InterviewEvaluation, EvaluationScore, Criterion]
    trigger: GET /panels/{maHdpv}/candidates/{maUngVien}/evaluation
    logic: "Tra theo userId trong token nên không có cách chỉ định phiếu của người khác; kiểm quyền được gán (403), HĐPV Inprogress hoặc Completed và ứng viên Xác nhận = Y (404 nếu không); IF tôi chưa có phiếu THEN 404 mã EVALUATION_NOT_FOUND; trả điểm theo tên và thang tiêu chí kể cả khi tiêu chí INACTIVE; refer trả cả mã và tên vị trí; không có API sửa hoặc xóa (BR3.8)"
    violation: "403 hoặc 404"
    source: [FR-A6, AC6.3.x, ADR-004]
  - id: BR7.6
    statement: Bài đã hoàn thành mở ở màn chỉ đọc riêng; ứng viên chưa chấm mở form chấm.
    category: policy
    applies_to: [InterviewEvaluation, PanelCandidate]
    trigger: Chọn một ứng viên ở S3
    logic: "IF my-evaluations có ứng viên đó THEN mở S5 (chỉ đọc, tải GET evaluation); ELSE mở S4; S5 hiển thị điểm từng tiêu chí, kết luận bằng chữ và biểu tượng, khối refer chỉ khi kết luận là Khác, điểm trung bình đã lưu, nhận xét, thời điểm hoàn thành; không có nút sửa hay hoàn thành lại; lỗi mạng có nút Thử lại"
    violation: "Không áp dụng"
    source: [FR-A5, AC6.3.x]
  - id: BR7.7
    statement: Bài hoàn thành từ U1 (trước khi có kết luận) vẫn xem lại được, hiển thị 'Chưa ghi kết luận'.
    category: policy
    applies_to: [InterviewEvaluation]
    trigger: Đọc phiếu có ketLuan rỗng
    logic: "API trả ketLuan = null; S3 và S5 hiển thị 'Chưa ghi kết luận' (chữ và biểu tượng) và không có khối refer; điểm trung bình đã được điền bù khi di chuyển DB (BR9.3)"
    violation: "Không áp dụng"
    source: [Functional Design U2, AC6.3.6]
  - id: BR7.8
    statement: Màn chấm điểm vẫn cảnh báo mất dữ liệu khi rời và hộp thoại xác nhận trước khi hoàn thành như U1, nay gồm cả kết luận và refer.
    category: policy
    applies_to: [InterviewEvaluation]
    trigger: Rời S4 hoặc bấm Hoàn thành
    logic: "Kế thừa BR3.10; 'đã nhập dữ liệu' gồm điểm, nhận xét, kết luận hoặc refer"
    violation: "Không áp dụng"
    source: [FR-A5, BR3.10]

  - id: BR8.1
    statement: Đăng xuất xóa token, xóa trạng thái người dùng trong app và quay về đăng nhập; nút quay lại không mở lại màn nghiệp vụ.
    category: authorization
    applies_to: [UserAccount]
    trigger: Bấm Đăng xuất
    logic: "Xóa token khỏi kho lưu an toàn; hủy request đang chạy; hủy mọi bộ nhớ đệm dữ liệu nghiệp vụ trong app; chuyển về S1 và thay toàn bộ ngăn xếp điều hướng; bộ bảo vệ điều hướng chuyển mọi đường dẫn nghiệp vụ về S1 khi không có token; request kế tiếp không kèm token; nếu đang có dữ liệu chưa hoàn thành ở S4 thì hỏi xác nhận trước (BR7.8)"
    violation: "Không áp dụng"
    source: [FR-A0, AC1.2.1, AC1.2.2]
  - id: BR8.2
    statement: Token là JWT không trạng thái nên đăng xuất không thu hồi token ở server; token chỉ hết hiệu lực khi hết 8 giờ.
    category: policy
    applies_to: [UserAccount]
    trigger: Đăng xuất
    logic: "Không có danh sách thu hồi ở MVP; token đã xóa khỏi máy này; rủi ro token bị sao chép trước đó được ghi nhận là tồn đọng chấp nhận"
    violation: "Không áp dụng"
    source: [DEC-4]
  - id: BR8.3
    statement: Dòng ứng viên ở S3 hiển thị nhãn Đã chấm kèm nhãn kết luận và Điểm TB ghép từ my-evaluations; ứng viên chưa chấm không có hai nhãn đó.
    category: policy
    applies_to: [InterviewEvaluation, PanelCandidate]
    trigger: Mở S3 và sau khi hoàn thành đánh giá
    logic: "my-evaluations trả thêm ketLuan và diemTrungBinh cho mỗi bài của tôi (chỉ thêm trường, BR2.11); nhãn kết luận có chữ và biểu tượng như BR5.7; Điểm TB hiển thị theo BR6.7; chưa chấm hiển thị 'Chưa chấm' như U1"
    violation: "Không áp dụng"
    source: [FR-A4, AC4.1.11, AC4.1.12, AC5.8.7]
  - id: BR8.4
    statement: Dòng HĐPV ở S2 hiển thị số đã chấm trên tổng số ứng viên đã xác nhận, chỉ tính bài của tôi, do app ghép từ my-evaluations của từng HĐPV.
    category: policy
    applies_to: [InterviewPanel, InterviewEvaluation]
    trigger: Mở S2
    logic: "Sau khi có GET /panels, app gọi song song my-evaluations cho từng HĐPV hiển thị; daCham = min(số bài của tôi, soUngVienXacNhan); hiển thị 'daCham/tong'; IF gọi my-evaluations của một HĐPV lỗi THEN dòng đó hiển thị tổng và '—' cho số đã chấm kèm nút Thử lại cục bộ, các HĐPV khác không bị ảnh hưởng"
    violation: "Không áp dụng"
    source: [FR-A2, ADR-002, AC2.1.3]
  - id: BR8.5
    statement: Hoàn thành đánh giá ghi một dòng audit không chứa điểm chi tiết hay nhận xét, nhưng có kết luận và cờ có refer.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Hoàn thành đánh giá thành công (201)
    logic: "Dòng audit gồm userId, maHdpv, maUngVien, evaluationId, ketLuan, coRefer (true hoặc false), thời điểm; không có nhận xét, lý do refer hay điểm; lần 200 do gửi lại ghi sự kiện riêng evaluation_replayed (giữ từ U1) chỉ có định danh và kết luận, không ghi thêm dữ liệu đánh giá"
    violation: "Không áp dụng"
    source: [project.md Mandated, FR-A6]

  - id: BR9.1
    statement: DB có ràng buộc giữ kết luận và refer nhất quán dù ghi bằng đường nào.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Ghi bảng phiếu đánh giá
    logic: "CHECK ket_luan IS NULL hoặc thuộc {DAT, LOAI, CAN_NHAC, KHAC}; CHECK refer_ma_vi_tri IS NULL hoặc ket_luan = KHAC; CHECK refer_ly_do IS NULL hoặc refer_ma_vi_tri IS NOT NULL; khóa ngoại refer_ma_vi_tri tới Position; ket_luan vẫn cho NULL ở DB để tương thích bài từ U1, còn API U2 bắt buộc (BR5.1)"
    violation: "Lỗi ràng buộc DB, API trả 500 và hoàn tác"
    source: [FR-A6, Q2 = A]
  - id: BR9.2
    statement: Thay đổi DB của U2 đến bằng tệp migration đánh số chạy lại được nhiều lần, và schema.sql luôn bằng trạng thái sau migration.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Chạy node scripts/migrate.mjs hoặc dựng DB mới
    logic: "docker/schema/migrate/002-u2-constraints.sql thêm các ràng buộc BR9.1 và điền bù BR9.3; scripts/migrate.mjs chạy các tệp chưa áp dụng theo thứ tự, ghi vào bảng SCHEMA_MIGRATIONS, bỏ qua tệp đã áp dụng, chạy bằng tài khoản chủ lược đồ, dừng với mã khác 0 nếu lỗi; docker/schema/schema.sql đã gồm sẵn kết quả nên DB mới không cần migration và được đánh dấu 002 là đã áp dụng; không xóa dữ liệu"
    violation: "Mã thoát khác 0"
    source: [Q2 = A]
  - id: BR9.3
    statement: Migration điền bù điểm trung bình cho các bài đã hoàn thành ở U1 theo đúng công thức BR6.1, BR6.2.
    category: constraint
    applies_to: [InterviewEvaluation]
    trigger: Chạy migration 002
    logic: "Với mỗi phiếu có diem_trung_binh rỗng, tính từ các dòng điểm và thang hiện tại của tiêu chí theo quy tắc làm tròn nửa lên 2 chữ số, ghi vào diem_trung_binh; ket_luan giữ nguyên rỗng; chạy lại không đổi gì thêm"
    violation: "Không áp dụng"
    source: [AC6.3.6, ADR-003]
```

## Tóm tắt

| Nhóm | Quy tắc | Nội dung chính |
|---|---|---|
| BR5 | BR5.1..BR5.9 | Kết luận bắt buộc, refer chỉ khi Khác, vị trí refer hợp lệ, chỉ là đề xuất, giao diện kết luận và refer |
| BR6 | BR6.1..BR6.7 | Công thức điểm trung bình, làm tròn số nguyên, server tự tính, xem trước, ví dụ dùng chung |
| BR7 | BR7.1..BR7.8 | Idempotency khi Thử lại, lỗi mạng, chống bấm đúp, xem lại bài, bài cũ không có kết luận |
| BR8 | BR8.1..BR8.5 | Đăng xuất, nhãn kết luận và Điểm TB ở S3, đã chấm trên tổng ở S2, audit |
| BR9 | BR9.1..BR9.3 | Ràng buộc DB, migration chạy lại được, điền bù điểm trung bình |

## Assumptions & Open Questions

- **[assumption]** Chọn cách ghép phía app cho "đã chấm / tổng" ở S2 (BR8.4, theo ADR-002) thay vì thêm trường vào `GET /panels`; số HĐPV mỗi người ít nên số lần gọi song song chấp nhận được. Nếu đo hiệu năng cho thấy chậm, đổi sang API tổng hợp ở Unit sau.
- **[assumption]** `min(số bài, tổng)` ở BR8.4 che trường hợp ứng viên đã chấm sau đó bị đổi thành Xác nhận = N; đây là trường hợp hiếm do dữ liệu nạp lại.
- **[assumption]** AC6.3.3 (người dùng B đọc đánh giá của A) được đáp ứng theo cấu trúc: API đọc tra theo `userId` của token nên không có cách chỉ định phiếu của người khác; người chưa được gán nhận `403`, người được gán nhưng chưa có phiếu nhận `404`.
- **[assumption]** Đăng xuất không thu hồi JWT ở server (BR8.2); chấp nhận ở MVP vì token chỉ sống 8 giờ.
- **Open question:** None.
