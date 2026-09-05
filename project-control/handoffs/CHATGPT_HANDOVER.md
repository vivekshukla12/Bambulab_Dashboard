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

## Product/governance baseline

Bambu Printer Dashboard is an independent, open-source, local-first/read-only-first monitoring dashboard for compatible Bambu Lab printers. Product Owner controls scope, architecture, dependencies, security/privacy boundaries, milestone acceptance and merges. Repository license is MPL-2.0.

Completed:
- M0 merged: `bad179a0f847f9a478e2c167e62dd94760baa105`
- M1 merged: `42821596cc0bf80a302b12287063b3ee17f58f3a`

M1 UI modernization remains deferred.

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO.

**Current state: HOLD pending official Bambu-supported integration viability.**

Draft PR #3 remains open/draft/unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked. Merge is not authorized.

Authoritative decision:
- DEC-017 in `project-control/decisions/DECISION_LOG.md`

Authoritative viability review:
- `project-control/reviews/M2_OFFICIAL_BAMBU_INTEGRATION_VIABILITY_2026-09-05.md`

Codex gate:
- `prompts/codex/NEXT_PROMPT.md` — HOLD.

## Why the project is on hold

The project tried two local automatic-discovery implementations:
- prior mDNS discovery failed hands-on;
- SSDP discovery was implemented on 2026-09-05 with automated/CI success, but the Product Owner reports the prototype still cannot automatically find the printers in real use.

A1 Mini previously demonstrated limited basic live telemetry. X2D active-print connectivity remains unresolved.

The Product Owner has decided that additional unsupported discovery/cloud reverse-engineering is not worth further investment. The project should continue only through a Bambu-supported integration path; if none is available and suitable, recommend project termination.

## Official Bambu boundary

Current public-source conclusion:
- Bambu Lab states its cloud is private infrastructure governed by a user agreement and that unofficial clients must not impersonate official Bambu clients. Do not implement reverse-engineered cloud login/client impersonation.
- Bambu Lab explicitly invites third-party/farm-management software developers to work with it on proper authorization controls and provides a developer-partnership route.
- Bambu Connect, Network Plugin, Farm Manager, partner API, or another official interface may be viable only after Bambu provides/documented supported terms suitable for this project.

Do not assume a community-observed or undocumented API is authorized.

## Current stop conditions

No further Codex/product implementation until Product Owner reviews official Bambu integration information.

Do not:
- continue SSDP/mDNS experimentation;
- use Developer Mode;
- impersonate Bambu Studio/Handy/Connect;
- use undocumented/private Bambu Cloud APIs;
- bundle/copy proprietary Network Plugin code;
- add Farm Manager/proprietary dependencies without approval;
- weaken TLS/auth/signatures/security;
- begin M3;
- merge PR #3.

## Next external feasibility questions

Obtain official Bambu guidance/documentation covering:
1. supported third-party printer enumeration/discovery;
2. read-only telemetry/status access;
3. authentication/authorization model;
4. A1 Mini and X2D support;
5. Bambu Connect / Network Plugin / Farm Manager / partner API applicability;
6. licensing/redistribution/MPL-2.0 compatibility;
7. commercial-use terms, fees, NDA, certificates/keys;
8. platform/deployment constraints;
9. privacy/data-processing requirements.

If a suitable official route exists, return for Product Owner architecture/security/dependency approval before implementation. If not, recommend explicit project termination and close M2/PR #3.
