# Proposed M1 Codex Execution Contract

**Status:** PROPOSED / NOT AUTHORIZED

This file is a review artifact. It does **not** authorize implementation. `prompts/codex/NEXT_PROMPT.md` remains `HOLD` until the Product Owner explicitly approves this execution contract and authorizes queueing.

## Milestone

M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## Objective

Implement the approved M1 architecture baseline as a runnable, testable, heavily documented synthetic dashboard prototype that proves the modular application structure, normalized read-only device/capability contracts, server-owned freshness/live-state model, SQLite persistence, REST/SSE browser boundary, PWA shell, Docker packaging and development/documentation/test toolchain required for M2 real-printer validation.

## Required reading

Read only the minimum necessary project-control context first:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/specs/M1_ARCHITECTURE.md`
3. `project-control/specs/V1_FEATURE_SCOPE.md`
4. `project-control/specs/MILESTONE_PLAN.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
7. `project-control/decisions/DECISION_LOG.md` — focus on DEC-006, DEC-007, DEC-008, DEC-010 through DEC-016.
8. `project-control/risks/RISK_REGISTER.md`
9. `CONTRIBUTING.md`
10. `LICENSE`, `NOTICE`, `TRADEMARKS.md`

Do not recursively read unrelated repository content unless a referenced contract/file is needed for the authorized task.

## Approved technology

Use exactly the approved baseline unless a blocking incompatibility is discovered:

- Node.js 24 LTS;
- TypeScript;
- React + Vite;
- Fastify;
- SQLite via `better-sqlite3`;
- Kysely for typed SQL/migrations;
- npm workspaces + TypeScript project references;
- Vitest;
- Playwright;
- TypeDoc plus structured TypeScript documentation comments;
- REST + Server-Sent Events;
- direct local development run;
- Docker/Docker Compose production packaging.

Do not substitute Next.js, NestJS, Prisma, PostgreSQL, Nx, Turborepo, Redux or other major alternatives unless the Product Owner explicitly approves a new architecture decision.

## Licensing/dependency constraint

All runtime, framework, library, build and core tooling dependencies must be open source, free for commercial use and compatible with MPL-2.0 distribution. Preserve third-party provenance/notices. Add an automated dependency-license inventory/check suitable for CI. Stop and report any unknown, proprietary, commercial-use-restricted or materially incompatible dependency rather than silently adding it.

New original source-code files must carry the repository's MPL-2.0 source-file notice policy.

## In scope

### Monorepo/tooling foundation

Create the approved monorepo structure with separate web/server apps and bounded packages equivalent to:

- domain;
- contracts;
- device core;
- adapter API;
- synthetic adapter;
- persistence;
- telemetry;
- discovery;
- secrets;
- observability;
- test support.

Exact package names may change only for clarity; responsibilities/boundaries may not be collapsed without approval.

### Documentation/context foundation

- Every significant package/module gets a concise local `README.md` describing purpose, contracts, owned data, consumed/emitted events, dependencies, invariants, extension points, tests and forbidden dependencies.
- Add `docs/architecture/MODULE_MAP.md` as a compact dependency/navigation map.
- Public/extension-facing TypeScript contracts receive useful structured source documentation for IDE hover/signature help.
- Configure TypeDoc and generate reference documentation through a documented command.

### Backend

- Fastify server with versioned read-only REST API.
- SSE endpoint for live normalized synthetic events.
- Health/diagnostics endpoint covering at least server, database/storage, simulator and event pipeline.
- Structured logging with request/device/adapter/event identifiers where applicable and strict secret exclusion.

### Persistence

- SQLite database using `better-sqlite3` and Kysely.
- Explicit initial migrations.
- Foreign keys enabled.
- WAL and sensible connection/busy behavior where appropriate and validated.
- Persistence survives restart.
- Model enough durable/raw data separation to support the approved tiered retention architecture without implementing the full later analytics/cleanup product.

### Domain/capability model

Implement normalized read-only contracts that distinguish at least:

- supported / unsupported / unknown;
- readable capability;
- live / stale / unavailable / degraded quality/freshness;
- source/adapter identity.

Do not add printer write/control methods to the read-only adapter contract.

### Synthetic adapter

Create deterministic synthetic fixtures/scenarios including:

1. A1 Mini-shaped device with one capability set;
2. X2D-shaped device with a meaningfully different capability set;
3. deterministic transitions covering connected, printing, stale, unavailable, reconnecting and recovered.

Synthetic mode must remain reusable for later regression testing.

### Frontend/PWA

- React/Vite responsive application shell.
- Home/Fleet view showing multiple synthetic devices.
- Minimal device-detail view driven by capabilities rather than model-specific branching.
- Live SSE updates.
- Explicit freshness/stale/unavailable/reconnecting presentation.
- Desktop/tablet/mobile responsive behavior.
- PWA manifest/service-worker/static shell and explicit offline indication; no queued writes.

### Network/service-discovery foundation

