# Next Codex Task

## Status
QUEUED — Product Owner authorized M1 implementation on 2026-08-23 after technical-lead architecture review.

## Milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## Objective
Implement the approved M1 architecture as a runnable, testable, heavily documented synthetic dashboard prototype that proves the modular application structure, normalized read-only capability/adapter contracts, server-owned freshness/live-state model, SQLite persistence, REST/SSE browser boundary, PWA shell, Docker packaging, dependency-license controls, and test/documentation toolchain required for M2 real-printer validation.

## Authoritative architecture and review
Read these first and treat them as binding:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/specs/M1_ARCHITECTURE.md`
3. `project-control/reviews/M1_ARCHITECTURE_REVIEW.md`
4. `project-control/specs/V1_FEATURE_SCOPE.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
7. `project-control/specs/MILESTONE_PLAN.md`
8. `project-control/decisions/DECISION_LOG.md` — focus on DEC-006 through DEC-016 as relevant
9. `project-control/risks/RISK_REGISTER.md`
10. `CONTRIBUTING.md`, `LICENSE`, `NOTICE`, `TRADEMARKS.md`

Do not recursively read unrelated repository content unless a referenced contract/file is required for this task. Follow module-local documentation and narrow-context development rules.

## Approved technology
Use exactly the approved baseline unless a blocking incompatibility is discovered:

- Node.js 24 LTS
- TypeScript
- React + Vite
- Fastify
- SQLite via `better-sqlite3`
- Kysely for typed SQL and migrations
- npm workspaces + TypeScript project references
- Vitest
- Playwright
- TypeDoc + structured TypeScript documentation comments
- REST + Server-Sent Events
- direct local Node/Vite development execution
- Docker/Docker Compose production packaging

Do not substitute Next.js, NestJS, Prisma, PostgreSQL, Nx, Turborepo, Redux, or another major architectural alternative without stopping and requesting Product Owner approval.

## Dependency and licensing rule
All runtime, framework, library, build, and core tooling dependencies must be open source, free for commercial use, and compatible with MPL-2.0 distribution. Preserve third-party provenance/notices. Add an automated dependency-license inventory/check suitable for CI. Stop and report any dependency with unknown, proprietary, commercial-use-restricted, or materially incompatible licensing rather than silently adding it.

All new original source files must follow the repository MPL-2.0 source-file notice policy.

## Required implementation scope

### 1. Monorepo/tooling foundation
Create a modular monorepo with separate web/server apps and bounded packages equivalent to:

- domain
- contracts
- device-core
- adapter-api
- adapter-synthetic
- persistence
- telemetry
- discovery
- secrets
- observability
- test-support

Exact package names may change only for clarity. Do not collapse responsibilities or weaken boundaries without approval.

### 2. Documentation/context foundation
For every significant package/module:

- add a concise local `README.md` covering purpose, responsibilities, public contracts, owned data, consumed/emitted events, invariants, dependencies, extension points, tests, and forbidden dependencies;
- add structured source documentation to public/extension-facing TypeScript APIs for useful IDE hover/signature help;
- configure TypeDoc and a documented generation command;
- add `docs/architecture/MODULE_MAP.md` as a compact dependency/navigation map.

### 3. Backend
Implement:

- Fastify server;
- versioned read-only REST API;
- SSE endpoint for live normalized synthetic device events;
- health/diagnostics endpoint covering at least server, database/storage, simulator, and event pipeline;
- structured logging with stable request/device/adapter/event identifiers where applicable;
- strict exclusion of secrets from logs and diagnostics.

### 4. Persistence
Implement:

- SQLite through `better-sqlite3` + Kysely;
- explicit initial migrations;
- foreign keys enabled;
- WAL mode and sensible busy/connection behavior where appropriate and verified;
- restart persistence;
- enough separation between durable operational history and raw/high-frequency telemetry to preserve the approved retention architecture, without building the later full analytics/cleanup product.

### 5. Domain/capability model
Implement normalized read-only contracts that distinguish at least:

- support: supported / unsupported / unknown;
- access: readable;
- freshness/quality: live / stale / unavailable / degraded;
- source/adapter identity.

Do not add printer write/control methods to the read-only adapter contract.

### 6. Synthetic adapter
Create permanent deterministic synthetic fixtures/scenarios including:

- an A1 Mini-shaped device;
- an X2D-shaped device with a meaningfully different capability set;
- deterministic transitions covering connected, printing, stale, unavailable, reconnecting, and recovered.

The synthetic adapter must implement the same adapter contract intended for later real adapters.

### 7. Frontend/PWA
Implement:

- React/Vite responsive application shell;
- Home/Fleet view with multiple synthetic devices;
- minimal capability-driven device-detail view with no model-name UI branching for feature behavior;
- live SSE updates;
- explicit stale/unavailable/reconnecting/recovered presentation;
- desktop/tablet/mobile responsiveness;
- PWA manifest/service-worker/static-shell foundation;
- explicit offline indication;
- no queued writes.

