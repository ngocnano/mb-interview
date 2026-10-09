# Quy trình CI/CD — U1 scoring-skeleton

Quy trình kiểm tra và phát hành thủ công theo đợt (team.md). Mã `CP-n` được `traceability.json` dẫn chiếu.

## Sources

- `construction/u1-scoring-skeleton/infrastructure-design/infrastructure-design-questions.md` — Q4 = A, Q5 = A
- `construction/u1-scoring-skeleton/infrastructure-design/infrastructure-specification.md` — IS-1, IS-10, IS-11, IS-13
- `construction/u1-scoring-skeleton/nfr-design/reliability-design.md` — TD-1..TD-4, RD-8, RD-10
- `aidlc/spaces/default/memory/team.md` — trunk-based, squash-merge, TDD, 80% coverage, ESLint/Prettier, `dart format`, `flutter analyze`, phát hành thủ công theo đợt
- `aidlc/spaces/default/memory/org.md` — squash-merge, một commit mỗi Bolt

## Chiến lược nhánh

Kho git cục bộ, nhánh `main` là trunk. Mỗi Bolt làm trên nhánh ngắn `bolt/<slug>` (ví dụ `bolt/b1-scoring-skeleton`) và squash-merge vào `main` thành một commit mang tên slug Bolt. Chỉ hợp nhất khi `npm run ci` xanh. Khi có kho trên GitHub, thêm một workflow chạy cùng `npm run ci` (không thay đổi nội dung kiểm tra).

## Các giai đoạn

| Mã | Giai đoạn | Nội dung | Cổng (gate) |
|---|---|---|---|
| CP-1 | Kiểm thử trước (TDD) | Với mỗi quy tắc nghiệp vụ, commit nhánh Bolt có test thất bại trước mã hiện thực; người duyệt kiểm lịch sử nhánh trước khi squash | Thủ công khi duyệt Bolt |
| CP-2 | Kiểm tĩnh | Backend: `eslint` và `prettier --check`; App: `dart format --set-exit-if-changed` và `flutter analyze` | Lỗi chặn hợp nhất |
| CP-3 | Kiểm thử | Đơn vị; tích hợp với Oracle XE tạm (Compose dựng DB sạch cho bài test, hủy sau khi chạy); kiểm hợp đồng so với tệp OpenAPI; `flutter test` | Mọi test phải xanh |
| CP-4 | Độ phủ | `@vitest/coverage-v8` cho backend và `flutter test --coverage` cho app | ≥ 80% dòng lệnh mỗi bên |
| CP-5 | Kiểm đầu cuối | `npm --prefix backend run verify:e2e` trên DB sạch, gồm nạp dữ liệu mẫu, đăng nhập, chấm, hoàn thành, gửi lại cùng khóa, khóa mới, kiểm DB, quét log tìm mật khẩu và token | Phải xanh trước khi duyệt Bolt |
| CP-6 | Kiểm bí mật | Script `scripts/check-secrets`: `.env` và tệp nạp thật không có trong `git ls-files`; không có chuỗi giống khóa JWT hoặc mật khẩu trong mã nguồn | Lỗi chặn hợp nhất |
| CP-7 | Dựng sản phẩm | Dựng ảnh backend (gắn nhãn `interview-backend:<slug>-<mã commit ngắn>`) và bản Flutter Web tĩnh đưa vào ảnh; bản điện thoại dựng riêng | Dựng thành công |

`npm run ci` ở thư mục gốc chạy CP-2, CP-3, CP-4, CP-6; CP-5 chạy riêng trước khi duyệt Bolt và trong `deploy`.

## Phát hành thủ công theo đợt

| Mã | Bước (script `deploy`) | Mô tả |
|---|---|---|
| CP-8 | 1. CI | Chạy `npm run ci` |
| | 2. Sao lưu | Chạy `scripts/backup` (IS-10); từ chối tiếp tục nếu không có bản sao lưu dưới 24 giờ (MD-4a) |
| | 3. Dựng ảnh | CP-7 |
| | 4. Cập nhật | `docker compose up -d`, chờ `oracle` và `backend` ở trạng thái sẵn sàng (IS-13) |
| | 5. Kiểm sức khỏe | `GET /health` trả `200` trong 60 giây |
| | 6. Xác minh | Chạy `verify:e2e` trên một Oracle XE tạm (cùng ảnh, DB sạch, hủy sau khi chạy) bằng ảnh backend vừa dựng; không chạy trên DB của `demo` vì lệnh tạo phiếu mẫu và sẽ lẫn vào dữ liệu thật. Trên `demo` chỉ kiểm `/health` và đăng nhập thử bằng tài khoản kiểm tra chỉ đọc |
| | 7. Xác nhận | Người phụ trách xác nhận kết quả rồi ghi nhãn phiên bản |

Phát hành do người phụ trách kích hoạt; không tự phát hành khi hợp nhất vào `main` (team.md).

## Quay lui và thăng cấp môi trường

| Mã | Hạng mục | Cách làm |
|---|---|---|
| CP-9 | Quay lui mã | Chạy lại ảnh phiên bản trước (`docker compose up -d` với nhãn cũ); các thay đổi cấu trúc DB của U1 chỉ thêm nên mã cũ chạy được với lược đồ mới |
| CP-9a | Quay lui dữ liệu | Khi thay đổi cấu trúc DB làm hỏng dữ liệu: dừng `backend`, `scripts/restore` từ bản sao lưu gần nhất, chạy ảnh cũ, kiểm `/health` (RTO 4 giờ) |
| CP-10 | Thăng cấp môi trường | `dev` → `demo`: cùng ảnh đã qua CI, chỉ khác `.env`; không dựng lại ảnh khi thăng cấp |

## Bí mật trong CI/CD

| Hạng mục | Cách xử lý |
|---|---|
| Mật khẩu DB cho test | Sinh ngẫu nhiên mỗi lần chạy và hủy cùng DB tạm; không dùng chung với `demo` |
| `.env` của `demo` | Chỉ nằm trên máy demo; không đưa vào ảnh Docker hay vào git (CP-6) |
| Khóa GitHub Actions (khi có) | Dùng secret của GitHub; không in ra log |

## Assumptions & Open Questions

- **[assumption]** `npm run ci` chạy được trên máy phát triển Windows (Docker Desktop có sẵn); Flutter SDK cần được cài để chạy phần app của CP-2 đến CP-4.
- **[assumption]** Tên nhánh `bolt/<slug>` là quy ước của dự án này, không phải yêu cầu của framework.
- **Open question:** None.
