# M2 Real-Device Validation Specification

**Status:** Proposed technical-lead M2 baseline for Product Owner review  
**Milestone:** M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## 1. Objective

M2 must prove or disprove the central product feasibility assumption: Bambu Printer Dashboard can provide a genuinely useful, stable, local-first, read-only monitoring experience for both an A1 Mini and an X2D under the project's approved security, legal/interface, privacy, and architecture constraints.

M2 is a hard GO/NO-GO gate. Synthetic evidence alone cannot satisfy this milestone.

## 2. Authorized interface direction

The M2 implementation may evaluate and implement only a **standard-mode local MQTTS read-only status path** that consumes printer-originated status information which Bambu Lab publicly states remains available to third-party monitoring software, including Home Assistant-style monitoring.

The implementation must:

- operate without printer Developer Mode;
- operate without Fleet Hub hardware;
- avoid Bambu cloud-client impersonation;
- avoid private/partner-only SDK credentials or certificates;
- use only user-authorized local printer access;
- send no printer write/control commands;
- preserve normal TLS/certificate validation behavior and must not disable security checks merely to connect;
- isolate Bambu-specific transport/payload handling behind a dedicated read-only adapter package.

If the usable read path cannot be established without undocumented security bypass, signature circumvention, copied proprietary network-plugin behavior, Developer Mode, private authorization, or another prohibited mechanism, implementation must stop and report the boundary rather than improvise.

## 3. Real devices in scope

M2 validation requires both Product Owner devices:

1. Bambu Lab A1 Mini
2. Bambu Lab X2D

For each device, record only sanitized validation metadata needed to reproduce findings, such as:

- model family;
- firmware version;
- dashboard adapter version/commit;
- test date/time window;
- whether LAN-only mode is enabled, if relevant;
- capability result and observed update behavior.

Do **not** commit serial numbers, MAC addresses, IP addresses, LAN Access Codes, cloud/account identifiers, raw private device payload dumps, screenshots containing private identifiers, or production-like logs containing secrets.

## 4. Discovery and onboarding

### 4.1 Preferred flow

1. Server-side LAN discovery attempts to identify compatible printers without browser-side LAN scanning.
2. UI displays sanitized candidate information sufficient for the Product Owner to distinguish devices.
3. Product Owner selects the printer.
4. Dashboard requests the printer LAN Access Code only when required for the authorized local read connection.
5. Adapter establishes a read-only connection and verifies status reception.

### 4.2 Manual fallback

If automatic discovery is unavailable or unreliable, M2 must support manual onboarding using the minimum required local connection information, such as printer IP/hostname plus any required model/serial/access metadata.

The exact minimum fields must be discovered and documented during implementation rather than guessed into the public product contract.

### 4.3 Discovery non-goal

Perfect cross-platform zero-configuration discovery is not an M2 GO/NO-GO requirement. A reliable manual fallback is sufficient for M2 feasibility if the real monitoring path itself is useful.

## 5. LAN Access Code / credential handling

Real LAN Access Codes are sensitive credentials.

For M2 feasibility work:

- default to **memory-only, never persisted** handling for real Access Codes;
- never place a real Access Code in source control, test fixtures, browser storage, URLs, logs, diagnostics, screenshots, issue/PR text, generated docs, or CI variables;
- pass credentials from the local server-side runtime to the Bambu adapter only;
- redact known credential fields and authorization material from all structured logs;
- do not run real-device tests in shared/public CI;
- if the Product Owner later requests remembered credentials during M2, use only the already approved encrypted-at-rest `SecretStore` boundary and document that explicit consent; do not invent a new key-management architecture.

Switching to persisted real credentials is not required to pass the M2 feasibility gate.

## 6. Read-only enforcement

The M2 Bambu adapter must implement the existing read-only adapter contract.

It must not expose or execute methods for:

- start/stop/pause/resume print;
- movement/jogging/home;
- temperature setting;
- fan control;
- AMS control;
- calibration;
- firmware update;
- file upload/delete;
- camera/video initiation;
- LEDs or other device mutations;
- arbitrary command passthrough.

Discovery of a technically reachable write command is evidence only; it is not authorization to implement, test, or execute it.

Where practical, tests should assert that the real adapter surface contains no write/control contract.

## 7. Normalization boundary

