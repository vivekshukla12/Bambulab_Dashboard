# Architecture Guardrails

Status: **M1 technology and structural baseline approved; implementation still gated**

## Core principles

1. **Local first.** Core monitoring and management remain on the LAN wherever supported; cloud-dependent paths must be explicit.
2. **Capability driven.** Model devices generically by discovered/supported capabilities rather than hard-coding behavior per printer model.
3. **Adapter boundary.** Device/vendor protocol concerns are isolated behind explicit adapters so domain logic, UI, audit and integrations do not depend directly on vendor transport details.
4. **Server-owned live state.** Background monitoring continues without an open browser. The server owns connection state, freshness, reconciliation, persistence and safe reconnection.
5. **API/event boundary.** Browser clients and integrations consume explicit normalized local APIs/events. Browser code must never communicate directly with printers.
6. **Safe degradation.** Unsupported capabilities are reported clearly; absent or stale telemetry is never fabricated.
7. **Portable deployment.** Direct local development remains supported; production packaging supports Docker/Docker Compose without making containers part of the internal architecture.
8. **PWA offline is read-only.** No queued writes/actions offline; credentials and sensitive data are excluded from offline storage.
9. **Read/write separation.** The current printer adapter contract is read-only. Future printer controls require a separately governed control interface/capability and Product Owner approval.
10. **Lawful interoperability.** Vendor/device interfaces must pass applicable technical, security, contractual and legal feasibility gates; interface reachability does not itself authorize use.
11. **Minimal dependency surface.** Production dependencies must be maintained, open source, free for commercial use and compatible with MPL-2.0 distribution. Unknown/incompatible licensing is a stop condition.
12. **Documentation-first modularity.** Significant modules have bounded responsibilities, local README/context files, typed/documented public contracts and generated reference docs where applicable. Routine Codex changes should require only scoped module context.

## Approved M1 technology baseline

- Runtime: Node.js 24 LTS.
- Language: TypeScript.
- Frontend: React + Vite.
- Backend HTTP/API shell: Fastify.
- Datastore: SQLite via `better-sqlite3`.
- Typed SQL/migrations: Kysely.
- Monorepo: npm workspaces plus TypeScript project references.
- Unit/integration testing: Vitest.
- Browser E2E: Playwright.
- Source/API docs: TypeDoc plus structured TypeScript documentation comments.
- Production packaging: Docker/Docker Compose.
- Live browser updates: Server-Sent Events initially; REST for snapshots/config/history.

See `project-control/specs/M1_ARCHITECTURE.md` for the complete approved baseline.

## Repository/module baseline

The M1 implementation should use a monorepo with separate `apps/web` and `apps/server` concerns plus bounded packages for domain/contracts/device core/adapter API/synthetic adapter/persistence/telemetry/discovery/secrets/observability/test support or equivalent responsibilities.

Vendor-specific payloads and protocol details stop at adapter boundaries. React, Fastify and SQLite implementation details must not leak into the core domain model.

## Deployment baseline

- **Development:** direct local Node/Vite run from a normal checkout.
- **Staging/test:** separate deployment; synthetic data by default; no real-printer access unless separately authorized.
- **Production V1:** always-on local LAN server/mini PC; Docker/Docker Compose is the recommended packaging path, while direct service execution remains architecturally valid.
- **Network access:** LAN-accessible read-only dashboard may run without application login under the approved V1 model; a local-only/interface-restricted binding option must be available where feasible.
- **Discovery:** production packaging should support a stable LAN-local service name via mDNS or equivalent so manual server IP/port entry is not the normal user experience.
- **HTTP/HTTPS:** initial read-only LAN deployment may use HTTP; architecture remains HTTPS-capable; HTTPS plus strong authentication is mandatory before any write/control or comparable sensitive capability.

## Persistence baseline

SQLite is the V1 datastore. Use explicit migrations and native SQLite strengths such as transactions, indexes, foreign keys and WAL where appropriate. Persistence remains behind explicit contracts so domain/UI code is not coupled to raw SQLite behavior.

Raw/high-frequency telemetry defaults to 30-day retention and is user-configurable from 1 through 365 days. Long-term maintenance/analytics data and approved aggregates are durable unless explicitly deleted/reset.

## Printer integration baseline

- M1: deterministic synthetic adapter only.
- M2 target: separately authorized real Bambu read-only adapter for both A1 Mini and X2D.
- Developer Mode is excluded.
- Fleet Hub dependency is excluded from the current consumer path.
- Bambu cloud-client impersonation is prohibited.
- Future real onboarding direction is LAN discovery plus user-supplied LAN Access Code with manual fallback.

## Deliberately deferred beyond the approved M1 baseline

- Real Bambu protocol implementation and real printer access (M2 authorization required).
- Camera transport/recording strategy.
- Home Assistant/Alexa/Google Home/Daisy implementation.
- Printer controls/write operations.
- Full backup key hierarchy and machine-independent secret recovery.
- Update signing/rollback implementation.
- Mandatory production TLS/certificate distribution strategy for any future sensitive/write-enabled release.

These deferred items must not be filled by implementation assumption.
