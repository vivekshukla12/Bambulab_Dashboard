# Current Status

## Current milestone

M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## State

**REMEDIATION REQUIRED — Product Owner M2 testing remains blocked by printer discovery. SSDP discovery remediation is QUEUED.**

On 2026-08-30 the Product Owner retested PR #3 after the onboarding/configuration remediation. Automatic discovery / Rescan still returned no usable Bambu printer candidates, so the Product Owner considers the prototype not ready for detailed M2 testing.

Research then verified that the current PR #3 adapter implements printer discovery using mDNS (`224.0.0.251:5353` and `_bambu/_bblp/_printer` service queries). Public Bambu Studio behavior/issues and mature independent integrations provide strong evidence that Bambu LAN printer discovery is SSDP-based rather than mDNS-based. Automatic LAN discovery remains technically feasible; the current discovery mechanism is the likely implementation error.

Authoritative research:
- `project-control/reviews/M2_DISCOVERY_INTERFACE_RESEARCH_2026-08-30.md`

Authoritative Product Owner feedback:
- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

Executable Codex gate:
- `prompts/codex/NEXT_PROMPT.md` — **QUEUED** for SSDP discovery remediation only.

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
- current **mDNS-based** printer discovery — now identified as the likely wrong discovery mechanism;
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

### Discovery — current blocker

The Product Owner's 2026-08-30 retest showed the Rescan flow still does not discover usable printers.

The current implementation queries mDNS. Research found:
- Bambu Studio uses/depends on automatic LAN discovery, with known failures when multicast/network topology interferes;
- Bambu Studio public issue reports/logs explicitly reference SSDP;
- mature Home Assistant Bambu integration registers SSDP discovery for `urn:bambulab-com:device:3dprinter:1`;
- therefore M2 should replace printer mDNS discovery with independently implemented server-side SSDP discovery and retain manual fallback.

Perfect zero-config discovery is still not guaranteed across VLANs, guest Wi-Fi, AP isolation, VPNs, firewalls, containers or multicast-suppressed networks.

## Network Plugin / Cloud disposition

The Product Owner is open to broader Bambu integration if legally/contractually appropriate. Research disposition for M2:

- **Bambu Network Plugin / Bambu Connect:** Bambu officially supports these as part of third-party/control integration, but the stock Network Plugin is proprietary/closed-source and introducing it would be a material dependency/licensing/architecture decision. It is not required merely to solve LAN discovery/read-only monitoring. **Not authorized for current M2 remediation.**
- **Direct Bambu Cloud login/API:** Bambu states its cloud is private infrastructure governed by its user agreement and explicitly objects to unofficial clients impersonating official clients. No general public cloud API for this dashboard use case was established. **Direct reverse-engineered cloud integration is not authorized.**
- If local SSDP + approved read-only MQTTS ultimately proves insufficient, return for a separate Product Owner decision on an official Bambu partnership/supported integration route rather than silently expanding scope.

## Next authorized action

Codex may execute only the SSDP discovery remediation queued in `prompts/codex/NEXT_PROMPT.md` on existing PR #3:

1. replace Bambu printer mDNS discovery with independently implemented server-side SSDP discovery;
2. keep automatic scan + Rescan + sanitized candidates;
3. keep manual fallback;
4. preserve Edit/Reconfigure, Remove/Delete and real-printer-focused UX;
5. preserve deterministic synthetic regression internally;
6. add mocked/sanitized SSDP tests and run full automated/CI validation;
7. return `NEXT_PROMPT.md` to HOLD after implementation for technical review / Product Owner retest.

Do not resume the full M2 Excel test matrix until the SSDP remediation is independently reviewed and Product Owner discovery retest succeeds or the network-specific limitation is clearly established. Do not begin M3 and do not merge PR #3 without explicit Product Owner authorization.
