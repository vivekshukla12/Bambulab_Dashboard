# Bambu Printer Dashboard ChatGPT Handover

## Product purpose
Local-first responsive browser/PWA operational dashboard for monitoring compatible Bambu Lab printers and related devices, with multi-device visibility, real read-only telemetry, history, filament/maintenance workflows, notifications, audit/history, and a documented local API/event layer. Privileged printer controls are conditional/future rather than a current V1 promise.

## Repository / licensing
Public repository: `vivekshukla12/Bambulab_Dashboard`.
Source code license: MPL-2.0.
New original source files use the MPL source-file notice policy in `CONTRIBUTING.md` (normally `SPDX-License-Identifier: MPL-2.0`). Preserve third-party license/provenance. `TRADEMARKS.md` and `NOTICE` define the independent/unofficial relationship and third-party trademark/IP posture.

All production/core technologies and dependencies must be open source, free for commercial use and compatible with MPL-2.0 distribution.

## Delivery model
M0 and M1 are complete. Every major milestone from M1 onward must deliver a runnable/testable prototype with automated tests plus Product Owner hands-on validation. Feedback is captured under `project-control/feedback/`, triaged, and reconciled before the next milestone is authorized.

M2 is a hard real-device GO/NO-GO gate: useful, stable read-only monitoring must be proven on both A1 Mini and X2D without Developer Mode or Fleet Hub before substantial downstream feature investment.

## Current V1 direction
The PRD remains the requirement-ID baseline. `project-control/specs/V1_FEATURE_SCOPE.md` is the authoritative current V1 feasibility overlay.

V1 centers on real local read-only monitoring, explicit freshness semantics, observed telemetry/history, customizable fleet/device dashboards, local operational domains, notifications/search/audit, and later documented local integrations. Current V1 does not require or promise Developer Mode, Fleet Hub, Bambu partner/private authorization, cloud-client impersonation, broad direct printer controls, or unvalidated camera/printer-storage functionality.

## Approved architecture baseline from M1
Authoritative specification: `project-control/specs/M1_ARCHITECTURE.md`.

Approved baseline:
- Node.js 24 LTS + TypeScript;
- React + Vite frontend;
- Fastify backend;
- SQLite + `better-sqlite3` + Kysely;
- npm workspaces + TypeScript project references;
- strict modular monorepo/package boundaries;
- Vitest + Playwright;
- TypeDoc + structured source documentation;
- REST + Server-Sent Events initially;
- direct local development + Docker/Docker Compose packaging;
- permanent deterministic synthetic adapter;
- server-owned live state/freshness/persistence;
- read-only adapter contract separated from any future control interface;
- no interactive dashboard login for read-only V1;
- LAN-accessible default with optional binding restriction;
- HTTP permitted initially for read-only LAN use; HTTPS + strong authentication mandatory before future write/control capability;
- future server-side printer discovery + LAN Access Code onboarding with manual fallback;
- per-printer remembered encrypted or process-memory-only Access Code policy;
- durable history plus 30-day default raw telemetry configurable 1–365 days.

See DEC-014 through DEC-016.

## Documentation/modularity rule
DEC-010 remains mandatory. Significant modules have focused local README/context documentation; public/extension-facing contracts use structured source docs/generated reference support; `docs/architecture/MODULE_MAP.md` is the concise navigation map. Codex tasks must direct agents to minimum module-local context rather than whole-repository rereading.

## Security boundaries
- LAN-only V1 production access.
- Read-only V1 dashboard has no interactive application login; LAN reachability equals read access.
- Any future printer write/control or comparable sensitive feature requires HTTPS + strong authentication and a new Product Owner-approved security decision.
- Printer Access Codes are sensitive device credentials.
- Never log/commit credentials or expose them through browser storage/normal API/diagnostics.
- Stale/offline state is not live.
- Do not circumvent vendor/device security or access controls.

## Bambu Lab / interface posture
Independent third-party interoperability project; no affiliation, sponsorship, authorization, certification, maintenance relationship, or endorsement by Bambu Lab is claimed.

Approved constraints:
- no printer Developer Mode;
- no Fleet Hub dependency/extra hardware path for current V1;
- no Bambu developer-partner/private authorization at this stage;
- no reverse-engineered cloud-client impersonation;
- publicly available read-only printer status paths explicitly left available by Bambu may be evaluated under DEC-006/DEC-012;
- discovering a technical write/control path does not authorize using it.

M2 is authorized to evaluate/implement only the reviewed standard-mode local MQTTS read-only status path. If a usable client requires security bypass, signature circumvention, private authorization, proprietary implementation copying or write/control traffic, stop and return for Product Owner review.

## Completed milestones

