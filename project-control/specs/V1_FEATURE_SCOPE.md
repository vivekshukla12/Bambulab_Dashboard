# V1 Feature Scope — Read-Only-First Bambu Printer Dashboard

**Status:** Product-owner approved planning baseline; implementation remains milestone-gated.

## Purpose

This document translates PRD v1.0 into the currently achievable V1 product boundary after feasibility research and Product Owner constraints. The original PRD and its requirement IDs remain the requirements baseline; this file does not delete or renumber them. Where a PRD capability depends on an unavailable or unapproved Bambu interface, it is classified as conditional/future rather than silently removed.

## Product direction

V1 is a local-first operational dashboard for multiple Bambu Lab printers centered on real read-only monitoring, historical intelligence, maintenance, notifications, extensibility, and secure local integrations. It is not intended to replace Bambu Studio/Handy for privileged printer control.

The project must not require:
- printer Developer Mode;
- Bambu Fleet Hub hardware;
- Bambu developer/partner authorization at the current stage;
- reverse-engineered cloud-client impersonation or bypass of vendor controls.

## Capability classes

- **V1 Core — real-printer required:** must work end to end with real supported printers before V1 release.
- **V1 Platform — locally complete:** valuable production functionality that does not itself depend on a printer-side write interface.
- **Validation-dependent:** may enter V1 only after A1 Mini/X2D real-device evidence proves the required read field/interface reliably exists.
- **Conditional/Future:** retained in architecture and PRD traceability but not promised for V1 unless a supported/authorized interface becomes available and the Product Owner explicitly approves it.

## V1 Core — real-printer monitoring

V1 must support, subject to M2 validation on the initial devices:
- local read-only connection to supported Bambu printers without Developer Mode;
- simultaneous monitoring of multiple printers;
- connectivity/availability state;
- explicit freshness, stale, unavailable, reconnecting, and recovered semantics;
- active printer/print state;
- print progress where exposed;
- temperatures and other read-only status telemetry proven available;
- timestamps/quality metadata on observed state;
- capability-driven per-device representation rather than model-name UI branching;
- real fleet/home overview;
- real per-device monitoring pages;
- persistence of observed telemetry and job transitions;
- notifications derived from observed state, including completion/offline/stale where reliably inferable;
- local API exposure of normalized read-only printer state.

## V1 Platform — fully developable regardless of Bambu write access

### Application and device management
- local application onboarding/configuration with **no interactive dashboard login required for the approved read-only V1 LAN model**;
- clear disclosure that LAN reachability means read access to dashboard-visible information;
- configurable LAN-accessible versus local-only/selected-interface binding where supported;
- device registry, aliases, groups, locations, tags, notes, and capability metadata;
- manually configured/approved real-printer endpoints where required by the validated adapter;
- deterministic synthetic devices and scenarios retained for development/test.

### Dashboard and UX
- responsive desktop/tablet/mobile PWA-capable shell;
- fleet/home dashboard;
- capability-driven device pages;
- configurable cards/widgets;
- add/remove/reorder/resize/show/hide/duplicate/configure widgets;
- saved presets/layouts and device/group filters;
- explicit unsupported/unavailable states rather than hidden failures.

### History and jobs
- durable telemetry/history storage for values the dashboard observes;
- observed print-session/job correlation;
- local job timeline/history, search, filters, notes, and metadata;
- clear distinction between observed/inferred data and vendor-reported fields.

### Filament and AMS-adjacent platform
- universal local filament/spool library;
- manufacturer/material/color/profile/reference metadata;
- manual spool inventory and corrections;
- manual device/spool associations;
- AMS/read-only slot data only when proven by real-device validation.

### Maintenance
- maintenance task catalog;
- service history and notes;
- calendar/ICS export;
- manual schedules and usage entry;
- usage-driven reminders derived from telemetry the dashboard can reliably observe.

### Notifications and alerts
- in-app Alerts Center;
- browser notifications where browser secure-context/platform requirements are satisfied;
- read/unread/history/preferences;
- global mute;
- application, maintenance, system-health, security, backup and real-printer read-event notifications.

