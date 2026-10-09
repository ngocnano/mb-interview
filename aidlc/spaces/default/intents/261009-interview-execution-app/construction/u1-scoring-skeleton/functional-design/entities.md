# Mô hình thực thể — U1 scoring-skeleton

Phần dữ liệu U1 dựng: tài khoản và bộ đếm đăng nhập sai, dữ liệu hội đồng phỏng vấn (HĐPV), tiêu chí, phiếu đánh giá và điểm. Cột `ketLuan`, `referMaViTri`, `referLyDo`, `diemTrungBinh` của phiếu do U2 thêm (nullable ở U1, xem ghi chú trong khối yaml). Thực thể CV và AI thuộc U3 và U4, không có ở đây. Không có mã, không có SQL.

## Sources

- `inception/domain-design/components.md` — 14 thực thể và chủ sở hữu
- `inception/units-generation/unit-of-work.md` — ranh giới U1
- `inception/user-stories/stories.md` — AC của US1.1, US2.1, US4.1, US5.1, US5.2, US6.1, US7.1..US7.3
- `construction/u1-scoring-skeleton/functional-design/functional-design-questions.md` — Q1 = B, Q2..Q6 = A

## Khối nguồn chính thức

```yaml
entities:
  - name: UserAccount
    owner: IdentityAccess
    description: Tài khoản đăng nhập của người phỏng vấn, gắn với một CBQL.
    attributes:
      - { name: userId, type: id, required: true, unique: true, description: Do server sinh }
      - { name: email, type: text, required: true, unique: true, max: 255, constraints: "Lưu dạng chuẩn hóa (bỏ khoảng trắng hai đầu, chữ thường); so khớp không phân biệt hoa thường" }
      - { name: passwordHash, type: text, required: true, constraints: "Chỉ lưu giá trị băm bcrypt; không bao giờ lưu hay ghi log mật khẩu rõ" }
      - { name: employedId, type: text, required: true, references: Interviewer.employedId }
      - { name: hoTen, type: text, required: true, max: 200 }
      - { name: trangThai, type: enum, required: true, allowed: [ACTIVE, LOCKED], default: ACTIVE }
    constraints:
      - "email duy nhất (sau chuẩn hóa)"
      - "employedId phải tồn tại trong Interviewer"
    relationships:
      - { to: Interviewer, cardinality: "N:1", direction: "UserAccount -> Interviewer" }

  - name: LoginThrottle
    owner: IdentityAccess
    description: Bộ đếm đăng nhập sai theo email chuẩn hóa, dùng để tạm khóa 15 phút sau 5 lần sai. Tồn tại cả khi email không có tài khoản, để không lộ email có tồn tại.
    attributes:
      - { name: email, type: text, required: true, unique: true, max: 255 }
      - { name: soLanSai, type: integer, required: true, default: 0, min: 0 }
      - { name: khoaDen, type: timestamp, required: false, description: "Thời điểm hết khóa; rỗng nếu không khóa" }
      - { name: lanSaiCuoi, type: timestamp, required: false }
    constraints:
      - "Một dòng cho mỗi email chuẩn hóa"
    relationships: []

  - name: Position
    owner: InterviewCatalog
    description: Vị trí ứng tuyển.
    attributes:
      - { name: maViTri, type: text, required: true, unique: true, max: 50 }
      - { name: job, type: text, required: true, max: 200 }
      - { name: dvql, type: text, required: true, max: 200 }
      - { name: dvtt1, type: text, required: false, max: 200 }
      - { name: dvtt2, type: text, required: false, max: 200 }
      - { name: dvtt3, type: text, required: false, max: 200 }
      - { name: trangThai, type: enum, required: true, allowed: [ACTIVE, INACTIVE], default: ACTIVE }
    constraints: []
    relationships: []

  - name: Candidate
    owner: InterviewCatalog
    description: Ứng viên. Các trường nhạy cảm được lưu để khớp dữ liệu nguồn nhưng không bao giờ trả qua API của app.
    attributes:
      - { name: maUngVien, type: text, required: true, unique: true, max: 50 }
      - { name: ten, type: text, required: true, max: 200 }
      - { name: maViTri, type: text, required: true, references: Position.maViTri }
      - { name: sdt, type: text, required: false, max: 30, constraints: "Không trả qua API (BR2.6)" }
      - { name: email, type: text, required: false, max: 255 }
      - { name: ngaySinh, type: date, required: false, constraints: "Không trả qua API (BR2.6)" }
      - { name: gioiTinh, type: text, required: false, max: 20, constraints: "Không trả qua API (BR2.6)" }
      - { name: kinhNghiem, type: text, required: false, max: 1000 }
      - { name: trinhDo, type: text, required: false, max: 200 }
    constraints:
      - "maViTri phải tồn tại trong Position"
    relationships:
      - { to: Position, cardinality: "N:1", direction: "Candidate -> Position" }

  - name: Interviewer
    owner: InterviewCatalog
    description: Cán bộ quản lý (CBQL) có thể tham gia hội đồng phỏng vấn.
    attributes:
      - { name: employedId, type: text, required: true, unique: true, max: 50 }
      - { name: ten, type: text, required: true, max: 200 }
      - { name: job, type: text, required: false, max: 200 }
      - { name: donVi, type: text, required: false, max: 200 }
      - { name: email, type: text, required: false, max: 255 }
    constraints: []
    relationships: []

  - name: InterviewPanel
    owner: InterviewCatalog
    description: Hội đồng phỏng vấn (HĐPV). App không đổi trạng thái; trạng thái chỉ đến từ dữ liệu nạp.
    attributes:
      - { name: maHdpv, type: text, required: true, unique: true, max: 50 }
      - { name: ten, type: text, required: true, max: 200 }
      - { name: diaDiem, type: text, required: false, max: 300 }
      - { name: ngay, type: date, required: true }
      - { name: hinhThuc, type: enum, required: true, allowed: [Online, Offline] }
      - { name: daGuiEmail, type: boolean, required: false, default: false }
      - { name: trangThai, type: enum, required: true, allowed: [Draft, Sent, "Xác nhận", Inprogress, Completed] }
    constraints: []
    relationships: []

  - name: PanelCandidate
    owner: InterviewCatalog
    description: Dòng lịch của một ứng viên trong một HĐPV (Chi tiết HĐPV – Ứng viên).
    attributes:
      - { name: id, type: id, required: true, unique: true }
      - { name: maHdpv, type: text, required: true, references: InterviewPanel.maHdpv }
      - { name: maUngVien, type: text, required: true, references: Candidate.maUngVien }
      - { name: tuThoiGian, type: time-of-day, required: true, description: "Giờ địa phương hh:mm, không múi giờ (Q3 = A)" }
      - { name: denThoiGian, type: time-of-day, required: true }
      - { name: xacNhan, type: enum, required: true, allowed: [Y, N] }
    constraints:
      - "tuThoiGian nhỏ hơn denThoiGian"
      - "Duy nhất theo cặp (maHdpv, maUngVien)"
    relationships:
      - { to: InterviewPanel, cardinality: "N:1", direction: "PanelCandidate -> InterviewPanel" }
      - { to: Candidate, cardinality: "N:1", direction: "PanelCandidate -> Candidate" }

  - name: PanelInterviewer
    owner: InterviewCatalog
    description: Dòng gán một CBQL vào một HĐPV (Chi tiết HĐPV – CBQL).
    attributes:
      - { name: id, type: id, required: true, unique: true }
      - { name: maHdpv, type: text, required: true, references: InterviewPanel.maHdpv }
      - { name: maCbql, type: text, required: true, references: Interviewer.employedId }
      - { name: tuThoiGian, type: time-of-day, required: false }
      - { name: denThoiGian, type: time-of-day, required: false }
      - { name: xacNhan, type: enum, required: false, allowed: [Y, N] }
    constraints:
      - "Duy nhất theo cặp (maHdpv, maCbql)"
    relationships:
      - { to: InterviewPanel, cardinality: "N:1", direction: "PanelInterviewer -> InterviewPanel" }
      - { to: Interviewer, cardinality: "N:1", direction: "PanelInterviewer -> Interviewer" }

  - name: Criterion
    owner: Evaluation
    description: Tiêu chí chấm điểm cùng thang điểm nguyên.
    attributes:
      - { name: maTieuChi, type: text, required: true, unique: true, max: 20 }
      - { name: tenTieuChi, type: text, required: true, max: 200 }
      - { name: diemToiThieu, type: integer, required: true, min: 1, max: 5 }
      - { name: diemToiDa, type: integer, required: true, min: 1, max: 5 }
      - { name: thuTu, type: integer, required: true }
      - { name: trangThai, type: enum, required: true, allowed: [ACTIVE, INACTIVE], default: ACTIVE }
    constraints:
      - "1 <= diemToiThieu < diemToiDa <= 5"
    relationships: []

  - name: InterviewEvaluation
    owner: Evaluation
    description: Phiếu đánh giá đã hoàn thành của một người phỏng vấn cho một ứng viên trong một HĐPV. Ở U1 không có bản nháp và không sửa sau khi hoàn thành.
    attributes:
      - { name: evaluationId, type: id, required: true, unique: true, description: Do server sinh }
      - { name: userId, type: id, required: true, references: UserAccount.userId }
      - { name: maHdpv, type: text, required: true, references: InterviewPanel.maHdpv }
      - { name: maUngVien, type: text, required: true, references: Candidate.maUngVien }
      - { name: nhanXet, type: text, required: false, max: 2000 }
      - { name: idempotencyKey, type: uuid, required: true }
      - { name: trangThai, type: enum, required: true, allowed: [SUBMITTED], default: SUBMITTED }
      - { name: submittedAt, type: timestamp, required: true }
      - { name: ketLuan, type: enum, required: false, allowed: [DAT, LOAI, CAN_NHAC, KHAC], description: "Cột do U2 thêm; nullable ở U1, bắt buộc từ U2" }
      - { name: referMaViTri, type: text, required: false, references: Position.maViTri, description: "Cột do U2 thêm" }
      - { name: referLyDo, type: text, required: false, max: 500, description: "Cột do U2 thêm" }
      - { name: diemTrungBinh, type: decimal, required: false, description: "Cột do U2 thêm; 2 chữ số thập phân" }
    constraints:
      - "Duy nhất theo bộ ba (userId, maHdpv, maUngVien)"
      - "Duy nhất theo (userId, idempotencyKey)"
      - "Bản ghi ở trạng thái SUBMITTED không bị sửa hoặc xóa"
    relationships:
      - { to: UserAccount, cardinality: "N:1", direction: "InterviewEvaluation -> UserAccount" }
      - { to: InterviewPanel, cardinality: "N:1", direction: "InterviewEvaluation -> InterviewPanel" }
      - { to: Candidate, cardinality: "N:1", direction: "InterviewEvaluation -> Candidate" }

  - name: EvaluationScore
    owner: Evaluation
    description: Điểm của một tiêu chí trong một phiếu.
    attributes:
      - { name: evaluationId, type: id, required: true, references: InterviewEvaluation.evaluationId }
      - { name: maTieuChi, type: text, required: true, references: Criterion.maTieuChi }
      - { name: diem, type: integer, required: true }
    constraints:
      - "Khóa gồm (evaluationId, maTieuChi)"
      - "diem nằm trong [diemToiThieu, diemToiDa] của tiêu chí tại thời điểm hoàn thành"
    relationships:
      - { to: InterviewEvaluation, cardinality: "N:1", direction: "EvaluationScore -> InterviewEvaluation" }
      - { to: Criterion, cardinality: "N:1", direction: "EvaluationScore -> Criterion" }
```

