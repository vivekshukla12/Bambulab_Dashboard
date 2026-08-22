# Bambu Printer Dashboard — Product Requirements Document

**Version:** 1.0  
**Status:** Requirements baseline  
**Date:** 18 August 2026  
**Primary deployment:** Local LAN / always-on mini PC server

> Independent product concept for compatibility with Bambu Lab devices. Legal use of trademarks, branding, cloud authentication, APIs, and device interfaces must be validated during feasibility/legal review.

## 1. Product summary

A local-first browser dashboard for monitoring and managing Bambu Lab printers and related devices. It provides configurable multi-device monitoring, print status, AMS/filament state, cameras, files/media, maintenance, diagnostics, notifications, audit/history, and supported controls. It must scale from a two-printer home setup to a larger fleet without becoming a slicer or automatic print-farm scheduler.

### Goals
- Simultaneously monitor multiple Bambu devices from one responsive dashboard.
- Keep core behavior local to the LAN wherever supported; allow cloud-dependent features where required.
- Use a reusable widget/card system for home and device pages.
- Maintain strong operational visibility through logs, maintenance, alerts, and diagnostics.
- Provide a secure local API/event layer for AI, MCP, Home Assistant, scripts, and other integrations.
- Remain portable across server hardware and future NAS/container hosting.

### Product principles
1. Local first.
2. Capability driven, not hard-coded per printer model.
3. Observe/control supported functions; do not replace slicing or automate printer assignment.
4. Sensible defaults with deep widget customization.
5. Security and auditability are baseline requirements.
6. Portable and extensible for future devices, languages, accessibility, analytics, remote access, NAS backups, and mobile apps.

## 2. Initial scope
- Initial user model: one authenticated user; no RBAC required for V1.
- Initial devices: Bambu Lab A1 mini and X2D.
- Must dynamically support additional Bambu printers, AMS variants, and related devices where capabilities are available.
- Primary clients: desktop, tablet/iPad, mobile browser/PWA.

## 3. Recommended navigation
Home → Fleet / Devices → Prints / Jobs → Filaments → Maintenance → Files & Media → Notifications → History & Logs → Integrations / API → Admin / Settings

The application uses top navigation plus a collapsible sidebar. The sidebar may collapse on large screens as well as mobile.

## 4. Functional requirements

### Onboarding and devices
- **FR-001** Guided first-time onboarding.
- **FR-002** Prefer Bambu account/cloud sign-in for device association if officially supported; otherwise provide a secure local fallback.
- **FR-003** Add/remove devices dynamically through the UI.
- **FR-004** Generic capability-driven device model.
- **FR-005** Auto-generate a sensible default device page from capabilities.
- **FR-006** Device registry with model/name/identifier/status/firmware/date added/location.
- **FR-007** User-defined device groups/locations and group filters.

### Homepage, widgets, presets
- **FR-010** Homepage shows multiple printers simultaneously; drill down to device pages.
- Everything on the homepage is a card/widget using one consistent framework.
- Central widget library for homepage and device pages.
- Drag/drop, reorder, resize, hide/show, persistent configuration.
- Same widget type may appear multiple times with different configuration.
- Aggregate widgets may combine devices.
- Widgets support drill-down/click-through.
- One responsive layout model across desktop/tablet/mobile.
- Saved presets capture complete page composition: widgets, positions, sizes, visibility, filters, device/group scope, and relevant state.
- Each device page has its own configuration.

### Live monitoring and fleet
- **FR-011** Target Bambu Studio-like practical update responsiveness using supported interfaces.
- **FR-012** Surface available temperatures, fans, sensors, HMS/errors, network state, firmware, warnings, and diagnostics.
- **FR-013** Clearly show Device Unavailable; do not show stale state as live; automatically reconnect.
- **FR-014** Show print percentage, layers, elapsed/remaining time, stage, thumbnail/preview where available.
- **FR-015** Show energy/power telemetry only if exposed reliably.
- **FR-020** Fleet overview with compact status, job, progress, AMS, warnings, and quick actions.

### Camera/media
- **FR-030** Homepage camera feeds, off by default, opt-in per stream.
- **FR-031** Camera feed also available on device pages.
- **FR-032** Multiple simultaneous streams where supported.
- **FR-033** Advanced camera controls (snapshots, recordings, timelapses, quality controls, downloads) where supported.
- **FR-034** Global disable-all-cameras plus per-device privacy toggles.
- **FR-035** Audit camera access and actions.