### Search, history, and audit
- global search/command palette for local/product entities and non-printer actions;
- audit/history records for configuration, API, integration, file, backup, maintenance, security, adapter and service events;
- searchable/filterable/exportable history within approved retention/privacy constraints.

### Local API and integrations
- documented normalized browser-facing read API/events for the local dashboard;
- a **separately authenticated integration API/identity boundary** for Home Assistant, MCP, scripts, AI clients, webhooks and future external consumers once those integrations are implemented;
- typed/machine-readable schemas and capability discovery;
- event delivery via approved local event mechanisms;
- webhook support with delivery history/retry policy when introduced;
- Home Assistant integration target for normalized read-only printer entities/events;
- Home Assistant may serve as the preferred bridge to Alexa and Google Home rather than separate first-party voice integrations;
- MCP/script/AI-client integration surface;
- Daisy-compatible local API/events as a future first-party integration target, without coupling Bambu Dashboard to Daisy's implementation or release schedule.

The no-login dashboard decision does **not** eliminate authentication for future machine-to-machine integration identities. External integration credentials/scopes are independently governed and must not be conflated with browser dashboard login.

### Files/media owned by the dashboard
- local storage/catalog of prepared files and dashboard-owned media/exports where allowed;
- metadata, tags, thumbnails generated/owned by the dashboard, upload/download/organization of dashboard-local files;
- no claim of arbitrary printer-storage access unless separately validated and approved.

### Operations and resilience
- service health/diagnostics;
- backup/restore and migration;
- encrypted sensitive backup design and machine-independent recovery;
- update/health-check/rollback architecture;
- read-only offline PWA access to approved cached data **when served from a browser-supported secure context**;
- documented install, upgrade, recovery, diagnostics and support paths.

## Validation-dependent capabilities

The following are not V1 promises until real A1 Mini and X2D evidence proves them consistently and safely:
- AMS slot/state telemetry and RFID-derived metadata;
- layer number/count;
- remaining-time accuracy/availability;
- HMS/error-code richness;
- fan/Wi-Fi/nozzle/chamber/model-specific telemetry;
- thumbnails or print metadata reported by the printer;
- any camera snapshot/live-view access that does not require Developer Mode or unsupported security changes;
- any read-only printer file/media enumeration exposed through a supported path.

When validated, these capabilities must enter through the normalized capability model and remain optional per device/firmware.

## Conditional/Future capabilities — not promised for V1

Unless a supported/authorized path is later proven and separately approved, V1 does not promise:
- start/reprint directly from the dashboard;
- pause/resume/stop;
- axis or motion control;
- temperature/fan set-point control;
- calibration;
- AMS load/unload/drying/physical control;
- arbitrary printer SD/internal file upload/download/rename/move/delete;
- printer firmware management;
- live camera streaming, printer recordings, or timelapse retrieval;
- Bambu cloud account impersonation/integration through undocumented private APIs;
- Fleet Hub integration requiring dedicated hardware/partner authorization;
- Developer Mode MQTT/FTP/live-stream integration.

Bambu Connect may be evaluated only for documented, user-mediated workflows and must not be treated as a general headless monitoring/control API.

## Real-device release gate

The project remains viable only if M2 proves useful, stable read-only monitoring on both initial target devices — A1 Mini and X2D — without violating the constraints above.

M2 must produce evidence for each promised real-printer V1 capability, including:
- actual device/firmware tested;
- field/capability observed;
- freshness/update behavior;
- reconnect/offline behavior;
- model differences;
- failure modes;
- security/credential handling;
- repeatable hands-on validation steps.

If the real-device path is unreliable or too limited to support a genuinely useful dashboard, M2 is a formal Product Owner stop/re-scope decision point before substantial downstream feature investment.

## Documentation/modularity requirement

All features and adapters must follow DEC-010: strong module boundaries, focused module-local documentation, structured source documentation/type/schema support for IDE assistance and generated references, and token-efficient repository/task organization so routine changes do not require whole-repository rereading.