Create a dedicated package equivalent to `packages/adapter-bambu-readonly` that depends on the existing adapter/domain contracts rather than leaking vendor payloads into application code.

Responsibilities:

- establish/maintain the authorized local read connection;
- parse only required status messages;
- normalize observed fields into existing domain types;
- map missing/unsupported data to capability states rather than fabricated defaults;
- attach source/freshness timestamps;
- expose adapter health without private payloads or credentials;
- reconnect with bounded backoff;
- detect and surface stale/unavailable/degraded states.

Vendor/raw payload shapes must remain adapter-internal. Raw private payload dumps must not be committed.

## 8. Required capability evidence matrix

For **each** A1 Mini and X2D, M2 must explicitly record one of:

- `proven-live` — reliably observed on the real device with useful update behavior;
- `proven-static` — reliably observed but not meaningfully live;
- `unavailable` — not exposed through the authorized path;
- `unreliable` — observed but too inconsistent for a V1 product claim;
- `not-tested` — test conditions did not permit validation.

Minimum fields to attempt:

| Capability | M2 importance |
|---|---|
| Device reachable / online status | Required |
| Printer lifecycle / active state | Required |
| Printing vs idle | Required |
| Print progress | Required when a print is active |
| Nozzle temperature | Required if exposed |
| Bed temperature | Required if exposed |
| Chamber temperature | Optional/model-dependent |
| Remaining time / ETA | Evidence only until proven |
| Layer/current-total layer | Evidence only until proven |
| Toolhead/position/speed/status fields | Evidence only until proven |
| Fan telemetry | Evidence only until proven |
| HMS/error information | Evidence only until proven |
| AMS/slot/filament/RFID fields | Evidence only until proven |
| Wi-Fi/network telemetry | Evidence only until proven |
| Job/file display metadata | Evidence only until proven |

Only proven, reliable fields may be promoted into downstream product promises.

## 9. Freshness and reliability semantics

M2 must validate more than successful initial connection.

For each device, demonstrate and record:

- initial connection time;
- normal status update cadence/observed latency;
- transition from idle to active printing where practical;
- progress changing during an active print;
- stale-state detection when expected updates stop;
- unavailable/offline state after printer/network interruption;
- reconnect/recovery after the printer/network returns;
- no false presentation of stale data as live;
- adapter behavior after dashboard server restart;
- simultaneous monitoring of A1 Mini and X2D.

Thresholds should be based on observed printer behavior, not hard-coded synthetic cadence assumptions. The adapter may derive freshness thresholds from measured cadence with sensible safety bounds.

## 10. Print-session observation

M2 must prove enough real state transitions to support future observed print-session history.

At minimum, where practical on each device, observe a sequence equivalent to:

`idle -> printing -> printing/progress updates -> completed or returned-to-idle`

The dashboard may persist normalized state/events needed to reconstruct the session. M2 does not need the full M4 job-history product UI.

## 11. GO/NO-GO thresholds

### 11.1 Device-level minimum

Each target printer must satisfy all of the following:

1. Connection can be established under the approved standard-mode read-only path without Developer Mode, Fleet Hub, cloud-client impersonation, private authorization, or weakened security controls.
2. Online/offline availability is reliably distinguishable.
3. Active printer/print state is reliably distinguishable.
4. During a real print, print progress is available and updates usefully **or**, if progress is genuinely unavailable on one model, an explicit Product Owner decision accepts a reduced product value proposition.
5. At least nozzle and bed temperature are available when the printer exposes them through the authorized path, or absence is documented as a material capability gap.
6. Stale/unavailable/reconnect behavior can be represented safely.
7. Connection can recover without manual dashboard process restart under ordinary printer/network interruption.
8. Real status can flow through the existing normalized server/API/UI architecture without model-specific product-layer branching.

### 11.2 Fleet-level minimum

M2 must also demonstrate:

- A1 Mini and X2D monitored concurrently by one dashboard instance;
- capability differences represented through the capability model;
- synthetic devices remain usable for deterministic regression tests;
- persistence/history receives normalized real observations without storing credentials or raw private payload dumps.

### 11.3 GO recommendation

Technical lead should recommend **GO** only if both devices provide enough stable real data that the dashboard can credibly deliver its core V1 monitoring value: availability, current operating/print state, useful print progress during printing, meaningful temperature/status telemetry, and safe freshness/recovery behavior.

