# Bambu Printer Dashboard ChatGPT Handover

## Product purpose
Local-first responsive browser/PWA operational dashboard for monitoring compatible Bambu Lab printers and related devices, with multi-device visibility, real read-only telemetry, history, filament/maintenance workflows, notifications, audit/history, and a secure local API/event layer. Privileged printer controls are conditional/future rather than a current V1 promise.

## Repository / licensing
Public repository: `vivekshukla12/Bambulab_Dashboard`. Source code license: MPL-2.0. New original source files use the MPL source-file notice policy in `CONTRIBUTING.md` (normally `SPDX-License-Identifier: MPL-2.0`). Preserve third-party license/provenance. `TRADEMARKS.md` and `NOTICE` define the independent/unofficial relationship and third-party trademark/IP posture.

All production/core technologies and dependencies must be open source, free for commercial use and compatible with MPL-2.0 distribution. Automated dependency-license inventory/checking is part of the approved M1 architecture.

## Delivery model
M0 is complete. Every major product milestone from M1 onward must deliver a runnable/testable prototype. Automated tests and hands-on Product Owner validation are required; feedback is captured under `project-control/feedback/`, triaged, and reconciled with the roadmap before the next milestone is authorized.

M2 is a hard real-device GO/NO-GO gate: useful, stable read-only monitoring must be proven on both A1 Mini and X2D without Developer Mode or Fleet Hub before substantial downstream feature investment.

## Current V1 direction
The PRD remains the requirement-ID baseline. `project-control/specs/V1_FEATURE_SCOPE.md` is the authoritative current V1 feature-boundary overlay.

V1 centers on:
- real local read-only multi-printer monitoring;
- explicit freshness/stale/offline/reconnect semantics;
- observed telemetry and print-session history;
- customizable fleet/device dashboards;
- local filament/spool and maintenance domains;
- alerts/notifications/search/audit;
- documented local API/events;
- Home Assistant integration, with Alexa/Google Home potentially bridged through Home Assistant after validation;
- MCP/scripts/AI clients;
- Daisy as a future first-party integration consumer through stable documented local API/events, with no early runtime dependency.

Current V1 does not require or promise Developer Mode, Fleet Hub, Bambu partner/private authorization, cloud-client impersonation, broad direct printer controls, or unvalidated camera/printer-storage functionality.

## Approved M1 architecture

Authoritative specification: `project-control/specs/M1_ARCHITECTURE.md`.

Product Owner approved on 2026-08-23:

- Node.js 24 LTS + TypeScript;
- React + Vite frontend;
- Fastify backend;
- SQLite with `better-sqlite3`;
- Kysely typed SQL/migrations;
- npm workspaces + TypeScript project references;
- strict modular monorepo/package boundaries;
- Vitest + Playwright;
- TypeDoc + structured source documentation for IDE hover/generated reference docs;
- REST + Server-Sent Events initially;
- direct local development + Docker/Docker Compose packaging;
- deterministic permanent synthetic adapter/test scenarios;
- server-owned live state/freshness/persistence;
- read-only adapter contract separated from any future control interface;
- no interactive dashboard login for the read-only V1 model;
- LAN-accessible default with local/interface-restricted binding option where feasible;
- stable LAN-local dashboard name/discovery target via mDNS or equivalent;
- HTTP permitted initially for read-only LAN use; HTTPS + strong authentication mandatory before any write/control capability;
- future server-side printer LAN discovery + LAN Access Code onboarding with manual fallback;
- per-printer choice to remember Access Code (encrypted at rest) or keep it process-memory-only until restart;
- durable maintenance/analytics history plus 30-day default raw telemetry configurable from 1–365 days.

See DEC-014, DEC-015 and DEC-016.

## Documentation/modularity rule

DEC-010 remains mandatory. Significant modules must have focused local README/context documentation; public/extension-facing contracts require structured source docs and generated reference support; `docs/architecture/MODULE_MAP.md` is the intended concise navigation map. Codex tasks should direct agents to minimum module-local context rather than whole-repository re-reading.

## Security boundaries

