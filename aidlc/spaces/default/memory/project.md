# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER tự động ra kết luận tuyển dụng cuối cùng mà không có HR review. (affirmed 2026-10-09)

- NEVER gửi điểm số, nhận xét nội bộ hoặc danh tính người chấm cho ứng viên nếu không có chính sách rõ ràng cho phép. (affirmed 2026-10-09)

- NEVER ghi đè âm thầm dữ liệu đánh giá đã nộp; mọi sửa đổi phải tạo phiên bản mới có lý do và audit. (affirmed 2026-10-09)

- NEVER cho phép CBQL không thuộc HĐPV chấm điểm hồ sơ nếu chưa được gán vai trò hợp lệ. (affirmed 2026-10-09)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS yêu cầu HR chốt và duyệt nội dung trước khi gửi bất kỳ kết quả nào cho ứng viên. (affirmed 2026-10-09)

- ALWAYS ghi audit bất biến cho mọi hành động ảnh hưởng kết quả (submit, mở lại, sửa phiên bản, miễn đánh giá, override quorum, chốt, duyệt/gửi, đổi quyền/thành viên). (affirmed 2026-10-09)

- ALWAYS dùng idempotency key cho thao tác submit đánh giá để tránh tạo hai bản ghi khi nhấn lại hoặc timeout. (affirmed 2026-10-09)

- ALWAYS kiểm tra quyền (RBAC) ở phía server theo least privilege, kết hợp phạm vi tổ chức, HĐPV, ứng viên và trạng thái hồ sơ. (affirmed 2026-10-09)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
