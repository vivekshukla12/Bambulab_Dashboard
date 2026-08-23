# M1 Architecture Technical Lead Review

**Date:** 2026-08-23  
**Reviewer role:** Technical lead / architect  
**Disposition:** **APPROVE WITH NON-BLOCKING CLARIFICATIONS**  
**Implementation authorization:** This review does not itself change `prompts/codex/NEXT_PROMPT.md` from HOLD to QUEUED.

## Review scope

The approved M1 architecture and proposed Codex execution contract were reviewed against:

- PRD v1.0 and the approved `V1_FEATURE_SCOPE.md` feasibility overlay;
- DEC-006 through DEC-016;
- the read-only-first V1 direction and M2 dual-device GO/NO-GO gate;
- architecture and security/privacy guardrails;
- modularity/documentation/token-efficiency requirements;
- current M1 milestone boundaries;
- deployment, persistence, testing, licensing and browser constraints.

## Conclusion

The M1 architecture is technically coherent and sufficiently complete to implement the M1 prototype. It establishes the correct separation between browser/UI, server-owned state, persistence, normalized device capabilities, adapter boundaries and future real Bambu integration. The chosen TypeScript/Node/React/Fastify/SQLite stack is appropriate for a lightweight local-first dashboard and supports the required documentation, IDE discoverability, automated testing and modular monorepo strategy.

No material architecture redesign is required before M1 implementation.

## Required clarification 1 — browser dashboard versus integration authentication

The approved V1 dashboard itself has no interactive login while it remains read-only and LAN-only. This is an explicit deviation from the original PRD authentication baseline and must remain traceable through the V1 scope overlay and security guardrails.

This must **not** be interpreted as eliminating authentication for future machine-to-machine integrations. When Home Assistant, MCP, scripts, webhooks, Daisy or other external consumers are introduced, they require a separately governed integration-identity/authentication boundary. Any future printer write/control capability requires HTTPS plus strong authenticated authorization before exposure.

`V1_FEATURE_SCOPE.md` was reconciled during this review to remove the stale statement that V1 requires interactive application authentication and to distinguish browser read access from future authenticated integration access.

## Required clarification 2 — PWA secure-context behavior

M1 may permit plain HTTP for a read-only LAN dashboard, but browser service workers, installability and related PWA capabilities must not be assumed to work from an arbitrary LAN HTTP origin.

M1 validation must therefore:

- validate the PWA/service-worker behavior using a browser-supported secure context, such as localhost during development or HTTPS where configured;
- separately validate that the read-only dashboard itself remains usable over permitted LAN HTTP;
- document any browser/platform limitation clearly;
- avoid treating lack of service-worker support on insecure LAN HTTP as a defect in the application.

The architecture must remain HTTPS-capable so later production PWA behavior and any sensitive/write capability can operate under an appropriate secure context.

## Required clarification 3 — mDNS/local hostname is best-effort foundation in M1

The Product Owner requirement is that users should not normally need to remember a server IP and arbitrary port. A stable LAN-local name such as `bambu-dashboard.local` remains the intended user experience.

However, mDNS behavior depends on operating system, network segmentation, container networking and local resolver support. M1 should prove or scaffold the discovery/naming approach where practical, but M1 completion must not depend on universally resolving `.local` across every environment.

Requirements for M1:

- keep manual IP/port access as a documented diagnostics fallback;
- do not perform arbitrary browser-side LAN scanning;
- prefer server/host-side standard service discovery;
- record platform limitations discovered during validation;
- defer environment-specific packaging refinements where they do not block the core M1 prototype.

## Persistence review

SQLite + `better-sqlite3` + Kysely is approved for M1/V1. M1 should use explicit migrations, foreign keys, WAL where validated, transactions, indexes and temporary real SQLite databases for integration tests. The persistence boundary must remain clean enough that domain/UI code does not rely on SQLite implementation details, but PostgreSQL portability is not a V1 requirement.

The two-tier retention model is appropriate: long-lived operational/maintenance aggregates and job history, plus configurable 1–365 day retention for high-volume raw telemetry with 30 days default.

## Security review

The read-only adapter contract is a strong design choice because it prevents control methods from appearing accidentally in the primary integration boundary. Any future control interface must be separately introduced and approved.

Printer LAN Access Codes remain secrets even without dashboard login. The remember/do-not-remember policy is technically sound provided remembered values go only through the secrets boundary and non-remembered values are never intentionally persisted.

M1 must not use real printer credentials or real devices. Synthetic secrets may be used to exercise the secrets abstraction.

## Documentation/modularity review

The module-local README requirement, TypeDoc/TSDoc source documentation and `MODULE_MAP.md` are sufficient for the intended human/IDE/Codex maintenance model. Codex tasks should continue to specify minimum required context rather than encouraging whole-repository rereads.

## Testing review

The proposed combination of Vitest, temporary SQLite integration tests, shared adapter contract tests and Playwright E2E tests is sufficient for M1. Acceptance evidence should include local run, Docker run, synthetic capability differences, SSE updates, stale/unavailable/reconnect behavior, persistence across restart, health diagnostics, responsive layouts, documentation generation, dependency-license checks and basic resource observations.

PWA validation must follow the secure-context clarification above.

## Licensing review

The architecture's dependency policy is correct: every production/runtime/build dependency must be open source, commercially usable and compatible with MPL-2.0 distribution, with automated license inventory/checking and retained third-party provenance. Unknown or incompatible licensing remains a stop condition.

## Scope review

M1 correctly excludes real-printer access, Bambu protocol/MQTT work, Developer Mode, Fleet Hub, Bambu cloud impersonation, AMS/cameras, printer controls, Home Assistant, Alexa, Google Home, Daisy, maintenance product UI, notifications and later-milestone features.

M2 remains the critical hardware GO/NO-GO gate and must validate useful read-only monitoring on both A1 Mini and X2D before substantial M3+ investment.

## Architect recommendation

**The M1 architecture and implementation proposal are approved for queueing once the Product Owner explicitly authorizes implementation.**

No additional Product Owner architecture interview is required before M1. Non-material implementation details within the approved module and dependency constraints may be decided by the technical lead/Codex during implementation; material deviations remain stop conditions requiring Product Owner approval.
