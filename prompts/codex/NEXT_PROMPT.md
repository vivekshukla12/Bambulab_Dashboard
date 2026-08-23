# Next Codex Task

## Status
HOLD — M0 is complete. M1 is in planning and no product implementation task is yet authorized.

## Milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## Objective
No product implementation task is currently authorized. The next step is Product Owner-led M1 architecture planning and selection of one specific Codex task under the revised read-only-first V1 direction.

## Required reading
- `project-control/status/CURRENT_STATUS.md`
- `project-control/handoffs/CHATGPT_HANDOVER.md`
- `project-control/specs/PRODUCT_REQUIREMENTS.md`
- `project-control/specs/V1_FEATURE_SCOPE.md`
- `project-control/specs/OPERATING_MODEL.md`
- `project-control/specs/ITERATIVE_DELIVERY_MODEL.md`
- `project-control/specs/ARCHITECTURE_GUARDRAILS.md`
- `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
- `project-control/specs/MILESTONE_PLAN.md`
- `project-control/decisions/DECISION_LOG.md`
- `project-control/risks/RISK_REGISTER.md`

## In scope while HOLD
- Read and report repository/project-control state if asked.
- Identify M1 planning inconsistencies, risks, feasibility questions, and decision requirements.
- Recommend architecture/technology/documentation options without implementing or treating recommendations as authorization.
- Refine the normalized read-only capability/adapter design and M2 real-device validation plan at specification level.

## Out of scope while HOLD
- Product feature code.
- Creating an M1 implementation branch or PR without authorization.
- Selecting/implementing framework, datastore, deployment, authentication, TLS, Bambu integration, documentation toolchain, or other architecture choices as though they were approved.
- Live Bambu device/cloud integration or real-printer access.
- Printer Developer Mode, Fleet Hub dependency, Bambu partner/private authorization, or cloud-client impersonation.
- Printer write/control functionality.
- Starting later-milestone functionality.

## Architecture constraints
M1 must make deliberate architecture/feasibility decisions and prove approved choices in the runnable synthetic prototype defined in `MILESTONE_PLAN.md`. The design must preserve strong adapter/module boundaries, read-versus-control capability semantics, structured developer documentation/IDE support, and token-efficient scoped development under DEC-010. Do not fill unresolved choices by assumption.

## Security constraints
No secrets, real device credentials, customer/production data, or live device dumps. Synthetic test data only by default. No real-printer access unless explicitly approved. Do not bypass vendor/device security, authentication, certificate validation, access restrictions, or contractual boundaries.

## Prototype target once M1 is authorized
A locally runnable authenticated dashboard/PWA shell backed by an always-on service, showing a small deterministic synthetic fleet with simulated connectivity/status/telemetry, health diagnostics, explicit freshness/stale/offline/unavailable semantics, and the normalized adapter/capability contracts required for M2 read-only real-device validation.

## Required tests
None while status is HOLD. The eventual QUEUED M1 task must define automated and hands-on validation requirements, including module-boundary/documentation checks where practical.

## Required documentation updates
None while status is HOLD unless explicitly authorized for M1 planning/governance.

## Acceptance criteria
Remain stopped on implementation until the Product Owner approves a specific M1 task and this file is deliberately replaced with `Status: QUEUED` plus the complete authorized scope, non-goals, constraints, tests, prototype acceptance criteria, PR requirements, documentation updates, and stop conditions.

## PR requirements
No M1 PR is authorized while this file is HOLD.

## Stop conditions
Any attempt to implement product functionality, access real printers, or make material architecture/security/vendor-interface choices before a specific M1 task is explicitly authorized and this file is changed to `QUEUED`.
