# Current Status

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## State

**HOLD — official Bambu-supported integration viability gate.**

On 2026-09-05 the Product Owner reported that the SSDP-based prototype still cannot automatically find the printers in hands-on use. This follows earlier failed mDNS discovery and an unresolved X2D active-print connection failure. The Product Owner has therefore decided that further unsupported discovery/cloud reverse-engineering is not justified.

The project may continue only if Bambu Lab provides a documented, supported integration path that is technically and contractually suitable for this open-source dashboard. If no such path exists, the preferred disposition is project termination rather than continued workaround development.

Authoritative decision:
- `project-control/decisions/DECISION_LOG.md` — DEC-017

Authoritative viability review:
- `project-control/reviews/M2_OFFICIAL_BAMBU_INTEGRATION_VIABILITY_2026-09-05.md`

Executable gate:
- `prompts/codex/NEXT_PROMPT.md` — **HOLD** pending external Bambu integration viability.

M2 is not accepted. PR #3 remains draft/unmerged. M3 remains blocked.

## Verified implementation / evidence

PR #3 currently contains:
- local standard-mode MQTTS read-only adapter;
- strict credential-bearing TLS and local certificate handling;
- normalization, freshness, reconnect and sparse-frame accumulation;
- server-side SSDP discovery targeting `urn:bambulab-com:device:3dprinter:1`;
- automatic discovery initiation + Rescan UI;
- manual host fallback;
- Edit/Reconfigure and Remove/Delete flows;
- real-printer-focused normal Fleet UX;
- explicit synthetic regression mode;
- mocked X2D startup lifecycle hardening.

Codex automated evidence on 2026-09-05 passed build/Vitest/TypeDoc/license validation, Playwright E2E, and PR-head GitHub Actions including Docker Compose validation. This automated success does not overcome the Product Owner hands-on finding that automatic discovery still fails in the real environment.

Earlier A1 Mini testing established only limited basic live telemetry feasibility. X2D connectivity while actively printing remains unresolved.

## Official Bambu integration research disposition

Public Bambu statements establish two important boundaries:

1. Bambu Cloud is private infrastructure governed by a user agreement; unofficial software must not impersonate official Bambu clients. Reverse-engineered cloud-client impersonation is therefore not an acceptable project path.
2. Bambu explicitly invites third-party and farm-management software developers to work directly with Bambu Lab to implement proper authorization controls and provides a developer-partnership contact route. Bambu Connect / Network Plugin / Farm Manager or another partner interface may therefore be viable only under documented Bambu-supported terms.

No public review has yet established a general-purpose cloud/API contract suitable for this dashboard, nor confirmed licensing/redistribution/MPL compatibility, fees, NDA/certificate requirements, or supported models/platforms.

## Next action

No further Codex/product implementation is authorized.

The next project action is external feasibility:
1. obtain official Bambu guidance/documentation for a supported third-party integration route;
2. determine whether it supports printer enumeration/discovery, read-only telemetry, A1 Mini and X2D, and suitable authentication without client impersonation;
3. review licensing, redistribution, open-source/MPL compatibility, fees, NDA/certificate requirements, supported platforms, privacy and security constraints;
4. return to Product Owner architecture/security/dependency review before any implementation resumes.

If Bambu does not provide a suitable supported route, recommend terminating the project and closing M2/PR #3 through explicit Product Owner decision.

Do not begin M3 and do not merge PR #3 without explicit Product Owner authorization.
