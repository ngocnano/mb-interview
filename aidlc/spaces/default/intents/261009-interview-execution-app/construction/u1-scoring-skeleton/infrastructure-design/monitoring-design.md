# Thiết kế giám sát — U1 scoring-skeleton

Cụ thể hóa chiến lược quan sát của `observability-design.md` trên hạ tầng Docker Compose. Chưa dùng nền tảng giám sát ngoài (Q4 = A của NFR Requirements). Mã `MD-n` được `traceability.json` dẫn chiếu.

## Sources

- `construction/u1-scoring-skeleton/nfr-design/observability-design.md` — OD-1..OD-8
- `construction/u1-scoring-skeleton/nfr-requirements/observability-requirements.md` — NFR14.4..NFR14.11
- `construction/u1-scoring-skeleton/infrastructure-design/infrastructure-specification.md` — IS-7, IS-9, IS-13
- `construction/u1-scoring-skeleton/nfr-requirements/performance-requirements.md` — NFR13.1, NFR13.2

## Chỉ số và KPI

| Mã | Chỉ số | Nguồn | Ngưỡng | Vì sao quan trọng |
|---|---|---|---|---|
| MD-1 | Số request theo mã trạng thái và p95 `durationMs` mỗi API | Log truy cập (`type=access`), tính bằng `scripts/log-report` | p95 ≤ 500 ms (đọc), ≤ 1 giây (đăng nhập, hoàn thành đánh giá); 5xx ≤ 1% | Đo NFR13.1, NFR13.2 |
| MD-2 | Bộ nhớ tiến trình backend, thời gian chờ nhóm kết nối | Log `app` định kỳ mỗi phút và `docker stats` | Bộ nhớ ≤ 512 MB; chờ nhóm ≤ 5 giây | Báo hiệu quá tải DB hoặc rò bộ nhớ |
| MD-6 | Trường log bắt buộc của mọi dòng | Log JSON (OD-1) | 100% dòng có `time`, `level`, `type`, `correlationId` | Nối log app với backend, truy vết sự cố |
| MD-5 | Sự kiện kiểm toán (`login_failed`, `login_locked`, `evaluation_completed`, `evaluation_replayed`, `import_run`) | Log `type=audit` lưu theo IS-9 | Giữ tối thiểu 30 ngày; số `login_locked` bất thường (> 20 mỗi giờ) là dấu hiệu bị dò | Truy vết hành động ảnh hưởng kết quả |

## Cảnh báo

Chưa có cảnh báo tự động; người vận hành chạy báo cáo hoặc xem `/health` trước và trong giờ phỏng vấn.

| Mã | Cảnh báo | Điều kiện | Mức | Gửi tới |
|---|---|---|---|---|
| MD-3 | Backend lỗi | `/health` trả `503` hoặc tỷ lệ 5xx > 1% trong 5 phút | Cao | Người vận hành, xem log và `docker compose ps` |
| MD-4 | Oracle hoặc đĩa | Container `oracle` ở trạng thái `unhealthy`, hoặc volume `oracle-data` đầy trên 80% | Cao | Người vận hành |
| MD-4a | Sao lưu quá cũ | Bản `.dmp` mới nhất cũ hơn 24 giờ trước khi phát hành | Trung bình | Người phụ trách phát hành (script `deploy` từ chối chạy) |

## SLI và SLO

| Mã | SLI | Mục tiêu SLO | Cửa sổ đo |
|---|---|---|---|
| MD-7 | Tỷ lệ `/health` trả `200` trong giờ phỏng vấn | ≥ 99% | 30 ngày liên tục |
| MD-8 | p95 thời gian xử lý API đọc; p95 đăng nhập và hoàn thành đánh giá | ≤ 500 ms; ≤ 1 giây | Mỗi đợt phát hành, đo bằng kịch bản tải nhỏ và theo log hằng tuần |
| MD-8a | Số phiếu trùng cho cùng (người chấm, HĐPV, ứng viên) | 0 | Liên tục (ràng buộc duy nhất ở DB) |

## Log và truy vết

| Mã | Hạng mục | Cấu hình |
|---|---|---|
| MD-9 | Thu thập log | Backend ghi stdout; Docker `json-file` giới hạn dung lượng; `scripts/archive-logs` lưu theo ngày 30 ngày (IS-9) |
| MD-9a | Truy vết phân tán | Không dùng; mã tương quan `X-Correlation-Id` nối app và backend (OD-1) |
| MD-9b | Bảng điều khiển | Không có; `npm run log-report` in bảng tóm tắt MD-1 và MD-5 theo ngày |

## Assumptions & Open Questions

- **[assumption]** Một người vận hành đủ để xem báo cáo thủ công ở quy mô này.
- **[assumption]** Khi lên production thật sẽ thêm cảnh báo tự động; chưa quyết định công cụ.
- **Open question:** None.
