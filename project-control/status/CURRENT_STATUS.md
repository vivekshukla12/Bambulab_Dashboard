# Current Status

## Current milestone

M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## State

**SSDP REMEDIATION IMPLEMENTED LOCALLY — awaiting PR-head CI evidence, technical review and Product Owner discovery retest.**

On 2026-09-05 Codex executed the queued SSDP discovery remediation on PR #3. The M2 adapter now uses independently implemented server-side SSDP discovery with Node standard-library UDP, targeting the publicly observed Bambu printer service type `urn:bambulab-com:device:3dprinter:1`. The implementation preserves automatic scan, explicit Rescan, sanitized candidates, manual host fallback, edit/reconfigure, remove/delete, real-printer-focused normal UX and deterministic synthetic regression.

Local automated evidence on 2026-09-05:
- `npm run validate` — passed: TypeScript build, web build, Vitest `36` tests, TypeDoc generation and dependency-license inventory.
- `npm run test:e2e` — passed: Playwright `15` tests across desktop, tablet and mobile.
- `npm run docker:validate` — not runnable in the Codex workstation because Docker is unavailable (`docker` command not found); GitHub Actions Docker/Compose evidence must be checked after push.
- Real-device validation was not run because this Codex environment is not the Product Owner LAN with locally supplied credentials.

On 2026-08-30 the Product Owner retested PR #3 after the onboarding/configuration remediation. Automatic discovery / Rescan still returned no usable Bambu printer candidates, so the Product Owner considered the prototype not ready for detailed M2 testing. Research then verified that the prior PR #3 adapter implementation used mDNS (`224.0.0.251:5353` and `_bambu/_bblp/_printer` service queries). Public Bambu Studio behavior/issues and mature independent integrations provide strong evidence that Bambu LAN printer discovery is SSDP-based rather than mDNS-based. Automatic LAN discovery remains technically feasible; the prior discovery mechanism was the likely implementation error.

Authoritative research:
- `project-control/reviews/M2_DISCOVERY_INTERFACE_RESEARCH_2026-08-30.md`

Authoritative Product Owner feedback:
- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

Executable Codex gate:
- `prompts/codex/NEXT_PROMPT.md` — **HOLD** pending technical review, PR-head CI evidence and Product Owner discovery retest.

M2 is not accepted. PR #3 must remain draft/unmerged. M3 remains blocked.

## Repository / PR

- Repository: `vivekshukla12/Bambulab_Dashboard`
- Branch: `m2/real-device-readonly-prototype`
- Draft PR: #3 — `M2: real-device read-only GO/NO-GO prototype`
- Base: `main`
- Merge: not authorized

## Completed milestones

- M0 complete/merged 2026-08-22 — merge commit `bad179a0f847f9a478e2c167e62dd94760baa105`.
- M1 complete/merged 2026-08-24 — merge commit `42821596cc0bf80a302b12287063b3ee17f58f3a`.
- M1 visual/UI modernization feedback remains deferred to later planning / possible V1.1.

## M2 approved boundary

M2 remains limited to the approved standard-mode local MQTTS **read-only** status path through the dedicated Bambu adapter.

Do not use:
- Developer Mode;
- Fleet Hub dependency;
- printer write/control commands;
- weakened TLS/authentication/authorization/security;
- Bambu cloud-client impersonation;
- undocumented/private Bambu Cloud APIs;
- private/partner credentials;
- proprietary implementation copying;
- private live-device material in Git/public CI.

LAN Access Codes remain sensitive and process-memory-only by default.

## Verified M2 implementation state

PR #3 currently contains:
- `packages/adapter-bambu-readonly` with local MQTTS read-only transport;
- strict credential-bearing TLS plus `local-printer-chain` handling for local/private printer certificates;
- normalized telemetry, freshness, reconnect and partial-report accumulation;
- server-side SSDP printer discovery using the Bambu printer service type, bounded M-SEARCH, NOTIFY parsing, candidate deduplication and sanitized browser-facing DTOs;
- automatic discovery initiation + Rescan UI;
- manual host fallback;
- safe Edit/Reconfigure and Remove/Delete flows;
- real-printer-focused normal Fleet UX;
- deterministic synthetic adapter/scenarios retained for explicit development/regression use;
- mocked X2D startup lifecycle hardening.

The prior remediation head `8a5a09ddabd548720b0da2500ab1e3fc078cc3c1` passed GitHub Actions run `33320803532`, including fresh-checkout/browser/Docker Compose validation. That CI success does not validate the real LAN discovery protocol.

## Real-device evidence / Product Owner findings

### A1 Mini

Earlier Product Owner testing established limited feasibility: A1 Mini connected through the approved read-only path and basic live telemetry including nozzle temperature and Wi-Fi/network data was observed. This is limited evidence only, not full M2 validation.

### X2D

The Product Owner reported inability to connect X2D while it was actively printing. Root cause remains unresolved. Ecosystem research indicates X2D read-only monitoring is technically feasible, so this remains an implementation/model/firmware validation issue rather than proof that X2D monitoring is impossible.

### Discovery — retest pending

The Product Owner's 2026-08-30 retest showed the prior Rescan flow did not discover usable printers.

That implementation queried mDNS. Research found:
- Bambu Studio uses/depends on automatic LAN discovery, with known failures when multicast/network topology interferes;
- Bambu Studio public issue reports/logs explicitly reference SSDP;
- mature Home Assistant Bambu integration registers SSDP discovery for `urn:bambulab-com:device:3dprinter:1`;
- therefore M2 replaced printer mDNS discovery with independently implemented server-side SSDP discovery and retained manual fallback.

Perfect zero-config discovery is still not guaranteed across VLANs, guest Wi-Fi, AP isolation, VPNs, firewalls, containers or multicast-suppressed networks. Product Owner LAN retest is required to decide whether SSDP discovery now unblocks detailed M2 validation or whether a network-specific multicast limitation remains.

## Network Plugin / Cloud disposition

The Product Owner is open to broader Bambu integration if legally/contractually appropriate. Research disposition for M2:

- **Bambu Network Plugin / Bambu Connect:** Bambu officially supports these as part of third-party/control integration, but the stock Network Plugin is proprietary/closed-source and introducing it would be a material dependency/licensing/architecture decision. It is not required merely to solve LAN discovery/read-only monitoring. **Not authorized for current M2 remediation.**
- **Direct Bambu Cloud login/API:** Bambu states its cloud is private infrastructure governed by its user agreement and explicitly objects to unofficial clients impersonating official clients. No general public cloud API for this dashboard use case was established. **Direct reverse-engineered cloud integration is not authorized.**
- If local SSDP + approved read-only MQTTS ultimately proves insufficient, return for a separate Product Owner decision on an official Bambu partnership/supported integration route rather than silently expanding scope.

## Next action

No further product implementation is currently authorized. The SSDP remediation must now go through PR-head CI evidence, technical review and Product Owner discovery retest.

Do not resume the full M2 Excel test matrix until the SSDP remediation is independently reviewed and Product Owner discovery retest succeeds or the network-specific limitation is clearly established. Do not begin M3 and do not merge PR #3 without explicit Product Owner authorization.
