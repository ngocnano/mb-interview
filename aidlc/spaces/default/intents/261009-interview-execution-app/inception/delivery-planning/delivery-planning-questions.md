# Câu hỏi Delivery Planning

Bolt = một lượt xây dựng một phần công việc, kết thúc bằng thứ chạy được. Kế hoạch này chọn thứ tự và cách gộp 5 Unit (U1..U5) thành các Bolt. Chọn một đáp án cho mỗi câu; mặc định là A.

## Sources

- `inception/units-generation/unit-of-work.md` — 5 Unit, độ phức tạp, phụ thuộc
- `inception/units-generation/unit-of-work-dependency.md` — U2, U3, U5 phụ thuộc U1; U4 phụ thuộc U3
- `aidlc/spaces/default/memory/team.md` — trunk-based, squash-merge, walking skeleton, TDD, phát hành thủ công theo đợt
- `inception/requirements-analysis/requirements.md` — mục tiêu MVP làm trong 2 ngày

## Q1. Xây cái gì trước?

A. Lát cắt mỏng chạy xuyên suốt trước (U1), rồi hoàn thiện luồng chấm điểm (U2), sau đó giao diện chung (U5), Xem CV (U3), AI (U4). Rủi ro kỹ thuật lộ sớm, giá trị cốt lõi ra sớm.
B. Làm phần rủi ro nhất trước (AI, Xem CV PDF), rồi mới chấm điểm.
C. Giao diện chung (U5) ngay sau U1 để các màn hình sau dùng đúng chủ đề, rồi mới U2.
X. Other (please specify)

[Answer]: A
## Q2. Có chấm điểm và xếp hạng công việc bằng mô hình WSJF không?

WSJF = (giá trị + độ gấp + giá trị giảm rủi ro) chia cho kích thước công việc; điểm cao làm trước.

A. Không, dùng thứ tự theo phụ thuộc và giá trị Must Have; ghi lý do ngắn trong tài liệu.
B. Có, chấm WSJF cho từng Unit (giá trị, rủi ro, kích thước S/M/L/XL cùng trọng số).
X. Other (please specify)

[Answer]: A
## Q3. Một Bolt lớn cỡ nào?

A. Một Unit là một Bolt (5 Bolt), trừ U1 và U2 phát hành chung (U1 chưa có kết luận nên chưa dùng thật được).
B. Gộp U1 + U2 thành một Bolt lớn.
C. Cắt mỏng xuyên qua nhiều Unit.
X. Other (please specify)

[Answer]: A
## Q4. Các Bolt chạy nối tiếp hay song song?

A. Nối tiếp (một phiên làm việc, một Bolt tại một thời điểm; hợp với trunk-based và nhóm một người).
B. Song song sau U1 (U2, U3, U5 cùng lúc).
X. Other (please specify)

[Answer]: A
## Q5. Đường cắt phạm vi cho mục tiêu 2 ngày

A. Ngày 1-2: U1 + U2 (chấm điểm đầy đủ, 16 story Must Have). U5, U3, U4 làm khi còn thời gian; không đạt thì để lượt sau.
B. Thêm U5 vào mục tiêu 2 ngày (giao diện chung), U3 và U4 để lượt sau.
C. Làm cả 5 Unit trong lượt này, chấp nhận lố thời gian.
X. Other (please specify)

[Answer]: A
## Q6. Phụ thuộc bên ngoài

Các mục tôi ghi nhận: (1) nhà cung cấp AI + Legal/Security (OQ-AI-1..4) chặn U4; (2) gói xem PDF web + điện thoại chặn U3; (3) Docker + ảnh Oracle XE trên máy phát triển chặn U1; (4) dữ liệu nạp thật từ nguồn Phase 1 (nếu có) thay cho dữ liệu mẫu. Cách xử lý nếu trễ: U4 dựng với nhà cung cấp giả lập và cờ tắt; U1 dùng dữ liệu mẫu.

A. Đúng, dùng danh sách và cách xử lý này.
B. Bổ sung mục khác (nêu cụ thể).
X. Other (please specify)

[Answer]: A
## Q7. Điều bạn lo nhất, cần xử lý sớm

A. Kết nối Node.js với Oracle XE (Docker) và chạy được end-to-end ngay trong U1.
B. Xem PDF chạy ổn trên cả web và điện thoại.
C. Khung thời gian 2 ngày.
X. Other (please specify)

[Answer]: A
## Q8. Ai thực hiện Construction?

A. Một phiên làm việc này (aidlc-developer-agent), theo từng Unit lần lượt.
B. Mỗi nhóm sở hữu một Unit và duyệt độc lập.
X. Other (please specify)

[Answer]: A