## Tóm tắt

| Thực thể | Khối sở hữu | Ghi chú cho U1 |
|---|---|---|
| UserAccount | IdentityAccess | Đăng nhập, khóa/mở tài khoản do dữ liệu nạp |
| LoginThrottle | IdentityAccess | Mới ở Functional Design (Q1 = B); bổ sung vào requirements và story (AC1.1.9) |
| Position, Candidate, Interviewer | InterviewCatalog | Dữ liệu nguồn, chỉ ghi khi nạp |
| InterviewPanel, PanelCandidate, PanelInterviewer | InterviewCatalog | Chính sách truy cập đọc từ đây |
| Criterion | Evaluation | Thang điểm nguyên 1..5 |
| InterviewEvaluation, EvaluationScore | Evaluation | Chỉ ghi khi hoàn thành đánh giá |

## Assumptions & Open Questions

- **[assumption]** `userId`, `evaluationId`, `id` là mã do server sinh (GUID); kiểu lưu cụ thể thuộc thiết kế hạ tầng.
- **[assumption]** `Candidate` vẫn lưu `sdt`, `ngaySinh`, `gioiTinh` để khớp nguồn; có thể bỏ nếu PO muốn giảm dữ liệu cá nhân (câu hỏi mở từ domain-design).
- **Open question:** None.
