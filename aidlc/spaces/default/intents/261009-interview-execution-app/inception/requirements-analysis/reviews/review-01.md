**Reviewer:** aidlc-product-lead-agent
**Verdict:** READY
**Iteration:** 1

### Review

Rà soát advisory một lần cho `requirements.md` (và Q&A kèm theo) làm đầu vào quyết định cho cổng phê duyệt của con người. Lớp review: advisory — không có vòng sửa-và-review lại.

Nhận định chung: requirements tách rõ phần đầy đủ Phase 2 (north star, 31 FR) và lát cắt MVP 2 ngày (FR-A0..A7). Mỗi FR của MVP có tiêu chí pass/fail cụ thể, phù hợp với posture TDD đã khẳng định. Các quyết định của PO (DEC-1..DEC-5) truy vết được. Guardrail nghiệp vụ cốt lõi (HR duyệt trước khi gửi, audit, RBAC) được giữ ở north star dù MVP cắt bớt. Phạm vi 2 ngày thực tế và khả thi.

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Medium | FR-A1 / DEC-2 | Lệ thuộc schema DB dùng chung với team Phase 1; tên bảng/cột chưa chốt là rủi ro lịch cao nhất | Thống nhất tên bảng/cột theo Kiro_bang (1).xlsx ngay ngày 1; nếu chưa sẵn, seed tạm đúng cấu trúc để không chặn FE/BE | New |
| R-02 | Medium | FR-A0 / FR-A6 | Cần ánh xạ danh tính Supabase `auth.uid()` ↔ `EmployedID` của người chấm (dữ liệu Phase 1) để gắn đánh giá và áp RLS | Seed sẵn bảng ánh xạ cho tài khoản demo trong MVP; đối chiếu đầy đủ để increment sau | New |
| R-03 | Low | FR-A3 | "Vị trí phỏng vấn" trong flow chưa phân biệt rõ với trường `Vị trí` của ứng viên (job + ĐVQL + ĐVTT1-3) | Làm rõ ở domain-design; không chặn requirements | New |
| R-04 | Low | FR-A6 | Ràng buộc "tối đa một đánh giá/(người chấm, ứng viên)" nên hiện thực bằng unique constraint ở DB để test được | Khai báo constraint ở tầng DB khi thiết kế schema | New |

### Suggestions

- Cân nhắc bật OTP code 6 số (đã ghi trong DEC-4) để demo không phụ thuộc deep-link email — giảm rủi ro vận hành khi trình diễn.
