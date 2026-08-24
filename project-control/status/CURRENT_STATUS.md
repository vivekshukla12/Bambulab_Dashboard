# Current Status

## Current milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## State
PLANNING COMPLETE / HOLD — M1 is complete, accepted, and merged. The M2 real-device validation specification and Codex implementation proposal are technically reviewed and ready for Product Owner approval. No M2 implementation or real-printer access is authorized yet.

## Repository
`vivekshukla12/Bambulab_Dashboard` — public

## License
Mozilla Public License 2.0 (MPL-2.0). New original source files must carry the MPL-2.0 source-file notice policy defined in `CONTRIBUTING.md` and DEC-008.

## Current branch
`main`

## Current PR
None for M2.

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

## Product direction
V1 remains read-only-first for real Bambu printers. The product is a local-first operational dashboard centered on real monitoring, historical intelligence, maintenance, notifications and secure integrations. Printer write/control, Developer Mode, Fleet Hub dependency, cloud-client impersonation and private Bambu partner authorization are not part of the current V1 path.

See `project-control/specs/V1_FEATURE_SCOPE.md` for the current V1 feature boundary and `project-control/specs/MILESTONE_PLAN.md` for the roadmap.

## M2 approved planning direction
The technical-lead M2 planning package is now complete:

- `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
- `project-control/reviews/M2_PLANNING_REVIEW.md`
- `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`

Technical recommendation: approve this package as the M2 executable baseline, but implementation remains blocked until explicit Product Owner authorization changes `prompts/codex/NEXT_PROMPT.md` from HOLD to QUEUED.

## Proposed M2 interface
M2 will evaluate/implement only the **standard-mode local MQTTS read-only status path** for printer-originated status information that Bambu publicly states remains available to third-party monitoring software.

The M2 path must not require or use:
- Developer Mode;
- Fleet Hub hardware;
- Bambu partner/private authorization;
- reverse-engineered Bambu cloud-client impersonation;
- printer write/control commands;
- bypasses or weakening of vendor/device authentication/security controls;
- copied proprietary Bambu network-plugin implementation.

If useful read monitoring cannot be established under those constraints, implementation stops and the result feeds the M2 GO/NO-GO decision.

## M2 prototype target
The accepted M1 dashboard will be extended with a dedicated `adapter-bambu-readonly` boundary so the Product Owner can monitor the real A1 Mini and X2D locally while retaining synthetic mode.

M2 should prove:
- real connectivity/availability;
- real printer/print state;
- useful real-print progress;
- reliably exposed temperatures/status telemetry;
- explicit freshness/stale/offline/reconnect/recovery semantics;
- simultaneous A1 Mini + X2D monitoring;
- normalized persistence/history inputs;
- capability differences without model-specific product-layer branching.

No UI redesign is required in M2.

## Credential/evidence policy
For M2 feasibility:
- real LAN Access Codes default to memory-only/non-persisted handling;
- real-device testing runs locally on the Product Owner's LAN, not in public CI;
- credentials, serial numbers, MAC addresses, local IPs, account identifiers, raw private payload dumps, packet captures, private printer media and unsanitized logs must not be committed;
- repository evidence must be sanitized matrices/summaries or project-authored synthetic fixtures.

Persistent real credential storage is not required for the M2 GO/NO-GO decision.

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
Product Owner reviews and explicitly approves or changes the M2 planning package. Keep `prompts/codex/NEXT_PROMPT.md` on HOLD and do not access real printers until explicit implementation authorization is given.
