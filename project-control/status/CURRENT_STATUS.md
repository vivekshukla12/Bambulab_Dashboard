# Current Status

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## State

**REMEDIATION AUTHORIZED — COUNTRY/REGION FIX QUEUED BEFORE PRODUCT OWNER RETEST.**

The bounded no-outreach Bambu Connect / user-installed official Network Plugin spike authorized by DEC-018 remains technically feasible for Product Owner architecture review, but the Product Owner has authorized one additional narrow remediation before the clean Windows real-device retest.

PR #3 remains open, draft and unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked.

## Authorized remediation — 2026-09-06

Independent review found that the project-authored native Network Plugin helper hard-codes the plugin country code to `US` during agent initialization. This is an unjustified environment assumption and could invalidate a real discovery/monitoring failure outside that region.

`prompts/codex/NEXT_PROMPT.md` is QUEUED to:

- remove the hard-coded `US` value;
- support explicit local override `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE`;
- otherwise derive an ISO 3166-1 alpha-2 country code from a safe Windows local geographic-locale API;
- validate/normalize the value;
- fail closed with a sanitized diagnostic if no valid country code can be resolved;
- preserve all existing DEC-018 security, licensing and interface boundaries;
- return the execution gate to HOLD after automated/CI validation.

No Bambu account/cloud/profile configuration, Bambu Connect credentials, tokens, cookies or private IPC may be read to obtain the region.

## Existing spike outcome

The optional Windows `@bpd/bambu-network-plugin-bridge` remains disabled unless explicitly enabled and uses only an official Network Plugin already installed by the user through Bambu Studio. It verifies official signed runtime compatibility, resolves only discovery/local-connect/local-message functions, keeps private device/credential data server-side, exposes no write/control API, and preserves direct MQTTS/SSDP plus synthetic regression paths.

Prior automated evidence on head `0b395628d04cc492e3b59ddf25f0b2758b0aff09` passed, including final GitHub Actions run `34022690041` with Fresh checkout validation and Docker Compose validation. That evidence predates the country-code remediation and must be rerun on the new implementation head.

## Product Owner clean retest gate

After Codex completes the country/region remediation and returns `NEXT_PROMPT.md` to HOLD:

1. Exit Bambu Studio completely while leaving the official Network Plugin installed.
2. Run the documented bridge build/probe/discovery commands.
3. Enable `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1` and start the normal local server/web prototype.
4. Verify automatic enumeration for A1 Mini and X2D.
5. Enter Access Codes only through the local memory-only flow.
6. Verify useful read-only status for both printers, including X2D while actively printing.
7. Record only sanitized outcomes.

If this corrected clean Product Owner retest fails to establish reliable discovery and useful read-only monitoring for both target printers, return for **M2 NO-GO / project-termination review** rather than implementing another workaround.

## Authority

- Current decision: `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
- Execution gate: `prompts/codex/NEXT_PROMPT.md` — QUEUED for country/region remediation only.
- PR #3 remains draft/unmerged.

Do not merge PR #3, permanently adopt the proprietary Network Plugin, or begin M3 without explicit Product Owner authorization.
