# Next Codex Task

## Status
HOLD — M0 has been approved by the product owner but is not complete until PR #1 is merged and the main-branch project-control state is reconciled. M1 implementation is not authorized.

## Milestone
M0

## Objective
No product implementation task is currently authorized.

## Required reading
- `project-control/status/CURRENT_STATUS.md`
- `project-control/handoffs/CHATGPT_HANDOVER.md`
- `project-control/specs/PRODUCT_REQUIREMENTS.md`
- `project-control/specs/OPERATING_MODEL.md`
- `project-control/specs/ITERATIVE_DELIVERY_MODEL.md`
- `project-control/specs/ARCHITECTURE_GUARDRAILS.md`
- `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
- `project-control/specs/MILESTONE_PLAN.md`

## In scope
- Read and report repository/project-control state if asked.
- Identify inconsistencies without modifying architecture or product scope.
- Perform explicitly authorized M0 merge-state reconciliation only.

## Out of scope
- Product feature code.
- Framework/datastore/deployment selection.
- Live Bambu device/cloud integration.
- Authentication implementation.
- Camera, AMS, jobs, files/media, maintenance, notification, API/webhook, backup, update, or PWA implementation.
- Starting M1 without separate product-owner authorization.

## Architecture constraints
Use the M0 guardrails; do not fill unresolved technology decisions by assumption.

## Security constraints
No secrets, real device credentials, customer/production data, or live device dumps. No real-printer access by default.

## Prototype requirement
None for M0. When M1 is separately authorized, it must conclude with the runnable synthetic prototype defined in `MILESTONE_PLAN.md`.

## Required tests
None while status is HOLD.

## Required documentation updates
Only M0 merge/reconciliation updates explicitly authorized by the product owner.

## Acceptance criteria
Remain stopped on product implementation. After PR #1 is merged, update project-control state to M0 COMPLETE / M1 PLANNING-HOLD. A later explicit product-owner decision must replace this file with one specific M1 QUEUED task before Codex implements product functionality.

## PR requirements
PR #1 is approved for M0 merge; verify current head/mergeability before merge. Do not infer authorization for any M1 PR.

## Stop conditions
Any request to implement M1/product functionality or make material architecture/security/vendor-interface choices before a specific M1 task is explicitly authorized and `NEXT_PROMPT.md` is changed to `QUEUED`.
