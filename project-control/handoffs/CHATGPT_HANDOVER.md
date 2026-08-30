# Bambu Printer Dashboard ChatGPT Handover

## Repository authority

GitHub is authoritative: `vivekshukla12/Bambulab_Dashboard`.

At the start of a new project/milestone chat, reconcile at minimum:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `project-control/specs/OPERATING_MODEL.md`
5. relevant milestone/spec files
6. `project-control/decisions/DECISION_LOG.md`
7. `project-control/risks/RISK_REGISTER.md`
8. actual branch/PR/merge/commit state.

Do not rely on chat memory when GitHub can verify state.

## Product / governance baseline

Bambu Printer Dashboard is a local-first, read-only-first browser/PWA operational dashboard for compatible Bambu Lab printers. The Product Owner retains final authority over scope, architecture, milestones, dependencies, security/privacy boundaries, branding, acceptance and merges.

Repository license: MPL-2.0. Preserve source notices, attribution and third-party provenance.

Every M1+ milestone must end with a runnable/testable prototype, automated validation, Product Owner hands-on feedback and project-control reconciliation before the next milestone is authorized.

M0 and M1 are complete and merged:

- M0 merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`
- M1 merge commit: `42821596cc0bf80a302b12287063b3ee17f58f3a`

M1 UI modernization feedback remains deferred to later planning / possible V1.1.

## Approved architecture baseline

M1 approved:

- Node.js 24 LTS + TypeScript
- React + Vite
- Fastify
- SQLite + better-sqlite3 + Kysely
- npm workspaces + TypeScript project references
- Vitest + Playwright
- TypeDoc / structured source docs
- REST + SSE
- direct local development + Docker/Compose
- server-owned connectivity/freshness/persistence
- read-only adapter contract isolated from any future control interface
- capability-driven domain/UI behavior
- deterministic synthetic adapter/scenarios retained as a permanent regression/test path
- server-side printer discovery + LAN Access Code onboarding with manual fallback
- Access Codes process-memory-only by default unless separately remembered through the approved SecretStore boundary.

See DEC-014 through DEC-016.

## Security / Bambu interface constraints

Current V1/M2 constraints remain:

- no Developer Mode;
- no Fleet Hub dependency;
- no private/partner Bambu authorization;
- no Bambu cloud-client impersonation;
- no printer write/control commands;
- no weakening/disabling TLS/authentication/authorization/security checks;
- no proprietary implementation copying;
- real Access Codes, serial/MAC/IP/account identifiers, raw private payloads, packet captures, private media and unsanitized logs must not be committed or placed in public CI.

M2 may evaluate only the approved standard-mode local MQTTS read-only path. If useful monitoring requires a prohibited mechanism, stop and surface the boundary.

## Current milestone

M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype.

**Current state: REMEDIATION REQUIRED; detailed Product Owner validation is paused.**

Draft PR #3 remains open/unmerged on branch `m2/real-device-readonly-prototype`. Merge is not authorized. M3 remains blocked.

Authoritative latest Product Owner feedback:

- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

Executable Codex gate:

- `prompts/codex/NEXT_PROMPT.md` — QUEUED for M2 remediation before further detailed Product Owner testing.

## Verified M2 implementation before latest feedback

PR #3 already contains:

- dedicated `packages/adapter-bambu-readonly`;
- standard-mode local MQTTS read-only connection path;
- parser/normalizer and capability/freshness handling;
- bounded reconnect and mocked transport tests;
- process-memory-only Access Code handling;
- local/private printer certificate trust profile while keeping credential-bearing TLS verification enabled;
- server-side bounded mDNS discovery and sanitized discovery candidate API;
- candidate-based onboarding plus manual host fallback;
- optional interactive local validation with hidden credentials;
- deterministic synthetic mode and synthetic regression coverage.

Product Owner A1 Mini hands-on testing previously established limited real feasibility: A1 Mini connected and basic live telemetry including nozzle temperature and Wi-Fi/network data was observed. Do not overstate this as full M2 validation.

## Product Owner feedback / blockers — 2026-08-30

The Product Owner considers the prototype not ready for detailed M2 testing.

### X2D

The Product Owner reports that X2D could not be connected while it was actively printing. This is a local hands-on finding; root cause is unverified. R-014 has been updated to reflect the observed device/firmware variability risk.

### Discovery/onboarding

Server-side discovery exists, but current UI requires the user to press **Discover**. Product Owner expects automatic server-side discovery when onboarding/fleet is entered, then selection of a sanitized candidate and entry only of required remaining details such as Access Code. Manual IP/host metadata remains fallback.

### Edit/reconfigure

Current prototype lacks a usable way to correct an already configured printer after wrong details are entered. M2 remediation must add safe Edit/Reconfigure behavior. Existing credentials must never be displayed back; replacing an Access Code requires a new value.

### Remove printer

Current prototype lacks a Remove/Delete configured-printer action. Remediation must cleanly disconnect/remove active configuration and clear memory-only credential material while not silently deleting normalized history.

### Synthetic printer UX

Product Owner no longer wants synthetic printers mixed into the ordinary product fleet experience now that real printer connectivity exists.

Do **not** delete the deterministic synthetic adapter/testing infrastructure: that remains an approved architecture/regression requirement. The intended remediation is to make the normal product UX real-printer focused and hide/disable synthetic devices by default, while retaining explicit dev/test/diagnostic synthetic access and automated regression coverage.

### UI modernization

Broad frontend visual redesign remains deferred. Current remediation is functional onboarding/configuration readiness only.

## Current Codex remediation task

`prompts/codex/NEXT_PROMPT.md` authorizes only M2 remediation on existing PR #3:

1. automatic server-side discovery initiation + visible rescan/manual fallback;
2. minimal-details discovered-printer onboarding;
3. Edit/Reconfigure configured real printer;
4. Remove/Delete configured real printer with credential cleanup and non-destructive history semantics;
5. real-printer-focused default UX while preserving synthetic regression internally;
6. investigate/fix or safely document X2D active-print connection limitation using only approved standard-mode read-only path;
7. add focused automated/E2E tests and documentation/project-control updates;
8. return for technical review and Product Owner retest.

Do not ask Product Owner to run the full M2 Excel validation matrix until this remediation is implemented and reviewed.

## M2 gate / next milestone

M2 still requires an explicit Product Owner gate decision after remediation and real-device evidence. No M3 work may begin before that decision. Never merge PR #3 without explicit Product Owner authorization.
