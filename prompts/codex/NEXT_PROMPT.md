# Next Codex Task

## Status
HOLD — M0 repository/governance foundation must be committed and approved by the product owner before substantive Codex work.

## Milestone
M0

## Objective
No implementation task is currently authorized.

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
- Identify inconsistencies without modifying architecture or scope.

## Out of scope
- Product feature code.
- Framework/datastore/deployment selection.
- Live Bambu device/cloud integration.
- Authentication implementation.
- Camera, AMS, jobs, files/media, maintenance, notification, API/webhook, backup, update, or PWA implementation.
- Starting M1 without product-owner authorization.

## Architecture constraints
Use the M0 guardrails; do not fill unresolved technology decisions by assumption.

## Security constraints
No secrets, real device credentials, customer/production data, or live device dumps. No real-printer access by default.

## Prototype requirement
None for M0. When M1 is authorized, it must conclude with the runnable synthetic prototype defined in `MILESTONE_PLAN.md`.

## Required tests
None while status is HOLD.

## Required documentation updates
None unless specifically authorized.

## Acceptance criteria
Remain stopped until product-owner approval changes this file to a queued task.

## PR requirements
None while HOLD.

## Stop conditions
Any request to implement product functionality or make material architecture/security choices before M0 approval.
