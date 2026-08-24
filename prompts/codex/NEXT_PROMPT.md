# Next Codex Task

## Status
QUEUED — Product Owner authorized M2 implementation on 2026-08-24. This is the executable M2 contract.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Objective
Extend the accepted M1 architecture with a dedicated real Bambu read-only adapter and controlled local onboarding so the dashboard can prove or disprove useful, stable monitoring on the Product Owner's A1 Mini and X2D under `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`.

M2 is a hard real-device gate. Synthetic evidence alone cannot pass the milestone.

## Read first
Read only the minimum authoritative context needed for this task:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
3. `project-control/reviews/M2_PLANNING_REVIEW.md`
4. `prompts/codex/M2_IMPLEMENTATION_PROPOSAL.md`
5. `project-control/specs/M1_ARCHITECTURE.md`
6. `project-control/specs/V1_FEATURE_SCOPE.md`
7. `project-control/specs/OPERATING_MODEL.md`
8. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
9. `project-control/specs/MILESTONE_PLAN.md`
10. `project-control/decisions/DECISION_LOG.md` — especially DEC-006 and DEC-010 through DEC-016
11. `project-control/risks/RISK_REGISTER.md` — especially R-013 through R-016
12. `docs/architecture/MODULE_MAP.md` and affected module-local README/contracts/tests only as needed.

Do not recursively ingest unrelated implementation areas.

## Branch / PR first
Before substantial implementation:

1. Start from the current `main` tip.
2. Create a dedicated M2 milestone branch using the repository's existing naming conventions.
3. Open a **draft PR** targeting `main`.
4. Keep the PR unmerged. Product Owner acceptance and merge authorization are separate future decisions.

Record the branch and draft PR in project-control state once they exist.

## Authorized interface
Implement/evaluate only the approved **standard-mode local MQTTS read-only status path** for printer-originated status information that can be consumed under the project's approved constraints.

The M2 implementation must operate without:
- printer Developer Mode;
- Fleet Hub hardware;
- Bambu partner/private authorization;
- Bambu cloud-client impersonation;
- printer write/control commands;
- disabled or weakened TLS/certificate/security checks;
- authorization/signature bypasses;
- copied proprietary Bambu network-plugin implementation.

If useful read monitoring cannot be established without a prohibited mechanism, stop and report the boundary. Do not improvise around vendor security or authorization controls.

## Required implementation

### 1. Dedicated real read-only adapter
Create a bounded package equivalent to `packages/adapter-bambu-readonly` implementing the existing read-only adapter/domain contracts.

It owns:
- local MQTTS status-consumption transport;
- connection lifecycle, bounded reconnect and backoff;
- parser/normalizer for required observed status fields;
- capability discovery/mapping;
- source timestamps, freshness and quality;
- credential-free health diagnostics;
- no write/control contract or arbitrary passthrough.

Vendor/raw payload shapes remain adapter-internal and must not leak into product-domain, persistence, API or UI contracts.

### 2. M2 onboarding/configuration
Add only the minimum onboarding needed to connect the Product Owner's real printers.

Preferred flow:
- server-side LAN discovery where safely feasible;
- user selects a sanitized candidate;
- request LAN Access Code only when required;
- reliable manual IP/hostname plus minimum required access metadata fallback.

Perfect zero-configuration discovery is not an M2 acceptance requirement. A reliable manual fallback is mandatory.

### 3. Credential handling
For M2 real-device validation, default real LAN Access Codes to **process-memory-only / never persisted**.

Rules:
- server-side only;
- never browser storage;
- never URLs/query strings;
- never logs or normal diagnostics;
- never repository content, issue/PR text, generated docs, committed fixtures or public CI secrets;
- never echoed by local validation commands.

Do not persist a real Access Code unless the Product Owner separately requests it and the already-approved `SecretStore` boundary can be used without inventing new key-management architecture.

### 4. Normalized real telemetry
Attempt and classify the M2 capability matrix for **both** A1 Mini and X2D.

Core target evidence:
- availability/connectivity;
- printer lifecycle / active state;
- printing versus idle;
- useful print progress during a real print;
- nozzle temperature where exposed;
- bed temperature where exposed;
- timestamps/freshness/quality;
- state transitions sufficient to support future observed print-session history.

Additional fields such as chamber temperature, ETA, layer counts, motion/speed, fans, HMS, AMS/filament/RFID, network telemetry and job metadata may be normalized only when reliably observed. Do not fabricate defaults for unsupported or missing data.

### 5. Freshness and reliability
Implement and validate:
- initial connection;
- observed normal update cadence;
- stale detection;
- offline/unavailable detection;
- bounded reconnect/recovery;
- recovery without manual dashboard-process restart after ordinary interruption;
- dashboard server restart/reconnect behavior;
- simultaneous A1 Mini + X2D monitoring;
- no presentation of stale data as live.

Do not assume synthetic timing represents real-printer cadence. Base thresholds on observed behavior with sensible safety bounds.

### 6. Persistence
Persist normalized real observations through the existing persistence boundaries. Do not persist raw vendor payloads or credentials.

Prove enough normalized state/event persistence to support future observed print-session history without building the later M4 job-history product.

### 7. UI
Extend the accepted M1 UI only as needed to:
- configure/select/connect real printers;
- distinguish real versus synthetic sources;
- display validated real state/capabilities;
- display stale/offline/reconnecting/recovered semantics;
- expose credential-free diagnostics.

**Do not redesign or modernize the frontend in M2.** The Product Owner explicitly deferred that work.