### AMS and Filament Center
- **FR-040** Show all available AMS/slot details: filament/RFID, color, humidity, temperature, drying, spool presence, active slot, feeder state, warnings/errors.
- **FR-041** Supported AMS controls: load/unload, slot selection, drying, drying parameters, refresh/sync.
- **FR-042** Universal printer-independent filament library (at least brand, material/type, color).
- **FR-043** Synchronize currently loaded filament across AMS/external spool positions where available.
- **FR-044** Manual assignment/correction for third-party/non-RFID spools.
- **FR-045** Remaining spool weight only if reliably exposed.

### Files and Media Center
- **FR-050** Unified cross-device storage/media view for accessible printer/SD/internal files, prepared print files, timelapses, recordings, snapshots, downloads.
- **FR-051** Expose supported file operations: upload, download, rename, move, delete.
- **FR-052** Start/reprint an already-prepared print file when supported.

### Prints and Jobs
- **FR-060** Cross-printer Jobs area for active, pending/submitted where applicable, completed, failed, cancelled. Monitoring/history, not a scheduler.
- **FR-061** Lightweight local job index correlated with richer printer/Bambu details.
- **FR-062** Optional third-party slicer bridge only when a slicer cannot submit directly. No slicing in the dashboard.

### Maintenance Center
- **FR-070** Usage-driven upcoming maintenance based on official Bambu guidance, with advance warning before thresholds.
- **FR-071** Record completed service history.
- **FR-072** Link maintenance tasks to official Bambu documentation/videos where available.
- **FR-073** Create maintenance appointments inside the dashboard.
- **FR-074** Export appointments as standard calendar files for Google/Microsoft/Apple/other calendars.

### Notifications
- **FR-080** Configurable notification subscriptions plus Mute All.
- **FR-081** Desktop/browser notifications in V1; keep event model extensible for future mobile push.
- **FR-082** In-dashboard Alerts Center with read/unread handling.
- **FR-083** Background server monitoring continues with no browser open.

### Search and commands
- **FR-090** Global search across devices, jobs, files, maintenance, logs, settings, etc.
- **FR-091** Results must be grouped by category.
- **FR-092** Command-palette actions where appropriate; destructive actions still require confirmation.

### Audit and history
- **FR-100** Full practical audit trail: logins/failures, commands, files, config, API/cloud, connection failures, errors/restarts, camera actions, callbacks, security events.
- **FR-101** Default 90-day retention. The application exposes no purge function for records younger than 90 days; technical design must provide tamper resistance/evidence.
- **FR-102** Search/filter history by time, device, event type, severity, source/API identity, keyword.
- **FR-103** Export relevant data as CSV/JSON.
- **FR-104** Preserve structured history so analytics can be added later.

### Local API and integrations
- **FR-110** Secure local API for MCP, Home Assistant, scripts, AI/automation, etc.; read and supported control/write operations when authentication is strong enough.
- **FR-111** Admin API documentation with endpoints, capabilities, auth, examples, safe test console.
- **FR-112** Register event callbacks/webhooks.
- **FR-113** Retry failed callbacks and retain delivery status/logs.
- **FR-114** No general automation/rules engine in V1; external systems build automations on the API/event layer.

### Backup, restore, migration, updates
- **FR-120** Automatic backups around midnight by default; initial target same server; NAS later.
- **FR-121** Backup enough configuration to restore without breaking integrations, including protected credentials/secrets.
- **FR-122** Strongly encrypt sensitive backup contents; possession of the backup alone must not reveal secrets; still support disaster recovery to new hardware.
- **FR-123** Hardware-independent restore/migration (mini PC → NAS/container host, etc.).
- **FR-124** Preserve hostname/URL/API endpoints/credentials/integration identity where possible.
- **FR-125** Post-migration diagnostics/checklist for printer connectivity, Bambu auth, HTTPS, APIs/webhooks, storage, backups, notifications, DB/app health.
- **FR-126** Fully automatic application updates: backup + verify first, then check/install updates; failed backup blocks update.
- **FR-127** Health verification and safe recovery/rollback after failed update.

