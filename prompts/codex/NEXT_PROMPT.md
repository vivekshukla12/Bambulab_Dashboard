# Next Codex Task

## Status
HOLD — SSDP discovery remediation has been implemented on the active M2 PR branch and PR-head CI has passed. Await independent technical review and Product Owner discovery retest before authorizing more product implementation.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Completed Remediation
On 2026-09-05 Codex replaced the failed mDNS printer-discovery assumption in `packages/adapter-bambu-readonly` with independently implemented server-side SSDP discovery using Node standard-library UDP.

The implementation:

- targets the Bambu printer SSDP service type `urn:bambulab-com:device:3dprinter:1`;
- sends bounded active SSDP `M-SEARCH` requests and parses matching SSDP responses / NOTIFY alive messages;
- ignores unrelated services and `ssdp:byebye`;
- deduplicates candidates by server-side endpoint while returning only sanitized browser-facing candidate DTOs;
- keeps raw LAN endpoint data server-side;
- preserves automatic scan initiation, explicit Rescan, manual host fallback, edit/reconfigure, remove/delete, real-printer-focused normal UX and explicit synthetic regression mode;
- keeps the approved standard-mode local MQTTS read-only monitoring path;
- does not add Developer Mode, Fleet Hub, printer write/control, Bambu Cloud client impersonation, proprietary Network Plugin integration, private/partner credentials, security weakening, or real private device material.

## Local Automated Evidence
Validated in the Codex environment on 2026-09-05:

- `npm run validate` — passed: TypeScript build, web build, Vitest `36` tests, TypeDoc generation and dependency-license inventory.
- `npm run test:e2e` — passed: Playwright `15` tests across desktop, tablet and mobile.
- `npm run docker:validate` — not runnable locally because Docker is unavailable on the Codex workstation (`docker` command not found); GitHub Actions Docker/Compose validation passed after push.
- PR-head GitHub Actions after the SSDP remediation push passed fresh-checkout validation, browser E2E and Docker Compose validation.
- Local real-device validation was not run because this Codex environment is not the Product Owner LAN with locally supplied credentials.

## Review / Retest Gate
Do not claim M2 ready for detailed validation until PR-head automated/CI evidence passes and technical review accepts the SSDP remediation.

The Product Owner retest should verify:

1. entering onboarding automatically finds A1 Mini/X2D when LAN multicast conditions permit;
2. Rescan actually refreshes SSDP discovery;
3. selecting a candidate requires only Access Code / genuinely unavoidable missing metadata;
4. manual fallback remains usable if SSDP cannot cross the local network topology;
5. edit/reconfigure and remove/re-add still work;
6. A1 Mini remains connectable;
7. X2D can connect during an active print, or its remaining approved-path limitation is surfaced clearly.

## PR / Authority
Continue only on existing branch `m2/real-device-readonly-prototype` and draft PR #3 if a future prompt explicitly changes this file back to `QUEUED`.

M2 is not accepted. Product Owner acceptance and merge authorization remain separate decisions. Do not begin M3. Do not merge PR #3.
