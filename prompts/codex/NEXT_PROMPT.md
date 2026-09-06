# Next Codex Task

## Status

HOLD — FEASIBLE FOR PRODUCT OWNER ARCHITECTURE REVIEW.

## Milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## Completed bounded spike

The DEC-018 no-outreach feasibility spike is implemented on existing branch `m2/real-device-readonly-prototype` / draft PR #3.

The optional Windows `@bpd/bambu-network-plugin-bridge` package independently uses the public Bambu Studio ABI declarations and only a user-installed official Network Plugin. It verifies matching valid Authenticode signer certificates, pins ABI prefix `02.08.02`, resolves only discovery/local-connect/local-message functions, keeps private endpoint/credential data server-side and exposes no write/control API. The existing direct MQTTS/SSDP adapter remains the default.

No Bambu binary, proprietary fixture, real credential, private endpoint or raw device payload is committed.

Sanitized local evidence:

- native helper build passed;
- installed official runtime/signature/ABI probe passed;
- automated build, unit/integration, browser, documentation and license checks passed locally;
- bounded discovery returned zero candidates while Bambu Studio was concurrently using the plugin listener ports, so a clean standalone Product Owner retest remains required;
- no real plugin-backed monitor session ran because no local credential file was present.

## Hold authority

Do not resume implementation until the Product Owner explicitly decides the architecture/dependency/licensing posture and authorizes the standalone real-device retest or next remediation.

The Product Owner review must consider:

- the proprietary, separately distributed and non-redistributable runtime dependency;
- official user installation through Bambu Studio;
- Windows-only spike scope and ABI/version maintenance;
- Bambu Studio/plugin listener coexistence;
- inability to exercise the proprietary runtime in Docker/public CI;
- preservation of the direct MQTTS/SSDP fallback and synthetic regression path;
- continued prohibition of outreach, Developer Mode, private cloud access/client impersonation, token/credential extraction, binary reverse engineering, AGPL implementation copying, write/control operations and security weakening.

If authorized, the clean retest must exit Bambu Studio, run the documented build/probe/discovery path, enable `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1`, and validate only A1 Mini/X2D automatic enumeration plus useful local read-only status. Credentials must remain local and must not enter GitHub/chat.

If the clean retest fails to establish reliable discovery and useful read-only monitoring for both printers, recommend **M2 NO-GO / PROJECT TERMINATION** rather than implementing another workaround.

## PR / milestone authority

Keep PR #3 draft and unmerged. Do not permanently adopt the proprietary Network Plugin. Do not begin M3 without explicit Product Owner authorization.
