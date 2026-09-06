# Bambu Printer Dashboard ChatGPT Handover

## Repository authority

GitHub is authoritative: `vivekshukla12/Bambulab_Dashboard`.

At the start of a new project/milestone chat, reconcile:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `project-control/specs/OPERATING_MODEL.md`
5. relevant milestone/spec files
6. `project-control/decisions/DECISION_LOG.md` plus current dedicated decision records
7. `project-control/risks/RISK_REGISTER.md`
8. actual branch/PR/merge/commit/CI state

## Product/governance baseline

Bambu Printer Dashboard is an independent, open-source, local-first/read-only-first monitoring dashboard for compatible Bambu Lab printers. The Product Owner controls scope, architecture, dependencies, security/privacy boundaries, milestone acceptance and merges. The repository license is MPL-2.0.

Completed:

- M0 merged: `bad179a0f847f9a478e2c167e62dd94760baa105`
- M1 merged: `42821596cc0bf80a302b12287063b3ee17f58f3a`

M1 UI modernization remains deferred.

## Current milestone / gate

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO.

**Current state: HOLD — FEASIBLE FOR PRODUCT OWNER ARCHITECTURE REVIEW.**

Draft PR #3 remains open/draft/unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked. Merge is not authorized.

Authority:

- `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
- `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`
- `prompts/codex/NEXT_PROMPT.md` — HOLD

## Decision history

DEC-018 restores DEC-011's no-outreach policy and supersedes DEC-017 only where DEC-017 required contacting Bambu Lab or pursuing partner authorization. Do not contact Bambu Lab. The restrictions on Developer Mode, unsupported discovery work, private Bambu Cloud access, official-client impersonation, credential/token extraction, proprietary binary reverse engineering/redistribution, write/control operations and security weakening remain in force.

`DECISION_LOG.md` now mechanically indexes DEC-018 and marks DEC-011/DEC-017 consistently.

## Bounded spike result

The branch adds an isolated optional `@bpd/bambu-network-plugin-bridge` package and project-authored Windows native helper based only on public Bambu Studio declarations. It does not contain Bambu source headers, implementation code, binaries or proprietary fixtures.

The helper:

- locates only a normal user-installed Bambu Studio/Network Plugin or explicit local override;
- verifies both files with Authenticode and requires matching signer certificates;
- pins ABI prefix `02.08.02`;
- resolves only compatibility/version, discovery, local connect/disconnect and local message callback functions;
- sends host, serial and Access Code to the child only through its private environment and removes those variables immediately;
- uses an isolated temporary config/log directory and deletes it after use;
- emits private payloads only over child IPC for server-side parsing;
- exposes no arbitrary send, bind/unbind, cloud login, printing, motion, calibration, camera or file-transfer function.

The bridge is used only when `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`. Without that flag, the existing direct MQTTS/SSDP implementation remains active. Browser DTOs remain sanitized, and official discovery can supply the serial server-side so the browser asks only for the remaining Access Code.

## Evidence at handoff

Local official installation:

- Bambu Studio `02.08.02.61`
- Network Plugin `02.08.02.54`
- valid matching Authenticode signer certificates
- complete allowed symbol boundary present

Sanitized local results:

- `npm run m2:network-plugin:build` — passed.
- `npm run m2:network-plugin:probe` — passed; ABI prefix `02.08.02`.
- `npm run m2:network-plugin:discover` — zero candidates while Bambu Studio was running and owned the plugin's discovery/listener ports; this is not a clean standalone failure.
- final `npm run validate` — passed after documentation reconciliation with `43` Vitest tests.
- `npm run test:e2e` — `15` passed across desktop, tablet and mobile.
- `npm run docker:validate` — unavailable locally because Docker is not installed; verify the PR-head Docker Compose job after push.

No local real credential file is present. No real Access Code, serial, private IP, account data or raw plugin/device payload was read into evidence or committed.

## Required Product Owner action

Before permanent adoption, review the proprietary user-installed runtime dependency, no-redistribution posture, Windows/platform scope, ABI/version maintenance and operational coexistence implications.

For the clean A1 Mini/X2D retest:

1. Exit Bambu Studio but leave the official plugin installed.
2. Run the documented build/probe/discovery commands.
3. Set `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1` and launch the server/web prototype locally.
4. Enter the Access Code only through the loopback browser form; do not place secrets in chat/Git.
5. Verify A1 Mini and X2D enumeration and useful read-only status, including X2D while actively printing.
6. Commit only sanitized capability/reliability outcomes.

If the clean retest fails to provide reliable discovery and useful read-only monitoring for both printers, recommend M2 NO-GO / project termination. Do not add another workaround.

Never merge PR #3, adopt the proprietary plugin permanently or begin M3 without explicit Product Owner authorization.