### PWA/offline
- **FR-130** Installable PWA.
- **FR-131** Read selected cached historical/configuration content offline.
- **FR-132** Offline mode is strictly read-only; no queued writes/actions.
- **FR-133** Exclude credentials/tokens/full audit logs/camera media/control secrets from offline storage by default, subject to security review.

### Admin/help
- **FR-140** Server health only under Admin/Diagnostics.
- **FR-141** Contextual UI help/tooltips and links to official Bambu guidance where useful.

## 5. Security requirements
- **SEC-001** Initial production access is LAN-only.
- **SEC-002** HTTPS even on LAN.
- **SEC-003** Authentication required; prefer officially supported Bambu-account login, otherwise secure local auth.
- **SEC-004** Explicit confirmation for destructive/high-impact actions.
- **SEC-005** Strong API authentication before write/control exposure.
- **SEC-006** Protect credentials, tokens, webhook secrets, encryption keys, and backup secrets at rest.
- **SEC-007** Security-relevant activity must be auditable.
- **SEC-008** Camera privacy controls and auditability.
- **SEC-009** Do not treat stale/offline state as live.
- **SEC-010** Dedicated threat model/security review before production.

## 6. Non-functional requirements
- **NFR-001** Local-first availability.
- **NFR-002** Persistent service auto-start and monitoring recovery after reboot where feasible.
- **NFR-003** Lightweight runtime suitable for an always-on mini PC running other services.
- **NFR-004** Responsive desktop/tablet/mobile UI.
- **NFR-005** Server portability.
- **NFR-006** Extensible for future devices/features without wholesale rewrite.
- **NFR-007** English-only V1 but localization-ready.
- **NFR-008** Accessibility-ready architecture; full accessibility can be later-stage.
- **NFR-009** Strong operational diagnosability.
- **NFR-010** Unsupported capabilities degrade safely and clearly.

## 7. Explicit V1 out-of-scope boundaries
- Slicing engine and slicer validations.
- Automatic printer/job assignment or prioritization.
- General print-farm scheduling/orchestration engine.
- Printer/AMS firmware update management.
- General-purpose built-in automation/rules engine.
- Remote internet access.
- Native mobile app.
- Multi-user/RBAC.
- Full analytics suite.
- NAS backup target in V1.

## 8. Future-release items
- Secure remote access.
- Native mobile app and push notifications.
- Analytics/trends.
- NAS/network backups.
- Translations/localization.
- Full accessibility implementation.
- Potential multi-user model if product direction changes.
- Additional Bambu device capability packs.

## 9. Test/staging requirements
- **TEST-001** Simulation/fake telemetry and scenario support exists only in development/test builds.
- **TEST-002** Separate staging/test deployment.
- **TEST-003** Staging does not access real printers by default; explicit opt-in required.

## 10. Feasibility-review backlog
1. Bambu account authentication, third-party terms, trademarks/branding.
2. LAN vs cloud interfaces and per-feature data/control coverage.
3. Camera protocols, authentication, concurrency, recording/timelapse/quality controls.
4. Storage/media APIs and print/reprint from prepared files.
5. AMS telemetry/control coverage.
6. Job/diagnostic/energy/usage-hour telemetry availability.
7. Authentication/session/API/webhook/TLS/PWA security architecture.
8. 90-day audit immutability/tamper evidence vs host-admin capabilities.
9. Backup encryption and machine-independent key recovery.
10. Docker/native deployment, datastore, resource footprint, startup, staging, NAS migration.
11. Automatic update signing/verification/migration/health-check/rollback.
12. PWA/browser limitations and LAN certificate trust.

## 11. Conceptual product objects
Device, Capability, Widget, Preset/View, Print Job, Filament Definition, Maintenance Task, Maintenance Event, Alert/Notification, Audit Event, Integration, Backup.

## 12. Recommended next project workstreams
- Product ownership / requirement prioritization and change control.
- Bambu interface/legal feasibility.
- Solution architecture.
- Security architecture and threat modeling.
- UX/UI and widget design system.
- API/integration design.
- QA/test engineering and device capability matrix.
- DevOps/release, backup/update/rollback, staging, and migration.

This PRD is the requirements baseline. Future project changes should preserve stable requirement IDs where possible and record explicit deviations when technical feasibility constrains product intent.
