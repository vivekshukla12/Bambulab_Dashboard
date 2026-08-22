# Next Codex Task

## Status
HOLD — M0 is complete. M1 is in planning and no product implementation task is yet authorized.

## Milestone
M1 — Architecture foundation + synthetic dashboard prototype

## Objective
No product implementation task is currently authorized. The next step is product-owner-led M1 planning and selection of one specific Codex task.

## Required reading
- `project-control/status/CURRENT_STATUS.md`
- `project-control/handoffs/CHATGPT_HANDOVER.md`
- `project-control/specs/PRODUCT_REQUIREMENTS.md`
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
- Recommend architecture/technology options without implementing or treating recommendations as authorization.

## Out of scope while HOLD
- Product feature code.
- Creating an M1 implementation branch or PR without authorization.
- Selecting/implementing framework, datastore, deployment, authentication, TLS, Bambu integration, camera, or other architecture choices as though they were approved.
- Live Bambu device/cloud integration.
- Real-printer access.
- Starting later-milestone functionality.

## Architecture constraints
M1 must make deliberate architecture/feasibility decisions and prove approved choices in the runnable synthetic prototype defined in `MILESTONE_PLAN.md`. Do not fill unresolved choices by assumption.

## Security constraints
No secrets, real device credentials, customer/production data, or live device dumps. Synthetic test data only by default. No real-printer access unless explicitly approved. Do not bypass vendor/device security or access controls.

## Prototype target once M1 is authorized
A locally runnable authenticated dashboard/PWA shell backed by an always-on service, showing a small deterministic synthetic fleet with simulated connectivity/status/telemetry, health diagnostics, and explicit offline/unavailable semantics.

## Required tests
None while status is HOLD. The eventual QUEUED M1 task must define automated and hands-on validation requirements.

## Required documentation updates
None while status is HOLD unless explicitly authorized for M1 planning/governance.

## Acceptance criteria
Remain stopped on implementation until the product owner approves a specific M1 task and this file is deliberately replaced with `Status: QUEUED` plus the complete authorized scope, non-goals, constraints, tests, prototype acceptance criteria, PR requirements, documentation updates, and stop conditions.

## PR requirements
No M1 PR is authorized while this file is HOLD.

## Stop conditions
Any attempt to implement product functionality, access real printers, or make material architecture/security/vendor-interface choices before a specific M1 task is explicitly authorized and this file is changed to `QUEUED`.