- LAN-only V1 production access.
- Read-only V1 dashboard has no interactive application login; LAN reachability equals read access and must be disclosed clearly.
- HTTP may be used for the initial read-only LAN prototype/release path; architecture must remain HTTPS-capable.
- Any future printer write/control or comparable sensitive feature requires HTTPS + strong authentication and a new Product Owner-approved security decision.
- Printer Access Codes remain sensitive device credentials and are governed through the dedicated secrets boundary.
- Never log/commit credentials or expose them through browser storage/normal API/diagnostics.
- Stale/offline state is not live.
- Do not circumvent vendor/device security or access controls.
- Dedicated threat model/security review remains required before production release.

## Privacy/data rules
Synthetic fixtures only by default. Never commit customer/production-derived sensitive data, credentials/tokens, raw private live API dumps, production logs, private screenshots/media, or real identifiers. Real-device testing requires explicit M2 authorization and controlled local evidence handling.

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

M1 architecture is approved. Implementation is not yet authorized.

## Current PR / branch
- Branch: `main`
- M1 PR: none yet.
- M1 implementation is not authorized yet.

## Current implementation gate

A proposed complete M1 Codex execution contract exists at:

`prompts/codex/M1_IMPLEMENTATION_PROPOSAL.md`

It is a review artifact only. `prompts/codex/NEXT_PROMPT.md` remains `HOLD`. Product Owner must explicitly approve the execution contract before `NEXT_PROMPT.md` is changed to `QUEUED` and before Codex creates an M1 branch/PR or implements code.

## Important decisions
- GitHub is authoritative project state.
- PRD v1.0 is the requirements baseline; V1_FEATURE_SCOPE is the current feasibility overlay.
- MPL-2.0 is the repository source-code license with required source-file notice/provenance controls.
- M1+ uses iterative working prototypes with feedback gates.
- Heavy structured documentation, modularity, IDE assistance/generated reference docs and token-efficient context boundaries are mandatory (DEC-010).
- Developer Mode and current Fleet Hub/partner-dependent integration are excluded (DEC-011).
- Real read-only printer monitoring is a viable target; write/control remains separately gated (DEC-012).
- Read-only-first V1 plus M2 dual-device GO/NO-GO roadmap adopted (DEC-013).
- M1 TypeScript/React/Node/SQLite architecture approved (DEC-014).
- Read-only LAN access/discovery/credential model approved (DEC-015).
- Tiered durable/raw telemetry retention approved (DEC-016).
- Each milestone/task is separately authorized; architecture approval does not automatically authorize implementation.

## Current risks
See `project-control/risks/RISK_REGISTER.md`; highest concerns include real read-only capability/firmware coverage on A1 Mini/X2D, vendor interface authorization/changes, local-vs-cloud capability variance, naming/trademark posture, backup key recovery, audit tamper evidence, LAN TLS/PWA constraints, safe updates, device capability variance, stale telemetry safety, local API attack surface and secure persistent printer credential handling.

## Explicit V1 non-goals / conditional areas
No slicer; no automatic printer/job assignment or print-farm scheduler; no firmware update management; no built-in general rules engine; no remote internet access; no native mobile app; no multi-user/RBAC; no full analytics suite; no NAS backup target. Direct printer write/control, Developer Mode, Fleet Hub, unvalidated camera/media and arbitrary printer-storage operations remain conditional/future unless explicitly promoted by Product Owner decision after supported-interface validation.

## Next authorized action
Review `prompts/codex/M1_IMPLEMENTATION_PROPOSAL.md`. If the Product Owner explicitly approves that execution contract, replace/finalize `prompts/codex/NEXT_PROMPT.md` as `QUEUED`. Only then may Codex create the M1 feature branch/draft PR and implement the approved task.

## Files to read first
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `project-control/specs/M1_ARCHITECTURE.md`
4. `project-control/specs/V1_FEATURE_SCOPE.md`
5. `project-control/specs/PRODUCT_REQUIREMENTS.md`
6. `project-control/specs/OPERATING_MODEL.md`
7. `project-control/specs/MILESTONE_PLAN.md`
8. `project-control/specs/ARCHITECTURE_GUARDRAILS.md`
9. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
10. `project-control/decisions/DECISION_LOG.md`
11. `project-control/risks/RISK_REGISTER.md`
12. `TRADEMARKS.md`
13. `prompts/codex/NEXT_PROMPT.md`
14. `prompts/codex/M1_IMPLEMENTATION_PROPOSAL.md`
