# M2 Planning Technical Review

**Milestone:** M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype  
**Reviewer role:** Technical lead / architect  
**Disposition:** APPROVE FOR PRODUCT OWNER REVIEW  
**Implementation authorization:** Not granted by this review

## Reviewed basis

- `project-control/status/CURRENT_STATUS.md`
- `project-control/specs/OPERATING_MODEL.md`
- `project-control/specs/MILESTONE_PLAN.md`
- `project-control/specs/M1_ARCHITECTURE.md`
- `project-control/specs/V1_FEATURE_SCOPE.md`
- `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
- `project-control/decisions/DECISION_LOG.md`
- `project-control/risks/RISK_REGISTER.md`
- accepted M1 implementation/module boundaries
- public Bambu authorization-control statements preserving status pushes for third-party monitoring while restricting critical controls
- `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
- `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`

## Architecture assessment

The proposed M2 plan is compatible with the accepted M1 architecture. A dedicated `adapter-bambu-readonly` package is the correct extension point and preserves the normalized read-only adapter boundary, synthetic regression path, server-owned connection/freshness model, persistence boundaries, and capability-driven UI.

No major framework, datastore, deployment or application-architecture change is required.

## Interface/security assessment

The proposed interface is deliberately narrow: standard-mode local MQTTS status consumption only. It is consistent with the current project decision to evaluate Bambu status information that the vendor publicly states remains available to third-party monitoring, while excluding control operations.

The plan correctly treats these as hard stop conditions:

- Developer Mode;
- Fleet Hub/private partner authorization;
- cloud-client impersonation;
- TLS/security weakening;
- authorization/signature bypass;
- proprietary network-plugin copying;
- write/control commands.

The most material unresolved risk is not architecture but feasibility: public vendor statements preserve monitoring, while low-level client behavior and actual field coverage may still differ by firmware/model. M2 is explicitly designed to answer that question before M3 investment.

## Credential/privacy assessment

For this feasibility milestone, defaulting real LAN Access Codes to process-memory-only handling is appropriate and lower risk than exercising persistent credential storage unnecessarily. Persistent encrypted credential support remains an approved future onboarding direction but is not needed to decide M2 GO/NO-GO.

The evidence rules are sufficient: no real credentials, serial/MAC/IP identifiers, raw private payload dumps, packet captures, private printer media or unsanitized logs in the public repository. Real-device validation remains local and outside public CI.

## Acceptance-threshold assessment

The M2 gate is sufficiently concrete. It requires both A1 Mini and X2D to demonstrate useful real monitoring, not merely successful socket connection. Core criteria cover:

- availability/online-offline;
- active printer/print state;
- useful real-print progress;
- meaningful temperature/status telemetry;
- safe stale/unavailable/reconnect behavior;
- recovery without dashboard-process restart;
- simultaneous dual-device monitoring;
- capability-driven normalized architecture;
- retained synthetic regression.

GO, CONDITIONAL GO and NO-GO outcomes are distinguished. A material loss of core usefulness on either initial printer cannot be silently waived.

## Scope assessment

The proposal correctly excludes UI modernization, printer controls, camera/media, file management, Home Assistant/integrations, full AMS workflows, M3 widgets/presets, maintenance/notifications, backup/update work and other downstream scope.

The Product Owner's M1 visual-design feedback remains deferred and does not affect M2 feasibility.

## Technical recommendation

**Approve the M2 real-device validation specification and Codex implementation proposal as the executable baseline, subject to explicit Product Owner authorization.**

Once the Product Owner explicitly approves M2 implementation:

1. replace `prompts/codex/NEXT_PROMPT.md` with the approved M2 contract and set status to `QUEUED`;
2. authorize Codex to create the M2 branch/draft PR;
3. permit controlled local access only to the Product Owner's A1 Mini and X2D under the specification;
4. keep merge and M2 acceptance separately Product Owner-controlled.

Until that explicit authorization, `NEXT_PROMPT.md` must remain HOLD and no real-printer access is permitted.
