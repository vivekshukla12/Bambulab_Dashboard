# M2 Real-Device Validation Evidence

## Status

Prepared, not yet run in the Codex environment. M2 cannot pass on synthetic/offline evidence alone.

## Current Automated Evidence

Offline implementation tests use project-authored sanitized fixture payloads and mocked transports only. They do not contain real printer payloads, identifiers or credentials.

Validated in the Codex environment on 2026-08-24:

- `npm run validate` — passed after PR #3 review remediation.
- `npm run test:e2e` — passed across desktop, tablet and mobile Playwright projects after PR #3 review remediation.
- Focused adapter regression: `npm run test -- packages/adapter-bambu-readonly/src/bambu-readonly-adapter.test.ts` — passed, including mocked transport cleanup and silent offline recovery tests.
- Mocked discovery/onboarding regression: `npm run test -- apps/server/src/app.test.ts` — passed, including sanitized server-side discovery candidates and candidate-based endpoint resolution without exposing host/serial/Access Code in responses.
- Local A1 Mini reachability diagnostic found the target MQTTS port reachable, but strict TLS by raw IP failed because the printer presents a local/private certificate identity and issuer chain. The implementation now supports a `local-printer-chain` TLS trust profile that probes certificate material before credentials are sent and keeps TLS validation enabled for the credential-bearing connection. Private IP, certificate name, serial and Access Code were not recorded.
- Product Owner hands-on browser validation on 2026-08-25 connected to the A1 Mini through manual host fallback using the local TLS profile and observed live printer-originated nozzle temperature plus Wi-Fi telemetry. Reports arrived as partial/sparse frames; the adapter now accumulates observed status fields in memory so later sparse frames do not flicker already observed capabilities back to `unknown`.
- GitHub Actions run `32767627648` — passed `Fresh checkout validation` and `Docker Compose validation` for remediation commit `5e111ec30c6638a2fecbc03ad28b10c7bf9dce59`.
- Local `npm run docker:validate` — not runnable in the Codex workstation because Docker is unavailable (`docker` command not found); this is a local environment limitation, not the sole remaining Docker/Compose evidence blocker.

The local validation script now emits sanitized pre-stop connection state, initial connection result/timing, update cadence/latency summaries and redacted failure categories. It also supports optional local `--interactive` entry with hidden serial/Access Code prompts while retaining the ignored JSON config path. The dashboard attempts bounded server-side SSDP discovery for sanitized onboarding candidates while retaining manual fallback. Real-printer capability rows below remain `not-tested` until Product Owner LAN validation runs.

Validated in the Codex environment on 2026-08-30 after Product Owner remediation feedback:

- `npm run validate` — passed: TypeScript build, web build, Vitest `31` tests, TypeDoc generation and dependency-license inventory.
- `npm run test:e2e` — passed: Playwright `15` tests across desktop, tablet and mobile.
- Focused adapter regression: `npm run test -- packages/adapter-bambu-readonly/src/bambu-readonly-adapter.test.ts` — passed, including mocked X2D-shaped active-print startup, reconfiguration transport replacement, credential replacement redaction and forget/remove cleanup.
- Mocked server regression: `npm run test -- apps/server/src/app.test.ts` — passed, including sanitized discovery `found`/`none`/`failed` states, candidate-based onboarding, edit/reconfigure, remove and live-registry cleanup.
- Browser E2E now verifies automatic discovery initiation on fleet entry when no configured real printer is present, explicit rescan, edit/reconfigure, remove confirmation, real-printer-focused normal fleet rendering and explicit `?synthetic=1` synthetic regression mode.
- A mocked lifecycle bug was found and fixed: if a printer-originated active-print status frame arrives during connection startup before the transport reports fully connected, the later transport-connected signal no longer overwrites the already observed live print state with a degraded waiting state.
- Local `npm run docker:validate` — not runnable in the Codex workstation because Docker is unavailable (`docker` command not found); GitHub Actions Docker/Compose evidence must be checked after this remediation is pushed.
- Local real-device validation was not run because `secrets/m2-printers.local.json` is absent in this checkout and Product Owner detailed real-device validation remains paused until remediation review.

Validated in the Codex environment on 2026-09-05 after SSDP discovery remediation:

- `npm run validate` — passed: TypeScript build, web build, Vitest `36` tests, TypeDoc generation and dependency-license inventory.
- `npm run test:e2e` — passed: Playwright `15` tests across desktop, tablet and mobile.
- Adapter discovery regression now uses mocked/sanitized SSDP packets only and covers representative response parsing, NOTIFY alive parsing, byebye/unrelated-service filtering, Bambu service-type matching, candidate sanitization, deduplication, no-candidate timeout and socket failure fallback.
- Server/browser regressions continue to cover automatic scan initiation, Rescan, sanitized candidate DTOs without private endpoint fields, manual fallback, edit/reconfigure, remove and explicit synthetic regression mode.
- Local `npm run docker:validate` — not runnable in the Codex workstation because Docker is unavailable (`docker` command not found); GitHub Actions Docker/Compose validation passed after push.
- PR-head GitHub Actions after the SSDP remediation push passed fresh-checkout validation, browser E2E and Docker Compose validation.
- Local real-device validation was not run because this Codex environment is not the Product Owner LAN with locally supplied credentials.

