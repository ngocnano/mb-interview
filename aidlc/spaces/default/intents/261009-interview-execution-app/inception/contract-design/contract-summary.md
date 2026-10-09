# Hợp đồng giữa các phần của hệ thống — App thực hiện phỏng vấn

## Sources

- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/units-generation/unit-of-work.md` — U1..U5, mô hình triển khai
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/units-generation/unit-of-work-dependency.md` — sơ đồ phụ thuộc và điểm tích hợp
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/domain-design/components.md` — 7 khối, 14 thực thể
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/domain-design/decisions.md` — ADR-002, ADR-003, ADR-004, ADR-006, ADR-007
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/requirements-analysis/requirements.md` — FR-A0..FR-A10, BR-A1..BR-A5, NFR-8, quy ước lỗi API
- `aidlc/spaces/default/intents/261009-interview-execution-app/inception/contract-design/contract-design-questions.md` — Q1 = A (REST / JSON, OpenAPI 3), Q2 = A (interface TypeScript trong tiến trình), Q3 = A (chỉ thêm trong v1, thời gian chờ, thử lại)

## Bảng hợp đồng

| # | Provider Unit | Consumer | Mechanism | Owner |
|---|---|---|---|---|
| C1 | U1 (mở rộng bởi U2, U3, U4) — backend Node.js | InterviewerApp (U1..U5) | REST / JSON qua HTTPS, `/api/v1`, OpenAPI 3 | Backend; U1 tạo, Unit thêm API nào sở hữu phần đó |
| C2 | U1 — module InterviewCatalog | Evaluation (U1, U2), CandidateDocuments (U3), AiAssist (U4), DataImport (U1, U3) | Interface TypeScript trong tiến trình | U1 |
| C3 | U1 — module IdentityAccess | Mọi module API, DataImport | Interface TypeScript trong tiến trình | U1 |
| C4 | U3 — module CandidateDocuments | AiAssist (U4), DataImport (U3) | Interface TypeScript trong tiến trình | U3 |
| C5 | U1 — module Evaluation | DataImport (U1); InterviewerApp (U2) qua đặc tả công thức | Interface TypeScript; đặc tả công thức + bộ ví dụ dùng chung | U1 (interface), U2 (công thức) |
| C6 | U1 — DataImport | External: người vận hành (tệp nạp) | Shared schema tệp JSON | U1; U3 thêm trường CV |
| C7 | U4 — module AiAssist | External: nhà cung cấp AI (AiAssist là bên gọi) | Adapter gọi ra ngoài, lược đồ kết quả JSON | U4 |

Quy ước chung cho C1: xác thực `Authorization: Bearer <JWT>` ở mọi API trừ đăng nhập; mọi lỗi trả `{ code, message }` (`message` tiếng Việt, `code` là chuỗi tiếng Anh viết hoa ổn định); chuỗi ngày `dd/mm/yyyy` chỉ dùng ở giao diện, API dùng ISO 8601 cho thời điểm và `HH:mm` cho giờ; trường `null` có thể vắng mặt.

---

## C1 — API giữa app Flutter và backend

Cột "Unit" cho biết Unit nào thêm API hoặc trường đó. U1 dựng nền; U2 thêm kết luận, refer, điểm trung bình, tóm tắt đánh giá và xem lại; U3 thêm CV; U4 thêm AI.

| API | Unit | Story |
|---|---|---|
| `POST /auth/login` | U1 | US1.1 |
| `GET /config` | U4 | US7.4 |
| `GET /panels` | U1 | US2.1 |
| `GET /panels/{maHdpv}/candidates` | U1 | US4.1 |
| `GET /panels/{maHdpv}/candidates/{maUngVien}` | U1 | US5.1 |
| `GET /criteria` | U1 | US5.1 |
| `GET /panels/{maHdpv}/candidates/{maUngVien}/referable-positions` | U2 | US5.4 |
| `POST /panels/{maHdpv}/candidates/{maUngVien}/evaluation` | U1, mở rộng U2 | US6.1, US6.2, US5.3, US5.4, US5.8 |
| `GET /panels/{maHdpv}/candidates/{maUngVien}/evaluation` | U2 | US6.3 |
| `GET /panels/{maHdpv}/my-evaluations` | U1 (dạng tối thiểu: `maUngVien`, `submittedAt`), U2 thêm `ketLuan`, `diemTrungBinh` | US2.1, US4.1, US5.8 |
| `POST /panels/{maHdpv}/candidates/{maUngVien}/cv-link` | U3 | US5.5 |
| `GET /cv-files/{token}` | U3 | US5.5 |
| `POST /panels/{maHdpv}/candidates/{maUngVien}/ai-summary` | U4 | US5.6, US5.7 |

```yaml
openapi: 3.0.3
info:
  title: Interview Execution API
  version: 1.0.0
  description: >
    API giữa app Flutter và backend Node.js. Mọi API trừ /auth/login cần
    Authorization: Bearer <JWT>. Lỗi luôn trả Error. Trường lạ phải được client bỏ qua.
