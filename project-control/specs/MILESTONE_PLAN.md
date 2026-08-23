# Milestone Plan

**Status:** Revised read-only-first iterative plan approved for planning; implementation remains milestone-gated.

M0 is the governance bootstrap. Every **major product milestone M1+** must end with a runnable/testable prototype, automated validation, hands-on Product Owner feedback, and project-control reconciliation before the next milestone is authorized.

The PRD remains the requirement-ID baseline. `V1_FEATURE_SCOPE.md` defines the currently promised V1 boundary under approved feasibility constraints.

## M0 — Repository and governance foundation

**Objective:** Establish GitHub governance, requirements, legal/IP posture, security/privacy guardrails, milestone controls, and Codex queueing before feature development.

**Prototype:** Not applicable — M0 is the one-time governance foundation.

**Status:** Complete and merged.

---

## M1 — Architecture foundation + synthetic prototype + real-read feasibility design

**Objective:** Make the critical architecture/feasibility choices, prove the application architecture with a runnable synthetic prototype, and define the constrained read-only real-printer path that M2 must validate.

**Prototype outcome:** A locally runnable authenticated dashboard/PWA shell backed by an always-on service, showing a deterministic synthetic fleet with connectivity/status/telemetry, health diagnostics, and explicit stale/offline/unavailable semantics.

**Required work:**
- application/backend/frontend technology decision;
- datastore and explicit migration strategy;
- development/staging/production topology and packaging;
- local TLS approach;
- local application authentication/session architecture;
- configuration, secret/key and backup-recovery boundary;
- initial threat model;
- strong module/package boundaries and token-efficient repository structure;
- selected stack's structured source-documentation/IDE/reference-doc toolchain under DEC-010;
- normalized capability/domain model;
- explicit read-versus-control capability semantics;
- vendor/device adapter contract with no model-name coupling in product-domain/UI layers;
- deterministic simulator/scenario framework using the same normalized contracts expected from real adapters;
- read-only Bambu feasibility specification for M2, including credentials/configuration boundaries, security/legal constraints, expected status fields, freshness and test evidence requirements;
- responsive navigation/dashboard/fleet shell;
- service lifecycle and health endpoints.

**Explicit non-goals:**
- no real-printer implementation unless separately authorized inside M1;
- no printer Developer Mode;
- no Fleet Hub dependency;
- no Bambu partnership/private authorization;
- no cloud-client impersonation;
- no printer write/control features.

**Feedback focus:** install/run experience, information architecture, basic dashboard UX, resource footprint, architecture/module boundaries, documentation discoverability, capability model, security friction, and readiness for M2 real-device validation.

---

## M2 — A1 Mini + X2D real read-only monitoring / GO-NO-GO prototype

**Objective:** Prove that the project can deliver a genuinely useful real dashboard on both initial target printers under the approved constraints.

**Prototype outcome:** The dashboard connects read-only to an A1 Mini and X2D without Developer Mode or Fleet Hub, displays validated real status/telemetry through the normalized adapter contract, persists observed state/history, clearly handles stale/offline/reconnect behavior, and retains complete synthetic mode for deterministic testing.

**Minimum real-device validation targets:**
- printer availability/connectivity;
- active printer/print state;
- print progress where exposed;
- temperatures and other reliably exposed read telemetry;
- timestamps/freshness/quality semantics;
- print-session transition observation sufficient for useful local history;
- multi-device simultaneous operation;
- reconnect/recovery after printer/network interruption;
- capability differences between A1 Mini and X2D.

AMS, HMS, remaining time, layers, fans, thumbnails, camera, filament/RFID and other fields are added to the validated capability matrix only when demonstrated reliably on real devices.

**Hard guardrail:** Read-only only. Discovery of a technical write command is not authorization to implement or execute it.

**GO/NO-GO gate:** M2 cannot be accepted on synthetic evidence alone. If both initial devices cannot provide sufficiently useful and stable real monitoring without violating project constraints, stop substantial downstream implementation and require an explicit Product Owner continue/re-scope/stop decision.

**Feedback focus:** connection/onboarding, data usefulness, update latency, reliability, firmware/model variance, credentials/security handling, errors/recovery, and whether the real product is valuable enough to continue.

---

## M3 — Real multi-device fleet + widgets/presets

**Objective:** Turn proven real telemetry into the product's central multi-device customizable experience.

**Prototype outcome:** A1 Mini/X2D plus synthetic test devices appear in real fleet/home views; users can drill into capability-driven device pages; cards/widgets can be added, reordered, resized, hidden/shown, configured, duplicated, and saved as presets across responsive desktop/tablet/mobile layouts.

**Scope rule:** Widgets expose only capabilities proven by M2 or provided by dashboard-local domains. Unsupported fields are absent or explicitly unavailable; no fabricated real data.

**Feedback focus:** density/readability, useful default dashboard, grouping/filtering, responsive behavior, customization ergonomics, persistence and real-device state clarity.

---

## M4 — Observed jobs + filament + validated AMS/read telemetry

**Objective:** Build operational context around real observed printing without becoming a scheduler or requiring printer writes.