## A1 Mini Capability Matrix

| Capability | Classification | Notes |
|---|---|---|
| Device reachable / online status | proven-live | Manual host fallback connected through local MQTTS under the local TLS profile. |
| Printer lifecycle / active state | not-tested | Requires Product Owner LAN validation. |
| Printing vs idle | not-tested | Requires Product Owner LAN validation. |
| Print progress | not-tested | Requires a real active print where practical. |
| Nozzle temperature | proven-live | Live nozzle telemetry was observed in the browser/API through the read-only path. |
| Bed temperature | not-tested | Requires Product Owner LAN validation. |
| Stale/offline/reconnect | not-tested | Requires controlled local interruption/recovery validation. |

## X2D Capability Matrix

| Capability | Classification | Notes |
|---|---|---|
| Device reachable / online status | not-tested | Requires Product Owner LAN validation. |
| Printer lifecycle / active state | not-tested | Requires Product Owner LAN validation; mocked active-print startup path now preserves early live status frames. |
| Printing vs idle | not-tested | Product Owner reported a current prototype connection failure while X2D was actively printing; root cause still requires sanitized real retest. |
| Print progress | not-tested | Requires a real active print where practical; mocked X2D-shaped active-print progress is covered offline only. |
| Nozzle temperature | not-tested | Requires Product Owner LAN validation. |
| Bed temperature | not-tested | Requires Product Owner LAN validation. |
| Stale/offline/reconnect | not-tested | Requires controlled local interruption/recovery validation. |

## Simultaneous Dual-Device Evidence

Not tested yet. Run `npm run m2:validate:real -- secrets/m2-printers.local.json` with both printers configured and paste only sanitized aggregate results here.

## Product Owner Hands-On Feedback — 2026-08-25

- The Product Owner reports that the current functional behavior works as expected in hands-on use.
- Remaining feedback is primarily UI/frontend presentation and polish.
- UI/frontend modernization remains intentionally deferred to a later milestone or small V1.1 follow-up; it is not requested as M2 scope and is not an M2 acceptance blocker.
- This hands-on feedback does not by itself replace the remaining required real-device evidence or constitute an M2 GO/CONDITIONAL GO/NO-GO decision.

## Gate Recommendation

Pending. No GO / CONDITIONAL GO / NO-GO recommendation can be made until real A1 Mini and X2D validation evidence is collected under the approved local-only process.

## Official Network Plugin feasibility spike — 2026-09-06

Technical disposition: **FEASIBLE FOR PRODUCT OWNER ARCHITECTURE REVIEW**. This is a spike/architecture disposition only; the M2 device gate recommendation above remains pending.

Sanitized implementation evidence:

- Added an opt-in Windows bridge around a user-installed official Bambu Network Plugin using only the public ABI declarations.
- The bridge verifies matching valid Authenticode signers for Bambu Studio and the plugin, pins the `02.08.02` ABI prefix, uses isolated temporary runtime directories and fails closed when the component is absent/untrusted/incompatible.
- Discovery host/serial values remain server-side; Access Codes remain process-memory-only and are never returned to the browser.
- Local status callbacks normalize through the existing read-only adapter; no write/control entry point is resolved or exported.
- Existing direct MQTTS/SSDP behavior remains the default; the spike requires `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`.

Sanitized local runtime evidence:

- Native helper build passed.
- Official installed runtime/signature/ABI probe passed.
- Bounded discovery returned zero candidates while Bambu Studio was running and already owned the plugin listener ports. This concurrent result is not classified as a clean discovery failure.
- No local real-printer credential file was present, so no real bridge monitor session was attempted.
- Final `npm run validate` passed after documentation reconciliation with `43` Vitest tests.
- `npm run test:e2e` passed with `15` Playwright tests across desktop, tablet and mobile.
- `npm run docker:validate` could not run locally because Docker is not installed; PR-head Docker Compose CI remains the packaging evidence source.
- GitHub Actions run `34022565310` passed Fresh checkout validation (including browser E2E) and Docker Compose validation for implementation commit `0c0e5d5a17bdcfd16082d82efc1129497c769a3e`.

Product Owner retest remains required with Bambu Studio exited. Do not change A1 Mini/X2D capability rows until standalone discovery and useful read-only callback behavior are actually observed and sanitized.
