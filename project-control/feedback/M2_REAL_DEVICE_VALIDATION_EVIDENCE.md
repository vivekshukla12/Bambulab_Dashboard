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
| Device reachable / online status | proven-live | Manual MQTTS previously connected; the clean official Network Plugin retest also discovered and connected the A1 Mini. |
| Printer lifecycle / active state | not-tested | Requires Product Owner LAN validation. |
| Printing vs idle | not-tested | Requires Product Owner LAN validation. |
| Print progress | not-tested | Requires a real active print where practical. |
| Nozzle temperature | proven-live | Live nozzle telemetry was observed in the browser/API through the read-only path. |
| Bed temperature | proven-live | Live bed telemetry was observed through the official Network Plugin bridge. |
| Stale/offline/reconnect | not-tested | Requires controlled local interruption/recovery validation. |

## X2D Capability Matrix

| Capability | Classification | Notes |
|---|---|---|
| Device reachable / online status | proven-live | The clean official Network Plugin retest discovered and connected the X2D. |
| Printer lifecycle / active state | proven-live | The X2D reported a live `Printing` state during an active print. |
| Printing vs idle | proven-live | Active printing was proven live; idle behavior was not separately observed. |
| Print progress | proven-live | Live progress was observed at `82%` during the Product Owner retest. |
| Nozzle temperature | proven-live | Live nozzle telemetry was observed through the official Network Plugin bridge. |
| Bed temperature | proven-live | Live bed telemetry was observed through the official Network Plugin bridge. |
| Stale/offline/reconnect | not-tested | Requires controlled local interruption/recovery validation. |

## Simultaneous Dual-Device Evidence

Proven live through the clean official Network Plugin retest. The fleet showed two configured devices, two live, zero stale and zero unavailable while the A1 Mini was connected and the X2D was actively printing at `82%`.

## Product Owner Hands-On Feedback — 2026-08-25

- The Product Owner reports that the current functional behavior works as expected in hands-on use.
- Remaining feedback is primarily UI/frontend presentation and polish.
- UI/frontend modernization remains intentionally deferred to a later milestone or small V1.1 follow-up; it is not requested as M2 scope and is not an M2 acceptance blocker.
- This hands-on feedback does not by itself replace the remaining required real-device evidence or constitute an M2 GO/CONDITIONAL GO/NO-GO decision.

## Gate Recommendation

Product Owner decision required. The clean official Network Plugin retest now supplies real A1 Mini and X2D evidence, including simultaneous live operation and the X2D active-print case. Remaining evidence gaps and proprietary runtime constraints must be considered in the final M2 GO / CONDITIONAL GO / NO-GO and architecture/dependency/licensing decision.

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

## Network Plugin country/region remediation — 2026-09-06

The authorized pre-retest remediation is complete. The native helper no longer hard-codes `US`. The bridge now gives an explicit `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` override priority and otherwise asks a project-authored native boundary for the current Windows user's geographic region through the documented `GetUserDefaultGeoName` API. Both paths normalize to uppercase and validate against the ISO 3166-1 alpha-2 set before plugin initialization. Invalid overrides, numeric/unassigned values and unavailable Windows geography fail closed with a sanitized instruction to set the override; no arbitrary default is used.

Sanitized validation evidence for implementation commit `9cf1d4d542c6ca7ed0fd76ed83c24c340f993b98`:

- `npm run m2:network-plugin:build` — passed.
- `npm run m2:network-plugin:probe` — passed against the signed installed component and reported ABI prefix `02.08.02` plus Windows-derived country code `DE`.
- `npm run validate` — passed: TypeScript/web build, Vitest `52` tests, TypeDoc and dependency-license inventory.
- `npm run test:e2e` — passed: Playwright `15` tests across desktop, tablet and mobile.
- `git diff --check` — passed.
- GitHub Actions run `34035325621` passed Fresh checkout validation and Docker Compose validation for the implementation commit.

Coverage includes valid and lowercase explicit overrides, invalid override rejection without value disclosure, a mocked Windows locale-derived path, unresolved/invalid local values with no fallback, and the existing bridge redaction/read-only/security invariants. No real printer discovery or monitor test was performed by Codex as part of the remediation; the capability rows were updated only after the subsequent Product Owner clean retest recorded below.

## Product Owner clean Network Plugin retest — 2026-09-06

The Product Owner completed the requested standalone browser retest after the country/region remediation:

- An explicit Rescan discovered two sanitized official Network Plugin candidates without manual host entry.
- The X2D connected during an active print and reported live printing state, `82%` progress, nozzle and bed temperatures, Wi-Fi and AMS telemetry.
- The A1 Mini connected and reported live nozzle and bed temperatures plus Wi-Fi telemetry. Printer lifecycle/progress remained unobserved in its idle sparse reports and are not reclassified.
- The fleet simultaneously showed two configured devices, two live, zero stale and zero unavailable.
- The supplied screenshots exposed no printer host, serial, LAN Access Code or raw plugin payload.

This passes the specific corrected clean-retest scenario required by the country/region remediation gate and resolves the previously observed X2D active-print connection failure for this workstation/test session. It does not by itself authorize permanent adoption of the proprietary plugin, merge PR #3 or begin M3. Controlled stale/offline/reconnect behavior and A1 Mini lifecycle/progress remain evidence gaps for the Product Owner's final M2 GO/CONDITIONAL GO/NO-GO and architecture/dependency/licensing decision.
