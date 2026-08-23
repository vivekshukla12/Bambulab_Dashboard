# Current Status

## Current milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## State
PLANNING / HOLD — M1 architecture is approved, but implementation is not yet authorized.

## Repository
`vivekshukla12/Bambulab_Dashboard` — public

## License
Mozilla Public License 2.0 (MPL-2.0). New original source files must carry the MPL-2.0 source-file notice policy defined in `CONTRIBUTING.md` and DEC-008.

## Current branch
`main`

## Current PR
None for M1.

## Product direction
V1 is read-only-first for real Bambu printers. The product is a local-first operational dashboard centered on real monitoring, historical intelligence, maintenance, notifications and secure integrations. Printer write/control, Developer Mode, Fleet Hub dependency, cloud-client impersonation and private Bambu partner authorization are not part of the current V1 path.

See `project-control/specs/V1_FEATURE_SCOPE.md` for the current V1 feature boundary and `project-control/specs/MILESTONE_PLAN.md` for the roadmap.

## Approved M1 architecture

The Product Owner approved the consolidated M1 architecture package on 2026-08-23. The authoritative specification is `project-control/specs/M1_ARCHITECTURE.md`.

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
- stable LAN-local dashboard discovery/name target via mDNS/equivalent;
- HTTP permitted for initial read-only LAN operation, while HTTPS + strong authentication becomes mandatory before any future write/control capability;
- future printer discovery plus LAN Access Code onboarding with optional encrypted persistence;
- tiered retention: durable maintenance/analytics history plus 30-day default raw telemetry configurable from 1–365 days.

See DEC-014, DEC-015 and DEC-016.

## Completed planning work

- M0 repository/governance foundation merged.
- PRD v1.0 baseline preserved.
- read-only-first V1 scope and revised milestone roadmap established.
- documentation-first modular/token-efficient development requirement established.
- M1 technology, module, persistence, deployment, network, credential, retention and testing architecture approved.
- proposed M1 Codex execution contract created at `prompts/codex/M1_IMPLEMENTATION_PROPOSAL.md`.

## Critical project gate

M2 is the real-device GO/NO-GO milestone. It must demonstrate useful, stable read-only monitoring on both an A1 Mini and X2D without Developer Mode or Fleet Hub. Synthetic evidence alone cannot satisfy M2.

If M2 cannot prove enough real capability to make the dashboard genuinely useful, substantial downstream implementation must stop pending an explicit Product Owner continue/re-scope/stop decision.

## Current blocker

M1 implementation is intentionally blocked until the Product Owner explicitly approves the concrete execution contract in `prompts/codex/M1_IMPLEMENTATION_PROPOSAL.md` and authorizes `prompts/codex/NEXT_PROMPT.md` to change from `HOLD` to `QUEUED`.

Architecture approval alone does not authorize implementation.

## Next authorized action

Review the proposed M1 Codex execution contract. If the Product Owner approves it, copy/finalize the authorized contract into `prompts/codex/NEXT_PROMPT.md`, deliberately change status from `HOLD` to `QUEUED`, and only then permit Codex to create the M1 branch/draft PR and begin implementation.
