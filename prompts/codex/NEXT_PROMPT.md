# Next Codex Task

## Status
HOLD — M2 planning package is technically reviewed and ready for Product Owner approval. No real-device implementation or printer access is authorized yet.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Objective while HOLD
Planning/review only. Do not implement, discover, connect to, or query real printers until the Product Owner explicitly approves the M2 implementation contract and this file is deliberately changed to `QUEUED`.

## Authoritative M2 planning package
Read these first:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
3. `project-control/reviews/M2_PLANNING_REVIEW.md`
4. `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/specs/MILESTONE_PLAN.md`
7. `project-control/specs/M1_ARCHITECTURE.md`
8. `project-control/specs/V1_FEATURE_SCOPE.md`
9. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
10. `project-control/decisions/DECISION_LOG.md`
11. `project-control/risks/RISK_REGISTER.md`
12. affected module-local READMEs/contracts/tests only as needed.

## Proposed authorized interface
If later queued, M2 will evaluate/implement only the standard-mode local **MQTTS read-only status path** for printer-originated status information.

The queued task must not use Developer Mode, Fleet Hub, private/partner Bambu authorization, cloud-client impersonation, write/control commands, disabled TLS/security checks, or copied proprietary Bambu network-plugin implementation.

## M2 hard gate
M2 must prove sufficiently useful and reliable real read-only monitoring on **both** the Product Owner's A1 Mini and X2D. Synthetic evidence cannot pass M2.

The technical GO threshold requires credible core monitoring value: availability, current operating/print state, useful print progress during real printing, meaningful temperature/status telemetry, and safe freshness/offline/reconnect behavior on both devices, plus simultaneous monitoring through the existing normalized architecture.

If that cannot be achieved under the approved constraints, downstream implementation stops for Product Owner reassessment before M3.

## Credential/data posture
If later queued:
- real LAN Access Codes default to memory-only/non-persisted handling for M2;
- real-device tests run only locally on the Product Owner's LAN, not public CI;
- credentials, serial/MAC/IP identifiers, raw private payloads, packet captures, private printer media and unsanitized logs must not be committed;
- repository evidence must be sanitized summaries/matrices or project-authored synthetic fixtures.

## Prohibited while HOLD
Do not:
- create an M2 implementation branch or PR;
- access/discover/connect to/query real printers;
- request/use real LAN Access Codes;
- implement Bambu transport code;
- start M3+ work;
- change architecture/security assumptions;
- merge anything for M2.

## Queue transition rule
Only explicit Product Owner approval of the reviewed M2 implementation proposal may change this file to `QUEUED`. The queued version must contain the complete execution contract and remains separate from later milestone acceptance/merge authorization.
