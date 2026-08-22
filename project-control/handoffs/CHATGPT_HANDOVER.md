# Bambu Printer Dashboard ChatGPT Handover

## Product purpose
Local-first responsive browser/PWA dashboard for monitoring and managing compatible Bambu Lab printers and related devices, with multi-device visibility, supported controls, AMS/filament, cameras/media, maintenance, notifications, audit/history, and a secure local API/event layer.

## Repository / licensing
Public repository: `vivekshukla12/Bambulab_Dashboard`. Source code license: MPL-2.0. New original source files use the MPL source-file notice policy in `CONTRIBUTING.md` (normally `SPDX-License-Identifier: MPL-2.0`). Preserve third-party license/provenance. `TRADEMARKS.md` and `NOTICE` define the independent/unofficial relationship and third-party trademark/IP posture.

## Delivery model
M0 is complete. Every major product milestone from M1 onward must deliver a runnable/testable prototype. Automated tests and hands-on product-owner validation are required; feedback is captured under `project-control/feedback/`, triaged, and reconciled with the roadmap before the next milestone is authorized.

## Architecture
M0 established principles only: local-first, capability-driven vendor adapters, server-owned freshness/live state, explicit API/event boundary, safe degradation, portable deployment, read-only offline PWA, auditable controls, and minimal dependency surface. Exact technology stack and vendor interface choices remain unresolved for M1, which must prove approved choices in a synthetic working prototype.

## Security boundaries
LAN-only V1 production access; HTTPS; authentication required; strong API authentication before write/control; explicit confirmation for destructive/high-impact actions; protect secrets at rest and in backups; never log/commit credentials; camera privacy + audit; stale/offline state is not live; dedicated threat model before production. Do not circumvent vendor/device security or access controls to obtain functionality.

## Privacy/data rules
Synthetic fixtures only by default. Never commit customer/production-derived sensitive data, credentials/tokens, raw private live API dumps, production logs, private screenshots/media, or real identifiers.

## Bambu Lab / legal posture
Independent third-party interoperability project; no affiliation, sponsorship, authorization, certification, maintenance relationship, or endorsement by Bambu Lab is claimed. Bambu Lab names/marks and other IP remain with their rights holders. Material interface/auth/trademark/legal uncertainty is a feasibility stop condition, not an implementation shortcut. Working product name remains subject to final trademark/name review before V1 branding.

## Completed milestones
- M0 — Repository and governance foundation.
  - Approved by product owner on 2026-08-22.
  - PR #1 merged on 2026-08-22.
  - Verified merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`.

## Current milestone
M1 — Architecture foundation + synthetic dashboard prototype — **PLANNING / HOLD**.

## Current PR / branch
- Branch: `main`
- M1 PR: none yet.
- M1 implementation is not authorized yet.

## Important decisions
- GitHub is authoritative project state.
- PRD v1.0 is the requirements baseline.
- MPL-2.0 is the repository source-code license; new original source files carry an MPL-2.0 notice/SPDX identifier and third-party provenance is preserved.
- M0 governance is complete.
- M1+ uses iterative working prototypes with feedback gates.
- Technology stack remains a deliberate M1 decision.
- Bambu Lab affiliation/trademark disclaimer is mandatory and technical interface availability does not equal implementation authorization.
- Each milestone is separately authorized; completion of M0 does not automatically authorize M1 implementation.

## Current risks
See `project-control/risks/RISK_REGISTER.md`; highest concerns include Bambu legal/interface feasibility, local-vs-cloud capability coverage, naming/trademark posture, backup key recovery, audit tamper evidence, LAN TLS/PWA constraints, safe automatic updates, device capability variance, stale telemetry safety, and local API attack surface.

## Explicit V1 non-goals
No slicer; no automatic printer/job assignment or print-farm scheduler; no firmware update management; no built-in general rules engine; no remote internet access; no native mobile app; no multi-user/RBAC; no full analytics suite; no NAS backup target.

## Next authorized action
Begin M1 planning in a fresh chat. Verify GitHub, read the M1 milestone definition and current risks, then define one specific M1 Codex task. Do not begin product implementation until the product owner explicitly approves that task and `prompts/codex/NEXT_PROMPT.md` is changed to `QUEUED`.

## Files to read first
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/specs/PRODUCT_REQUIREMENTS.md`
3. `project-control/specs/OPERATING_MODEL.md`
4. `project-control/specs/ITERATIVE_DELIVERY_MODEL.md`
5. `project-control/specs/MILESTONE_PLAN.md`
6. `project-control/specs/ARCHITECTURE_GUARDRAILS.md`
7. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
8. `project-control/decisions/DECISION_LOG.md`
9. `project-control/risks/RISK_REGISTER.md`
10. `TRADEMARKS.md`
11. `prompts/codex/NEXT_PROMPT.md`
