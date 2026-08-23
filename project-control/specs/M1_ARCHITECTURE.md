# M1 Architecture Baseline

**Status:** Approved by Product Owner on 2026-08-23. Implementation remains gated by `prompts/codex/NEXT_PROMPT.md`.

## Purpose

This specification records the approved M1 technology, module, networking, persistence, documentation and security architecture for Bambu Printer Dashboard. It implements DEC-010 through DEC-016 and is subordinate to the PRD, V1 feature-scope overlay, operating model and security/legal guardrails.

## Technology stack

- Runtime: Node.js 24 LTS.
- Language: TypeScript for server, web and shared packages.
- Frontend: React + TypeScript.
- Frontend build/PWA foundation: Vite.
- Backend HTTP/API shell: Fastify.
- Datastore: SQLite.
- SQLite driver: `better-sqlite3`.
- Typed SQL and migrations: Kysely.
- Monorepo/workspaces: npm workspaces plus TypeScript project references; do not add Nx/Turborepo unless later justified and approved.
- Unit/integration tests: Vitest.
- Browser E2E: Playwright.
- Generated source/API documentation: TypeDoc plus structured TSDoc/JSDoc-compatible comments.
- Production packaging: Docker/Docker Compose.
- Development path: direct local Node/Vite execution remains supported.

All production dependencies and core build/runtime tools must be open source, free for commercial use and compatible with MPL-2.0 distribution. Dependency license inventory/checking is part of CI and release review.

## Repository and module structure

Target structure:

```text
apps/
  web/
  server/
packages/
  domain/
  contracts/
  device-core/
  adapter-api/
  adapter-synthetic/
  persistence/
  telemetry/
  discovery/
  secrets/
  observability/
  test-support/
docs/
  architecture/
  modules/
  api/
  development/
  generated/
test-fixtures/synthetic/
project-control/
prompts/
```

Exact package names may be refined during implementation if responsibilities remain equivalent and no material architectural boundary changes.

### Module rules

- Each significant module/package owns one bounded responsibility.
- Vendor-specific payloads, protocol details and credentials stop at adapter boundaries.
- UI code must not import printer/vendor protocol code or access printers directly.
- Domain packages must not depend on React, Fastify or SQLite implementations.
- Persistence is accessed through explicit repository/service contracts; raw SQL/SQLite concerns do not leak into domain or UI code.
- A module must not depend on unrelated packages merely for convenience; shared code is promoted only when a stable cross-module contract genuinely exists.

## Documentation and token-efficiency standard

Every significant module must include a concise local `README.md` containing:

- purpose and responsibility;
- public contracts;
- data owned;
- events consumed/emitted;
- invariants;
- dependencies;
- extension points;
- relevant tests;
- explicit forbidden dependencies/boundaries.

Public and extension-facing TypeScript APIs require structured documentation sufficient for IDE hover, signature help and generated TypeDoc reference output.

Maintain `docs/architecture/MODULE_MAP.md` as a concise dependency/navigation map so Codex and human maintainers can identify the minimum context required for a change. Codex tasks should direct agents to module-local README/contracts/tests first and prohibit unrelated repository-wide reading unless a referenced contract requires it.

Generated reference documentation must not replace architecture/module documentation; both are required where applicable.

## Application topology

```text
Browser/PWA
    |
    | REST + Server-Sent Events
    v
Dashboard server
    |
    +-- domain/device state
    +-- persistence/history
    +-- discovery
    +-- secrets
    +-- diagnostics/observability
    |
    v
Printer adapter boundary
    |
    +-- synthetic adapter (M1)
    +-- future Bambu read-only adapter (M2, separately authorized)
```

The server owns live state, freshness, background monitoring, reconciliation and persistence. Browser clients consume normalized APIs/events only.

## API/event model

M1 uses REST for snapshots/configuration/history and Server-Sent Events for live server-to-browser state updates. WebSockets are not required in M1 because the current V1 product direction is read-only-first and predominantly server-to-client.

Representative routes may include:

```text
GET /api/v1/devices
GET /api/v1/devices/:id
GET /api/v1/devices/:id/state
GET /api/v1/events
GET /api/v1/health
```

Exact route schemas are implementation details, but public contracts must be versioned, typed and documented.

## Printer adapter architecture

M1 defines a read-only adapter contract. Conceptually it supports:

- discovery;
- connection/disconnection;
- capability reporting;
- current normalized state;
- subscription/event delivery;
- health/freshness reporting.

