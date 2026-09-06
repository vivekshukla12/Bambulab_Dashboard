# Next Codex Task

## Status

HOLD — READY FOR PRODUCT OWNER CLEAN NETWORK PLUGIN RETEST.

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

No real printer test was performed during the remediation.

## Product Owner clean retest

This is a Product Owner hands-on gate, not an authorized Codex implementation task:

1. Fully exit Bambu Studio, including any background instance, while leaving the official Network Plugin installed.
2. From the repository root, run `npm run m2:network-plugin:build`.
3. Run `npm run m2:network-plugin:probe`.
4. Run `npm run m2:network-plugin:discover`.
5. If Windows geography is missing or incorrect, set `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` to the Product Owner's ISO 3166-1 alpha-2 code and repeat steps 3-4.
6. Set `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1` and launch `npm run dev:server`.
7. In a separate terminal, launch `npm run dev:web -- --host 127.0.0.1`.
8. Enter Access Codes only through the local memory-only dashboard flow. Do not place printer hosts, serials or Access Codes in commands, chat, logs or Git.
9. Verify A1 Mini and X2D automatic enumeration and useful read-only status, including X2D while actively printing, and record only sanitized outcomes.

If the corrected clean retest fails, do not queue another workaround. Return for M2 NO-GO / project-termination review.

PR #3 must remain draft and unmerged. Do not permanently adopt the proprietary Network Plugin or begin M3 without explicit Product Owner authorization.