**Prototype outcome:** Cross-printer observed job/session history and correlation, search/filter/notes, universal local filament/spool library, manual associations/corrections, and any AMS/slot/filament read telemetry that M2/M4 real-device evidence proves reliable.

**Explicit non-goals:** No AMS physical control, load/unload/drying commands, print scheduling, automatic printer assignment, or unvalidated RFID claims.

**Feedback focus:** usefulness/accuracy of observed job history, filament workflow, AMS read mapping where available, manual correction model and provenance of inferred versus vendor-reported data.

---

## M5 — Maintenance + notifications + search + audit/history

**Objective:** Turn real monitoring into an operational management tool.

**Prototype outcome:** Maintenance catalog/history/appointments/ICS export, usage-derived reminders where reliable telemetry supports them, browser + in-app notifications, global categorized search/command palette, and structured searchable/exportable audit/history.

**Real-printer notifications:** Include only reliably inferable events such as completion/offline/stale and other validated read-only conditions. Notification logic must preserve source/freshness semantics.

**Feedback focus:** alert noise, maintenance usefulness, search discoverability, audit detail/privacy, retention and diagnostics.

---

## M6 — Local API + Home Assistant + integration platform

**Objective:** Expose the normalized dashboard state through a secure, documented integration surface.

**Prototype outcome:** Strongly authenticated local API for approved reads and dashboard-local operations, capability discovery, typed/machine-readable schemas, generated/reference documentation, event delivery/webhooks with retry/history, safe admin test tooling, and a Home Assistant integration prototype consuming real normalized printer telemetry.

**Smart-home direction:** Home Assistant is the preferred bridge for Alexa and Google Home experimentation rather than building separate voice-assistant integrations initially. Exact exposed entities/voice behavior must be validated against Home Assistant/Alexa/Google capabilities before product claims.

**Other integrations:** MCP/scripts/AI clients are supported through the same normalized contracts. Daisy is a future first-party integration target through documented local API/events but Bambu Dashboard must not depend on Daisy's architecture or release schedule.

**Feedback focus:** API ergonomics, auth/scoping, entity/event semantics, Home Assistant usefulness, integration identity/audit, documentation/IDE experience.

---

## M7 — Files/media owned by dashboard + conditional read-only printer media research

**Objective:** Build a useful local files/media domain without assuming printer-storage or camera privileges.

**Prototype outcome:** Dashboard-local catalog/storage for prepared files and owned/generated media/exports, metadata/tags/search/download/upload/organization, with any real printer thumbnails/snapshots/file enumeration included only if a supported read-only path has been separately validated and approved.

**Conditional/future only:** live camera streams, printer recordings/timelapses, arbitrary printer-storage operations, prepared-file print initiation, and destructive printer file operations remain outside V1 promises unless a supported authorized path is later approved.

**Feedback focus:** local media usefulness, metadata/navigation, storage footprint, privacy and explicit unavailable-state UX for unsupported printer-side capabilities.

---

## M8 — Backup/restore + update/rollback + migration + offline

**Objective:** Prove operational resilience and portability.

**Prototype outcome:** Encrypted backup/restore with approved machine-independent secret recovery, restore/migration diagnostics, backup-gated update workflow with health verification/rollback, documented recovery drills, and strictly read-only PWA offline access to approved cached content.

**Feedback focus:** disaster recovery, key recovery, update confidence, migration portability, offline expectations and browser/LAN certificate limitations.

---

## M9 — V1 release candidate

**Objective:** Harden the validated read-only-first product into a deployable release candidate.

**Prototype outcome:** A deployable V1 candidate on the target always-on LAN server with documented install/upgrade/recovery paths, staging, tested A1 Mini/X2D capability matrix, deterministic synthetic regression suite, threat-model remediation, operational diagnostics, accessibility/localization readiness checks, dependency/license review, generated developer/API documentation, branding/trademark review, and complete release evidence.

**Release rule:** V1 claims only capabilities demonstrated by real-device evidence or fully local product functionality in `V1_FEATURE_SCOPE.md`. Conditional printer controls/camera/storage features are not release blockers unless separately promoted into V1 by an explicit Product Owner decision.

**Feedback focus:** complete workflow usability, real monitoring reliability, installation/upgrade experience, supportability, integration usefulness, documentation quality, final scope gaps and release blockers.

## Future capability track — not scheduled into V1

The following may be evaluated after V1 or when a suitable supported interface becomes available:
- Bambu Connect user-mediated workflows;
- authorized printer controls;
- printer-side files/media operations;
- camera/live-view capabilities;
- broader AMS controls;
- Fleet Hub as an optional enterprise adapter only if hardware/authorization constraints later become acceptable;
- new official Bambu APIs;
- richer Daisy integration after Daisy's own architecture matures.

No future capability automatically enters implementation because it becomes technically reachable. DEC-006 and Product Owner approval continue to apply.

## Roadmap rule

The sequence above is a planning baseline, not an automatic implementation queue. At the end of every prototype milestone, validated feedback may change the next milestone's priorities or boundaries through explicit Product Owner decisions while preserving stable PRD requirement IDs and governance controls.
