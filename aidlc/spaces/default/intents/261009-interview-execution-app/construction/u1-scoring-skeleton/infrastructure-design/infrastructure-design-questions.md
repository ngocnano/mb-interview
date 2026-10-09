# Câu hỏi Infrastructure Design — U1 scoring-skeleton

Hạ tầng của dự án này nhỏ (một backend, một Oracle XE, app Flutter), nên chỉ còn năm lựa chọn. Mặc định là A.

## Sources

- `construction/u1-scoring-skeleton/nfr-design/logical-components.md` — LC-1..LC-11
- `construction/u1-scoring-skeleton/nfr-design/reliability-design.md` — RD-9, RD-10 (sao lưu), TD-4 (`verify:e2e`)
- `construction/u1-scoring-skeleton/nfr-design/observability-design.md` — OD-6 (giữ log 30 ngày)
- `construction/u1-scoring-skeleton/nfr-design/security-design.md` — SD-10, SD-11, SD-13
- `aidlc/spaces/default/memory/team.md` — trunk-based, squash-merge, phát hành thủ công theo đợt
- Kiểm tra máy: thư mục `D:\Kiro` chưa phải kho git; Docker có sẵn; Flutter SDK chưa cài

## Q1. Cách chạy hệ thống

A. Docker Compose với hai dịch vụ: `oracle` (Oracle XE) và `backend` (Node.js). Backend phục vụ luôn bản Flutter Web đã build (cùng nguồn, web không cần CORS); app điện thoại gọi API trực tiếp. Khi phát triển có thể chạy `backend` bằng `npm run dev` trên máy và chỉ chạy `oracle` bằng Compose.
B. Cài Oracle XE trực tiếp trên Windows, không dùng Docker.
X. Other (please specify)

[Answer]: A

## Q2. Ảnh Oracle XE

A. Ảnh cộng đồng `gvenzl/oracle-xe` bản `slim` (Oracle XE 21c), ghim theo phiên bản cụ thể, có kiểm tra sức khỏe sẵn; dữ liệu nằm trong một volume Docker có tên.
B. Ảnh chính thức `container-registry.oracle.com/database/express` (cần đăng nhập registry và chấp nhận điều khoản Oracle).
X. Other (please specify)

[Answer]: A

## Q3. Môi trường

A. Hai môi trường: `dev` (máy mỗi người, dữ liệu mẫu) và `demo` (một máy chạy Compose cho buổi demo, dữ liệu nạp từ tệp thật). Production thật chưa định; vì phát hành thủ công theo đợt, mỗi đợt do người phụ trách chạy lệnh triển khai và xác nhận.
B. Chỉ một môi trường `dev`.
X. Other (please specify)

[Answer]: A

## Q4. Kho mã và chạy kiểm tra (CI)

A. Kho git cục bộ trước (khởi tạo nhánh `main`, một commit ban đầu gồm `.gitignore`, `.kiro/`, `aidlc/`, tài liệu nguồn), kèm script `npm run ci` ở thư mục gốc chạy lint, test và độ phủ cho cả backend và app. Khi có kho trên GitHub thì thêm workflow chạy cùng script đó. Trunk-based và nhánh Bolt dùng được ngay.
B. Chỉ làm tài liệu, không khởi tạo git (không dùng nhánh và squash-merge).
X. Other (please specify)

[Answer]: A

## Q5. Phát hành, sao lưu và quay lui

A. Phát hành thủ công theo đợt bằng một script `deploy`: (1) chạy `npm run ci`; (2) xuất sao lưu Oracle Data Pump (RD-10); (3) build ảnh backend gắn nhãn phiên bản (tên theo slug Bolt); (4) `docker compose up -d`; (5) kiểm tra `/health`; (6) chạy `verify:e2e` trên môi trường vừa lên (chỉ trên `demo`, vì lệnh dùng dữ liệu mẫu). Quay lui: chạy lại ảnh phiên bản trước; riêng thay đổi cấu trúc DB thì khôi phục từ bản sao lưu.
B. Phát hành tự động mỗi lần hợp nhất vào `main`.
X. Other (please specify)

[Answer]: A
