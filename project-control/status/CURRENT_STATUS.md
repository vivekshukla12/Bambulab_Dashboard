# Current Status

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## State

**HOLD — CLEAN NETWORK PLUGIN RETEST PASSED; PRODUCT OWNER M2 DECISION REQUIRED.**

The bounded no-outreach Bambu Connect / user-installed official Network Plugin spike authorized by DEC-018 remains technically feasible for Product Owner architecture review. The authorized country/region remediation and clean Windows Product Owner retest are complete. The execution gate remains on HOLD pending the Product Owner's M2 GO/CONDITIONAL GO/NO-GO and architecture/dependency/licensing decision.

PR #3 remains open, draft and unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked.

## Completed remediation — 2026-09-06

Independent review found that the project-authored native Network Plugin helper hard-coded the plugin country code to `US` during agent initialization. Implementation commit `9cf1d4d542c6ca7ed0fd76ed83c24c340f993b98` removes that assumption.

The bridge now:

- gives explicit local override `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` priority;
- otherwise reads only the current Windows user's geographic region through the documented `GetUserDefaultGeoName` API;
- normalizes and validates against ISO 3166-1 alpha-2 before plugin initialization;
- fails closed with a sanitized override instruction when no valid code can be resolved;
- preserves all existing DEC-018 security, licensing and interface boundaries;
- never reads Bambu account/cloud/profile configuration, Connect credentials, tokens, cookies or private IPC for country/region.

Local validation passed native build/probe, `52` Vitest tests, TypeDoc/license validation, `15` Playwright E2E tests and `git diff --check`. The sanitized probe derived `DE` from Windows. GitHub Actions run `34035325621` passed Fresh checkout validation and Docker Compose validation for the implementation commit.

## Existing spike outcome

The optional Windows `@bpd/bambu-network-plugin-bridge` remains disabled unless explicitly enabled and uses only an official Network Plugin already installed by the user through Bambu Studio. It verifies official signed runtime compatibility, resolves only discovery/local-connect/local-message functions, keeps private device/credential data server-side, exposes no write/control API, and preserves direct MQTTS/SSDP plus synthetic regression paths.

Current remediation evidence is recorded in `project-control/feedback/M2_REAL_DEVICE_VALIDATION_EVIDENCE.md`. No real printer test was performed during the country/region correction, so this is not M2 GO/acceptance or permanent dependency approval.

## Product Owner clean retest result

The Product Owner completed the requested clean standalone retest:

1. Explicit Rescan discovered two sanitized official Network Plugin candidates without manual host entry.
2. The A1 Mini connected with live nozzle/bed/Wi-Fi telemetry.
3. The X2D connected while actively printing and exposed live printing state, `82%` progress, nozzle/bed/Wi-Fi/AMS telemetry.
4. Both printers remained connected simultaneously; the fleet showed two live, zero stale and zero unavailable.
5. Supplied screenshots exposed no host, serial, Access Code or raw plugin payload.

This passes the specific corrected retest scenario and resolves the previously observed X2D active-print connection failure for this workstation/test session. Remaining evidence gaps include controlled stale/offline/reconnect behavior and A1 Mini lifecycle/progress. The successful retest does not authorize permanent proprietary dependency adoption, merge or M3.

## Authority

- Current decision: `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
- Execution gate: `prompts/codex/NEXT_PROMPT.md` — HOLD pending Product Owner M2 and dependency decision.
- PR #3 remains draft/unmerged.

Do not merge PR #3, permanently adopt the proprietary Network Plugin, or begin M3 without explicit Product Owner authorization.