### 11.4 CONDITIONAL GO

A **CONDITIONAL GO** may be recommended only when a missing field is non-core or clearly model-specific and the remaining telemetry still creates a useful monitoring product. Any reduced product claim must be explicitly approved by the Product Owner and reflected in `V1_FEATURE_SCOPE.md`.

### 11.5 NO-GO

Recommend **NO-GO / reassessment required** if either initial target device cannot provide stable useful read-only monitoring under the approved constraints, or if obtaining the required data would require a prohibited security/interface path.

NO-GO does not automatically end the project; it requires a formal Product Owner continue/re-scope/stop decision before M3.

## 12. Real-device evidence handling

Permitted repository evidence:

- sanitized capability matrix;
- aggregate timing/cadence measurements;
- pass/fail validation tables;
- redacted error categories;
- synthetic reproductions of real behavior that contain no private device material;
- firmware/model family notes without serial/IP/MAC/access-code identifiers.

Not permitted in repository:

- real LAN Access Codes;
- private keys/tokens/account credentials;
- serial numbers, MAC addresses or local IPs unless intentionally and irreversibly anonymized;
- raw MQTT/device payload captures;
- raw packet captures containing private device traffic;
- private printer screenshots/media;
- logs containing authentication material or uniquely identifying private metadata.

If debugging requires raw local evidence, keep it outside the repository, minimize retention, and convert findings into sanitized summaries or synthetic regression fixtures before committing.

## 13. Testing strategy

M2 must preserve the M1 synthetic suite and add:

### Automated/offline tests

- adapter contract tests for `adapter-bambu-readonly` using synthetic/sanitized fixture messages authored for the project;
- payload parser/normalizer tests for missing, malformed, partial and unknown fields;
- reconnect/backoff/freshness tests with mocked transport;
- credential-redaction tests;
- regression tests proving no write/control API surface;
- existing build, Vitest, TypeDoc, license, Playwright and Docker validation must continue to pass.

### Local real-device validation

Real-device tests run only on the Product Owner's LAN environment and are not part of public CI. Provide a documented local validation command or runbook that:

- accepts credentials interactively or through a non-committed local mechanism;
- prints only sanitized evidence;
- can target one or both printers;
- records the capability matrix without raw private payloads.

## 14. Prototype outcome

The M2 prototype should extend the existing dashboard so the Product Owner can:

- configure/connect the real A1 Mini and X2D locally;
- see real device cards alongside or instead of synthetic devices;
- open device detail pages driven by validated real capabilities;
- observe real live updates;
- see stale/offline/reconnecting/recovered states;
- restart the dashboard and reconnect safely;
- inspect credential-free diagnostics;
- switch back to synthetic mode for deterministic testing.

No visual redesign is required in M2. M1 UI modernization feedback remains deferred.

## 15. Explicit non-goals

M2 does not include:

- UI modernization/redesign;
- printer controls;
- camera/media;
- file management;
- Home Assistant or other integrations;
- full AMS product workflows;
- maintenance/notification product features;
- broad job-history UI;
- cloud monitoring;
- remote internet access;
- Developer Mode;
- Fleet Hub;
- Bambu partner/private authorization.

## 16. Stop conditions

Stop and return for Product Owner/technical-lead review if work would require:

- Developer Mode;
- disabling/weakening TLS/certificate validation;
- bypassing authorization/signature/security controls;
- private Bambu SDK/API credentials;
- Bambu cloud-client impersonation;
- executing write/control commands;
- copying proprietary Bambu network-plugin implementation;
- introducing a major architecture/framework/datastore change;
- committing real credentials/private payload dumps/device identifiers;
- broadening into M3+ scope;
- changing the product security model materially.

## 17. Acceptance evidence

Before technical acceptance, the M2 PR must include:

- exact branch and head SHA;
- automated validation results;
- clean-checkout and Docker regression evidence;
- sanitized A1 Mini capability matrix;
- sanitized X2D capability matrix;
- simultaneous dual-device validation;
- freshness/stale/offline/reconnect evidence;
- print-session transition evidence where practical;
- credential-handling/redaction evidence;
- known firmware/model limitations;
- updated risks and project-control state;
- technical GO / CONDITIONAL GO / NO-GO recommendation.

Milestone completion still requires Product Owner hands-on validation and explicit acceptance/merge authorization.
