# Yêu cầu độ tin cậy — U1 scoring-skeleton

Mã `NFR2.x` kế thừa NFR-2 (Độ tin cậy khi mất mạng) và `NFR14.x` kế thừa NFR-14 (Quan sát và vận hành); số liền trong mã nghĩa là NFR-2, NFR-14. Mã `NFR3.x` kế thừa NFR-3 (Tích hợp) và `NFR4.x` kế thừa NFR-4 (Khả năng kiểm thử).

## Sources

- `inception/requirements-analysis/requirements.md` — NFR-2, NFR-3, NFR-4, NFR-14
- `construction/u1-scoring-skeleton/nfr-requirements/nfr-requirements-questions.md` — Q3 = A
- `inception/contract-design/contract-summary.md` — thời gian chờ 10 giây, thử lại GET tối đa 2 lần
- `construction/u1-scoring-skeleton/functional-design/rules.md` — BR3.6, BR3.7, BR3.9, BR4.5
- `aidlc/spaces/default/memory/team.md` — TDD, coverage 80%

## Độ sẵn sàng và khôi phục

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR14.1 | Mục tiêu sẵn sàng | 99% trong giờ phỏng vấn, không cam kết SLA | Theo dõi thủ công qua `/health` khi vận hành | NFR-14 |
| NFR14.2 | Sao lưu | Xuất dữ liệu Oracle thủ công trước mỗi đợt phát hành; RPO 24 giờ | Quy trình phát hành có bước sao lưu, ghi ở Deployment sau | NFR-14 |
| NFR14.3 | Khôi phục | RTO 4 giờ; có hướng dẫn khôi phục từ bản xuất | Thử khôi phục một lần trên máy dev | NFR-14 |

## Chịu lỗi

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR2.1 | Không báo thành công khi chưa có xác nhận của server | App chỉ hiển thị "Đã hoàn thành đánh giá" sau khi nhận `201` hoặc `200`; thời gian chờ hoặc lỗi thì giữ nguyên dữ liệu và báo chưa hoàn thành | Test màn hình với server giả lập timeout (AC6.2.2 hoàn thiện ở U2) | NFR-2 |
| NFR2.2 | Thời gian chờ và thử lại | Chờ tối đa 10 giây; GET thử lại tối đa 2 lần; hoàn thành đánh giá chỉ thử lại do người dùng với cùng `idempotencyKey` | Test client | contract-summary |
| NFR2.3 | Hoàn thành đánh giá là nguyên tử | Phiếu và các dòng điểm ghi trong một giao dịch; lỗi giữa chừng thì hoàn tác toàn bộ | Test gây lỗi ở dòng điểm thứ hai và kiểm DB không còn phiếu | BR3.9 |
| NFR2.4 | Chống ghi trùng | Cùng `idempotencyKey` hoặc cùng bộ ba (người chấm, HĐPV, ứng viên) không tạo bản ghi thứ hai, kể cả hai request đồng thời | Test song song (NFR13.12) | BR3.6, BR3.7 |
| NFR2.5 | Mất DB | Backend trả `503` hoặc `500` với thông báo tiếng Việt, app hiển thị lỗi và nút Thử lại; không mất bài đã xác nhận `201`; tự kết nối lại khi DB trở lại | Test dừng và khởi động lại container Oracle | NFR-2 |
| NFR2.6 | Dừng êm | Khi nhận tín hiệu dừng, backend ngừng nhận request mới, chờ request đang chạy tối đa 10 giây rồi thoát | Test dừng khi đang hoàn thành đánh giá | NFR-2 |
| NFR2.7 | Lệnh nạp an toàn | Mất kết nối giữa chừng thì hoàn tác và thoát mã khác 0; chạy lại không nhân đôi | Test nạp (AC7.1.2, AC7.1.6) | BR4.1, BR4.5 |

## Tích hợp và kiểm thử

| ID | Yêu cầu | Chỉ tiêu | Cách kiểm | Nguồn |
|---|---|---|---|---|
| NFR3.1 | API có phiên bản | Đường dẫn `/api/v1`; chỉ thêm trong v1; trường lạ do client bỏ qua | Test hợp đồng với tệp OpenAPI | contract-summary |
| NFR3.2 | Mã tương quan | Mỗi request có `X-Correlation-Id` (sinh nếu client không gửi), trả về trong header phản hồi và có trong mọi dòng log | Test header và log | NFR-3 |
| NFR3.3 | Nạp dữ liệu idempotent | Chạy lại cùng tệp không đổi số bản ghi; báo cáo số thêm, cập nhật, lỗi | Test nạp hai lần (AC7.1.2) | NFR-3, BR4.1 |
| NFR4.1 | Phát triển hướng kiểm thử | Test viết trước cho BR1.6, BR2.1..BR2.5, BR3.2, BR3.3, BR3.6..BR3.9, BR4.x | Lịch sử commit và báo cáo test | NFR-4, team.md |
| NFR4.2 | Độ phủ | Tối thiểu 80% dòng lệnh cho backend và cho app Flutter; chạy CI trước khi hợp nhất | Báo cáo độ phủ trong build-and-test | NFR-4 |
| NFR4.3 | Kiểm tra tĩnh | ESLint + Prettier cho backend; `dart format` + `flutter analyze` cho app; lỗi chặn hợp nhất | CI | team.md |
| NFR4.4 | Kiểm tra đầu cuối | `npm --prefix backend run verify:e2e` xanh (Oracle XE thật, nạp dữ liệu mẫu, đăng nhập, chấm, hoàn thành, gửi lại, kiểm DB) | Chạy lệnh đã được duyệt | Delivery Planning |

## Assumptions & Open Questions

- **[assumption]** Không có máy chủ dự phòng; thời gian ngừng do bảo trì được chấp nhận ngoài giờ phỏng vấn.
- **Open question:** None.