### 8. Synthetic regression
Synthetic mode remains a permanent deterministic path. Existing M1 synthetic scenarios and prior validated behavior must continue to work.

## Automated/offline tests
Add at minimum:
- adapter contract tests using project-authored synthetic/sanitized fixture messages;
- parser/normalizer tests for partial, malformed, missing and unknown fields;
- reconnect/backoff/freshness tests with mocked transport;
- credential/log-redaction tests;
- tests proving the M2 adapter/API surface exposes no printer write/control capability;
- synthetic regression coverage;
- existing build/Vitest validation;
- Playwright E2E;
- TypeDoc/source-documentation checks;
- dependency/license checks;
- Docker/Docker Compose validation.

All new original source files must follow the repository MPL-2.0 source-file notice policy. Preserve third-party license/provenance and use only commercially safe, MPL-compatible dependencies. Any significant new dependency is a stop condition unless already covered by an approved decision.

## Local real-device validation
Real-device validation is explicitly authorized only on the Product Owner's LAN and only for the Product Owner's A1 Mini and X2D under this contract.

Provide a documented local-only validation path that:
- accepts required connection information through a non-committed local mechanism;
- never echoes LAN Access Codes;
- validates each printer individually and both concurrently;
- exercises real active-print progress where practical;
- exercises stale/offline/reconnect/recovery scenarios where practical;
- emits only sanitized capability/timing/pass-fail output suitable for repository evidence.

Do not run real-device validation in public/shared CI.

## Repository evidence policy
Permitted committed evidence includes:
- sanitized capability matrices;
- aggregate timing/cadence measurements;
- pass/fail validation tables;
- redacted error categories;
- firmware/model-family notes;
- project-authored synthetic reproductions containing no private live-device material.

Do not commit:
- LAN Access Codes or other credentials;
- serial numbers, MAC addresses, local IPs or account identifiers;
- raw MQTT/device payload dumps;
- packet captures containing private device traffic;
- private printer screenshots/media;
- unsanitized logs or shell output containing identifying/private material.

If raw local debugging evidence is temporarily required, keep it outside the repository, minimize retention, and convert findings to sanitized summaries or project-authored synthetic fixtures before commit.

## Required M2 evidence
For each A1 Mini and X2D classify attempted capabilities as:
- `proven-live`;
- `proven-static`;
- `unavailable`;
- `unreliable`;
- `not-tested`.

Also record sanitized evidence for:
- firmware version;
- initial connection behavior;
- observed update cadence/latency;
- real-print progress behavior;
- stale/offline/reconnect behavior;
- relevant print-session transitions;
- simultaneous dual-device behavior;
- model/firmware limitations;
- credential/redaction controls.

## GO / CONDITIONAL GO / NO-GO gate
The implementation completion report must recommend exactly one disposition.

### GO
Both A1 Mini and X2D support stable, useful real read-only monitoring under approved constraints, including availability, current operating/print state, useful progress during printing, meaningful temperature/status telemetry, safe freshness/reconnect behavior, and simultaneous normalized monitoring.

### CONDITIONAL GO
Only a non-core/model-specific gap remains and the remaining telemetry still supports a useful product. State the exact V1 claim reduction that requires Product Owner approval.

### NO-GO / reassessment required
Either target printer cannot provide stable useful monitoring, or required data depends on a prohibited interface/security mechanism. Stop downstream implementation and return for Product Owner reassessment. Do not begin M3.

## Explicit non-goals / prohibited scope
Do not implement or test:
- any printer write/control command;
- Developer Mode;
- Fleet Hub;
- cloud-client impersonation;
- camera/video initiation;
- printer file operations;
- AMS physical controls;
- Home Assistant or other integrations;
- M3 widgets/presets;
- frontend modernization/redesign;
- maintenance/notification product features;
- backup/update features;
- M3+ scope.

## Stop conditions
Stop and surface the issue before proceeding if work would require:
- Developer Mode;
- weakening TLS/vendor security;
- private Bambu credentials/SDK/partner authorization;
- cloud-client authentication impersonation;
- authorization/signature bypass;
- write/control traffic;
- proprietary implementation copying;
- major architecture/framework/datastore change;
- significant unapproved dependency/infrastructure addition;
- persisted real credentials requiring new key-management architecture;
- committing private live-device material;
- M3+ scope;
- any other material architecture/security/privacy change not already approved.

## Completion / PR evidence
Before requesting technical/Product Owner review, the M2 draft PR must include or link to:
- exact branch and final head SHA;
- automated validation results;
- clean-checkout and Docker regression evidence;
- sanitized A1 Mini capability matrix;
- sanitized X2D capability matrix;
- simultaneous dual-device evidence;
- freshness/stale/offline/reconnect evidence;
- real print-session transition/progress evidence where practical;
- credential-handling/redaction evidence;
- known firmware/model limitations;
- updated module documentation/source docs;
- updated risks, feedback notes, `CURRENT_STATUS.md`, `CHATGPT_HANDOVER.md`, and this execution gate as appropriate;
- technical GO / CONDITIONAL GO / NO-GO recommendation.

Milestone completion still requires Product Owner hands-on prototype validation, feedback reconciliation, explicit M2 gate decision, and separate merge authorization.

## Authority
This task is authorized for Codex execution. It authorizes implementation and controlled local real-device validation only within the boundaries above. It does **not** authorize M2 acceptance, merge, M3 work, printer controls, or any material architecture/security expansion.