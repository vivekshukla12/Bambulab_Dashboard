# Current Status

## Current milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## State
IMPLEMENTATION AUTHORIZED / QUEUED — M1 architecture and execution contract are approved. Codex may execute only the task in `prompts/codex/NEXT_PROMPT.md`.

## Repository
`vivekshukla12/Bambulab_Dashboard` — public

## License
Mozilla Public License 2.0 (MPL-2.0). New original source files must carry the MPL-2.0 source-file notice policy defined in `CONTRIBUTING.md` and DEC-008.

## Current branch
`main` until Codex creates the authorized M1 implementation branch.

## Current PR
None yet for M1. Codex is authorized to create a draft M1 PR from its implementation branch. No merge is authorized.

## Product direction
V1 is read-only-first for real Bambu printers. The product is a local-first operational dashboard centered on real monitoring, historical intelligence, maintenance, notifications and secure integrations. Printer write/control, Developer Mode, Fleet Hub dependency, cloud-client impersonation and private Bambu partner authorization are not part of the current V1 path.

See `project-control/specs/V1_FEATURE_SCOPE.md` for the current V1 feature boundary and `project-control/specs/MILESTONE_PLAN.md` for the roadmap.

## Approved M1 architecture
The Product Owner approved the consolidated M1 architecture package on 2026-08-23. The authoritative specification is `project-control/specs/M1_ARCHITECTURE.md`; technical-lead review is recorded in `project-control/reviews/M1_ARCHITECTURE_REVIEW.md`.

Approved baseline includes:
- Node.js 24 LTS + TypeScript;
- React + Vite frontend;
- Fastify backend;
- SQLite + `better-sqlite3` + Kysely;
- npm-workspace monorepo with strict bounded packages and TypeScript project references;
- Vitest + Playwright;
- TypeDoc + structured source documentation for IDE/generated reference support;
- REST + Server-Sent Events;
- direct local development + Docker/Docker Compose production packaging;
- open-source/commercial-use/MPL-compatible dependency policy and automated license inventory;
- no dashboard login for the read-only V1 model;
- LAN-accessible default with local/interface restriction option where feasible;
- stable LAN-local dashboard discovery/name target via mDNS/equivalent, treated as best-effort where platform/network support differs;
- HTTP permitted for initial read-only LAN operation, while HTTPS + strong authentication becomes mandatory before any future write/control capability;
- future printer discovery plus LAN Access Code onboarding with optional encrypted persistence;
- tiered retention: durable maintenance/analytics history plus 30-day default raw telemetry configurable from 1–365 days.

See DEC-014, DEC-015 and DEC-016.

## Authorization
On 2026-08-23 the Product Owner authorized M1 implementation after technical-lead review. `prompts/codex/NEXT_PROMPT.md` is now `QUEUED` and is the only executable Codex scope.

Codex may:
- create an M1 implementation branch from current `main`;
- open a draft PR;
- implement and validate only the authorized M1 synthetic prototype contract;
- update project-control files as required by that contract.

Codex may not:
- access real printers or credentials;
- implement Bambu protocols, Developer Mode, Fleet Hub, cloud impersonation, write/control features or later milestones;
- make material architecture/security/dependency decisions without stopping for Product Owner approval;
- merge the M1 PR.

## Critical project gate
M2 is the real-device GO/NO-GO milestone. It must demonstrate useful, stable read-only monitoring on both an A1 Mini and X2D without Developer Mode or Fleet Hub. Synthetic evidence alone cannot satisfy M2.

If M2 cannot prove enough real capability to make the dashboard genuinely useful, substantial downstream implementation must stop pending an explicit Product Owner continue/re-scope/stop decision.

## Next authorized action
Codex executes `prompts/codex/NEXT_PROMPT.md`, creates the M1 branch/draft PR, implements the scoped synthetic prototype, runs required automated and hands-on validation, records evidence, and returns the PR for technical-lead/Product Owner review. Do not merge without explicit Product Owner approval.
