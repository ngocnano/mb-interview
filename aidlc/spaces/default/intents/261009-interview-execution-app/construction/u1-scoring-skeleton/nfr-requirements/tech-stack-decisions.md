# Quyết định công nghệ — U1 scoring-skeleton

Mã `NFRx.y` ở cột nguồn trỏ về các tài liệu NFR cùng thư mục. Tất cả phiên bản sẽ được ghim cụ thể (không dùng khoảng) khi dựng dự án ở Code Generation.

## Sources

- `construction/u1-scoring-skeleton/nfr-requirements/nfr-requirements-questions.md` — Q5 = A, Q6 = A
- `aidlc/spaces/default/memory/team.md` — Node.js + Flutter, TDD, ESLint + Prettier, `dart format` + `flutter analyze`
- `inception/units-generation/unit-of-work.md` — modular monolith, một app Flutter, một Oracle XE
- Môi trường máy kiểm tra: Node.js 22.13.0, npm 10.9.2, Docker có sẵn; Flutter SDK chưa thấy trong PATH

## Backend

| Hạng mục | Chọn | Lý do | Phương án đã cân nhắc |
|---|---|---|---|
| Runtime | Node.js 22 LTS | Khớp bản đang có trên máy; team.md chọn Node.js | Node 20 (cũ hơn) |
| Ngôn ngữ | TypeScript | Kiểu dữ liệu cho hợp đồng giữa module (C2..C5) | JavaScript thuần |
| Web framework | Express | Phổ biến, đơn giản, đủ cho 7 API | Fastify (nhanh hơn, đã loại ở Q5) |
| Truy cập Oracle | `node-oracledb` chế độ thin | Không cần cài Oracle Client; chạy trên Windows | Chế độ thick (cần Client) |
| Băm mật khẩu | `bcryptjs`, cost 10 | Thuần JS, tránh biên dịch native trên Windows | `bcrypt` native |
| Token | `jsonwebtoken`, HS256 | Khớp quyết định JWT; khóa từ biến môi trường | RS256 (chưa cần) |
| Kiểm payload | `zod` | Lược đồ dùng chung giữa kiểu và kiểm tra | Tự viết |
| Giới hạn tốc độ | `express-rate-limit` | Đáp ứng NFR1.4 | Tự viết |
| Log | `pino` (JSON) | Nhẹ, ra stdout, có mã tương quan | `winston` |
| Test | Vitest + Supertest | Nhanh, hỗ trợ TypeScript; Supertest cho API | Jest |
| Chất lượng | ESLint + Prettier | Theo team.md | — |
| Kiểm tích hợp | Oracle XE (Docker) thật, không giả lập | Lệnh xác minh đầu cuối cần DB thật (Delivery Planning) | Giả lập DB |

## Ứng dụng Flutter

| Hạng mục | Chọn | Lý do | Phương án đã cân nhắc |
|---|---|---|---|
| SDK | Flutter bản ổn định mới nhất tại thời điểm dựng | Một mã nguồn cho web và điện thoại (NFR-11) | Hai mã nguồn riêng |
| HTTP | `dio` | Hủy, thời gian chờ, bộ chặn header Bearer và mã tương quan | `http` |
| Lưu token | `flutter_secure_storage` (web dùng bộ nhớ trình duyệt) | Kho an toàn trên điện thoại (NFR1.16) | `shared_preferences` |
| Điều hướng | `go_router` | Hỗ trợ web, làm mới trang giữ đăng nhập (AC1.1.8) | Navigator thuần |
| Quản lý trạng thái | `riverpod` | Dễ test, tách logic khỏi giao diện | `bloc` |
| Test | `flutter_test` | Có sẵn trong SDK | — |
| Chất lượng | `dart format` + `flutter analyze` | Theo team.md | — |

## Dữ liệu và công cụ

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Cơ sở dữ liệu | Oracle Database XE trong Docker, DB riêng của app | Quyết định ở Requirements |
| Nạp dữ liệu | Lệnh dòng lệnh TypeScript cùng mã nguồn backend, dùng chung kết nối và giao dịch (ADR-007) | Giao dịch nạp xuyên module |
| Hợp đồng API | Tệp OpenAPI C1 đặt trong mã nguồn backend; sinh kiểu dữ liệu từ đó cho Node.js và Dart khi có thời gian | Tránh lệch trường (gợi ý của review contract-design) |
| Quản lý mã nguồn | Trunk-based, squash-merge, một commit mỗi Bolt, tên theo slug Bolt | Theo team.md |
| CI | Chạy lint, test và độ phủ trước hợp nhất; chi tiết ở build-and-test | NFR4.2, NFR4.3 |

## Cấu trúc thư mục dự kiến

```text
backend/        # Node.js + TypeScript, modular monolith
app/            # Flutter (web + điện thoại)
data/sample/    # tệp nạp mẫu (không chứa mật khẩu thật)
docker/         # tệp chạy Oracle XE
```

## Rủi ro công nghệ

| Rủi ro | Xử lý |
|---|---|
| Chưa có Flutter SDK trên máy | Cài SDK là điều kiện của Bolt B1 phần app; phần backend không bị chặn |
| `node-oracledb` thin mode khác biệt với một số tính năng Oracle | Thử kết nối với Oracle XE ngay trong B1 (rủi ro R-1 của kế hoạch) |
| Ảnh Docker Oracle XE nặng và khởi động chậm | Dùng ảnh cố định phiên bản; lệnh xác minh chờ DB sẵn sàng có thời gian chờ |

## Assumptions & Open Questions

- **[assumption]** Phiên bản cụ thể của từng gói được ghim khi `npm install` và `flutter pub get`; chưa ghim ở bước thiết kế.
- **[assumption]** Ảnh Oracle XE cụ thể (nguồn, phiên bản, điều khoản sử dụng) được chốt ở Infrastructure Design.
- **Open question:** None.
