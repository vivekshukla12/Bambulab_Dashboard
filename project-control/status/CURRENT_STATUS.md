# Current Status

## Current milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## State
REMEDIATION COMPLETE / DRAFT PR REVIEW — M1 synthetic prototype implementation is on Draft PR #2. The technical-lead reproducibility finding has been remediated, fresh-checkout validation passes, and Docker/Compose validation passes in GitHub Actions. Local Docker execution remains unavailable on this workstation because Docker is not installed.

## Repository
`vivekshukla12/Bambulab_Dashboard` — public

## License
Mozilla Public License 2.0 (MPL-2.0). New original source files must carry the MPL-2.0 source-file notice policy defined in `CONTRIBUTING.md` and DEC-008.

## Current branch
`m1/synthetic-dashboard-prototype`

## Current PR
Draft PR #2 — `M1: synthetic dashboard architecture prototype`

https://github.com/vivekshukla12/Bambulab_Dashboard/pull/2

No merge is authorized.

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
On 2026-08-23 the Product Owner authorized M1 implementation after technical-lead review. `prompts/codex/NEXT_PROMPT.md` was executed as the controlling Codex scope.

Implemented on Draft PR #2:
- npm-workspace TypeScript monorepo with bounded packages and TypeScript project references;
- Fastify read-only REST/SSE backend;
- React/Vite PWA shell with fleet, device details, diagnostics and explicit stale/unavailable/reconnect/offline states;
- SQLite/Kysely persistence with migrations, WAL, foreign keys and restart-surviving current state;
- deterministic synthetic A1 Mini-shaped and X2D-shaped devices using the read-only adapter contract;
- module READMEs, `docs/architecture/MODULE_MAP.md`, TypeDoc generation, license inventory and Docker/Compose packaging files.

Remediated on Draft PR #2:
- committed the previously local-only `packages/secrets` workspace and fixed the `.gitignore` rule that hid it;
- verified fresh-checkout `npm ci`, `npm run validate` and `npm run test:e2e` from GitHub branch state;
- added and ran `npm run docker:validate` in GitHub Actions, proving Docker/Compose build/startup, dashboard/API/health access and SQLite volume persistence across restart/recreation.

Codex may not:
- access real printers or credentials;
- implement Bambu protocols, Developer Mode, Fleet Hub, cloud impersonation, write/control features or later milestones;
- make material architecture/security/dependency decisions without stopping for Product Owner approval;
- merge the M1 PR.

## Critical project gate
M2 is the real-device GO/NO-GO milestone. It must demonstrate useful, stable read-only monitoring on both an A1 Mini and X2D without Developer Mode or Fleet Hub. Synthetic evidence alone cannot satisfy M2.

If M2 cannot prove enough real capability to make the dashboard genuinely useful, substantial downstream implementation must stop pending an explicit Product Owner continue/re-scope/stop decision.

## Next authorized action
Technical-lead/Product Owner review of remediated Draft PR #2. Docker/Compose validation evidence is now recorded from GitHub Actions. Do not merge without explicit Product Owner approval.
