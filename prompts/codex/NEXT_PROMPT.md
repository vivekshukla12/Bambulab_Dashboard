# Next Codex Task

## Status
HOLD — M1 is complete and merged. M2 is the active planning milestone, but no real-device implementation task is yet authorized.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Objective while HOLD
Support planning/review only. Do not implement or access real printers until this file is deliberately replaced with a Product Owner-approved `QUEUED` M2 execution contract.

## Current authoritative state
Read first:
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `project-control/specs/M1_ARCHITECTURE.md`
4. `project-control/specs/V1_FEATURE_SCOPE.md`
5. `project-control/specs/MILESTONE_PLAN.md`
6. `project-control/specs/OPERATING_MODEL.md`
7. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
8. `project-control/decisions/DECISION_LOG.md`
9. `project-control/risks/RISK_REGISTER.md`
10. relevant M1 module READMEs/contracts/tests, only where needed for M2 planning.

## M1 closure
M1 was accepted by the Product Owner after hands-on validation and PR #2 was merged into `main` on 2026-08-24. Verified merge commit: `42821596cc0bf80a302b12287063b3ee17f58f3a`.

The Product Owner's UI feedback is non-blocking: the current UI is functionally acceptable but visually basic; no UI redesign is authorized now. Modernization is deferred to later planning / possible V1.1.

## M2 hard gate
M2 must prove sufficiently useful and reliable real read-only monitoring on **both** an A1 Mini and X2D. Synthetic evidence cannot pass M2.

If M2 cannot prove enough real read-only capability on both devices, downstream implementation must stop for a formal Product Owner reassessment before M3.

## Prohibited while HOLD
Do not:
- create an M2 implementation branch or PR;
- access, discover, connect to, or query real printers;
- request/use real LAN Access Codes;
- implement Bambu device protocols or cloud-client behavior;
- use Developer Mode;
- use Fleet Hub;
- use private Bambu partner/developer authorization;
- impersonate Bambu cloud clients;
- add printer write/control commands;
- weaken or bypass vendor/device security or authentication;
- commit live device dumps, credentials, private identifiers, logs, screenshots/media, or unsanitized real-device evidence;
- start M3+ scope.

## Planning work permitted
- Review the existing read-only adapter/domain contracts from M1.
- Define the smallest supported/authorized M2 real-read adapter experiment.
- Define discovery + manual fallback and LAN Access Code consent/secret-handling behavior.
- Define a per-device capability evidence matrix and success thresholds.
- Define reconnect/freshness/offline/firmware variance tests.
- Define safe real-device evidence capture/sanitization rules.
- Define M2 automated tests and Product Owner hands-on validation steps.
- Identify any material architecture/security/interface decision that requires Product Owner approval before implementation.

## Queue transition rule
Only after technical-lead review and explicit Product Owner approval may this file change to `QUEUED`. The queued version must contain the complete M2 scope, allowed real-device activity, non-goals, security/data handling rules, tests, GO/NO-GO acceptance thresholds, documentation requirements, branch/PR rules, stop conditions and merge gate.
