# M2 Codex Implementation Proposal

**Status:** PROPOSAL — not executable until Product Owner approval and `prompts/codex/NEXT_PROMPT.md` is explicitly changed to QUEUED.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Objective
Extend the accepted M1 architecture with a dedicated real Bambu read-only adapter and controlled local onboarding so the dashboard can prove useful, stable monitoring on the Product Owner's A1 Mini and X2D under the constraints in `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`.

## Read first

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
3. `project-control/specs/M1_ARCHITECTURE.md`
4. `project-control/specs/V1_FEATURE_SCOPE.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/specs/SECURITY_PRIVACY_GUARDRAILS.md`
7. `project-control/specs/MILESTONE_PLAN.md`
8. `project-control/decisions/DECISION_LOG.md` — especially DEC-006, DEC-010 through DEC-016
9. `project-control/risks/RISK_REGISTER.md`
10. affected module READMEs and `docs/architecture/MODULE_MAP.md`

Do not recursively read unrelated implementation areas unless required by these contracts.

## Authorized interface

Implement/evaluate only the approved **standard-mode local MQTTS read-only status path** for printer-originated status information.

Do not use:
- Developer Mode;
- Fleet Hub;
- private/partner Bambu authorization;
- Bambu cloud-client impersonation;
- write/control commands;
- disabled TLS/certificate checks;
- proprietary Bambu network-plugin implementation copied into this project.

If the usable read path cannot be established under those constraints, stop and report the boundary rather than bypassing it.

## Required implementation

### 1. Real read-only adapter package
Create a bounded package equivalent to `packages/adapter-bambu-readonly` implementing the existing read-only adapter contract.

It should own:
- local MQTTS transport for status consumption;
- connection lifecycle/reconnect/backoff;
- parser/normalizer for required observed status fields;
- capability discovery/mapping;
- freshness timestamps and quality;
- credential-free health diagnostics;
- no write/control surface.

Vendor/raw payloads must not escape this package.

### 2. Configuration/onboarding
Add the minimum M2 onboarding needed to connect the Product Owner's real printers.

Preferred flow:
- server-side discovery where safely feasible;
- user selects a candidate;
- prompt for LAN Access Code when required;
- manual IP/hostname + required access metadata fallback.

Perfect discovery is not an M2 blocker. Reliable manual fallback is mandatory.

### 3. Credentials
For M2 real-device validation, default to **memory-only, never-persisted** real LAN Access Codes.

Rules:
- server-side only;
- never browser storage;
- never URL/query string;
- never logs/diagnostics;
- never repository/CI;
- never committed test fixtures;
- never public workflow secrets.

Do not persist a real Access Code unless the Product Owner separately requests it and the existing approved encrypted `SecretStore` boundary can be used without new key-management architecture.

### 4. Normalized real telemetry
Attempt and classify the capability matrix required by `M2_REAL_DEVICE_VALIDATION.md` for both A1 Mini and X2D.

Core target fields:
- availability/connectivity;
- active printer/print state;
- printing vs idle;
- print progress during a real print;
- nozzle temperature;
- bed temperature;
- timestamps/freshness/quality;
- state transitions sufficient for observed print-session history.

Additional fields such as chamber temperature, ETA, layer counts, position/speed, fans, HMS, AMS/filament/RFID, Wi-Fi and job metadata may be captured only if reliably observed. Do not fabricate unsupported values.

### 5. Freshness/reliability
Implement and validate:
- initial connection;
- normal update cadence;
- stale detection;
- offline/unavailable detection;
- bounded reconnect;
- recovery;
- server restart/reconnect;
- simultaneous A1 Mini + X2D monitoring.

Do not assume the synthetic adapter's timing is representative of real printers.

### 6. Persistence
Persist normalized real observations using the existing persistence boundaries. Do not persist raw vendor payloads or credentials.

M2 should prove enough state/event persistence to support future observed print-session history, without building the later M4 job-history product.

### 7. UI
Extend the existing M1 UI only as needed to:
- configure/select/connect real printers;
- distinguish synthetic and real sources;
- show validated real capabilities/state;
- show stale/offline/reconnect/recovery;
- expose credential-free diagnostics.

Do not redesign or modernize the frontend in M2. The Product Owner explicitly deferred that work.

### 8. Synthetic regression
Synthetic mode remains a permanent deterministic test path. Existing M1 synthetic scenarios must continue to work.

## Automated tests

Add at minimum:
- real adapter contract tests using project-authored synthetic/sanitized fixtures;
- parser/normalizer tests for partial/malformed/unknown fields;
- reconnect/backoff/freshness tests using mocked transport;
- credential/log redaction tests;
- tests asserting no write/control adapter/API surface;
- regression tests for synthetic mode;
- existing `npm run validate`, Playwright, TypeDoc/license and Docker/Compose validation.

Do not put real-device credentials or private payloads in CI.

## Local real-device validation

Provide a local-only documented validation path for the Product Owner's LAN.

It must:
- accept required connection information through a non-committed local mechanism;
- never echo LAN Access Codes;
- validate A1 Mini and X2D individually and concurrently;
- produce only sanitized capability/timing/pass-fail output suitable for repository evidence;
- allow hands-on dashboard testing.

Real-device validation is performed locally by/with the Product Owner, not public CI.

## Required M2 evidence

For each A1 Mini and X2D record a sanitized matrix with:
- `proven-live`;
- `proven-static`;
- `unavailable`;
- `unreliable`;
- `not-tested`.

Also record:
- firmware version;
- initial connection behavior;
- observed update cadence/latency;
- stale/offline/reconnect behavior;
- real-print progress behavior;
- relevant state transitions;
- simultaneous dual-device behavior;
- limitations/variance.

Never record serial number, MAC, IP, Access Code, account identity, raw private payload or private printer media in committed evidence.

## GO/NO-GO gate

The technical completion report must recommend one of:

### GO
Both A1 Mini and X2D support stable, useful real read-only monitoring under approved constraints, including availability, current state, useful print progress during printing, meaningful temperature/status telemetry, and safe freshness/reconnect behavior.

### CONDITIONAL GO
A non-core/model-specific gap exists, but remaining telemetry still supports a useful product. Clearly state any required V1 scope reduction for Product Owner approval.

### NO-GO / reassessment
Either target printer cannot provide a stable useful monitoring path, or required data would depend on a prohibited interface/security mechanism. Stop downstream milestone implementation pending Product Owner decision.

## Prohibited scope
Do not implement or test:
- any printer write/control command;
- Developer Mode;
- Fleet Hub;
- cloud-client impersonation;
- camera/video initiation;
- printer file operations;
- AMS control;
- Home Assistant/Alexa/Google/Daisy;
- M3 widgets/presets;
- UI redesign;
- maintenance/notifications;
- backup/update features.

## Branch / PR
When explicitly queued:
- create an M2 milestone branch from current `main`;
- open a draft PR before substantial implementation;
- do not merge;
- keep real secrets/private evidence outside Git;
- include sanitized evidence and project-control updates;
- request technical-lead/Product Owner review only after automated and local real-device evidence is complete.

## Stop conditions
Stop and report before proceeding if work requires:
- Developer Mode;
- weakening TLS/vendor security;
- private Bambu credentials/SDK;
- reverse-engineered cloud-client authentication;
- write/control traffic;
- proprietary code copying;
- major architecture/dependency change;
- committing private live-device material;
- M3+ scope.

## Authority
This file is a proposal only. Codex must not execute it while `prompts/codex/NEXT_PROMPT.md` remains HOLD. Product Owner acceptance and merge authority remain separate from implementation completion.
