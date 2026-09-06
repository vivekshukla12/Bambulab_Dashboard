# Next Codex Task

## Status

QUEUED — COUNTRY/REGION REMEDIATION BEFORE PRODUCT OWNER RETEST.

## Milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## Product Owner authorization — 2026-09-06

The Product Owner authorizes one narrowly scoped remediation before the clean Windows Product Owner retest of the optional official Bambu Network Plugin bridge.

The current native bridge hard-codes the Network Plugin country code to `US` during agent initialization. Remove that assumption so a failed discovery/monitoring test cannot be attributed to an incorrect region value.

## Authorized task

Fix country/region handling for `@bpd/bambu-network-plugin-bridge` only.

Requirements:

1. Remove the hard-coded `US` value from native bridge initialization.
2. Use only local, non-sensitive sources for the country code. Do not read Bambu Studio account/profile/cloud configuration, Bambu Connect credentials, tokens, cookies or private IPC.
3. Support an explicit environment override named `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` for deterministic local testing.
4. When the override is absent, derive the country code from the Windows local user/system geographic locale using a documented Windows API where safely available.
5. Normalize and validate the resolved value as an uppercase ISO 3166-1 alpha-2 country code before passing it to the Network Plugin.
6. Do not silently fall back to `US` or another arbitrary country. If no valid local country code can be resolved, fail closed with a sanitized actionable diagnostic explaining how to set the explicit environment override.
7. Keep the resolved country code non-secret and safe to include in sanitized probe/test diagnostics if useful, but do not expose printer identifiers, hosts, serials, Access Codes or raw plugin payloads.
8. Preserve all DEC-018 boundaries: user-installed official Network Plugin only; no Bambu binary redistribution; no Developer Mode; no Bambu Cloud/private API/client impersonation; no token/credential extraction; no plugin reverse engineering; no AGPL implementation copying; no write/control operations; no security weakening.
9. Do not change the architecture, make the proprietary Network Plugin a permanent dependency, remove direct MQTTS/SSDP fallback, or alter M3 scope.

## Verification

Add/update automated coverage for at least:

- valid explicit override;
- lowercase override normalized to uppercase;
- invalid override rejected;
- Windows locale-derived country code path through a mockable/project-authored boundary;
- unresolved/invalid local country fails closed without an arbitrary default;
- existing bridge redaction/read-only/security invariants remain intact.

Run the relevant validation suite, including at minimum:

- `npm run m2:network-plugin:build`
- `npm run m2:network-plugin:probe`
- `npm run validate`
- `npm run test:e2e`
- `git diff --check`

Update the bridge README/runbook and project-control evidence/status/handover only as necessary to document the new country-code behavior and the exact clean Product Owner retest procedure.

Do not require or perform a real printer test on behalf of the Product Owner. Do not place Product Owner printer details or credentials in repository output.

## Completion gate

After remediation and automated/CI validation:

- push to existing branch `m2/real-device-readonly-prototype` / draft PR #3;
- record the final head SHA and CI status;
- return this file to **HOLD — READY FOR PRODUCT OWNER CLEAN NETWORK PLUGIN RETEST**;
- provide sanitized local commands for the Product Owner to test with Bambu Studio fully exited.

The clean retest must then prove A1 Mini and X2D automatic enumeration plus useful read-only status, including the previously unresolved X2D active-print case.

If that clean Product Owner retest fails after this country/region correction, do not implement another workaround; return for M2 NO-GO / project-termination review.

## PR / milestone authority

Keep PR #3 draft and unmerged. Do not permanently adopt the proprietary Network Plugin and do not begin M3 without explicit Product Owner authorization.
