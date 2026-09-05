# Next Codex Task

## Status
HOLD — external Bambu-supported integration viability gate.

## Milestone
M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## Why HOLD

On 2026-09-05 the Product Owner reported that the SSDP-based prototype still cannot automatically find the printers in hands-on use. Automated/CI success is therefore insufficient to establish an acceptable onboarding path.

The Product Owner has directed that the project should continue only if a legally/contractually supported Bambu Lab integration path exists. If no suitable supported path exists, the preferred disposition is to terminate the project rather than continue reverse-engineering around vendor controls.

Authoritative decision:
- `project-control/decisions/DECISION_LOG.md` — DEC-017

Authoritative viability review:
- `project-control/reviews/M2_OFFICIAL_BAMBU_INTEGRATION_VIABILITY_2026-09-05.md`

## Current rule

Do not implement any further M2 code until official Bambu interface/partnership information has been obtained and reviewed by the Product Owner.

Do not:
- continue mDNS/SSDP discovery experimentation;
- implement reverse-engineered Bambu Cloud login/API access;
- impersonate Bambu Studio, Handy, Connect, or another official Bambu client;
- enable Developer Mode;
- bundle/copy proprietary Network Plugin code;
- add Farm Manager or another proprietary dependency without explicit Product Owner approval;
- weaken TLS, authentication, signatures, authorization, or other security controls;
- begin M3;
- merge PR #3.

## External viability questions

Before implementation can resume, establish from Bambu Lab or official documentation:
1. whether a third-party dashboard may enumerate printers associated with a user's account and/or available on the LAN;
2. whether read-only telemetry/status monitoring is supported;
3. the approved authentication/authorization flow without official-client impersonation;
4. whether Bambu Connect, Network Plugin, Farm Manager, a partner API, or another interface is intended for this use case;
5. support for A1 Mini and X2D;
6. licensing/redistribution terms and MPL-2.0 compatibility;
7. commercial-use terms, fees, NDA requirements, certificates/keys, and partner requirements;
8. deployment/platform constraints;
9. privacy/data-processing obligations;
10. whether the supported interface can satisfy the dashboard's core product goals.

## Outcome gate

- If Bambu provides a suitable official route: return for Product Owner architecture/security/dependency review before any code is queued.
- If Bambu declines or no technically/contractually suitable route exists: recommend project termination and close M2/PR #3 through explicit Product Owner decision.

PR #3 remains draft and unmerged. M3 remains blocked.
