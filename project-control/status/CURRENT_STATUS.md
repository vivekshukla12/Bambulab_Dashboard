# Current Status

## Current milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## State
IMPLEMENTATION AUTHORIZED / QUEUED — Product Owner explicitly started M2 on 2026-08-24. The reviewed M2 planning package is now the executable baseline. `prompts/codex/NEXT_PROMPT.md` is QUEUED for controlled Codex execution. M2 acceptance, GO/NO-GO disposition, merge, and M3 remain separately Product Owner controlled.

## Repository
`vivekshukla12/Bambulab_Dashboard` — public

## License
Mozilla Public License 2.0 (MPL-2.0). New original source files must carry the MPL-2.0 source-file notice policy defined in `CONTRIBUTING.md` and DEC-008. Preserve third-party provenance and license compatibility.

## Current branch
`main` for project-control state. Codex is authorized to create a dedicated M2 milestone branch from current `main` before substantial implementation.

## Current PR
None for M2 at queue time. Codex must open a draft M2 PR targeting `main` before substantial implementation and must not merge it.

## Completed milestones

### M0 — Repository and governance foundation
- Product Owner accepted M0 on 2026-08-22.
- PR #1 merged on 2026-08-22.
- Verified merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`.

### M1 — Architecture foundation + synthetic prototype + real-read feasibility design
- Product Owner approved the M1 architecture baseline and implementation contract.
- Technical-lead review found one reproducibility blocker; remediation was completed and revalidated.
- Fresh-checkout build/test, Playwright E2E, TypeDoc/license checks, and Docker/Compose validation all passed.
- Product Owner performed hands-on prototype validation.
- Product Owner accepted M1 and explicitly authorized merge on 2026-08-24.
- PR #2 merged into `main` on 2026-08-24.
- Verified merge commit: `42821596cc0bf80a302b12287063b3ee17f58f3a`.
- UI modernization feedback is non-blocking and deferred to later planning, potentially a small V1.1 UI/UX refresh.

## M2 authorization
The Product Owner's 2026-08-24 instruction to start M2 authorizes execution of the already-reviewed M2 planning package without scope expansion:

- `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
- `project-control/reviews/M2_PLANNING_REVIEW.md`
- `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`
- executable gate: `prompts/codex/NEXT_PROMPT.md`

This authorization permits controlled implementation and real-device validation on the Product Owner's LAN for the Product Owner's A1 Mini and X2D only, under the approved read-only constraints.

## Product direction
V1 remains read-only-first for real Bambu printers. The product is a local-first operational dashboard centered on real monitoring, historical intelligence, maintenance, notifications and secure integrations. Printer write/control, Developer Mode, Fleet Hub dependency, cloud-client impersonation and private Bambu partner authorization are not part of the current V1 path.

See `project-control/specs/V1_FEATURE_SCOPE.md` for the current V1 feature boundary and `project-control/specs/MILESTONE_PLAN.md` for the roadmap.

## Authorized M2 interface
M2 may evaluate/implement only the **standard-mode local MQTTS read-only status path** for printer-originated status information under the constraints in `M2_REAL_DEVICE_VALIDATION.md`.

The M2 path must not require or use:
- Developer Mode;
- Fleet Hub hardware;
- Bambu partner/private authorization;
- reverse-engineered Bambu cloud-client impersonation;
- printer write/control commands;
- bypasses or weakening of vendor/device authentication, authorization, signature, TLS or other security controls;
- copied proprietary Bambu network-plugin implementation.

If useful read monitoring cannot be established under those constraints, implementation stops and the result feeds the M2 GO/NO-GO decision.

## M2 prototype target
Extend the accepted M1 dashboard with a dedicated `adapter-bambu-readonly` boundary while retaining permanent deterministic synthetic mode.

M2 must prove or disprove:
- real connectivity/availability;
- real printer/print state;
- useful real-print progress;
- reliably exposed temperatures/status telemetry;
- explicit freshness/stale/offline/reconnect/recovery semantics;
- simultaneous A1 Mini + X2D monitoring;
- normalized persistence/history inputs;
- capability differences without model-specific product-layer branching.

No UI redesign is required or authorized in M2.

## Credential/evidence policy
For M2 feasibility:
- real LAN Access Codes default to process-memory-only/non-persisted handling;
- real-device testing runs locally on the Product Owner's LAN, not in public/shared CI;
- credentials, serial numbers, MAC addresses, local IPs, account identifiers, raw private payload dumps, packet captures, private printer media and unsanitized logs must not be committed;
- repository evidence must be sanitized matrices/summaries or project-authored synthetic fixtures;
- persistent real credential storage is not required for the M2 GO/NO-GO decision and is not authorized unless separately requested within the approved `SecretStore` boundary.

## M2 GO/NO-GO gate
Synthetic evidence cannot satisfy M2.

Technical lead should recommend **GO** only if both A1 Mini and X2D provide enough stable real data for a credible core monitoring product: availability, current operating/print state, useful progress during printing, meaningful temperature/status telemetry, and safe freshness/recovery behavior.

A **CONDITIONAL GO** requires an explicit Product Owner-approved reduction in product claims for non-core/model-specific gaps.

Recommend **NO-GO / reassessment required** if either target printer cannot provide useful stable monitoring under the approved constraints or required data depends on a prohibited interface/security mechanism.

No M3 implementation may begin before the Product Owner decides the M2 gate.

## M2 primary risks
See `project-control/risks/RISK_REGISTER.md`, especially:
- R-013 — read-only viable direction / control unavailable;
- R-014 — firmware/model variability may undermine useful monitoring;
- R-015 — credential/private evidence leakage during real-device debugging;
- R-016 — low-level read transport assumptions may depend on unofficial details.

## Next authorized action
Codex may now resume from GitHub, read `prompts/codex/RESUME.md`, then execute the QUEUED contract in `prompts/codex/NEXT_PROMPT.md`: create the M2 branch and draft PR, implement within the approved boundary, preserve synthetic regression, and prepare local-only real-device validation. Do not merge and do not begin M3.