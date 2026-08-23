# Current Status

## Current milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## State
PLANNING / HOLD — M0 is complete and merged. M1 has not yet been authorized for implementation.

## Repository
`vivekshukla12/Bambulab_Dashboard` — public

## License
Mozilla Public License 2.0 (MPL-2.0). New original source files must carry the MPL-2.0 source-file notice policy defined in `CONTRIBUTING.md` and DEC-008.

## Current branch
`main`

## Current PR
None for M1.

## Product direction
The approved planning direction is now read-only-first for real Bambu printers. V1 is a local-first operational dashboard centered on real monitoring, historical intelligence, maintenance, notifications and secure integrations. Printer write/control, Developer Mode, Fleet Hub dependency, cloud-client impersonation and private Bambu partner authorization are not part of the current V1 path.

See `project-control/specs/V1_FEATURE_SCOPE.md` for the current feature boundary and `project-control/specs/MILESTONE_PLAN.md` for the revised roadmap.

## Completed
- M0 — Repository and governance foundation.
- PR #1 merged on 2026-08-22.
- PRD v1.0 requirements baseline committed and preserved.
- Project operating model and iterative prototype delivery model established.
- Architecture, security, privacy, data, vendor-interface, deployment and legal/IP guardrails established.
- Documentation-first, modular, IDE-discoverable and token-efficient development requirement established by DEC-010.
- Printer Developer Mode and current Fleet Hub/partner-dependent path excluded by Product Owner direction.
- Publicly available read-only printer monitoring recognized as the viable real-device target under DEC-012.
- Read-only-first V1 feature scope and revised milestone roadmap established.
- Home Assistant designated as the preferred initial smart-home interoperability layer; Alexa/Google Home are potential downstream bridges after validation.
- Daisy identified as a future first-party integration target through documented local API/events without creating a runtime dependency.

## In progress
- M1 planning only.
- Selection and approval of the M1 technology architecture, documentation toolchain, module/repository structure, datastore, deployment, auth/TLS/security choices, and normalized adapter/capability contracts.
- Definition of the first specific M1 Codex implementation task.

## Critical project gate
M2 is the real-device GO/NO-GO milestone. It must demonstrate useful, stable read-only monitoring on both an A1 Mini and X2D without Developer Mode or Fleet Hub. Synthetic evidence alone cannot satisfy M2.

If M2 cannot prove enough real capability to make the dashboard genuinely useful, substantial downstream implementation must stop pending an explicit Product Owner continue/re-scope/stop decision.

## Blockers
- M1 implementation remains intentionally blocked until the Product Owner explicitly authorizes a specific M1 task and `prompts/codex/NEXT_PROMPT.md` is deliberately changed from `HOLD` to `QUEUED`.

## Decisions still required before M1 implementation
- application/backend/frontend technology stack;
- datastore and migration approach;
- development/staging/production topology and packaging;
- selected stack documentation/IDE/generated-reference toolchain;
- module/package/repository context boundaries for token-efficient development;
- normalized capability/domain and printer-adapter contracts;
- initial local application authentication/session architecture;
- local TLS/certificate development and staging strategy;
- secret/key handling and backup-recovery direction;
- initial threat model/security boundaries;
- exact M1 prototype acceptance tests and hands-on validation.

## Next authorized action
Continue Product Owner-led M1 architecture planning using the revised V1 scope and milestone plan. Do not begin product implementation, access real printers, create an M1 implementation branch/PR, or change `NEXT_PROMPT.md` to `QUEUED` until the Product Owner explicitly approves the concrete M1 task.
