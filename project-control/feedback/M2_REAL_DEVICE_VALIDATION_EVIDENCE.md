# M2 Real-Device Validation Evidence

## Status

Prepared, not yet run in the Codex environment. M2 cannot pass on synthetic/offline evidence alone.

## Current Automated Evidence

Offline implementation tests use project-authored sanitized fixture payloads and mocked transports only. They do not contain real printer payloads, identifiers or credentials.

Validated in the Codex environment on 2026-08-24:

- `npm run validate` — passed after PR #3 review remediation.
- `npm run test:e2e` — passed across desktop, tablet and mobile Playwright projects after PR #3 review remediation.
- Focused adapter regression: `npm run test -- packages/adapter-bambu-readonly/src/bambu-readonly-adapter.test.ts` — passed, including mocked transport cleanup and silent offline recovery tests.
- GitHub Actions run `32725830367` — passed `Fresh checkout validation` and `Docker Compose validation` for the PR branch.
- Local `npm run docker:validate` — not runnable in the Codex workstation because Docker is unavailable (`docker` command not found); this is a local environment limitation, not the sole remaining Docker/Compose evidence blocker.

The local validation script now emits sanitized pre-stop connection state, initial connection result/timing, update cadence/latency summaries and redacted failure categories. Real-printer capability rows below remain `not-tested` until Product Owner LAN validation runs.

## A1 Mini Capability Matrix

| Capability | Classification | Notes |
|---|---|---|
| Device reachable / online status | not-tested | Requires Product Owner LAN validation. |
| Printer lifecycle / active state | not-tested | Requires Product Owner LAN validation. |
| Printing vs idle | not-tested | Requires Product Owner LAN validation. |
| Print progress | not-tested | Requires a real active print where practical. |
| Nozzle temperature | not-tested | Requires Product Owner LAN validation. |
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

## Gate Recommendation

Pending. No GO / CONDITIONAL GO / NO-GO recommendation can be made until real A1 Mini and X2D validation evidence is collected under the approved local-only process.
