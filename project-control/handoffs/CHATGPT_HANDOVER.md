# Bambu Printer Dashboard ChatGPT Handover

## Product purpose
Local-first responsive browser/PWA operational dashboard for monitoring compatible Bambu Lab printers and related devices, with multi-device visibility, real read-only telemetry, history, filament/maintenance workflows, notifications, audit/history, and a secure local API/event layer. Privileged printer controls are conditional/future rather than a current V1 promise.

## Repository / licensing
Public repository: `vivekshukla12/Bambulab_Dashboard`. Source code license: MPL-2.0. New original source files use the MPL source-file notice policy in `CONTRIBUTING.md` (normally `SPDX-License-Identifier: MPL-2.0`). Preserve third-party license/provenance. `TRADEMARKS.md` and `NOTICE` define the independent/unofficial relationship and third-party trademark/IP posture.

## Delivery model
M0 is complete. Every major product milestone from M1 onward must deliver a runnable/testable prototype. Automated tests and hands-on Product Owner validation are required; feedback is captured under `project-control/feedback/`, triaged, and reconciled with the roadmap before the next milestone is authorized.

M2 is now a hard real-device GO/NO-GO gate: useful, stable read-only monitoring must be proven on both A1 Mini and X2D without Developer Mode or Fleet Hub before substantial downstream feature investment.

## Current V1 direction
The PRD remains the requirement-ID baseline. `project-control/specs/V1_FEATURE_SCOPE.md` is the authoritative current V1 feature-boundary overlay.

V1 centers on:
- real local read-only multi-printer monitoring;
- explicit freshness/stale/offline/reconnect semantics;
- observed telemetry and print-session history;
- customizable fleet/device dashboards;
- local filament/spool and maintenance domains;
- alerts/notifications/search/audit;
- secure documented local API/events;
- Home Assistant integration, with Alexa/Google Home potentially bridged through Home Assistant after validation;
- MCP/scripts/AI clients;
- Daisy as a future first-party integration consumer through stable documented local API/events, with no early runtime dependency.

Current V1 does not require or promise Developer Mode, Fleet Hub, Bambu partner/private authorization, cloud-client impersonation, broad direct printer controls, or unvalidated camera/printer-storage functionality.

## Architecture
M0 established local-first, capability-driven vendor adapters, server-owned freshness/live state, explicit API/event boundaries, safe degradation, portable deployment, read-only offline PWA, auditable controls, and minimal dependency surface. DEC-010 additionally requires heavy structured developer documentation, IDE discoverability/generated references, strong module/package boundaries and token-efficient scoped repository context.

Exact technology stack, datastore, deployment packaging, auth/TLS implementation, documentation toolchain and adapter contract details remain unresolved M1 decisions.

## Security boundaries
LAN-only V1 production access; HTTPS; local application authentication required; strong API authentication; explicit separation of read versus control capabilities; protect secrets at rest and in backups; never log/commit credentials; stale/offline state is not live; dedicated threat model before production. Do not circumvent vendor/device security or access controls to obtain functionality.

## Privacy/data rules
Synthetic fixtures only by default. Never commit customer/production-derived sensitive data, credentials/tokens, raw private live API dumps, production logs, private screenshots/media, or real identifiers. Real-device testing requires explicit milestone authorization and controlled local evidence handling.

## Bambu Lab / legal/interface posture
Independent third-party interoperability project; no affiliation, sponsorship, authorization, certification, maintenance relationship, or endorsement by Bambu Lab is claimed. Bambu Lab names/marks and other IP remain with their rights holders.

Approved constraints/direction:
- no printer Developer Mode;
- no Fleet Hub dependency/extra hardware path for current V1;
- no Bambu developer-partner/private authorization at this stage;
- no reverse-engineered cloud-client impersonation;
- publicly available read-only printer status paths explicitly left available by Bambu may be evaluated under DEC-006/DEC-012;
- discovering a technical write/control path does not authorize using it.

## Completed milestones
- M0 — Repository and governance foundation.
  - Approved by Product Owner on 2026-08-22.
  - PR #1 merged on 2026-08-22.
  - Verified merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`.

## Current milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design — **PLANNING / HOLD**.

## Current PR / branch
- Branch: `main`
- M1 PR: none yet.
- M1 implementation is not authorized yet.

## Important decisions
- GitHub is authoritative project state.
- PRD v1.0 is the requirements baseline; V1_FEATURE_SCOPE is the current feasibility overlay.
- MPL-2.0 is the repository source-code license with required source-file notice/provenance controls.
- M1+ uses iterative working prototypes with feedback gates.
- Technology stack remains a deliberate M1 decision.
- Heavy structured documentation, modularity, IDE assistance/generated reference docs and token-efficient context boundaries are mandatory (DEC-010).
- Developer Mode and current Fleet Hub/partner-dependent integration are excluded (DEC-011).
- Real read-only printer monitoring is a viable target; write/control remains separately gated (DEC-012).
- Read-only-first V1 plus M2 dual-device GO/NO-GO roadmap adopted (DEC-013).
- Each milestone is separately authorized; planning updates do not automatically authorize implementation.

## Current risks
See `project-control/risks/RISK_REGISTER.md`; highest concerns include real read-only capability/firmware coverage on A1 Mini/X2D, vendor interface authorization/changes, local-vs-cloud capability variance, naming/trademark posture, backup key recovery, audit tamper evidence, LAN TLS/PWA constraints, safe updates, device capability variance, stale telemetry safety, and local API attack surface.

## Explicit V1 non-goals / conditional areas
No slicer; no automatic printer/job assignment or print-farm scheduler; no firmware update management; no built-in general rules engine; no remote internet access; no native mobile app; no multi-user/RBAC; no full analytics suite; no NAS backup target. Direct printer write/control, Developer Mode, Fleet Hub, unvalidated camera/media and arbitrary printer-storage operations remain conditional/future unless explicitly promoted by Product Owner decision after supported-interface validation.

## Next authorized action
Continue M1 architecture planning. Finalize the stack, datastore/migrations, deployment topology, authentication/TLS, documentation toolchain, module/repository boundaries, normalized capability/adapter contracts, threat model direction, and concrete M1 prototype acceptance criteria. Do not begin product implementation until the Product Owner explicitly approves the specific M1 Codex task and `prompts/codex/NEXT_PROMPT.md` is deliberately changed to `QUEUED`.

## Files to read first
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `project-control/specs/PRODUCT_REQUIREMENTS.md`
4. `project-control/specs/V1_FEATURE_SCOPE.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/specs/ITERATIVE_DELIVERY_MODEL.md`
7. `project-control/specs/MILESTONE_PLAN.md`
8. `project-control/specs/ARCHITECTURE_GUARDRAILS.md`
9. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
10. `project-control/decisions/DECISION_LOG.md`
11. `project-control/risks/RISK_REGISTER.md`
12. `TRADEMARKS.md`
13. `prompts/codex/NEXT_PROMPT.md`
