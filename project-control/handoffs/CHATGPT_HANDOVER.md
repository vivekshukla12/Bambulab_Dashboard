# Bambu Printer Dashboard ChatGPT Handover

## Repository authority

GitHub is authoritative: `vivekshukla12/Bambulab_Dashboard`.

Read `CURRENT_STATUS.md`, this handover, `NEXT_PROMPT.md`, `V1_PRODUCT_REQUIREMENTS.md`, `MILESTONE_PLAN.md`, current decisions/risks and actual PR/CI state before making current-state claims.

## Completed foundation

- M0 merged: `bad179a0f847f9a478e2c167e62dd94760baa105`
- M1 merged: `42821596cc0bf80a302b12287063b3ee17f58f3a`
- Approved stack: Node.js 24 + TypeScript, React/Vite, Fastify, SQLite/Kysely, npm workspaces, Vitest, Playwright, TypeDoc, REST/SSE, Docker/Docker Compose.

## Current product decision — DEC-019

On 10 October 2026 the Product Owner deliberately simplified V1.

Current V1 is:

- local-first;
- read-only;
- Docker-native;
- direct local printer status only;
- manual-onboarding-first;
- no proprietary Bambu runtime dependency;
- no Bambu Cloud/Connect/Studio/Network Plugin;
- no Developer Mode/Fleet Hub;
- no paid service;
- no vendor outreach;
- no printer control/write surface.

The original full-scope `PRODUCT_REQUIREMENTS.md` is preserved unchanged for future projects/releases. The active requirements are `V1_PRODUCT_REQUIREMENTS.md`.

## Why the change was made

The Network Plugin spike was technically successful on Windows but would make Ubuntu/Docker deployment depend on proprietary Bambu software installation, platform/ABI compatibility and lifecycle management. The Product Owner prefers a smaller product that is easy to build, deploy and maintain.

The project therefore treats difficult printer models as a support-matrix question rather than an excuse to add proprietary compatibility layers.

## Current milestone

M2 — Direct plugin-free local printer monitoring / supported-model gate.

PR #3 remains open, draft and unmerged. The branch currently still contains historical Network Plugin spike code that must be removed from the active V1 implementation before M2 can be completed.

Known direct evidence:
- A1 Mini previously connected over the direct read-only path and produced live telemetry.
- X2D direct plugin-free support remains unresolved and must be retested.
- Network Plugin dual-printer evidence is useful historical product evidence but does not qualify a model for the new direct-only production support matrix.

## Current execution task

`NEXT_PROMPT.md` is QUEUED to:

- remove Network Plugin bridge/package/runtime references from active V1 code and docs;
- preserve historical decision/research/evidence records;
- keep direct MQTTS read-only adapter and optional SSDP convenience;
- make manual onboarding sufficient and normal;
- update tests/docs;
- return to HOLD for Product Owner direct A1 Mini/X2D retest.

## Model-support rule

Support only printer/model/firmware combinations that provide useful direct read-only telemetry. If X2D direct support fails, do not add Bambu software, cloud, Developer Mode or another workaround. Return for Product Owner decision on experimental/unsupported status.

## Roadmap

- M2: direct local monitoring/support gate
- M3: fleet/device pages + observed history
- M4: read-only AMS/filament + maintenance + alerts
- M5: local integration API + Home Assistant
- M6: Ubuntu/Docker operations + backup/restore/portability
- M7: V1 release candidate

Never merge a milestone PR or begin the next milestone without explicit Product Owner authorization.