PWA/service-worker install/offline validation must be performed in a secure context such as localhost or HTTPS. Do not assume an arbitrary plain-HTTP LAN origin can register a service worker.

### 8. Dashboard-server discovery foundation
Implement only the dashboard-server local naming/discovery foundation that is safe without real printers. The target UX is a stable LAN-local name such as `bambu-dashboard.local`, but cross-platform mDNS behavior is not an M1 completion blocker where host/network support differs. Record feasibility/limitations and retain manual IP/port as diagnostics fallback.

Do not scan for or access real printers in M1.

### 9. Packaging
Provide:

- documented direct local development/run path;
- Dockerfile(s) and Docker Compose path for the same prototype;
- persistent application data mounted outside ephemeral containers.

Docker is packaging, not an internal architectural dependency.

## Explicitly prohibited / out of scope
Do not implement or access:

- real Bambu printers;
- real LAN Access Codes;
- Bambu MQTT/device protocol code;
- Developer Mode;
- Fleet Hub;
- Bambu cloud auth/API/client impersonation;
- printer write/control commands;
- cameras/media;
- real AMS integration;
- Home Assistant/Alexa/Google Home/Daisy integration;
- printer file management;
- maintenance product UI;
- notifications product UI;
- full backup/recovery/update system;
- full production TLS/certificate distribution;
- multi-user/RBAC.

Do not use real/private printer dumps, screenshots, logs, identifiers, or credentials in fixtures/tests.

## Security constraints

- M1 dashboard is read-only and has no interactive application login.
- LAN reachability means read access to dashboard-exposed information; document that trade-off.
- HTTP is permitted for this read-only prototype, but architecture must remain HTTPS-capable.
- No write/control API may be added.
- Secrets module may be scaffolded/tested only with synthetic secrets.
- Never weaken certificate validation or vendor security controls.

## Automated validation required
At minimum prove:

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

## Hands-on validation required
Document reproducible evidence for:

1. fresh checkout local run;
2. Docker Compose run;
3. Home/Fleet displays A1 Mini-shaped and X2D-shaped synthetic devices;
4. capability sets visibly differ without model-specific feature branching;
5. live synthetic printing telemetry reaches the UI;
6. stale state appears explicitly;
7. unavailable state appears explicitly;
8. reconnecting/recovered transitions work;
9. SQLite-backed M1 state/configuration survives restart;
10. health/diagnostics reflect server/database/simulator/event-pipeline state;
11. desktop/tablet/mobile views are usable;
12. PWA shell/install/offline behavior is validated in a supported secure context and clearly indicates offline state;
13. generated TypeDoc output exists and public contract docs are meaningful;
14. module README files and `MODULE_MAP.md` allow scoped maintenance without whole-repository reconstruction;
15. CPU, memory, and startup observations are recorded for direct and/or Docker run as practical;
16. dependency-license report has no unresolved incompatible/unknown production dependency.

## Branch and pull request requirements

- Create an M1 feature/milestone branch from current `main`.
- Open a draft PR before substantial implementation.
- Keep implementation within this contract.
- Include architecture/spec documentation updates needed to reflect actual implementation.
- Include automated-test evidence and hands-on validation instructions/results.
- Preserve MPL-2.0 notices and third-party provenance.
- Do not merge the PR.
- Request review only when the prototype and evidence are complete.

## Required project-control reconciliation
Before reporting M1 implementation complete, update as applicable:

- `project-control/status/CURRENT_STATUS.md`;
- `project-control/handoffs/CHATGPT_HANDOVER.md`;
- relevant architecture/spec files for non-material implementation clarifications;
- `project-control/risks/RISK_REGISTER.md` for new material risks;
- `project-control/decisions/DECISION_LOG.md` only for Product Owner-approved material decisions;
- milestone feedback/validation evidence in the established project-control location.

Do not change product scope or architecture silently to make tests pass.

## Stop conditions
Stop and report instead of improvising if implementation requires:

- a material change to the approved technology stack or package boundaries;
- a significant new infrastructure/service dependency;
- a dependency with unclear/incompatible commercial or MPL licensing;
- any real-printer access;
- Bambu credential/protocol/interface implementation;
- application authentication or write/control features;
- weakening security/TLS/vendor controls;
- API/schema changes beyond M1 that would materially constrain later milestones;
- sensitive or production-derived data;
- later-milestone scope.

## Completion and authority
Codex implementation completion is not milestone acceptance and is not merge authorization. Report the branch/PR, tests, prototype run instructions, validation evidence, documentation/license evidence, known limitations, and unresolved risks. The Product Owner retains final milestone acceptance and merge authority.