### M0 — Repository and governance foundation
- Product Owner approved 2026-08-22.
- PR #1 merged 2026-08-22.
- Merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`.

### M1 — Architecture foundation + synthetic prototype + real-read feasibility design
- Architecture approved by Product Owner.
- Synthetic prototype implemented on PR #2.
- Technical-lead reproducibility blocker remediated.
- Fresh-checkout CI, unit/integration tests, Playwright E2E, TypeDoc/license checks, and Docker/Compose validation passed.
- Product Owner performed hands-on testing and accepted M1 on 2026-08-24.
- PR #2 merged into `main` on 2026-08-24.
- Verified merge commit: `42821596cc0bf80a302b12287063b3ee17f58f3a`.

Product Owner M1 UX feedback:
- UI functionally acceptable for M1 but visually basic/not modern enough for final product quality;
- no frontend redesign authorized now;
- visual modernization deferred, potentially later milestone or small V1.1 UI/UX refresh.

## Current milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype — **IMPLEMENTATION STARTED**.

The Product Owner explicitly started M2 on 2026-08-24. `prompts/codex/NEXT_PROMPT.md` is the executable QUEUED contract. Codex resumed from GitHub and created branch `m2/real-device-readonly-prototype` from `main` tip `a192856ada68e3275cec68544565b77ffd05b8a2` before substantial implementation. The M2 draft PR is being opened next and must be recorded in project-control state once it exists.

M2 implementation authorization is not milestone acceptance and does not authorize merge or M3.

## M2 authoritative package
- `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
- `project-control/reviews/M2_PLANNING_REVIEW.md`
- `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`
- executable gate: `prompts/codex/NEXT_PROMPT.md`

## M2 implementation boundary
Implement/evaluate only the standard-mode local **MQTTS read-only status path** through a dedicated `adapter-bambu-readonly` package.

Do not use:
- Developer Mode;
- Fleet Hub;
- private/partner Bambu credentials or authorization;
- cloud-client impersonation;
- write/control commands;
- weakened TLS/security;
- authorization/signature bypass;
- copied proprietary Bambu network-plugin implementation.

The adapter must preserve the existing normalized read-only contract, synthetic regression path, server-owned freshness/persistence model and capability-driven product layers.

## M2 credential/evidence policy
For M2 feasibility:
- real LAN Access Codes default to process-memory-only/non-persisted handling;
- real-device tests run only locally on the Product Owner LAN, not public/shared CI;
- credentials, serial/MAC/IP/account identifiers, raw private payloads, packet captures, private printer media and unsanitized logs are not committed;
- repository evidence is sanitized capability/timing/pass-fail summaries or project-authored synthetic fixtures;
- persistent real credential storage is not required to pass M2 and requires separate Product Owner request within the already-approved SecretStore boundary.

## M2 hard gate
Both A1 Mini and X2D must demonstrate a genuinely useful core read-only monitoring product. Required value includes availability, current operating/print state, useful progress during real printing, meaningful temperature/status telemetry, safe stale/offline/reconnect behavior, simultaneous dual-device monitoring and compatibility with the existing normalized architecture.

Synthetic evidence cannot pass M2.

Possible outcomes:
- **GO** — both devices satisfy useful stable monitoring under approved constraints;
- **CONDITIONAL GO** — only non-core/model-specific gaps remain and Product Owner explicitly accepts reduced claims;
- **NO-GO / reassessment** — either device lacks useful stable monitoring or required data depends on a prohibited mechanism.

No M3 implementation may begin until the Product Owner decides the M2 gate.

## Current risks
See `project-control/risks/RISK_REGISTER.md`, especially:
- R-013 read-only viable direction / controls unavailable;
- R-014 firmware/model variability may undermine useful monitoring;
- R-015 credential/private evidence leakage during real-device debugging;
- R-016 low-level read transport assumptions may depend on unofficial implementation details.

## Next authorized action
Codex may resume from GitHub and execute `prompts/codex/NEXT_PROMPT.md`: create the M2 branch/draft PR, implement the dedicated read-only adapter and minimum onboarding, preserve synthetic regression, and prepare sanitized local-only validation for the Product Owner's A1 Mini and X2D. Stop on any prohibited interface/security boundary. Do not merge and do not start M3.

## Files to read first
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
5. `project-control/reviews/M2_PLANNING_REVIEW.md`
6. `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`
7. `project-control/specs/OPERATING_MODEL.md`
8. `project-control/specs/MILESTONE_PLAN.md`
9. `project-control/specs/M1_ARCHITECTURE.md`
10. `project-control/specs/V1_FEATURE_SCOPE.md`
11. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
12. `project-control/decisions/DECISION_LOG.md`
13. `project-control/risks/RISK_REGISTER.md`
14. affected module-local README/contracts/tests as needed.
