# Bambu Printer Dashboard ChatGPT Handover

## Product purpose
Local-first responsive browser/PWA operational dashboard for monitoring compatible Bambu Lab printers and related devices, with multi-device visibility, real read-only telemetry, history, filament/maintenance workflows, notifications, audit/history, and a documented local API/event layer. Privileged printer controls are conditional/future rather than a current V1 promise.

## Repository / licensing
Public repository: `vivekshukla12/Bambulab_Dashboard`.
Source code license: MPL-2.0.
New original source files use the MPL source-file notice policy in `CONTRIBUTING.md` (normally `SPDX-License-Identifier: MPL-2.0`). Preserve third-party license/provenance. `TRADEMARKS.md` and `NOTICE` define the independent/unofficial relationship and third-party trademark/IP posture.

All production/core technologies and dependencies must be open source, free for commercial use and compatible with MPL-2.0 distribution. Automated dependency-license inventory/checking is part of the architecture.

## Delivery model
M0 and M1 are complete. Every major milestone from M1 onward must deliver a runnable/testable prototype with automated tests plus Product Owner hands-on validation. Feedback is captured under `project-control/feedback/`, triaged, and reconciled before the next milestone is authorized.

M2 is a hard real-device GO/NO-GO gate: useful, stable read-only monitoring must be proven on both A1 Mini and X2D without Developer Mode or Fleet Hub before substantial downstream feature investment.

## Current V1 direction
The PRD remains the requirement-ID baseline. `project-control/specs/V1_FEATURE_SCOPE.md` is the authoritative current V1 feasibility overlay.

V1 centers on:
- real local read-only multi-printer monitoring;
- explicit freshness/stale/offline/reconnect semantics;
- observed telemetry and print-session history;
- customizable fleet/device dashboards;
- local filament/spool and maintenance domains;
- alerts/notifications/search/audit;
- documented local API/events;
- Home Assistant integration later, potentially bridging Alexa/Google Home;
- MCP/scripts/AI clients;
- Daisy as a future first-party integration consumer through stable documented local API/events, with no early runtime dependency.

Current V1 does not require or promise Developer Mode, Fleet Hub, Bambu partner/private authorization, cloud-client impersonation, broad direct printer controls, or unvalidated camera/printer-storage functionality.

## Approved architecture baseline from M1
Authoritative specification: `project-control/specs/M1_ARCHITECTURE.md`.

Approved stack and structure:
- Node.js 24 LTS + TypeScript;
- React + Vite frontend;
- Fastify backend;
- SQLite + `better-sqlite3` + Kysely;
- npm workspaces + TypeScript project references;
- strict modular monorepo/package boundaries;
- Vitest + Playwright;
- TypeDoc + structured source documentation for IDE/generated reference docs;
- REST + Server-Sent Events initially;
- direct local development + Docker/Docker Compose packaging;
- deterministic permanent synthetic adapter/test scenarios;
- server-owned live state/freshness/persistence;
- read-only adapter contract separated from any future control interface;
- no interactive dashboard login for the read-only V1 model;
- LAN-accessible default with local/interface-restricted binding option where feasible;
- stable LAN-local dashboard name/discovery target via mDNS/equivalent where practical;
- HTTP permitted initially for read-only LAN use; HTTPS + strong authentication mandatory before future write/control capability;
- future server-side printer discovery + LAN Access Code onboarding with manual fallback;
- per-printer choice to remember Access Code encrypted at rest or keep it process-memory-only until restart;
- durable maintenance/analytics history plus 30-day default raw telemetry configurable from 1–365 days.

See DEC-014, DEC-015 and DEC-016.

## Documentation/modularity rule
DEC-010 remains mandatory. Significant modules have focused local README/context documentation; public/extension-facing contracts use structured source docs/generated reference support; `docs/architecture/MODULE_MAP.md` is the concise navigation map. Codex tasks must direct agents to minimum module-local context rather than whole-repository rereading.

## Security boundaries
- LAN-only V1 production access.
- Read-only V1 dashboard has no interactive application login; LAN reachability equals read access and must be disclosed clearly.
- HTTP may be used for the initial read-only LAN path; architecture remains HTTPS-capable.
- Any future printer write/control or comparable sensitive feature requires HTTPS + strong authentication and a new Product Owner-approved security decision.
- Printer Access Codes are sensitive device credentials and are governed through the dedicated secrets boundary.
- Never log/commit credentials or expose them through browser storage/normal API/diagnostics.
- Stale/offline state is not live.
- Do not circumvent vendor/device security or access controls.
- Dedicated threat model/security review remains required before production release.

