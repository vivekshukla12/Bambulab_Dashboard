# Current Status

## Current milestone

M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## State

**REMEDIATION IMPLEMENTED LOCALLY — detailed Product Owner M2 validation remains paused pending technical review and real-device retest.**

On 2026-08-30 the Product Owner reported that the current prototype was not ready for detailed M2 testing. The finding is classified **fix before M2 completion** under the operating model. The local remediation implementation now covers the requested onboarding/configuration lifecycle and an offline X2D active-print startup edge, but this is not M2 acceptance. Implementation remains on draft PR #3; M2 is not accepted, merge is not authorized, and M3 remains blocked.

Authoritative remediation feedback:

- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

Executable Codex gate:

- `prompts/codex/NEXT_PROMPT.md` — HOLD after local M2 onboarding/configuration/X2D remediation; await technical review, PR-head CI evidence, and Product Owner retest direction.

## Repository / PR

- Repository: `vivekshukla12/Bambulab_Dashboard`
- Branch: `m2/real-device-readonly-prototype`
- Draft PR: #3 — `M2: real-device read-only GO/NO-GO prototype`
- PR state: open, draft, unmerged; merge remains Product Owner controlled.
- Base branch: `main`

## Completed milestones

### M0

Complete and merged on 2026-08-22. Verified merge commit: `bad179a0f847f9a478e2c167e62dd94760baa105`.

### M1

Complete and merged on 2026-08-24. Verified merge commit: `42821596cc0bf80a302b12287063b3ee17f58f3a`.

The Product Owner's M1 visual/UI modernization feedback remains deferred to later planning / possible V1.1 and is not part of the current M2 remediation except where functional onboarding UX is required.

## M2 approved boundary

M2 remains limited to the approved **standard-mode local MQTTS read-only status path** through the dedicated Bambu read-only adapter.

The implementation must not use:

- Developer Mode;
- Fleet Hub dependency;
- Bambu partner/private authorization;
- Bambu cloud-client impersonation;
- printer write/control commands;
- weakened or disabled TLS/authentication/authorization/security checks;
- proprietary implementation copying or security bypasses.

Real LAN Access Codes and private device identifiers/content must never be committed or placed in public CI. Real-device debugging remains local to the Product Owner LAN and repository evidence remains sanitized.

## Verified implementation baseline before 2026-08-30 feedback

PR #3 already contained:

- `packages/adapter-bambu-readonly` with standard-mode read-only MQTTS transport and normalized telemetry;
- bounded reconnect/freshness logic with mocked regression tests;
- process-memory-only real Access Code handling by default;
- local/private printer TLS trust handling that retains certificate verification for credential-bearing connections;
- server-side bounded mDNS discovery endpoint and candidate-based onboarding;
- manual host fallback;
- optional interactive local validation command with hidden credential prompts;
- permanent deterministic synthetic adapter/scenarios for regression testing;
- successful prior build/test/E2E and Docker/Compose CI evidence on earlier remediation commits.

Product Owner hands-on A1 Mini testing previously established limited real feasibility: the A1 Mini connected through the approved read-only path and exposed basic live telemetry including nozzle temperature and Wi-Fi/network data. This is limited evidence only, not full M2 acceptance.

## Product Owner findings — 2026-08-30

### 1. X2D connection blocker

The Product Owner could not connect the X2D while the printer was actively printing. This is a locally reported real-device finding; the root cause is not yet independently verified and no private connection details are recorded in GitHub.

This materially reinforces R-014 (model/firmware variability) until real retest proves the approved path is reliable or the limitation is documented as M2 feasibility evidence. Offline remediation on 2026-08-30 fixed a mocked startup edge where an active-print status frame arriving before the transport-connected signal could be overwritten by the later connected transition; this does not by itself prove real X2D connectivity.

### 2. Discovery UX is not automatic enough

The current implementation has server-side discovery, but the normal UI still requires the user to press **Discover**. The Product Owner expects discovery to initiate automatically in the onboarding/fleet experience, show sanitized candidates, and request only the remaining information needed from the user (for example LAN Access Code). Manual host/metadata entry should remain fallback behavior.

### 3. Missing edit/reconfigure lifecycle

The current real-printer onboarding UI does not provide a suitable way to correct a configured printer after incorrect details are entered. M2 remediation must add safe Edit/Reconfigure behavior without displaying stored credentials.

### 4. Missing remove lifecycle

The current prototype does not provide a suitable Remove/Delete action for configured real printers. M2 remediation must allow a configured real printer to be disconnected, cleared from active configuration, and re-added without leaking credentials or silently deleting normalized history.

### 5. Synthetic devices should not clutter normal product UX

The Product Owner no longer finds synthetic printer simulation useful in the ordinary product workflow now that real-printer connectivity exists.

This does **not** delete the approved deterministic synthetic regression infrastructure. DEC-012/M1 architecture and the current M2 contract require synthetic mode for repeatable automated/offline testing. The remediation target is therefore:

- real-printer-focused normal fleet UX by default;
- synthetic cards hidden/disabled from normal user operation once real onboarding is being used;
- explicit internal/development/test access to synthetic scenarios retained;
- synthetic automated regression coverage preserved.

Removing the underlying synthetic adapter/test framework would require a separate architecture decision and is not authorized by this UX feedback.

## M2 readiness decision

The Product Owner explicitly considered the previous prototype **not ready for detailed M2 testing**. Do not ask the Product Owner to execute the full M2 Excel test matrix until the remediation is independently reviewed and PR-head CI is checked.

## Remediation implemented on 2026-08-30

Local remediation implemented on branch `m2/real-device-readonly-prototype`:

- automatic server-side discovery initiation on normal fleet/onboarding entry when no configured real-printer state makes a scan unnecessary;
- visible rescan/manual fallback and explicit sanitized discovery `found`/`none`/`failed` states;
- Edit/Reconfigure configured real printers without displaying existing Access Codes; supplied replacement Access Codes replace only process-memory credential material;
- Remove/Delete configured real printers with adapter stop/cleanup, live-registry removal and non-destructive normalized-history semantics;
- real-printer-focused default Fleet UX, with deterministic synthetic scenarios retained through explicit `?synthetic=1` development/regression view and automated tests;
- X2D-relevant mocked lifecycle hardening so a late transport-connected signal no longer overwrites an already observed active-print status frame;
- focused adapter/server/Playwright coverage plus module docs/runbook/project-control evidence updates.

Local validation:

- `npm run validate` — passed on 2026-08-30, including TypeScript build, web build, Vitest `31` tests, TypeDoc generation and dependency-license inventory.
- `npm run test:e2e` — passed on 2026-08-30: Playwright `15` tests across desktop, tablet and mobile.
- `npm run docker:validate` — not runnable locally because Docker is unavailable on the Codex workstation; PR-head GitHub Actions Docker/Compose evidence must be checked after push.
- Local real-device validation was not run because `secrets/m2-printers.local.json` is absent in this checkout and detailed Product Owner real-device validation remains paused pending review.

## Next authorized action

Next step is technical review and PR-head CI verification for the remediation commit, then controlled Product Owner retest of:

1. automatic discovery/rescan/manual fallback;
2. candidate-based connection with minimum remaining details/Access Code;
3. edit/reconfigure;
4. remove/re-add;
5. real-printer-focused normal fleet UX with synthetic regression retained outside ordinary use;
6. A1 Mini reconnect/basic telemetry;
7. X2D active-print connection behavior, or sanitized documentation of an approved-path limitation.

Do not begin M3 and do not merge PR #3 without explicit Product Owner authorization.
