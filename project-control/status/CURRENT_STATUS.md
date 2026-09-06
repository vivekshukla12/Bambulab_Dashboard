# Current Status

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## State

**HOLD — FEASIBLE FOR PRODUCT OWNER ARCHITECTURE REVIEW.**

The bounded no-outreach Bambu Connect / user-installed official Network Plugin spike authorized by DEC-018 is implemented on draft PR #3. This disposition means the public, user-installed plugin boundary is technically usable for an isolated optional bridge. It is not M2 acceptance, permanent dependency approval, a GO recommendation or merge authorization.

PR #3 remains open, draft and unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked.

## Spike outcome — 2026-09-06

The project independently implemented a Windows helper from the public Bambu Studio declarations without copying Bambu Studio implementation code or any proprietary binary. The optional `@bpd/bambu-network-plugin-bridge` package:

- is disabled unless `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`;
- uses only a Network Plugin already installed by the user through Bambu Studio;
- requires valid Authenticode signatures and the same signer certificate on Bambu Studio and `bambu_networking.dll`;
- accepts ABI prefix `02.08.02` and fails closed for absent, unsigned, differently signed or incompatible components;
- resolves only discovery, local connection/disconnection and local read-only callback entry points;
- retains private discovery endpoints/serials on the server and keeps Access Codes in process memory only;
- normalizes local callback payloads through the existing M2 read-only adapter/domain boundary;
- exposes no cloud-login, arbitrary send-message, bind/unbind, printing, motion, calibration, camera, file-transfer or other write/control API;
- preserves the existing direct MQTTS/SSDP path and synthetic regression mode when the opt-in flag is absent.

No Bambu binary, proprietary fixture, real credential, private endpoint or raw device payload is committed.

## Local runtime evidence

Local inspection found an official Bambu Studio `02.08.02.61` installation and user-installed Network Plugin `02.08.02.54`. Both files had valid Authenticode signatures from the same signer. The native helper built successfully with the installed Microsoft C++ toolchain, loaded the plugin and verified the complete allowed symbol boundary and ABI prefix.

Sanitized commands/results:

- `npm run m2:network-plugin:build` — passed.
- `npm run m2:network-plugin:probe` — passed; component available, ABI prefix `02.08.02`.
- `npm run m2:network-plugin:discover` — completed with zero candidates while Bambu Studio was running.

The zero-candidate run is not treated as a clean bridge failure because local inspection showed the running Studio instance already owned the plugin discovery/listener ports. A Product Owner retest must exit Bambu Studio before starting the standalone bridge/dashboard. Real A1 Mini and X2D discovery and read-only status reliability remain unproven and must not be marked passed.

## Automated evidence

On the local spike state:

- native bridge build passed;
- signed-runtime/ABI probe passed;
- final `npm run validate` passed after documentation reconciliation: TypeScript/web build, Vitest `43` tests, TypeDoc and license inventory;
- `npm run test:e2e` passed: `15` Playwright tests across desktop, tablet and mobile;
- bridge tests cover clean component absence, discovery sanitization/rejection/deduplication, callback normalization, browser/server redaction and absence of write/control exports;
- no proprietary plugin is required or loaded by public CI.

Local `npm run docker:validate` could not run because Docker is not installed on this workstation (`docker` command not found). PR-head GitHub Actions, including Docker Compose validation, must be recorded after push.

## Product Owner review / retest gate

Before permanent adoption, the Product Owner must explicitly review the proprietary runtime dependency, licensing/redistribution posture, Windows/platform limitation, ABI/version maintenance and operational requirement for a normal official Bambu installation.

For a clean hands-on retest:

1. Exit Bambu Studio while leaving the official Network Plugin installed.
2. Run `npm run m2:network-plugin:build`, `npm run m2:network-plugin:probe` and `npm run m2:network-plugin:discover`.
3. Set `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`, start the normal server/web prototype locally and use only the browser's memory-only Access Code entry.
4. Verify automatic enumeration and useful read-only status for A1 Mini and X2D, including the previously unresolved X2D active-print case.
5. Record only sanitized outcomes in project control.

If that clean Product Owner retest fails to establish reliable discovery and useful read-only monitoring for both printers, return an M2 NO-GO / project termination recommendation rather than adding another workaround.

## Authority

- Current decision: `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
- Spike review: `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`
- Execution gate: `prompts/codex/NEXT_PROMPT.md` — HOLD

Do not merge PR #3, make the Network Plugin a permanent dependency or begin M3 without explicit Product Owner authorization.