## Bambu Lab / interface posture
Independent third-party interoperability project; no affiliation, sponsorship, authorization, certification, maintenance relationship, or endorsement by Bambu Lab is claimed.

Approved constraints:
- no printer Developer Mode;
- no Fleet Hub dependency/extra hardware path for current V1;
- no Bambu developer-partner/private authorization at this stage;
- no reverse-engineered cloud-client impersonation;
- publicly available read-only printer status paths explicitly left available by Bambu may be evaluated under DEC-006/DEC-012;
- discovering a technical write/control path does not authorize using it.

## Completed milestones

### M0 — Repository and governance foundation
- Product Owner approved 2026-08-22.
- PR #1 merged 2026-08-22.
- Merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`.

### M1 — Architecture foundation + synthetic prototype + real-read feasibility design
- Architecture approved by Product Owner.
- Synthetic prototype implemented on PR #2.
- Technical-lead review identified one reproducibility blocker (`packages/secrets` missing from committed tree); remediation completed.
- Fresh-checkout CI, unit/integration tests, Playwright E2E, TypeDoc/license checks, and Docker/Compose validation all passed.
- Product Owner performed hands-on testing and accepted M1 on 2026-08-24.
- PR #2 merged into `main` on 2026-08-24.
- Verified merge commit: `42821596cc0bf80a302b12287063b3ee17f58f3a`.

Product Owner M1 UX feedback:
- UI is functionally acceptable for M1 but visually basic/not modern enough for final product quality;
- no frontend redesign is authorized now;
- visual modernization is deferred as a non-blocking item, potentially a later milestone or small V1.1 UI/UX refresh.

## Current milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype — **PLANNING / HOLD**.

No M2 implementation branch/PR exists yet. `prompts/codex/NEXT_PROMPT.md` is HOLD and is the execution gate.

## M2 hard gate
M2 must prove sufficiently useful and reliable real read-only monitoring on **both** A1 Mini and X2D. Synthetic evidence cannot pass M2.

M2 must not require/use:
- Developer Mode;
- Fleet Hub hardware;
- Bambu private/partner authorization;
- reverse-engineered cloud-client impersonation;
- printer write/control commands;
- bypasses or weakening of vendor/device authentication/security controls.

If M2 cannot prove enough real read-only capability on both printers to make the product genuinely useful, substantial M3+ implementation stops for a formal Product Owner continue/re-scope/stop decision.

## M2 planning focus
Before implementation is queued, define and approve:
- the smallest supported/authorized local read path to test;
- server-side discovery and manual fallback;
- LAN Access Code consent and credential handling;
- exact field/capability evidence matrix for A1 Mini and X2D;
- freshness/update-rate/stale/offline/reconnect validation;
- firmware/model variance recording;
- sanitized evidence handling with no credentials/private device dumps committed;
- GO/NO-GO success thresholds;
- automated adapter/contract tests plus Product Owner real-device validation;
- branch/PR/documentation/security/stop/merge rules.

Real-device testing is allowed only after an explicit M2 `QUEUED` task. Until then, do not access/discover real printers or request LAN Access Codes.

## Current risks
See `project-control/risks/RISK_REGISTER.md`; highest M2 concerns are real read-only capability/firmware coverage on A1 Mini/X2D, vendor interface authorization/change risk, local-vs-cloud capability variance, credential handling, device capability variance, stale telemetry safety and local API attack surface.

## Next authorized action
Technical-lead M2 planning and creation/review of a concrete M2 Codex execution contract. Keep `prompts/codex/NEXT_PROMPT.md` on HOLD until Product Owner explicitly approves that contract.

## Files to read first
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `project-control/specs/OPERATING_MODEL.md`
5. `project-control/specs/MILESTONE_PLAN.md`
6. `project-control/specs/M1_ARCHITECTURE.md`
7. `project-control/specs/V1_FEATURE_SCOPE.md`
8. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
9. `project-control/decisions/DECISION_LOG.md`
10. `project-control/risks/RISK_REGISTER.md`
11. relevant module-local README/contracts/tests for M2 planning.
