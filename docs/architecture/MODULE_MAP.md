# Module Map

This map is the first stop for scoped M1 maintenance. Read the affected package README and public contracts before widening context.

| Area | Path | Depends on | Purpose |
|---|---|---|---|
| Web app | `apps/web` | `@bpd/contracts` | React/Vite PWA shell for fleet and device views. |
| Server app | `apps/server` | contracts, device core, persistence, simulator, discovery, observability | Fastify REST/SSE boundary and static production host. |
| Domain | `packages/domain` | none | Normalized read-only device, capability, freshness and state types. |
| Contracts | `packages/contracts` | domain | Versioned API/SSE DTO contracts and mappers. |
| Adapter API | `packages/adapter-api` | domain | Read-only adapter interface for synthetic and future real adapters. |
| Synthetic adapter | `packages/adapter-synthetic` | adapter API, domain | Permanent deterministic A1 Mini-shaped and X2D-shaped scenarios. |
| Device core | `packages/device-core` | adapter API, domain, persistence, telemetry, observability | Server-owned live state, event fan-out, persistence reconciliation. |
| Persistence | `packages/persistence` | domain, observability | SQLite/Kysely migrations, repositories, raw telemetry/history split. |
| Telemetry | `packages/telemetry` | domain | Freshness summaries and retention policy helpers. |
| Discovery | `packages/discovery` | none | Dashboard local-name/discovery descriptor and manual fallback. |
| Secrets | `packages/secrets` | none | Synthetic-safe secret-store boundary and encrypted-at-rest direction. |
| Observability | `packages/observability` | none | Structured redacting logs, request identifiers and diagnostics helpers. |
| Test support | `packages/test-support` | persistence | Temporary database/test utilities. |

M1 excludes real printer access. Future Bambu adapters must enter through `packages/adapter-api` and must not be imported by the web app.