The read-only interface must not expose physical printer control operations. If a supported control path is ever approved, it must be represented by a separately governed control capability/interface rather than silently adding write methods to the read adapter.

The synthetic adapter implements the same contract used by later real adapters and remains a permanent deterministic test fixture.

## Capability and state model

Capabilities must be runtime/discovery-driven rather than model-name branching. At minimum, a capability can distinguish:

- support: supported / unsupported / unknown;
- access: readable, with future controllable/configurable categories separately governed;
- quality/freshness: live / stale / unavailable / degraded;
- source: synthetic or named approved adapter.

Unsupported or absent fields are explicit and never fabricated.

## M1 synthetic scenarios

M1 must include at least:

- A1 Mini-shaped synthetic device with one capability set;
- X2D-shaped synthetic device with a different capability set;
- deterministic connectivity/state transitions covering connected, printing, stale, unavailable, reconnecting and recovered.

Synthetic fixtures must remain safe and deterministic and must not contain real credentials/device dumps.

## Printer discovery and onboarding direction for M2

M1 prepares, but does not access real printers. The approved future onboarding model is:

1. server performs LAN discovery;
2. discovered printers are presented in the UI;
3. user selects a printer;
4. user supplies its LAN Access Code when required;
5. user chooses whether to remember that code;
6. manual IP/serial/access-code setup exists as a fallback where discovery fails.

No Developer Mode, Fleet Hub dependency, private Bambu partner access or Bambu cloud-client impersonation is permitted under the current project decisions.

## Dashboard network discovery

Production packaging should advertise the dashboard on the LAN using a standard local service-discovery/name mechanism such as mDNS so users normally open a stable local hostname rather than entering an IP address and arbitrary port manually. A target user experience is a stable name similar to `bambu-dashboard.local`, subject to implementation/platform feasibility.

Manual IP/port access remains a diagnostics fallback.

## Dashboard access model

The read-only V1 dashboard has no interactive application login. LAN reachability therefore means read access to the information exposed by the dashboard. This trade-off must be stated clearly in setup/admin documentation.

The application must support LAN-accessible operation and a configuration option to restrict binding to localhost/a selected interface where feasible.

Any future write/control capability, sensitive remote exposure, multi-user model or comparable security expansion requires a new Product Owner-approved security decision and must introduce strong authentication before exposure.

## HTTP/HTTPS policy

Initial read-only LAN deployment may use HTTP. The architecture must remain HTTPS-capable from M1 onward. HTTPS plus strong authentication becomes mandatory before any sensitive/write/control capability is introduced.

Certificate validation must never be disabled merely for convenience.

## Printer Access Code policy

When a user supplies a printer LAN Access Code, the UI must ask whether to remember it.

- If remembered: persist only through the secrets module using approved encryption-at-rest protection.
- If not remembered: keep only in process memory for the current server runtime and require re-entry after restart.
- Changing from remember to do-not-remember must delete the persisted encrypted copy.

Access Codes must never be written to normal logs, browser local storage, diagnostics bundles, REST responses, telemetry, source control or plaintext backups.

The current runtime does not claim generic RAM encryption. “Memory only” means never intentionally persisted to disk.

## Secrets boundary

Use a dedicated `secrets` module with a minimal get/set/delete contract. Domain/UI code must not depend on encryption implementation details.

M1 must establish a safe local encrypted-at-rest direction for remembered printer credentials. Full machine-independent disaster-recovery key design remains part of the later backup/recovery milestone and must not be improvised in M1.

## SQLite policy

Use SQLite as the V1 datastore and exploit its native strengths rather than treating it as a temporary toy database.

M1 should configure/test, where appropriate:

- foreign keys enabled;
- WAL mode;
- transactions;
- explicit indexes;
- prepared statements;
- a sensible busy timeout;
- JSON only where a relational representation is not clearer;
- FTS5 later where search requirements justify it.

Use explicit sequential committed migrations. Migrations are immutable after merge. M1 must prove fresh-database-to-current migration behavior.

## Data retention model

Two retention classes are approved:

### Durable operational history

Retain for the lifetime of the dashboard/printer unless the user explicitly deletes/resets it, including data needed for maintenance and long-term analytics such as:

- printer identity/lifecycle metadata;
- job summaries/outcomes;
- cumulative usage/print-hour aggregates;
- maintenance/service records;
- significant faults/events;
- approved long-term analytic summaries.

