# Next Codex Task

## Status

**QUEUED — APPLY DEC-019 V1 SCOPE RESET AND RETURN FOR DIRECT-ONLY M2 RETEST.**

## Authority

The Product Owner approved DEC-019 on 10 October 2026.

Read first:

1. `project-control/specs/V1_PRODUCT_REQUIREMENTS.md`
2. `project-control/decisions/DEC-019_SIMPLIFIED_PLUGIN_FREE_V1.md`
3. `project-control/specs/MILESTONE_PLAN.md`
4. `project-control/status/CURRENT_STATUS.md`
5. `project-control/handoffs/CHATGPT_HANDOVER.md`
6. `project-control/specs/ARCHITECTURE_GUARDRAILS.md`
7. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
8. `project-control/risks/RISK_REGISTER.md`
9. current draft PR #3 state

## Milestone

M2 — Direct plugin-free local printer monitoring / supported-model gate

## Authorized implementation task

Reconcile the existing M2 branch to the simplified V1 production architecture.

### Remove from active V1 implementation

Remove the Network Plugin production/runtime path, including:

- `packages/bambu-network-plugin-bridge` and its active workspace/build integration;
- server/config feature flags and runtime wiring for the Network Plugin bridge;
- active UI/API behavior that assumes the plugin path;
- plugin-specific generated API docs/build references;
- normal runbook/README instructions that ask users to install/use Bambu Studio, Bambu Connect or Network Plugin.

Do **not** erase historical project-control decisions/reviews/evidence. Preserve them as history and mark them superseded/retired where necessary.

### Keep and harden

- direct local MQTTS read-only adapter;
- existing normalized domain/API/UI boundaries;
- strict TLS/security behavior;
- process-memory-only Access Code default;
- direct manual printer onboarding;
- edit/remove/reconfigure;
- optional server-side SSDP discovery only as best-effort convenience;
- synthetic regression mode;
- stale/offline/reconnect logic;
- Docker/Docker Compose packaging;
- privacy/redaction protections.

### Onboarding behavior

Manual IP/hostname + required local identity + LAN Access Code must be a normal supported workflow and must not be presented as a failure/fallback.

Automatic discovery may remain but:
- it must never be required to use the product;
- discovery failure must not block manual onboarding;
- no browser-side LAN scanning;
- no proprietary Bambu runtime;
- no cloud/device-account enumeration.

### Supported-model semantics

Add/document an explicit support classification suitable for V1:

- supported;
- experimental;
- unsupported;
- not-tested.

Do not claim X2D direct support from prior Network Plugin evidence. Existing A1 direct evidence may be retained as prior evidence but real Product Owner retesting remains required after cleanup.

### Prohibited

Do not:

- use or restore Network Plugin/Bambu Studio/Bambu Connect as runtime dependencies;
- use Bambu Cloud/private APIs or official-client impersonation;
- use Developer Mode or Fleet Hub;
- contact Bambu Lab;
- introduce paid services;
- execute printer writes/control;
- weaken TLS/auth/security;
- commit real credentials, serials, IPs or raw private payloads;
- begin M3.

## Validation

Run the complete relevant suite, including at minimum:

- `npm run validate`
- `npm run test:e2e`
- Docker Compose validation in CI
- `git diff --check`
- focused adapter/server/onboarding regressions

Add/update tests proving:

- product runs without Network Plugin package/runtime;
- manual onboarding works even when discovery returns none/fails;
- direct adapter remains read-only;
- stale/offline/reconnect behavior remains covered by mocks;
- browser/API responses redact private connection data;
- synthetic regression remains available.

## Documentation/project-control reconciliation

Update active README/runbooks/generated docs/module map to the DEC-019 direct-only architecture.

Keep `PRODUCT_REQUIREMENTS.md` unchanged.

Update status/handover/evidence/risk records with the final head SHA and validation results.

Return `NEXT_PROMPT.md` to:

**HOLD — READY FOR PRODUCT OWNER DIRECT A1 MINI/X2D M2 RETEST**

## Product Owner retest after implementation

The Product Owner will test on the LAN without Network Plugin/Bambu Studio dependency:

1. manually onboard A1 Mini and X2D using local connection details;
2. optionally observe whether best-effort SSDP discovers anything;
3. verify A1 Mini live monitoring;
4. verify X2D direct live monitoring, ideally while printing;
5. verify simultaneous monitoring if both connect;
6. perform a controlled offline/reconnect test;
7. report only sanitized outcomes.

If X2D does not work through the direct path, stop. Do not implement another workaround. Return for Product Owner support-matrix decision.

## PR / milestone authority

Keep PR #3 draft and unmerged. Do not begin M3.
