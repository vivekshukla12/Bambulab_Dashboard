# Current Status

## Current milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## State
PLANNING / HOLD — M1 is complete, accepted, and merged. M2 is now the active milestone for planning, but no M2 implementation task is yet queued.

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

## M2 purpose and hard gate
M2 is the mandatory real-device GO/NO-GO milestone. It must demonstrate sufficiently useful and reliable read-only monitoring on **both** an A1 Mini and X2D under the approved security/legal/interface constraints.

Synthetic evidence cannot satisfy M2.

M2 must not require or use:
- Developer Mode;
- Fleet Hub hardware;
- Bambu partner/private authorization;
- reverse-engineered Bambu cloud-client impersonation;
- printer write/control commands;
- bypasses or weakening of vendor/device authentication or security controls.

If M2 cannot prove enough real read-only capability on both initial target devices to make the dashboard genuinely useful, substantial downstream implementation must stop for a formal Product Owner continue/re-scope/stop decision before M3.

## M2 planning requirements
Before Codex implementation is queued, technical-lead planning must define and Product Owner must approve a concrete M2 execution contract covering at least:
- exact supported/authorized local read path to evaluate;
- device discovery/manual fallback behavior;
- LAN Access Code handling and consent;
- field/capability evidence matrix for A1 Mini and X2D;
- freshness/update/reconnect/offline validation;
- firmware/model variance recording;
- controlled handling of real-device evidence with no secrets/private dumps committed;
- success thresholds for the M2 GO/NO-GO decision;
- automated tests around the adapter boundary plus hands-on real-device validation;
- branch/PR, documentation, security, stop and merge rules.

## Security/data gate
Real-device testing in M2 may use the Product Owner's local printers only under an explicitly queued M2 task. Real LAN Access Codes, private device payloads, logs or identifiers must never be committed to the repository. Evidence must be sanitized or summarized according to the security/privacy guardrails.

## Next authorized action
Technical-lead M2 planning and creation/review of the concrete M2 Codex execution contract. Keep `prompts/codex/NEXT_PROMPT.md` on HOLD until that contract is explicitly approved. Do not start real-printer implementation or access yet.