Implement only the dashboard-server local-discovery/naming foundation that can be safely developed without real printers, where practical. The intended production UX is a stable LAN-local name (for example mDNS-based) rather than manual IP/port. Do not access or scan for real printers in M1.

### Packaging

- Documented direct local development/run path.
- Dockerfile(s) and Docker Compose path for the same prototype.
- Persistent application data mounted outside ephemeral containers.

### Testing

- Vitest unit tests.
- Integration tests with real temporary SQLite databases.
- Shared adapter contract test suite used by the synthetic adapter.
- Playwright E2E tests for the core prototype.

## Explicit non-goals / prohibited work

Do not implement or access:

- real Bambu printers;
- real LAN Access Codes;
- Bambu MQTT/device protocol code;
- Developer Mode;
- Fleet Hub;
- Bambu cloud authentication/API/client impersonation;
- cameras/media;
- AMS real integration;
- printer controls/write commands;
- Home Assistant/Alexa/Google Home/Daisy integration;
- printer file management;
- maintenance product UI;
- notifications product UI;
- full backup/recovery/update system;
- full production TLS/certificate distribution;
- multi-user/RBAC.

Do not use real/private printer dumps, screenshots, logs, identifiers or credentials in tests/fixtures.

## Security constraints

- M1 dashboard is read-only and does not implement application login.
- LAN reachability/read-access trade-off must be documented.
- HTTP is permitted for this read-only prototype; architecture must not block later HTTPS.
- No write/control API may be added.
- Secrets module boundary may be scaffolded/tested only with synthetic secrets. No real printer credential may be used.
- Never weaken certificate validation or vendor security controls.

## Automated validation required

At minimum, CI/local validation must prove:

- TypeScript build/typecheck succeeds;
- lint/format policy succeeds if introduced;
- unit tests pass;
- SQLite migration tests pass from an empty database;
- adapter contract tests pass for the synthetic adapter;
- server API/integration tests pass;
- Playwright core E2E tests pass;
- TypeDoc generation succeeds;
- dependency-license inventory/check succeeds;
- Docker image/Compose configuration builds successfully where CI supports it.

## Hands-on prototype validation required

Document reproducible evidence for:

1. fresh checkout local run;
2. Docker Compose run;
3. Home/Fleet displays A1 Mini-shaped and X2D-shaped synthetic devices;
4. their capability sets visibly differ without model-name UI branching;
5. live printing telemetry updates reach the UI;
6. stale state appears explicitly;
7. unavailable state appears explicitly;
8. reconnecting/recovered transitions work;
9. SQLite-backed configuration/state required by M1 survives restart;
10. health/diagnostics reflect server/database/simulator/event-pipeline state;
11. responsive desktop/tablet/mobile views are usable;
12. PWA shell installs/behaves as supported by the validation browser and clearly indicates offline state;
13. generated TypeDoc output exists and IDE-oriented public contract docs are meaningful;
14. module README/context files and `MODULE_MAP.md` allow a reviewer to understand/change one package without whole-repository reconstruction;
15. CPU, memory and startup observations are recorded for direct and/or Docker run as practical;
16. dependency-license report contains no unresolved incompatible/unknown production dependency.

## Pull request requirements

Once authorized:

- create an M1 feature/milestone branch from current `main`;
- open a draft PR before substantial implementation;
- keep scope to this contract;
- include architecture/spec documentation updates needed to reflect actual implementation;
- include automated-test evidence and hands-on validation instructions/results;
- preserve MPL-2.0 notices and third-party provenance;
- do not merge;
- request review when the prototype and evidence are complete.

## Required project-control updates before reporting M1 implementation complete

Update as applicable:

- `project-control/status/CURRENT_STATUS.md`;
- `project-control/handoffs/CHATGPT_HANDOVER.md`;
- relevant architecture/spec files if implementation exposed a non-material clarification;
- `project-control/risks/RISK_REGISTER.md` for new material risks;
- `project-control/decisions/DECISION_LOG.md` only for Product Owner-approved material decisions;
- milestone feedback/validation evidence under `project-control/feedback/` or the established validation location.

Do not change product scope or architecture silently to make tests pass.

## Stop conditions

Stop and report rather than improvising if work requires:

- changing the approved technology stack or package boundaries materially;
- adding a significant infrastructure/service dependency;
- introducing a dependency with unclear/incompatible commercial/MPL licensing;
- real-printer access;
- any Bambu credential/protocol/interface implementation;
- application authentication or write/control features;
- weakening security/TLS/vendor controls;
- schema/API contract changes beyond the M1 approved prototype that would constrain later milestones materially;
- use of sensitive or production-derived data;
- later-milestone scope.

## M1 completion standard

Implementation completion is **not** milestone approval. Codex should report the branch/PR, tests, prototype run instructions, validation evidence, documentation/license evidence, known limitations and any unresolved risks. The Product Owner retains the M1 acceptance and merge decision.
