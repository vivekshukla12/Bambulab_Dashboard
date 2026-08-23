# Next Codex Task

## Status
HOLD — M1 architecture is approved, but the concrete implementation execution contract is still awaiting explicit Product Owner approval.

## Milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## Current architecture authority

The approved M1 architecture is recorded in:

- `project-control/specs/M1_ARCHITECTURE.md`
- DEC-014, DEC-015 and DEC-016 in `project-control/decisions/DECISION_LOG.md`

Do not reopen or substitute the approved stack/architecture while this file is HOLD.

## Proposed implementation contract

A complete proposed Codex execution contract is available at:

`prompts/codex/M1_IMPLEMENTATION_PROPOSAL.md`

That file is a review artifact only. It is **not executable authorization**.

## In scope while HOLD

- Read and report repository/project-control state if asked.
- Review the approved M1 architecture for consistency with existing guardrails.
- Review `M1_IMPLEMENTATION_PROPOSAL.md` and identify ambiguities, missing tests, licensing/security risks or acceptance gaps.
- Recommend non-implementation clarifications to the Product Owner.

## Out of scope while HOLD

- Product feature code or scaffolding.
- Creating an M1 implementation branch or PR.
- Installing/adding dependencies.
- Real-printer access or discovery.
- Bambu protocol/MQTT/cloud/Developer Mode/Fleet Hub work.
- Changing the approved stack as though a recommendation were authorization.
- Starting later-milestone features.

## Security/data constraints while HOLD

No secrets, real LAN Access Codes, real-device credentials, customer/production data or live device dumps. Do not access real printers. Do not weaken vendor/device security or certificate validation.

## Queue transition rule

Only the Product Owner can authorize implementation. After the Product Owner explicitly approves the proposed execution contract, this file must be deliberately replaced with `Status: QUEUED` and contain/refer to the complete authorized task scope, non-goals, constraints, tests, prototype acceptance criteria, documentation requirements, PR requirements and stop conditions.

Until that explicit approval occurs, remain stopped on implementation.
