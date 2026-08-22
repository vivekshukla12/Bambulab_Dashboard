# Architecture Guardrails

Status: **M0 baseline; technology selection intentionally deferred**

## Core principles

1. **Local first.** Core monitoring and management should remain on the LAN wherever supported; cloud-dependent paths must be explicit.
2. **Capability driven.** Model devices generically by discovered/supported capabilities rather than hard-coding behavior per printer model.
3. **Adapter boundary.** Device/cloud protocol concerns must be isolated behind explicit adapters so domain logic, UI, audit, and integrations do not depend directly on vendor-specific transport details.
4. **Server-owned live state.** Background monitoring continues without an open browser. The server is responsible for connection state, freshness, reconciliation, and safe reconnection.
5. **API/event boundary.** Browser clients and integrations consume explicit local APIs/events. External/AI-generated parameters are untrusted and validated before any control operation.
6. **Safe degradation.** Unsupported capabilities are reported clearly; absent or stale telemetry is never fabricated.
7. **Portable deployment.** Avoid unnecessary host coupling so the service can move from an always-on mini PC to future container/NAS hosting.
8. **PWA offline is read-only.** No queued writes/actions offline; sensitive credentials, full audit logs, camera media, and control secrets are excluded from offline storage by default.
9. **Auditable controls.** High-impact device, camera, file, integration, configuration, authentication, and security actions produce structured audit events.
10. **Lawful interoperability.** Vendor/device interfaces must pass applicable technical, security, contractual, and legal feasibility gates; interface reachability does not itself authorize use.
11. **Minimal dependency surface.** Prefer maintained, commercially safe open-source dependencies and native platform capabilities. Significant infrastructure dependencies require explicit architecture justification and product-owner approval.

## Deployment baseline

- **Development:** exact OS/container workflow is pending M1 architecture decision.
- **Staging:** separate deployment; no real-printer access by default; explicit opt-in required.
- **Production V1:** always-on local LAN server/mini PC, LAN-only application access, HTTPS required.
- **Future:** portable to container/NAS hosting without wholesale redesign.

## Deliberately unresolved in M0

- Application framework/language.
- Frontend framework.
- Datastore and migration technology.
- Process/container topology.
- Bambu LAN/cloud interface selection.
- Camera transport/recording strategy.
- Authentication/session implementation.
- Secret/key storage and machine-independent backup recovery.
- Update packaging/signing/rollback mechanism.
- LAN certificate issuance/trust strategy.

These are M1 feasibility/architecture decisions, not implementation assumptions.
