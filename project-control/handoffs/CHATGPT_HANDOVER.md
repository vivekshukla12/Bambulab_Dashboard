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

**Current state: HOLD — READY FOR PRODUCT OWNER CLEAN NETWORK PLUGIN RETEST.**

Draft PR #3 remains open/draft/unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked. Merge is not authorized.

Authority:

- `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
- `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`
- `prompts/codex/NEXT_PROMPT.md` — HOLD pending the Product Owner's clean Network Plugin retest.

## Decision history

DEC-018 restores DEC-011's no-outreach policy and supersedes DEC-017 only where DEC-017 required contacting Bambu Lab or pursuing partner authorization. Do not contact Bambu Lab. The restrictions on Developer Mode, unsupported/private Bambu Cloud access, official-client impersonation, credential/token extraction, proprietary binary reverse engineering/redistribution, write/control operations and security weakening remain in force.

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

The bridge is used only when `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`. Without that flag, the existing direct MQTTS/SSDP implementation remains active.

## Country/region remediation completed — 2026-09-06

Independent review found that the native helper initialized the Network Plugin with a hard-coded `US` country code. The Product Owner-authorized narrow fix is complete in implementation commit `9cf1d4d542c6ca7ed0fd76ed83c24c340f993b98`.

The bridge now:

- gives `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` explicit priority;
- otherwise reads only the current Windows user's geographic region through the documented `GetUserDefaultGeoName` API;
- normalizes and validates the value against ISO 3166-1 alpha-2 before plugin initialization;
- fails closed with a sanitized override instruction when the override or Windows value is invalid/unavailable;
- has no arbitrary region fallback and does not read Bambu Studio account/cloud/profile data, Connect credentials, tokens, cookies or private IPC.

All DEC-018 security, licensing and interface boundaries remain unchanged.

## Current remediation evidence

On implementation head `9cf1d4d542c6ca7ed0fd76ed83c24c340f993b98`:

- `npm run m2:network-plugin:build` — passed.
- `npm run m2:network-plugin:probe` — passed; ABI prefix `02.08.02`, Windows-derived country code `DE`.
- `npm run validate` — passed with `52` Vitest tests plus TypeDoc and license validation.
- `npm run test:e2e` — `15` passed across desktop, tablet and mobile.
- `git diff --check` — passed.
- GitHub Actions run `34035325621` passed Fresh checkout validation and Docker Compose validation.

No real discovery or printer monitoring was run during this remediation. Real A1 Mini/X2D evidence remains pending.

## Required next sequence

1. Product Owner exits Bambu Studio completely, including any background instance, but leaves the official Network Plugin installed.
2. From the repository root, run `npm run m2:network-plugin:build`, `npm run m2:network-plugin:probe` and `npm run m2:network-plugin:discover`.
3. If Windows geography is missing or incorrect, set `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` to the Product Owner's ISO 3166-1 alpha-2 code and repeat the probe/discovery commands.
4. Set `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`, then launch `npm run dev:server` and `npm run dev:web -- --host 127.0.0.1` in separate terminals.
5. Enter Access Codes only through the local memory-only dashboard flow; do not place secrets in commands, chat, logs or Git.
6. Verify A1 Mini and X2D automatic enumeration and useful read-only status, including X2D while actively printing.
7. Record only sanitized results.

If the corrected clean retest fails to provide reliable discovery and useful read-only monitoring for both printers, recommend M2 NO-GO / project termination. Do not add another workaround.

Never merge PR #3, adopt the proprietary plugin permanently or begin M3 without explicit Product Owner authorization.
