# Milestone Plan

**Status:** Initial iterative plan for product-owner review

M0 is the governance bootstrap. Every **major product milestone M1+** must end with a runnable/testable prototype, automated validation, hands-on product-owner feedback, and project-control reconciliation before the next milestone is authorized.

## M0 — Repository and governance foundation

**Objective:** Establish GitHub governance, requirements, legal/IP posture, security/privacy guardrails, milestone controls, and Codex queueing before feature development.

**Prototype:** Not applicable — M0 is the one-time governance foundation.

**Exit criteria:** Required anchors/specifications exist; MPL-2.0 and disclaimers are preserved; risks/decisions recorded; iterative prototype model established; Codex remains HOLD; product owner approves M0.

---

## M1 — Architecture foundation + synthetic dashboard prototype

**Objective:** Make the critical architecture/feasibility choices and prove them with the first runnable application.

**Prototype outcome:** A locally runnable authenticated dashboard/PWA shell backed by an always-on service, showing a small synthetic fleet with simulated connectivity/status/telemetry, health diagnostics, and explicit offline/unavailable semantics. No live Bambu dependency is required for the prototype.

**Required work:**
- Bambu legal/interface/auth/trademark feasibility matrix for near-term integration;
- application/frontend/datastore/deployment decisions;
- initial threat model;
- local TLS development/staging approach;
- configuration/secret boundary;
- service lifecycle and health endpoints;
- capability/domain model skeleton;
- deterministic simulator/scenario framework;
- responsive navigation/dashboard shell.

**Feedback focus:** install/run experience, information architecture, basic dashboard UX, prototype resource footprint, architecture assumptions, capability model, security friction.

---

## M2 — First real-device read-only monitoring prototype

**Objective:** Validate one approved device integration path end to end while retaining a complete synthetic mode.

**Prototype outcome:** The dashboard can add/connect to at least one explicitly approved initial device path (A1 mini or X2D, according to feasibility), show core capability-driven live status/print progress/telemetry, clearly handle stale/offline state, reconnect safely, and fall back to simulator scenarios for testing.

**Guardrail:** Real-printer access is explicit opt-in; begin read-only. Control operations are not added merely because an interface exposes them.

**Feedback focus:** connection/onboarding UX, telemetry usefulness, freshness/responsiveness, device capability mapping, errors/recovery, LAN/cloud tradeoffs.

---

## M3 — Multi-device fleet + widget/preset prototype

**Objective:** Prove the product's central multi-device and customization experience.

**Prototype outcome:** Multiple synthetic/approved devices appear in fleet/home views; users can drill into capability-driven device pages; widgets/cards can be added, reordered, resized, hidden/shown, configured, duplicated, and saved in presets across responsive desktop/tablet/mobile layouts.

**Feedback focus:** density/readability, widget defaults, interaction model, responsive behavior, grouping/filtering, persistence expectations.

---

## M4 — Jobs + AMS/filament operational prototype

**Objective:** Add the primary non-camera operational domains without becoming a scheduler.

**Prototype outcome:** Cross-printer job monitoring/history, local job correlation, AMS/slot state, universal filament library, loaded-filament synchronization/manual correction, and only feasibility-approved AMS controls with safe confirmations/audit.

**Feedback focus:** operational usefulness, job lifecycle semantics, AMS accuracy, third-party spool workflow, safe-control ergonomics.

---

## M5 — Cameras + files/media prototype

**Objective:** Add privacy-controlled visual monitoring and supported storage/media operations.

**Prototype outcome:** Opt-in per-device camera viewing with global privacy disable and audit; files/media center for approved accessible storage; supported download/upload/rename/move/delete and prepared-file reprint/start only where feasibility and safety controls permit.

**Feedback focus:** camera latency/resource impact, privacy controls, concurrent streams, media navigation, destructive confirmations, unsupported-feature messaging.

---

## M6 — Maintenance + notifications + search + audit/history prototype

**Objective:** Turn the dashboard into an operational management tool rather than only a live monitor.

**Prototype outcome:** Usage-driven maintenance records/appointments/export, browser + in-app notifications, global categorized search/command palette, structured auditable history with search/filter/export and approved 90-day retention/tamper-evidence behavior.

**Feedback focus:** alert noise, maintenance usefulness, search discoverability, audit detail/privacy, retention/diagnostic workflows.

---

## M7 — Local API + integrations prototype

**Objective:** Expose a secure, documented integration surface without building an internal automation engine.

**Prototype outcome:** Strongly authenticated local API for approved reads/controls, capability discovery, admin documentation/safe test console, webhook registration/retry/delivery history, and at least one controlled integration demonstration (for example Home Assistant/MCP/script) using synthetic or safe test data.

**Feedback focus:** API ergonomics, auth/scoping, event semantics, integration identity/audit, developer experience.

---

## M8 — Backup/restore + update/rollback + migration + offline prototype

**Objective:** Prove operational resilience and portability.

**Prototype outcome:** Encrypted backup/restore with approved machine-independent secret recovery, restore/migration diagnostics, backup-gated automatic update workflow with health verification/rollback, and strictly read-only PWA offline access to approved cached content.

**Feedback focus:** disaster-recovery usability, key recovery, update confidence, migration portability, offline expectations and browser limitations.

---

## M9 — V1 release-candidate prototype

**Objective:** Produce a release candidate by hardening the complete validated prototype chain.

**Prototype outcome:** A deployable V1 candidate on the target always-on LAN server with documented install/upgrade/recovery paths, staging, tested initial-device capability matrix, threat-model remediation, operational diagnostics, accessibility/localization readiness checks, dependency/license review, branding/trademark review, and release evidence.

**Feedback focus:** complete workflow usability, reliability, install/upgrade experience, supportability, final scope gaps, release blockers.

## Roadmap rule

The sequence above is a planning baseline, not an automatic implementation queue. At the end of every prototype milestone, validated feedback may change the next milestone's priorities or boundaries through explicit product-owner decisions while preserving stable PRD requirement IDs and governance controls.
