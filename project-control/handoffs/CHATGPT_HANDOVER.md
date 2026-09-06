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

**Current state: REMEDIATION AUTHORIZED — COUNTRY/REGION FIX QUEUED BEFORE PRODUCT OWNER RETEST.**

Draft PR #3 remains open/draft/unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked. Merge is not authorized.

Authority:

- `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
- `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`
- `prompts/codex/NEXT_PROMPT.md` — QUEUED for the country/region remediation only.

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

## Country/region remediation authorization — 2026-09-06

Independent review found that the native helper initializes the Network Plugin with a hard-coded `US` country code. The Product Owner explicitly authorized a narrow fix before the clean real-device test.

Codex is authorized to:

- remove the hard-coded `US` value;
- support explicit `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` override;
- otherwise derive a country code from a safe Windows local geographic-locale API;
- normalize/validate it as ISO 3166-1 alpha-2;
- fail closed with a sanitized actionable diagnostic if it cannot resolve a valid value;
- add automated coverage and update the local runbook;
- rerun build/probe/validation/E2E/CI;
- return `NEXT_PROMPT.md` to HOLD when ready for the Product Owner clean retest.

Do not obtain the country/region from Bambu Studio account/cloud/profile data, Bambu Connect credentials, tokens, cookies or private IPC. Do not broaden the bridge or alter DEC-018 boundaries.

## Prior evidence before remediation

On prior head `0b395628d04cc492e3b59ddf25f0b2758b0aff09`:

- `npm run m2:network-plugin:build` — passed.
- `npm run m2:network-plugin:probe` — passed; ABI prefix `02.08.02`.
- `npm run m2:network-plugin:discover` — zero candidates while Bambu Studio was running and owned the plugin's discovery/listener ports; this is not a clean standalone failure.
- `npm run validate` — passed with `43` Vitest tests.
- `npm run test:e2e` — `15` passed across desktop, tablet and mobile.
- GitHub Actions run `34022690041` passed Fresh checkout validation and Docker Compose validation.

These results predate the country-code remediation and must not be treated as final validation of the new implementation.

## Required next sequence

1. Codex executes only the queued country/region remediation and returns the gate to HOLD.
2. Verify the resulting PR head and CI.
3. Product Owner exits Bambu Studio but leaves the official Network Plugin installed.
4. Product Owner runs documented build/probe/discovery commands.
5. Product Owner enables `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1` and launches the prototype locally.
6. Enter Access Codes only through the local memory-only flow; do not place secrets in chat/Git.
7. Verify A1 Mini and X2D automatic enumeration and useful read-only status, including X2D while actively printing.
8. Record only sanitized results.

If the corrected clean retest fails to provide reliable discovery and useful read-only monitoring for both printers, recommend M2 NO-GO / project termination. Do not add another workaround.

Never merge PR #3, adopt the proprietary plugin permanently or begin M3 without explicit Product Owner authorization.
