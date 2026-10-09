**Reviewer:** aidlc-architecture-reviewer-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho mã của U1 `u1-scoring-skeleton` (backend Node.js, app Flutter, lược đồ Oracle, script vận hành), đối chiếu `code-generation-plan.md`, `code-summary.md`, `source-manifest.json`, `traceability.json`, `rules.md`, `contract-summary.md` (C1..C6) và các tài liệu NFR, hạ tầng.

Nhận định: mã bám đúng thiết kế đã duyệt. Chính sách truy cập nằm ở một chỗ (`CatalogPolicy`, ADR-004) và được gọi trước mọi truy cập dữ liệu; hoàn thành đánh giá là một giao dịch, có idempotency, xử lý đua ghi bằng ràng buộc duy nhất rồi đọc lại để phân biệt 200 và 409; quyền DB của tài khoản ứng dụng chỉ thêm vào bảng phiếu và bảng điểm (kiểm bằng test); mọi truy vấn dùng biến ràng buộc (quy tắc ESLint cấm nối chuỗi); log che trường nhạy cảm và có mã tương quan; backend từ chối khởi động khi thiếu khóa JWT. Số liệu đã kiểm lại: 99 test backend đạt, độ phủ 92,95%; 39 test Flutter đạt, độ phủ 95,5%; ESLint, Prettier, `dart format`, `flutter analyze` sạch; `verify:e2e` 21/21; Docker Compose thật chạy, backend phục vụ Flutter Web và màn đăng nhập hiển thị đúng khi mở bằng Edge; sao lưu và khôi phục Data Pump chạy được. `traceability.json`: 170 mục, 153 `OK` trỏ tới tệp tồn tại, 13 `N/A` thuộc Unit khác, 4 `Deferred` có lý do; sensor truy vết pass. Ghi chú trung thực về quy trình đã có trong `code-summary.md`: bước lược đồ DB không có Red thật, và một phiên workflow thứ hai đã tạm ghi đè kế hoạch đã duyệt trước khi được khôi phục.

Trong lúc rà soát có một lỗ hổng đã được sửa ngay trước khi ghi kết luận: giới hạn tốc độ theo IP (NFR1.4) sẽ coi mọi người dùng là cùng một địa chỉ khi backend chạy sau reverse proxy HTTPS (IS-8), nên 100 request mỗi phút áp dụng cho cả hệ thống. Nay có biến `TRUST_PROXY` (số lớp proxy, mặc định 0) trong `config.ts`, `app.ts`, `.env.example` và `docker-compose.yml`, có test cho giá trị mặc định và giá trị 1.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | `code-summary.md`, bước 3..5 | Lược đồ DB được viết trước test nên không có bước Red thật, trái thứ tự TDD đã chọn cho lớp này | Chấp nhận vì cần DDL để dựng Oracle và chứng minh runner sẵn sàng; ghi nhận và áp dụng Red thật cho lớp DB của U2 (thêm cột kết luận, refer, điểm trung bình) | New |
| R-02 | Medium | `app/` + `backend/src/app.ts` | Luồng app Flutter Web gọi API thật trong trình duyệt (đăng nhập, chấm, hoàn thành) chưa được kiểm tự động; mới kiểm test widget với API giả, `verify:e2e` ở tầng HTTP và ảnh chụp màn đăng nhập. Ảnh chụp màn hẹp 420 px cho thấy các ô nhập bị cắt mép phải, chưa rõ do cửa sổ headless hay do bố cục | Kiểm tay trên trình duyệt thật và điện thoại ở Build and Test; chỉnh bố cục khi làm U5 nếu lỗi tái hiện | New |
| R-03 | Medium | NFR13.1..NFR13.3, NFR1.12 | Chưa đo p95 và thời gian mở màn; HTTPS chưa có (máy demo chưa chọn) | Đã ghi `Deferred`; đo ở Build and Test và chốt HTTPS trước khi dùng dữ liệu thật | New |
| R-04 | Low | `evaluation/service.ts` | Bộ đệm tiêu chí 60 giây ở production làm kiểm payload dùng danh sách cũ ngay sau khi nạp tiêu chí mới | Chấp nhận (tiêu chí ít đổi); có thể xóa bộ đệm sau khi lệnh nạp chạy khi cần | New |
| R-05 | Low | `app.ts` | Content-Security-Policy tắt vì Flutter Web cần worker và wasm | Cấu hình CSP riêng ở bước hạ tầng khi chốt proxy | New |
| R-06 | Low | `identity/service.ts` | Đọc rồi ghi bộ đếm đăng nhập sai không khóa dòng nên hai lần sai đồng thời có thể đếm thiếu một | Chấp nhận cho MVP; khóa bằng 5 lần sai vẫn có hiệu lực sau lần sai kế tiếp | New |
| R-07 | Low | `scripts/deploy.mjs` | Mới kiểm cú pháp, chưa chạy trọn các bước | Chạy thử khi phát hành lần đầu trên máy demo | New |

### Suggestions

- Thêm một kịch bản duyệt web tự động (Playwright hoặc `flutter drive`) cho luồng đăng nhập → chấm → hoàn thành để lấp khoảng trống thứ hai ở trên.
