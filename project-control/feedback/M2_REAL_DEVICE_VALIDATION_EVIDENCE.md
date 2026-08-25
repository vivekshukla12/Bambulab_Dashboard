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

The local validation script now emits sanitized pre-stop connection state, initial connection result/timing, update cadence/latency summaries and redacted failure categories. It also supports optional local `--interactive` entry with hidden serial/Access Code prompts while retaining the ignored JSON config path. The dashboard attempts bounded server-side mDNS discovery for sanitized onboarding candidates while retaining manual fallback. Real-printer capability rows below remain `not-tested` until Product Owner LAN validation runs.

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
| Printer lifecycle / active state | not-tested | Requires Product Owner LAN validation. |
| Printing vs idle | not-tested | Requires Product Owner LAN validation. |
| Print progress | not-tested | Requires a real active print where practical. |
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