servers:
  - url: /api/v1
security:
  - bearerAuth: []
paths:
  /auth/login:
    post:
      summary: Đăng nhập bằng email và mật khẩu (FR-A0)
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email: { type: string, format: email, maxLength: 255 }
                password: { type: string, minLength: 1, maxLength: 128 }
      responses:
        '200':
          description: Đăng nhập thành công
          content:
            application/json:
              schema:
                type: object
                required: [token, expiresAt, user]
                properties:
                  token: { type: string }
                  expiresAt: { type: string, format: date-time }
                  user:
                    type: object
                    required: [userId, employedId, hoTen, email]
                    properties:
                      userId: { type: string }
                      employedId: { type: string }
                      hoTen: { type: string }
                      email: { type: string }
        '400': { $ref: '#/components/responses/BadRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '429': { $ref: '#/components/responses/TooManyRequests' }
  /config:
    get:
      summary: Cấu hình công khai cho app (U4)
      responses:
        '200':
          description: Cờ tính năng
          content:
            application/json:
              schema:
                type: object
                required: [aiCvSummaryEnabled]
                properties:
                  aiCvSummaryEnabled: { type: boolean }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /panels:
    get:
      summary: HĐPV Inprogress mà tôi được gán (FR-A2, BR-A2)
      responses:
        '200':
          description: Danh sách sắp theo ngay tăng dần, rồi theo maHdpv
          content:
            application/json:
              schema:
                type: object
                required: [items]
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/PanelSummary' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /panels/{maHdpv}/candidates:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
    get:
      summary: Ứng viên Xác nhận = Y của HĐPV, mọi vị trí, sắp theo giờ (FR-A4, BR-A1)
      responses:
        '200':
          description: Sắp theo tuThoiGian tăng dần, cùng giờ thì maUngVien tăng dần
          content:
            application/json:
              schema:
                type: object
                required: [panel, items]
                properties:
                  panel: { $ref: '#/components/schemas/PanelSummary' }
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/CandidateRow' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
  /panels/{maHdpv}/candidates/{maUngVien}:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
      - $ref: '#/components/parameters/MaUngVien'
    get:
      summary: Thông tin ứng viên để chấm (FR-A5); không có sdt, ngaySinh, gioiTinh
      responses:
        '200':
          description: Thông tin ứng viên
          content:
            application/json:
              schema: { $ref: '#/components/schemas/CandidateDetail' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
  /criteria:
    get:
      summary: Tiêu chí đang hoạt động, sắp theo thuTu (FR-A7)
      responses:
        '200':
          description: Danh sách tiêu chí
          content:
            application/json:
              schema:
                type: object
                required: [items]
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/Criterion' }
        '401': { $ref: '#/components/responses/Unauthorized' }
  /panels/{maHdpv}/candidates/{maUngVien}/referable-positions:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
      - $ref: '#/components/parameters/MaUngVien'
    get:
      summary: Vị trí đang hoạt động, trừ vị trí hiện tại của ứng viên (U2, FR-A5)
      responses:
        '200':
          description: Danh sách vị trí để refer
          content:
            application/json:
              schema:
                type: object
                required: [items]
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/Position' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
  /panels/{maHdpv}/candidates/{maUngVien}/evaluation:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
      - $ref: '#/components/parameters/MaUngVien'
    post:
      summary: Hoàn thành đánh giá và khóa (FR-A6)
      description: >
        HĐPV phải Inprogress hoặc Completed, ứng viên Xác nhận = Y. Mọi tiêu chí đang hoạt động
        phải có điểm. Cùng idempotencyKey gửi lại trả 200 với bản đã lưu; khác khóa khi đã có bài trả 409.
        Server tự tính diemTrungBinh; nếu client gửi trường này thì bị bỏ qua.
        U1: chưa có ketLuan, refer. U2: ketLuan bắt buộc; refer chỉ khi ketLuan = KHAC.
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CompleteEvaluationRequest' }
      responses:
        '201':
          description: Đã hoàn thành
          content:
            application/json:
              schema: { $ref: '#/components/schemas/CompleteEvaluationResponse' }
        '200':
          description: Gửi lại cùng idempotencyKey, trả bản đã lưu
          content:
            application/json:
              schema: { $ref: '#/components/schemas/CompleteEvaluationResponse' }
        '400': { $ref: '#/components/responses/BadRequest' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '409': { $ref: '#/components/responses/Conflict' }
    get:
      summary: Bài đã hoàn thành của tôi cho ứng viên này (U2, US6.3)
      responses:
        '200':
          description: Bài đã hoàn thành, chỉ đọc
          content:
            application/json:
              schema: { $ref: '#/components/schemas/EvaluationDetail' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
  /panels/{maHdpv}/my-evaluations:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
    get:
      summary: Tóm tắt các bài tôi đã hoàn thành trong HĐPV, để app ghép vào danh sách (U2, ADR-002)
      responses:
        '200':
          description: Chỉ bài của người gọi
          content:
            application/json:
              schema:
                type: object
                required: [items]
                properties:
                  items:
                    type: array
                    items: { $ref: '#/components/schemas/MyEvaluationSummary' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
  /panels/{maHdpv}/candidates/{maUngVien}/cv-link:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
      - $ref: '#/components/parameters/MaUngVien'
    post:
      summary: Cấp liên kết xem CV ngắn hạn và ghi nhật ký xem (U3, FR-A8)
      responses:
        '200':
          description: Liên kết hết hạn sau 5 phút
          content:
            application/json:
              schema:
                type: object
                required: [url, expiresAt, pageCount]
                properties:
                  url: { type: string, description: 'Đường dẫn tương đối /api/v1/cv-files/{token}' }
                  expiresAt: { type: string, format: date-time }
                  pageCount: { type: integer, minimum: 1 }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '500': { $ref: '#/components/responses/ServerError' }
        '502': { $ref: '#/components/responses/ServerError' }
  /cv-files/{token}:
    parameters:
      - name: token
        in: path
        required: true
        schema: { type: string }
    get:
      summary: Nội dung PDF của CV (U3)
      description: >
        Token ngắn hạn gắn với người dùng và ứng viên; vẫn yêu cầu JWT của cùng người dùng.
        Header Content-Disposition inline, Cache-Control no-store.
      responses:
        '200':
          description: Tệp PDF
          content:
            application/pdf:
              schema: { type: string, format: binary }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '410':
          description: Liên kết đã hết hạn (CV_LINK_EXPIRED)
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
  /panels/{maHdpv}/candidates/{maUngVien}/ai-summary:
    parameters:
      - $ref: '#/components/parameters/MaHdpv'
      - $ref: '#/components/parameters/MaUngVien'
    post:
      summary: Tạo hoặc lấy tóm tắt AI của CV (U4, FR-A9, FR-A10)
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                taoLai: { type: boolean, default: false }
      responses:
        '200':
          description: Kết quả đã lưu hoặc vừa tạo
          content:
            application/json:
              schema: { $ref: '#/components/schemas/AiSummary' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
        '404': { $ref: '#/components/responses/NotFound' }
        '422': { $ref: '#/components/responses/Unprocessable' }
        '429': { $ref: '#/components/responses/TooManyRequests' }
        '502': { $ref: '#/components/responses/ServerError' }
        '504': { $ref: '#/components/responses/ServerError' }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  parameters:
    MaHdpv:
      name: maHdpv
      in: path
      required: true
      schema: { type: string }
    MaUngVien:
      name: maUngVien
      in: path
      required: true
      schema: { type: string }
  schemas:
    Error:
      type: object
      required: [code, message]
      properties:
        code: { type: string, description: 'Mã ổn định, ví dụ VALIDATION_FAILED, UNAUTHENTICATED, FORBIDDEN, PANEL_NOT_AVAILABLE, CANDIDATE_NOT_CONFIRMED, ALREADY_COMPLETED, CV_NOT_FOUND, CV_NO_TEXT, AI_DISABLED, RATE_LIMITED' }
        message: { type: string, description: 'Thông báo tiếng Việt hiển thị được' }
        details:
          type: array
          description: Danh sách trường lỗi khi code = VALIDATION_FAILED
          items:
            type: object
            required: [field, message]
            properties:
              field: { type: string, description: 'Ví dụ diem.TC03, ketLuan, referMaViTri' }
              message: { type: string }
    PanelSummary:
      type: object
      required: [maHdpv, ten, ngay, hinhThuc]
      properties:
        maHdpv: { type: string }
        ten: { type: string }
        ngay: { type: string, format: date }
        hinhThuc: { type: string, enum: [Online, Offline] }
        diaDiem: { type: string }
        soUngVienXacNhan: { type: integer, minimum: 0 }
    Position:
      type: object
      required: [maViTri, job, dvql]
      properties:
        maViTri: { type: string }
        job: { type: string }
        dvql: { type: string }
        dvtt1: { type: string }
        dvtt2: { type: string }
        dvtt3: { type: string }
    CandidateRow:
      type: object
      required: [maUngVien, ten, viTri, tuThoiGian, denThoiGian]
      properties:
        maUngVien: { type: string }
        ten: { type: string }
        viTri: { $ref: '#/components/schemas/Position' }
        tuThoiGian: { type: string, pattern: '^[0-2][0-9]:[0-5][0-9]$' }
        denThoiGian: { type: string, pattern: '^[0-2][0-9]:[0-5][0-9]$' }
        coCv: { type: boolean, description: 'U3' }
    CandidateDetail:
      allOf:
        - $ref: '#/components/schemas/CandidateRow'
        - type: object
          properties:
            kinhNghiem: { type: string }
            trinhDo: { type: string }
            panel: { $ref: '#/components/schemas/PanelSummary' }
    Criterion:
      type: object
      required: [maTieuChi, tenTieuChi, diemToiThieu, diemToiDa, thuTu]
      properties:
        maTieuChi: { type: string, maxLength: 20 }
        tenTieuChi: { type: string, maxLength: 200 }
        diemToiThieu: { type: integer, minimum: 1, maximum: 5 }
        diemToiDa: { type: integer, minimum: 1, maximum: 5 }
        thuTu: { type: integer }
    ScoreItem:
      type: object
      required: [maTieuChi, diem]
      properties:
        maTieuChi: { type: string }
        diem: { type: integer, minimum: 1, maximum: 5 }
    CompleteEvaluationRequest:
      type: object
      required: [idempotencyKey, diem]
      properties:
        idempotencyKey: { type: string, format: uuid }
        diem:
          type: array
          minItems: 1
          items: { $ref: '#/components/schemas/ScoreItem' }
        nhanXet: { type: string, maxLength: 2000 }
        ketLuan:
          type: string
          enum: [DAT, LOAI, CAN_NHAC, KHAC]
          description: 'Bắt buộc từ U2'
        referMaViTri: { type: string, description: 'Chỉ khi ketLuan = KHAC; khác vị trí hiện tại; vị trí đang hoạt động' }
        referLyDo: { type: string, maxLength: 500, description: 'Chỉ khi có referMaViTri' }
    CompleteEvaluationResponse:
      type: object
      required: [evaluationId, submittedAt, trangThai]
      properties:
        evaluationId: { type: string }
        submittedAt: { type: string, format: date-time }
        trangThai: { type: string, enum: [SUBMITTED] }
        diemTrungBinh: { type: number, description: 'U2; 2 chữ số thập phân, server tính' }
    EvaluationDetail:
      type: object
      required: [evaluationId, maHdpv, maUngVien, diem, submittedAt, trangThai]
      properties:
        evaluationId: { type: string }
        maHdpv: { type: string }
        maUngVien: { type: string }
        diem:
          type: array
          items:
            allOf:
              - $ref: '#/components/schemas/ScoreItem'
              - type: object
                properties:
                  tenTieuChi: { type: string, description: 'Giữ được cả tiêu chí đã ngừng' }
        nhanXet: { type: string }
        ketLuan: { type: string, enum: [DAT, LOAI, CAN_NHAC, KHAC] }
        referViTri: { $ref: '#/components/schemas/Position' }
        referLyDo: { type: string }
        diemTrungBinh: { type: number }
        submittedAt: { type: string, format: date-time }
        trangThai: { type: string, enum: [SUBMITTED] }
    MyEvaluationSummary:
      type: object
      required: [maUngVien, submittedAt]
      properties:
        maUngVien: { type: string }
        ketLuan: { type: string, enum: [DAT, LOAI, CAN_NHAC, KHAC] }
        diemTrungBinh: { type: number }
        submittedAt: { type: string, format: date-time }
    AiItem:
      type: object
      required: [id, tieuDe, trich, trang]
      properties:
        id: { type: string }
        tieuDe: { type: string }
        thoiGian: { type: string }
        tinhTrang: { type: string, description: 'Chỉ cho chứng chỉ' }
        trich: { type: string, maxLength: 300, description: 'Nguyên văn trong CV' }
        trang: { type: integer, minimum: 1 }
    AiSummary:
      type: object
      required: [tomTat, kinhNghiem, trinhDo, chungChi, cauHoiGoiY, taoLuc, canhBao]
      properties:
        tomTat: { type: string, maxLength: 800 }
        kinhNghiem: { type: array, items: { $ref: '#/components/schemas/AiItem' } }
        trinhDo: { type: array, items: { $ref: '#/components/schemas/AiItem' } }
        chungChi: { type: array, items: { $ref: '#/components/schemas/AiItem' } }
        cauHoiGoiY:
          type: array
          maxItems: 6
          items:
            type: object
            required: [loai, noiDung, thamChieu]
            properties:
              loai: { type: string, enum: [KINH_NGHIEM, TRINH_DO, CHUNG_CHI] }
              noiDung: { type: string, maxLength: 300 }
              thamChieu: { type: string, description: 'id của một AiItem' }
        taoLuc: { type: string, format: date-time }
        canhBao: { type: string, description: 'Lưu ý AI có thể sai sót, chỉ để tham khảo' }
  responses:
    BadRequest:
      description: Dữ liệu không hợp lệ (VALIDATION_FAILED)
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    Unauthorized:
      description: Chưa đăng nhập, sai thông tin hoặc token hết hạn
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    Forbidden:
      description: Không được gán vào HĐPV, tài khoản bị khóa, hoặc AI_DISABLED
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    NotFound:
      description: Không tồn tại, HĐPV không đủ trạng thái, ứng viên Xác nhận = N, hoặc CV_NOT_FOUND
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    Conflict:
      description: Đã hoàn thành đánh giá với khóa khác (ALREADY_COMPLETED)
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    Unprocessable:
      description: CV dạng ảnh không có lớp chữ (CV_NO_TEXT)
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    TooManyRequests:
      description: Vượt giới hạn số lần gọi AI (RATE_LIMITED) hoặc tạm khóa đăng nhập sau 5 lần sai (LOGIN_LOCKED); có header Retry-After
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
    ServerError:
      description: Lỗi máy chủ hoặc nhà cung cấp ngoài
      content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } }
```

## C2 — Truy vấn chính sách truy cập của InterviewCatalog

Nơi duy nhất quyết định quyền truy cập (ADR-004). Các module khác không đọc bảng của InterviewCatalog.

```yaml
# shared-schema: interface TypeScript, mô tả dạng yaml
contract: InterviewCatalogPolicy
owner: U1
version: 1
types:
  Caller: { userId: string, employedId: string }
  Denial:
    reason: [NOT_ASSIGNED, PANEL_NOT_FOUND, PANEL_NOT_AVAILABLE, CANDIDATE_NOT_FOUND, CANDIDATE_NOT_CONFIRMED]
    httpStatus: "NOT_ASSIGNED -> 403; còn lại -> 404"
  Allowed<T>: { ok: true, value: T }
  Denied: { ok: false, denial: Denial }
operations:
  canOpenForScoring:
    input: { caller: Caller, maHdpv: string, maUngVien: string }
    output: "Allowed<{ maViTri: string }> | Denied"
    rule: "được gán + HĐPV Inprogress + ứng viên Xác nhận = Y"
    used_by: [Evaluation, CandidateDocuments, AiAssist]
  canComplete:
    input: { caller: Caller, maHdpv: string, maUngVien: string }
    output: "Allowed<{ maViTri: string }> | Denied"
    rule: "được gán + HĐPV Inprogress hoặc Completed + ứng viên Xác nhận = Y (BR-A2)"
    used_by: [Evaluation]
  canViewPanel:
    input: { caller: Caller, maHdpv: string }
    output: "Allowed<void> | Denied"
    rule: "được gán + HĐPV Inprogress"
    used_by: [Evaluation]
  getActivePositions:
    input: { excludeMaViTri: "string | null" }
    output: "Position[]"
    used_by: [Evaluation]
  isActivePosition:
    input: { maViTri: string }
    output: boolean
    used_by: [Evaluation]
  upsertImportBatch:
    input: "{ positions, interviewers, candidates, panels, panelCandidates, panelInterviewers }"
    output: "{ added: number, updated: number, errors: ImportError[] }"
    transaction: "dùng giao dịch do DataImport truyền vào"
    used_by: [DataImport]
errors: "Không ném ngoại lệ cho kết quả nghiệp vụ; trả Denied. Lỗi DB ném ra ngoài, module gọi trả 500."
```

## C3 — Xác thực của IdentityAccess

```yaml
# shared-schema
contract: IdentityAccess
owner: U1
version: 1
operations:
  verifyToken:
    input: { bearerToken: string }
    output: "{ ok: true, caller: { userId, employedId } } | { ok: false, reason: [MISSING, INVALID, EXPIRED, LOCKED] }"
    rule: "mọi lý do -> 401; tài khoản bị khóa sau khi phát token -> 401"
    used_by: [InterviewCatalog, Evaluation, CandidateDocuments, AiAssist]
    note: "Gắn dưới dạng middleware HTTP dùng chung; module nhận Caller đã xác thực"
  upsertAccounts:
    input: "{ email, password, employedId, hoTen, trangThai }[]"
    output: "{ added, updated, errors: ImportError[] }"
    rule: "băm bcrypt khi tạo hoặc khi có mật khẩu mới; employedId phải tồn tại (kiểm qua InterviewCatalog)"
    transaction: "dùng giao dịch do DataImport truyền vào"
    used_by: [DataImport]
```

## C4 — Văn bản CV của CandidateDocuments

```yaml
# shared-schema
contract: CandidateDocuments
owner: U3
version: 1
operations:
  getCvTextForAi:
    input: { caller: Caller, maHdpv: string, maUngVien: string }
    precondition: "gọi InterviewCatalogPolicy.canOpenForScoring trước, trả Denied nếu không được phép"
    output: "{ ok: true, cvHash: string, pages: { trang: number, text: string }[] } | { ok: false, reason: [DENIED, CV_NOT_FOUND, CV_NO_TEXT] }"
    used_by: [AiAssist]
  upsertCvPaths:
    input: "{ maUngVien, cvPath }[]"
    output: "{ added, updated, warnings: ImportError[] }"
    rule: "tệp không tồn tại hoặc không phải PDF -> cảnh báo, ứng viên coi như không có CV"
    used_by: [DataImport]
```

## C5 — Evaluation cho DataImport và đặc tả điểm trung bình

```yaml
# shared-schema
contract: Evaluation
owner: U1 (interface), U2 (công thức điểm trung bình)
version: 1
operations:
  upsertCriteria:
    input: "{ maTieuChi, tenTieuChi, diemToiThieu, diemToiDa, thuTu, trangThai }[]"
    rule: "1 <= diemToiThieu < diemToiDa <= 5; trùng mã -> cập nhật"
    used_by: [DataImport]
averageScoreSpec:
  used_by: [Evaluation (Node.js), InterviewerApp (Dart)]
  definition: "trung bình cộng các điểm đã chọn, mỗi điểm quy về thang 5 bằng diem * 5 / diemToiDa"
  storage: "số thập phân 2 chữ số, làm tròn nửa lên; server lưu, không nhận giá trị từ client"
  display: "1 chữ số thập phân, dấu phẩy thập phân, ví dụ 3,7"
  empty: "không có điểm nào -> null, hiển thị —"
  shared_examples:
    - { scores: [4, 3, 4], scale: 5, stored: 3.67, display: "3,7" }
    - { scores: [4, 3, 5, 4, 5], scale: 5, stored: 4.20, display: "4,2" }
    - { scores: [], scale: 5, stored: null, display: "—" }
    - { scores: [5], scale: 5, stored: 5.00, display: "5,0" }
```

## C6 — Tệp nạp dữ liệu

Định dạng tệp JSON người vận hành đưa vào lệnh nạp; tên trường theo `Kiro_bang (1).xlsx`. Có thể xuất từ bảng tính.

```yaml
# shared-schema
contract: ImportFile
owner: U1 (U3 thêm cvPath)
version: 1
format: "JSON UTF-8, một tệp"
fields:
  tieuChi: "[{ maTieuChi*, tenTieuChi*, diemToiThieu, diemToiDa, thuTu, trangThai }]"
  viTri: "[{ maViTri*, job*, dvql*, dvtt1, dvtt2, dvtt3, trangThai }]"
  cbql: "[{ employedId*, ten*, job, donVi, email* }]"
  taiKhoan: "[{ email*, matKhau*, employedId*, hoTen, trangThai }]"
  ungVien: "[{ ma*, ten*, maViTri*, sdt, email, ngaySinh, gioiTinh, kinhNghiem, trinhDo, cvPath }]"
  hdpv: "[{ ma*, ten*, diaDiem, ngay* (dd/mm/yyyy), hinhThuc (Online|Offline), daGuiEmail (Y|N), trangThai* (Draft|Sent|Xác nhận|Inprogress|Completed) }]"
  hdpvUngVien: "[{ id, maHdpv*, maUngVien*, tuThoiGian* (HH:mm), denThoiGian* (HH:mm), xacNhan (Y|N) }]"
  hdpvCbql: "[{ id, maHdpv*, maCbql*, tuThoiGian, denThoiGian, xacNhan (Y|N) }]"
required_marker: "* = bắt buộc"
security: "matKhau chỉ có trong tệp nạp, không ghi log; tệp nạp không được commit vào git"
report: "{ group, added, updated, errors: [{ line, field, reason }] } in ra console; mã thoát khác 0 khi lỗi kết nối DB"
```

## C7 — Bộ chuyển đổi nhà cung cấp AI

AiAssist là bên gọi; nhà cung cấp chưa chọn (OQ-AI-1). Hợp đồng này cố định phía app, để đổi nhà cung cấp không ảnh hưởng phần còn lại.

```yaml
# shared-schema
contract: AiProviderAdapter
owner: U4
version: 1
operations:
  summarizeCv:
    input: "{ promptVersion: string, language: 'vi', pages: { trang, text }[] }  # văn bản đã che SĐT, email, ngày sinh, địa chỉ"
    output: "JSON đúng lược đồ AiSummary (không có taoLuc, canhBao) + { model: string }"
    timeout_ms: 20000
    retries: 0
    errors: [TIMEOUT, PROVIDER_ERROR, INVALID_OUTPUT]
config: "ai.cvSummary.enabled (mặc định false), ai.provider, ai.timeoutMs, ai.maxPerUserPerHour; khóa truy cập chỉ từ biến môi trường"
test_double: "Bộ chuyển đổi giả lập trả kết quả cố định, dùng cho test và khi chưa chọn nhà cung cấp"
```

## Quy tắc sở hữu và thay đổi hợp đồng

- **Chủ sở hữu:** Unit tạo ra hợp đồng sở hữu nó (cột Owner). Unit thêm API hoặc trường mới sở hữu phần thêm đó và phải cập nhật tài liệu này hoặc tệp OpenAPI trong mã nguồn.
- **Trong `v1` chỉ thêm, không phá vỡ (Q3 = A):** được thêm API, thêm trường tùy chọn ở phản hồi, thêm giá trị mã lỗi. Client phải bỏ qua trường lạ. Không được đổi tên, xóa trường, đổi kiểu hay đổi nghĩa.
- **Ngoại lệ trước lần phát hành đầu tiên:** được sửa tự do nếu app và backend đổi trong cùng một đợt phát hành; sau lần phát hành đầu, thay đổi phá vỡ phải sang `/api/v2`.
- **Thay đổi đã định trước từ U1 sang U2:** `ketLuan` chuyển từ không có thành bắt buộc. Đây là thay đổi phá vỡ nhưng nằm trong ngoại lệ trước phát hành; U1 và U2 phải phát hành cùng nhau nếu có phát hành.
- **Interface trong tiến trình (C2..C5):** đổi chữ ký là thay đổi trong cùng mã nguồn, trình biên dịch TypeScript báo lỗi ở nơi dùng; vẫn phải cập nhật tài liệu.
- **Thời gian chờ và thử lại (Q3 = A):** app chờ tối đa 10 giây cho mỗi request, 25 giây cho tạo tóm tắt AI. App tự thử lại tối đa 2 lần cho request đọc (`GET`) khi lỗi mạng hoặc `5xx`, không thử lại `4xx`. Hoàn thành đánh giá chỉ gửi lại khi người dùng bấm Thử lại, với cùng `idempotencyKey`. Tạo tóm tắt AI không tự thử lại.
- **Bảo mật:** mọi API có dữ liệu nghiệp vụ trả `Cache-Control: no-store`; không đặt dữ liệu nhạy cảm trong đường dẫn ngoài mã định danh; CV chỉ đi qua liên kết ngắn hạn.

## Assumptions & Open Questions

- **[assumption]** API nằm trên HTTPS ở môi trường thật; ở máy dev local có thể dùng HTTP (thiết kế hạ tầng quyết định).
- **[assumption]** `GET /cv-files/{token}` vẫn yêu cầu JWT của cùng người dùng, để liên kết lộ ra ngoài cũng không mở được nếu không đăng nhập. Nếu trình xem PDF trên web không gửi được header, cần cơ chế khác (ví dụ tải về bộ nhớ app rồi hiển thị); quyết định khi chọn gói xem PDF.
- **[assumption]** `soUngVienXacNhan` trả trong danh sách HĐPV; số "đã chấm" do app ghép từ `my-evaluations` (ADR-002).

| Contract | Question | Blocks |
|---|---|---|
| C1 `/cv-files/{token}` | Gói xem PDF có gửi được header `Authorization` trên web không; nếu không, đổi cách cấp nội dung | U3 |
| C7 | Nhà cung cấp AI, nơi lưu dữ liệu, consent, rà soát thiên lệch (OQ-AI-1..4) | U4 (chỉ phần gọi thật; bộ giả lập không bị chặn) |
| C1 `/my-evaluations` | Có cần phân trang khi HĐPV nhiều ứng viên không; MVP giả định không | Không chặn |
