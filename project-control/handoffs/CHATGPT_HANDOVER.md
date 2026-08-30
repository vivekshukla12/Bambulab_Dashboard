# Bambu Printer Dashboard ChatGPT Handover

## Repository authority

GitHub is authoritative: `vivekshukla12/Bambulab_Dashboard`.

At the start of a new project/milestone chat, reconcile:
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `project-control/specs/OPERATING_MODEL.md`
5. relevant milestone/spec files
6. `project-control/decisions/DECISION_LOG.md`
7. `project-control/risks/RISK_REGISTER.md`
8. actual branch/PR/merge/commit/CI state.

Do not rely on chat memory where GitHub can verify state.

## Product / governance baseline

Bambu Printer Dashboard is a local-first, read-only-first browser/PWA operational dashboard for compatible Bambu Lab printers. The Product Owner retains final authority over scope, architecture, milestones, dependencies, security/privacy boundaries, branding, acceptance and merges.

Repository license: MPL-2.0. Preserve source notices, attribution and third-party provenance.

Every M1+ milestone must end with a runnable/testable prototype, automated validation, Product Owner hands-on feedback and project-control reconciliation before the next milestone is authorized.

Completed:
- M0 merge commit `bad179a0f847f9a478e2c167e62dd94760baa105`
- M1 merge commit `42821596cc0bf80a302b12287063b3ee17f58f3a`

M1 UI modernization feedback remains deferred.

## Approved architecture baseline

M1 approved:
- Node.js 24 LTS + TypeScript;
- React + Vite;
- Fastify;
- SQLite + better-sqlite3 + Kysely;
- npm workspaces + TS project references;
- Vitest + Playwright;
- TypeDoc;
- REST + SSE;
- direct local + Docker/Compose;
- server-owned connectivity/freshness/persistence;
- read-only adapter isolated from future control;
- capability-driven product behavior;
- deterministic synthetic adapter retained as permanent regression/test infrastructure;
- server-side printer discovery + LAN Access Code onboarding with manual fallback;
- Access Codes process-memory-only by default unless separately remembered through approved SecretStore policy.

See DEC-014 through DEC-016.

## Security / Bambu interface constraints

Current M2 constraints:
- no Developer Mode;
- no Fleet Hub dependency;
- no printer write/control;
- no weakened TLS/auth/security;
- no Bambu cloud-client impersonation;
- no undocumented/private Bambu Cloud API use;
- no private/partner credentials;
- no proprietary implementation copying;
- no real credentials/private identifiers/raw private traffic in Git or public CI.

M2 remains the approved standard-mode local MQTTS read-only path unless Product Owner separately changes the interface decision.

## Current milestone

M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype.

**Current state: REMEDIATION REQUIRED; Product Owner M2 testing is blocked by failed printer discovery. SSDP remediation is QUEUED.**

Draft PR #3 remains open, draft and unmerged on branch `m2/real-device-readonly-prototype`. Merge is not authorized. M3 remains blocked.

Executable gate:
- `prompts/codex/NEXT_PROMPT.md` — QUEUED for SSDP discovery remediation only.

Latest research:
- `project-control/reviews/M2_DISCOVERY_INTERFACE_RESEARCH_2026-08-30.md`

Latest Product Owner feedback:
- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

## Current implementation / evidence

PR #3 contains:
- `packages/adapter-bambu-readonly` local read-only MQTTS path;
- strict credential-bearing TLS and `local-printer-chain` support;
- normalization, freshness, reconnect and sparse-frame accumulation;
- automatic discovery initiation + Rescan UI;
- safe Edit/Reconfigure;
- safe Remove/Delete;
- manual host fallback;
- real-printer-focused normal Fleet UX;
- explicit synthetic dev/regression mode (`?synthetic=1`);
- mocked X2D startup lifecycle hardening.

Prior remediation head `8a5a09ddabd548720b0da2500ab1e3fc078cc3c1` passed GitHub Actions run `33320803532`. That does not prove real LAN discovery.

A1 Mini earlier connected through the approved read-only path and exposed limited basic live telemetry (nozzle temperature + Wi-Fi/network data). Do not overstate this as full validation.

Product Owner later reported X2D could not connect while actively printing; real root cause remains unresolved.

## Critical discovery finding — 2026-08-30

Product Owner retested the post-remediation Rescan and still got no usable printer candidates. Detailed M2 testing remains blocked.

Verified repository fact: current `packages/adapter-bambu-readonly/src/index.ts` performs Bambu printer discovery using **mDNS**, including multicast `224.0.0.251:5353` and `_bambu._tcp.local`, `_bblp._tcp.local`, `_printer._tcp.local` queries.

Research conclusion:
- automatic Bambu LAN printer discovery is technically possible;
- public Bambu Studio issues/logs reference **SSDP** discovery and show auto-discovery behavior;
- mature Home Assistant Bambu integration registers SSDP service type `urn:bambulab-com:device:3dprinter:1`;
- current mDNS implementation is therefore the likely wrong discovery mechanism;
- replace it with independently implemented server-side SSDP discovery, retaining manual fallback because multicast may fail across VLANs/AP isolation/guest networks/firewalls/VPNs/containers.

Do not claim guaranteed zero-config discovery on every network.

## Network Plugin / Cloud research disposition

The Product Owner is open to Bambu Network Plugin or cloud integration if appropriate, but neither is authorized for the current remediation.

- Bambu officially positions Bambu Connect / its Network Plugin as supported third-party/control integration routes. The stock networking plugin is proprietary/closed-source. Adding/bundling it would require a separate Product Owner architecture/dependency/licensing decision and is unnecessary merely for SSDP discovery + read-only MQTT monitoring.
- Bambu states its cloud is private infrastructure governed by its user agreement and explicitly objects to unofficial clients impersonating official clients. No general public cloud API for this dashboard use case was established. Direct reverse-engineered cloud login/API use remains prohibited under current decisions.
- If SSDP + approved local read-only MQTTS ultimately cannot meet product needs, return for a Product Owner decision on an official Bambu-supported/partnership path. Do not silently add another interface.

## Next authorized action

Codex may execute `prompts/codex/NEXT_PROMPT.md` only:
1. replace mDNS printer discovery with server-side SSDP;
2. keep automatic discovery + Rescan + sanitized candidates + manual fallback;
3. preserve existing edit/remove/real-printer UX/synthetic regression behavior;
4. add sanitized/mock SSDP tests and run full validation/CI;
5. return gate to HOLD for technical review/Product Owner retest.

Do not ask Product Owner to run the full Excel M2 matrix until discovery is working or a clear network-specific multicast limitation is established. Do not begin M3. Never merge PR #3 without explicit Product Owner authorization.