### Raw/high-frequency telemetry

Default retention: 30 days.

User-configurable retention: 1 through 365 days.

Dense transient samples such as temperatures, progress updates, fan/speed values and similar raw telemetry expire according to this policy. Before expiry, selected compact daily aggregates may be retained where they support maintenance or future analytics.

## Frontend constraints

M1 frontend remains intentionally lean:

- React + React Router;
- native `fetch` and EventSource where sufficient;
- responsive CSS/design tokens;
- no Redux or large state framework unless measured complexity later justifies it;
- no heavy component framework unless separately justified.

PWA foundation includes manifest/service-worker/static asset caching and an explicit offline indicator. Offline behavior remains strictly read-only; no queued mutation system is introduced.

## Testing strategy

- Vitest for unit and integration tests.
- Real temporary SQLite databases for persistence/integration tests.
- Shared adapter contract tests that both synthetic and future real adapters must satisfy.
- Playwright for browser E2E tests.
- Deterministic fixtures under `test-fixtures/synthetic/`.

M1 hands-on/E2E validation must cover at least:

1. fresh local run;
2. Docker Compose run;
3. synthetic fleet visible;
4. live synthetic printing updates;
5. stale transition;
6. unavailable transition;
7. reconnect/recovery;
8. SQLite persistence across restart;
9. health/diagnostic status;
10. responsive desktop/tablet/mobile views;
11. generated developer documentation;
12. dependency-license report.

## Observability

Use structured application logs with stable identifiers such as request ID, device ID, adapter and event type where applicable. Secrets are always excluded.

M1 exposes a health/diagnostics endpoint covering at least server, database/storage, simulator and event pipeline state.

## Packaging

Development must work directly from a normal checkout with documented Node/npm commands.

Production packaging must support Docker/Docker Compose. Application persistent data must be mounted outside ephemeral containers. Docker is a packaging choice, not a requirement for internal application architecture.

## Dependency/licensing governance

Before a dependency becomes a production dependency:

1. identify its license and provenance;
2. confirm open-source status and commercial-use rights;
3. confirm compatibility with MPL-2.0 distribution;
4. record/retain required notices/attribution;
5. include it in automated dependency-license reporting.

Unknown, proprietary, commercial-use-restricted or materially incompatible dependencies are stop conditions pending review.

## M1 implementation scope

M1 implementation is limited to:

- monorepo/tooling foundation;
- modular packages and module documentation;
- Fastify server;
- React/Vite PWA shell;
- SQLite + initial migrations;
- normalized contracts/capability/state model;
- synthetic adapter and deterministic scenarios;
- REST + SSE read path;
- Home/Fleet and minimal device-details UI;
- explicit stale/offline/reconnect semantics;
- health/diagnostics;
- dashboard local-discovery foundation where practical without real printer access;
- TypeDoc/generated docs;
- automated tests;
- Docker/Compose packaging;
- dependency license/provenance checks.

M1 does not include real-printer connection, real access codes, Bambu protocol implementation, Bambu cloud, Developer Mode, Fleet Hub, cameras, AMS implementation, Home Assistant, Alexa, Google Home, Daisy, printer controls, printer file management, maintenance UI or notifications.

## M1 acceptance contract

M1 is not complete until all of the following are demonstrated and recorded:

- fresh clone runs using documented local steps;
- equivalent prototype runs via Docker Compose;
- synthetic A1 Mini-shaped and X2D-shaped devices use differing capability sets;
- live synthetic state updates reach the browser through the approved server API/event boundary;
- connected/printing/stale/unavailable/reconnecting/recovered states are visible and truthful;
- persistence survives server restart;
- responsive desktop/tablet/mobile layouts are validated;
- unit/integration/E2E suites pass;
- generated TypeDoc/reference documentation exists and public contracts provide useful IDE documentation;
- module README/context boundaries exist;
- dependency license report/check passes;
- no secrets or real/private device data are present;
- CPU/memory/startup observations are captured for the prototype;
- project-control and handoff documentation are reconciled;
- Product Owner performs hands-on validation and makes the milestone decision.

## M2 gate prepared by this architecture

M2 is separately authorized and must prove useful read-only monitoring on both an A1 Mini and X2D without Developer Mode, Fleet Hub or cloud-client impersonation. Synthetic evidence cannot satisfy M2. Failure to demonstrate sufficiently useful/reliable real telemetry is a mandatory project reassessment gate before substantial M3+ investment.
