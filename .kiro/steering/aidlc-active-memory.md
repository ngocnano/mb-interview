---
inclusion: always
---

# AI-DLC Active Memory

<!-- AI-DLC writes this file from aidlc/spaces/default/memory/ for every chat. Do not edit it: edit those files instead. -->

The text of each file below is the active AI-DLC method and policy layers. They apply to the
conductor and delegated agents.

<memory-file path="aidlc/spaces/default/memory/org.md">
# Org-Level Rules

> Framework defaults. Read with `team.md` and `project.md` from the active
> space. The resolver loads every applicable layer; narrower layers add
> specialisation and must not contradict broader policy.

## Way of Working

We use **trunk-based development**. All work merges to `main` via
short-lived feature branches (typically resolved within 1-2 days).
Long-lived branches accumulate merge debt; we avoid them.

For Construction worktrees, the worktree base branch is `main` and the
merge target is `main`.

If our project requires multiple environments (staging, production), we
still keep one trunk and gate releases via tags or environment-specific
deployment configs — not via long-lived release branches.

We **squash-merge** Bolt branches into `main`. Each Bolt becomes one
commit on the trunk, named by the Bolt slug, with the full Bolt commit
history preserved on the source branch until the worktree is discarded.

Squash gives us a clean linear `main` history that maps 1:1 to
delivery-planning's Bolt sequence. We accept the trade-off of losing
intermediate commits on `main` because the audit log preserves the full
event sequence anyway.

## Walking Skeleton

When practices are scope-dependent, select the walking skeleton only when the
active scope declares `skeleton: on`. In checkpoint-enabled solo work with a
non-empty Unit DAG, the first Unit is the smallest working integrated slice.
Run it through all applicable per-unit stages, including Code Generation, before
later Units even if stage-major was selected. Verify it with the intent's recorded,
human-authorized Construction Verification Command, which must demonstrate the
project's real end-to-end result, then require the human's skeleton checkpoint
approval. A first design-stage review does not demonstrate a working skeleton.

For `skeleton: off`, skip the skeleton ceremony: no bootstrap checkpoint; offer
the explicit Construction choice at entry. For skeleton-on, offer it after the verified,
human-approved skeleton. Follow `construction_policy.offer_autonomy`; never
repeat a recorded choice. **Continue automatically** records `autonomous`;
**Review each checkpoint** records `gated`. On-demand requests can grant or
revoke autonomy during Construction. Ordinary completion approvals follow that
choice; Plan Approval, summary confirmation, verification command selection,
and failures remain human stops.

Existing workflows without `Construction Checkpoints` retain their legacy
first-stage and late stage approvals. Team-owned Unit gates retain their own
policy; no Unit DAG means no skeleton checkpoint ceremony.

## Testing Posture

We treat tests as a first-class deliverable in every Bolt. The specific
methodology (TDD, BDD, ATDD, or classic test-after) is affirmed at
practices-discovery and recorded in `team.md` under this heading with explicit
`Methodology` and `Ordering` fields; Code Generation resolves those fields
independently from coverage, tooling, and scope notes.

When no posture has been affirmed, our default per scope is:
- **Methodology**: test-after
- **Ordering**: implement each applicable testable layer, then write and run
  that layer's tests.
- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage
  floor and CI execution before merge.
- `bugfix`, `security-patch` add a targeted regression for the specific
  bug/vulnerability and require the existing suite to remain green.
- `express` uses the Minimal strategy: requirement-driven unit tests (one per
  requirement, with a happy-path floor per component); existing tests remain
  green.
- `poc`, `refactor`, `workshop` add no extra new-test floor and require the
  existing suite to remain green.

The active `Test Strategy` still applies in every scope and determines test
volume/types. Scope floors are additive; they never reduce or replace the
selected strategy.

Build and Test verifies defined coverage floors and affirmed quality targets;
they may not be weakened to make a step pass.

Affirm a stricter posture in `team.md` if the team commits to one.

## Guard Policy

<!-- Mode: strict, relaxed, or off. Strict here holds for every intent in this space, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless a narrower layer or the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

We **deploy on merge** to staging environments. Production deploys gate
on a separate manual approval — typically tech lead + product owner
sign-off in CodePipeline or a CD platform's environment protection.

