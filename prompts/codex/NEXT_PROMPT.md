# Next Codex Task

## Status

HOLD — CLEAN NETWORK PLUGIN RETEST PASSED; PRODUCT OWNER M2 DECISION REQUIRED.

## Milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## Completed remediation — 2026-09-06

Implementation commit `9cf1d4d542c6ca7ed0fd76ed83c24c340f993b98` removed the hard-coded Network Plugin country value. The optional bridge now uses explicit `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` when set and otherwise reads the current Windows user's geographic region through the documented `GetUserDefaultGeoName` API. It normalizes and validates ISO 3166-1 alpha-2 before plugin initialization and fails closed with a sanitized override instruction when no valid value is available.

The bridge does not read Bambu account/cloud/profile configuration, Bambu Connect credentials, tokens, cookies or private IPC for country/region. DEC-018 security, licensing, read-only and no-redistribution boundaries remain unchanged.

Validation passed:

- `npm run m2:network-plugin:build`
- `npm run m2:network-plugin:probe` — ABI prefix `02.08.02`, Windows-derived country code `DE`
- `npm run validate` — `52` Vitest tests plus TypeDoc/license validation
- `npm run test:e2e` — `15` Playwright tests
- `git diff --check`
- GitHub Actions run `34035325621` — Fresh checkout validation and Docker Compose validation passed

No real printer test was performed by Codex during the remediation.

## Product Owner clean retest result — 2026-09-06

The Product Owner completed the requested standalone browser retest and supplied sanitized evidence:

- Explicit Rescan discovered two official Network Plugin candidates without manual host entry.
- The A1 Mini connected with live nozzle/bed/Wi-Fi telemetry.
- The X2D connected while actively printing with live printing state, `82%` progress and nozzle/bed/Wi-Fi/AMS telemetry.
- Both printers were live simultaneously; fleet summary showed two live, zero stale and zero unavailable.
- No host, serial, Access Code or raw plugin payload appeared in the evidence.

This passes the specific corrected clean-retest scenario and resolves the prior X2D active-print failure for this workstation/test session. Remaining evidence gaps include A1 Mini lifecycle/progress and controlled stale/offline/reconnect behavior.

No Codex implementation task is queued. The Product Owner must now make an explicit M2 GO / CONDITIONAL GO / NO-GO decision and separately approve or reject permanent support for the optional user-installed proprietary Network Plugin. Until then, do not implement another workaround, merge PR #3, adopt the dependency or begin M3.