Teams that have invested in test coverage and observability sometimes
graduate to continuous deployment to production (every commit
auto-deploys); that's a team decision, not a framework default.

## Code Style

We defer to project-level configurations:
- Formatter: Prettier (JS/TS), Black (Python), `gofmt` (Go), or
  language-default. Configured in repo root (`.prettierrc`,
  `pyproject.toml`, etc.).
- Linter: ESLint, Ruff, golangci-lint, etc. Run in CI before merge;
  failure blocks the PR.
- Naming conventions: language idiomatic (camelCase for JS/TS,
  snake_case for Python, etc.). No project-wide rename rules unless
  team affirms one.

When the framework makes a code-style suggestion, agents read the
project's linter config first; the agent's suggestion only fires if the
linter doesn't already cover it.

## Forbidden

<!-- Things agents must never do -->
<!-- Example: Do not ask questions about topics already decided in previous stages -->

## Mandated

- **Conversation language — resolution**: Every artifact a person reads or reviews is written in the workflow's established conversation language. The orchestrator resolves that language from the human's substantive prose and MUST state it as a `Conversation language: <language>` line in every delegated brief, because a delegated agent or reviewer never sees the conversation and some stages hand it nothing else (a greenfield run of a stage whose `consumes` are all `conditional_on: brownfield` reaches its lead with no upstream artifact at all). Delegated agents and reviewers resolve the language in this order and stop at the first source that answers: (1) the `Conversation language:` line in your brief — AUTHORITATIVE for delegated work, because the orchestrator regenerates it on every dispatch from the live conversation and it is therefore never staler than a persisted rule; (2) an explicit conversation-language rule in `aidlc/spaces/<active-space>/memory/project.md` — the FALLBACK for a brief that states no language, and the ONLY file a language switch is ever persisted to, so `project.md` ALWAYS outranks a conversation-language rule in `team.md`, which can only ever be a team default and NEVER the record of a switch (cross-file position is NOT recency: the runtime rule chain concatenates `org → team → project → phase`, so `team.md` reaches you before `project.md` in every bundle no matter which was written last, and the winner is this stated precedence rather than the later position); within `project.md`, when it carries more than one conversation-language rule the LAST one under `## Corrections` is the current one (this tie-break governs conversation-language rules ONLY and leaves the additive rule model untouched; the learnings write path appends and never replaces, so a superseded language rule can still be on disk); (3) the verbatim initial description decoded from `<record>/project-description.json`, falling back to `## Project Information` → `**Project**` in legacy records, when it carries a real language signal (not the `[Project description]` placeholder, not a bare identifier or path); (4) any artifact or draft you were handed — the directive's `consumes[]` contracts, the artifact you were dispatched to review, or the lead draft you were dispatched against. Every source is readable on every harness: the rule bundle carries (2) through the dispatch-rules hook on Claude, Codex, and opencode and through always-included agent resources or workspace steering on Kiro, and neither `aidlc-state.md` nor the handed artifacts fall inside the per-unit reviewer read-scope bound.
- **Conversation language — stability**: The established conversation language holds for the whole session, and inside that session for every stage, dispatch, reviewer pass and approval gate of the workflow — nothing but a session boundary ends it. A turn that carries no language signal never changes it — `Approve`, `Looks correct`, an option letter or number, pasted code, a quoted error or stack trace, a bare file path or identifier. Only an explicit human request to switch languages changes it, and that switch takes effect IMMEDIATELY: everything written from that point follows the new language, and the orchestrator states the new language in the `Conversation language:` line of every subsequent delegated brief. Persistence is a separate, later step and never the activation step: the §13 learnings ritual is the ONLY sanctioned write path for persisting a conversation-language switch into `aidlc/spaces/<active-space>/memory/` and it is human-gated, so NEVER edit a memory file directly to record a switch — a direct write skips the tool's audit event, its duplicate key, and its admission conflict-check, and "do not wait for persistence" is never licence to bypass that gate (this bounds the persistence of a language switch and forbids a direct agent edit; it does not govern the deterministic memory writers a stage invokes by contract, such as `aidlc-state.ts practices-promote`, which own the stamped `## Mandated` / `## Forbidden` rules and the five replaced `team.md` sections rather than the `## Corrections` language record). When `directive.ceremony.learnings` is `off`, no language-switch persistence happens and no direct memory edits replace the ritual; the current session still uses the new language. When the enabled `learnings` protocol module offers it, the switch is recorded as a single-line rule under `## Corrections` in `project.md` and NEVER in `team.md`, so the cross-file precedence in (2) never has to arbitrate one switch against another; when the human declines, it is simply not persisted, and the `Conversation language:` line the orchestrator states in every brief carries it for the rest of the session. A session boundary is where that carrier ends, and a workflow outlives it: the resume context the engine injects at session start carries scope, phase, stage, status, agent and next action but NO language, so on the FIRST turn of a new session the orchestrator MUST re-resolve the language before it dispatches anything — the persisted rule from (2), else the human-readable artifacts this workflow has already produced, which record the language the human was last served in, else the verbatim initial description from (3) — and when every one of those is silent it ASKS the human rather than defaulting to English. Re-resolving is not a switch: it is never announced as one and never persisted as one. An unpersisted switch therefore does not outlive its session, which is exactly what persistence buys — a human who wants a switch to survive a resume accepts the ritual, and a human who declines is served correctly for the rest of the session and re-resolved from disk in the next one. A persisted rule NEVER outranks the brief, and never outranks a later explicit human request to switch: it is the fallback for a brief that states no language, and because the learnings write path appends rather than replaces, a superseded language rule can outlive the switch — the LAST conversation-language rule under `## Corrections` is the current one.
- **Conversation language — what to localize**: Write in the resolved conversation language every artifact a person reads or reviews — requirements, user stories, plans, specs, reviews, questions, discovered practices, affirmed team and project rules, evidence, decision rationale, and any other explanatory prose — and the agent's own human-facing conversational output in every turn, for the orchestrator and delegated agents alike: conversational chat messages, status updates, progress reports, and transitional narration between tool calls. Structured-question `prompt`, `header`, `options[].description`, and free-text follow-ups are human-facing prose and follow the same rule; only `options[].label` literals the protocol spells verbatim are preserved tokens. This includes the descriptive text of a rule shaped as `ALWAYS …` / `NEVER …`, where the leading marker is a fixed token but the sentence it introduces is not. A Markdown artifact is not English merely because a tool parses part of it: localize the prose that surrounds a preserved token. Verbatim human input echoed into an artifact is always kept exactly as the human wrote it.
- **Conversation language — preserved tokens**: Any literal a stage file or the stage protocol spells in backticks and tells you to write exactly is a fixed token — keep it English, character for character, and localize only the prose around it. This covers option labels and sentinel VALUES, not just syntax: `[Answer]:` tags with their option letters, the mandatory final option `X. Other (please specify)`, the assumption-confirmation options `A. Accept assumptions` / `B. Convert to follow-up questions` (the engine compares the filled answer against the literal), the `None.` / `None` sentinels under `## Assumptions & Open Questions` and `## Positions`, the `AGREE:` / `OBJECT:` position prefixes, and the `**Collaborator:** <agent-slug>` first line the engine matches exactly before it accepts a stage. Glossing such a literal when you PRESENT it to the human is fine; what you WRITE into an artifact is the literal itself. Also preserved: the source-register tags `[desc]`, `[scope]`, `[assumption]`, `[Q<n>]`, `[memory:M<n>]` with their literal prefixes (`Initial description:`, `Workflow-selected scope:`); the H2 headings the claim-sources sensor matches verbatim (`## Sources`, `## Assumptions & Open Questions`, `## Assumption Confirmation`, `## Review`) plus any other H2 taken from a stage template, which the `required-sections` sensor matches verbatim whenever a template is supplied (the framework ships none, so a team's `aidlc/spaces/<active-space>/memory/templates/` is what arms that check); the reviewer verdicts `READY` and `NOT-READY`; YAML keys and enum values inside fenced blocks (`units`, `name`, `kind`, `depends_on`, `service | spec | ui | packaging | library`); the field labels, status values, and checkbox states of `aidlc-state.md` and the audit shards; the verbatim initial description decoded from `<record>/project-description.json` (the `**Project**` state field is only its safe single-line preview); stable IDs (`FR-1`, `ENT-001`, `BR1.1`); enum and classification values; code and identifiers; file paths; mermaid keywords; and cross-references.

## Corrections

<!-- Self-learning loop appends here. -->
<!-- Use team.md to record team-wide additions and project.md for
     project-specific specialisation. The loader resolves org → team →
     project at session start and retains every applicable rule. -->
</memory-file>

<memory-file path="aidlc/spaces/default/memory/team.md">
# Team-Level Rules

> This team's affirmed practices and corrections. Loaded after `org.md` as
> strict-additive guidance; contradictions with broader policy are rejected.
> Populated by the practices-discovery affirmation gate. Edit at the gate,
> not directly.

## Way of Working

Phát triển theo trunk-based: mọi thay đổi hợp nhất vào `main` qua các nhánh
feature ngắn (1–2 ngày). Squash-merge mỗi nhánh thành một commit trên trunk.
Nếu cần nhiều môi trường, vẫn giữ một trunk và kiểm soát phát hành bằng tag hoặc
cấu hình triển khai theo môi trường, không dùng nhánh release dài hạn.

## Walking Skeleton

Dựng một lát cắt mỏng chạy xuyên suốt (walking skeleton) trước khi làm tính năng
đầy đủ. Với domain nhiều luồng và tích hợp của app phỏng vấn, skeleton đi từ
"nhận đầu vào Phase 1 → hiển thị phiên → chấm nháp → submit đánh giá → tổng hợp
tối giản" là lát cắt chứng minh các mảnh ghép (backend Node.js + client Flutter)
kết nối được trước khi làm sâu từng tính năng.

## Testing Posture

- **Methodology**: tdd
- **Methodology evidence**: Nhóm khẳng định viết test trước, rồi mới hiện thực
  (phỏng vấn Q3 = B). Domain có nhiều business rule trọng yếu (Definition of
  Ready, blind scoring, idempotency submit, không gửi kết quả trước HR duyệt)
  nên dẫn dắt bằng test giúp khóa hành vi đúng ngay từ đầu.
- **Ordering**: Viết test thất bại cho hành vi mong muốn trước, hiện thực mã tối
  thiểu để test xanh, rồi refactor — cho từng lớp có thể kiểm thử.
- Sàn coverage: 80% dòng lệnh và chạy CI trước khi merge (scope classic).
- Áp dụng cho cả backend (Node.js) và frontend (Flutter); các business rule
  trọng yếu phải có test tương ứng.

## Guard Policy

<!-- Affirmed by the team. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless project.md or the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

Phát hành thủ công theo đợt/lịch (phỏng vấn Q4 = C): các thay đổi được gom lại
và phát hành theo đợt do người phụ trách kích hoạt, không tự động deploy mỗi
commit. Mỗi đợt phát hành cần bước xác nhận trước khi đưa lên môi trường đích.

## Code Style

Theo cấu hình ở cấp dự án (phỏng vấn Q5 = A):
- Backend Node.js: ESLint + Prettier; frontend Flutter: `dart format` +
  `flutter analyze` (linter theo `analysis_options.yaml`).
- Linter/formatter chạy trong CI trước khi merge; lỗi lint chặn PR.
- Quy ước đặt tên theo idiom từng ngôn ngữ (camelCase cho JS/TS, lowerCamelCase
  cho Dart).

## Forbidden

<!-- Team-specific forbidden patterns -->

## Mandated

<!-- Team-specific mandates -->

## Corrections

<!-- Self-learning loop appends here. -->
</memory-file>

<memory-file path="aidlc/spaces/default/memory/project.md">
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
- ALWAYS kiểm tra có phiên agent hoặc workflow khác đang chạy trong cùng thư mục (danh sách phiên và thời gian ghi tệp) trước khi ghi vào thư mục dùng chung; nếu có thì dừng lại và hỏi người dùng thay vì ghi chồng lên. (learned 2026-10-09) <!-- cid:261009-interview-execution-app:code-generation:350677d4fb8ed0c566f9874410ec8a26264ae8c9c4debd4a7698334adb58ccfa -->
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/ideation.md">
# Ideation Phase Guardrails

These rules apply to every stage whose `phase: ideation` declaration
imports them as the matching phase rule.

## Focus

- Prioritize user needs and problem definition before proposing solutions
- Keep ideation artifacts at the problem/opportunity level — no implementation details
- Explore the problem space broadly before narrowing to solutions

## Evidence Standards

- Market research claims require citations or explicit source attribution
- Feasibility estimates must be conservative — flag assumptions clearly
- Do not present speculation as fact; label uncertain claims as "hypothesis" or "assumption"

## Scope Discipline

- No implementation details (architecture, tech stack, code) in ideation artifacts
- Do not carry forward scope decisions that have not been explicitly approved
- If a feasibility concern would block progress, surface it early rather than glossing over it

## Output Quality

- All ideation artifacts must be readable by non-technical stakeholders
- Avoid jargon unless defined in a glossary
- Success metrics must be measurable — avoid vague outcomes like "improved performance"

## Corrections
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/inception.md">
# Inception Phase Guardrails

These rules apply to every stage whose `phase: inception` declaration
imports them as the matching phase rule.

## Requirements Quality

- Requirements must be testable and verifiable — each requirement must have a clear pass/fail criterion
- Avoid ambiguous language ("fast", "easy", "user-friendly") unless paired with a measurable threshold
- Never carry forward unresolved contradictions between requirements; surface and resolve them explicitly

## Architecture Standards

- Architecture decisions require trade-off analysis — document at least two alternatives considered
- All ADRs must include: Context, Decision, Consequences, and Alternatives Rejected
- Security and compliance implications must be addressed for every major architectural decision

## User Stories

- User stories follow Given/When/Then (BDD) format for acceptance criteria
- Each story must identify the actor, the action, and the business value
- Stories must be independently testable — avoid stories that only make sense in sequence

## Traceability

- Every requirement must trace back to an ideation artifact (intent, feasibility, or scope)
- Do not introduce new requirements in inception without documenting their origin

## Corrections
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/construction.md">
# Construction Phase Guardrails

These rules apply to every stage whose `phase: construction` declaration
imports them as the matching phase rule.

## Code Completeness

- Generate complete, runnable files — no partial implementations, no placeholder stubs unless explicitly marked TODO with a rationale
- Every generated module must be independently executable or clearly document its dependencies
- Do not leave unresolved import errors, missing type definitions, or broken references

## Error Handling

- Always include error handling at integration boundaries (API calls, database operations, file I/O, external services)
- Errors must be surfaced to the caller or logged — silent failures are not acceptable
- Distinguish between recoverable errors (retry/fallback) and fatal errors (fail fast)

## Testing Standards

- Test files must cover the happy path and at least two error/edge cases
- Tests must be runnable without manual setup beyond documented prerequisites
- Do not generate tests that always pass regardless of implementation (e.g., `assert True`)

## Security

- Never hardcode credentials, API keys, or secrets — use environment variables or a secrets manager
- Validate and sanitize all inputs at system boundaries
- Flag any code that bypasses authentication or authorization checks

## Corrections
</memory-file>

<memory-file path="aidlc/spaces/default/memory/phases/operation.md">
# Operation Phase Guardrails

These rules apply to every stage whose `phase: operation` declaration
imports them as the matching phase rule.

## Infrastructure Safety

- Infrastructure changes require security review — document the security implications of every change
- Never remove or bypass existing security controls without explicit approval and documented rationale
- Changes to IAM roles, network policies, or encryption settings must include a risk assessment

## Deployment Procedures

- All deployment procedures must include rollback steps — document how to reverse every change
- Deployments to production must have a defined smoke test or health check to verify success
- Blue/green or canary strategies must document traffic-shifting criteria and abort conditions

## Observability

- SLOs must be quantified with specific percentages and time windows (e.g., "99.9% availability over a 30-day rolling window")
- Alerting thresholds must be set below SLO breach to allow time for remediation
- Every new service or component must have at least one health metric and one error rate metric

## Incident Response

- Runbooks must include escalation paths and contact information
- Post-incident reviews are required for any P1/P2 incident — document timeline, root cause, and prevention

## Corrections
</memory-file>
