# Bambu Printer Dashboard — V1 Product Requirements

**Version:** 1.0  
**Status:** Product Owner approved current V1 baseline  
**Date:** 10 October 2026  
**Primary deployment:** Docker/Docker Compose on an always-on local LAN server, including Ubuntu mini PCs

> This document is the authoritative scope for the current V1 product. The original full-scope PRD remains preserved unchanged in `project-control/specs/PRODUCT_REQUIREMENTS.md` for traceability and possible future projects/releases.

## 1. Product definition

Bambu Printer Dashboard V1 is a **local-first, plugin-free, cloud-free, read-only monitoring and operations dashboard** for supported Bambu Lab printers.

The product connects directly from its local server to user-authorized printers on the same LAN, consumes printer-originated status information through the approved direct local read-only path, normalizes the data, and provides fleet monitoring, history, alerts, maintenance support, and local integrations.

V1 is deliberately smaller than the original PRD. It does not attempt to replace Bambu Studio or Bambu Handy and does not depend on proprietary Bambu desktop/runtime software.

## 2. Product principles

1. **Simple deployment.** V1 must run as a normal Docker/Docker Compose application without Bambu Studio, Bambu Connect, Network Plugin, paid vendor services, or a desktop GUI on the server.
2. **Local first.** Core monitoring works entirely on the LAN.
3. **Read only.** Printer status may be observed; printer commands are outside V1.
4. **No vendor outreach dependency.** V1 must not depend on Bambu Lab support, partner access, private certificates, or paid services.
5. **No Developer Mode.** Supported printers remain in normal consumer operating mode.
6. **Capability driven.** The UI and API represent only telemetry actually proven for each model/firmware combination.
7. **Manual onboarding is acceptable.** Reliable manual configuration is a supported primary flow; automatic discovery is optional convenience, not a release gate.
8. **Portable server architecture.** The application remains suitable for Ubuntu/Linux, x86-64 or ARM64 where the Node/Docker stack itself is supported.
9. **Lawful interoperability posture.** Do not bypass authentication, signatures, TLS, access controls, or private vendor interfaces. Technical reachability alone is not authorization.
10. **Keep future ambition preserved, not implemented.** Deferred capabilities stay traceable through the original PRD rather than complicating V1.

## 3. Approved printer interface boundary

### Required V1 path

The supported production printer path is:

`printer -> direct local encrypted read-only status connection -> dashboard server -> normalized API/events -> browser/integrations`

The server may use user-supplied local connection information, including:

- printer IP address or hostname;
- serial/device identifier when required by the local status topic;
- LAN Access Code;
- model/display label.

The dashboard may perform best-effort server-side LAN discovery where it is simple and reliable, but **manual onboarding must remain sufficient for normal operation**.

### Explicitly excluded production dependencies

V1 must not require or integrate with:

- Bambu Network Plugin;
- Bambu Studio;
- Bambu Connect;
- Bambu Cloud/private cloud APIs;
- Developer Mode;
- Fleet Hub;
- Bambu partner/developer credentials;
- reverse-engineered official-client authentication;
- paid third-party connectivity services.

Historical feasibility code/evidence for these paths may remain in Git history or archived project records, but they are not part of the V1 production architecture.

## 4. Supported-printer policy

A printer/model/firmware combination is **supported** only after the direct plugin-free local read-only path has demonstrated useful and stable telemetry.

Initial validation targets remain:

- Bambu Lab A1 Mini;
- Bambu Lab X2D.

However, V1 does **not** require architecture complexity merely to claim both models. If one target cannot provide useful direct local read-only monitoring under the approved boundary, it may be marked unsupported/experimental while V1 proceeds with models that meet the support gate, subject to explicit Product Owner acceptance.

## 5. V1 functional requirements

### V1-FR-001 — Local onboarding and device registry

The user can add, edit, remove, enable, and disable supported printers.

Manual onboarding must work using the minimum required local connection information. Automatic discovery, if retained, is best-effort convenience only.

The device registry supports display name, model/capability metadata, tags/group/location, connection status, firmware when observed, and date added.

### V1-FR-010 — Multi-printer fleet dashboard

The dashboard shows multiple supported printers simultaneously with clear:

- online/live;
- stale;
- unavailable/offline;
- reconnecting;
- printing/idle/other observed lifecycle state;
- print progress where available;
- important temperature/status telemetry;
- warnings or capability gaps.

Stale data must never be presented as current live state.

### V1-FR-020 — Device monitoring page

Each printer has a capability-driven detail page built from observed telemetry rather than model-specific UI branching.

The page may display, when reliably exposed:

- print state/stage;
- progress;
- elapsed/remaining time;
- layers;
- nozzle temperature;
- bed temperature;
- chamber temperature;
- Wi-Fi/network telemetry;
- fan/status fields;
- HMS/error/status information;
- AMS/slot/filament telemetry;
- printer-reported job/file metadata.

Unobserved or unsupported fields are shown as unavailable/unsupported rather than fabricated.

### V1-FR-030 — Connection reliability and freshness

The server owns connection lifecycle and must provide:

- timestamps on observations;
- freshness quality;
- stale detection;
- offline/unavailable transition;
- bounded reconnect;
- recovery after printer/network return;
- safe behavior after dashboard/server restart.

### V1-FR-040 — History and observed print sessions

The dashboard stores normalized observations and reconstructs useful local print/session history from data it actually observes.

History supports:

- printer;
- start/end/outcome where inferable;
- progress samples/summary;
- duration where observable/inferable;
- relevant temperatures/status;
- errors/events;
- search/filtering;
- clear distinction between printer-reported and dashboard-inferred fields.

Raw vendor payloads and credentials are not retained as normal history.

### V1-FR-050 — AMS and filament information

V1 may show read-only AMS/slot/filament information only when passively reported by a supported printer.

The product also includes a local manual filament/spool catalog with user-managed brand, material/type, color, notes, and optional association with observed printer/AMS positions.

No AMS control is included.

### V1-FR-060 — Maintenance

V1 provides:

- maintenance task catalog;
- manual service records and notes;
- schedules/reminders;
- usage-driven reminders only where supported by reliably observed telemetry;
- calendar/ICS export.

The dashboard may link to public official maintenance guidance but must not scrape/private-integrate vendor services.

### V1-FR-070 — Notifications and alerts

The server can generate notifications from observed local state, including where reliable:

- print completed;
- printer offline/unavailable;
- stale telemetry;
- reconnect/recovered;
- observed error/warning;
- maintenance due.

V1 includes an in-app Alerts Center and browser notifications where browser/platform requirements permit.

### V1-FR-080 — Local API and Home Assistant

The dashboard exposes documented normalized read-only local APIs/events.

A separately authenticated machine-to-machine integration boundary may be provided for:

- Home Assistant;
- scripts;
- MCP/AI clients;
- local webhooks or equivalent event consumers.

Home Assistant is the preferred smart-home automation bridge. The dashboard itself does not become a general rules/automation engine.

No API endpoint may expose printer write/control operations in V1.

### V1-FR-090 — Local operations and diagnostics

V1 provides:

- application/server health;
- adapter/device health;
- sanitized diagnostics;
- dependency/version information;
- database/storage health;
- exportable troubleshooting information without credentials/private identifiers.

### V1-FR-100 — Backup, restore and portability

V1 supports backup and restore of dashboard-owned configuration/history.

Sensitive credentials, if the user explicitly chooses to persist them, must use the approved secrets boundary and must not be exposed in plaintext backup content.

The application remains portable between supported Docker hosts.

### V1-FR-110 — PWA and responsive UI

The web UI is responsive on desktop, tablet, and mobile and may be installable as a PWA.

Offline functionality is read-only and limited to approved cached dashboard-owned data. Printer state cannot be claimed live while offline.

## 6. Credential and security requirements

- **V1-SEC-001:** Production deployment is LAN-only by default.
- **V1-SEC-002:** No interactive dashboard login is required for the approved read-only trusted-LAN model; documentation must make the consequence explicit.
- **V1-SEC-003:** Support local-only/selected-interface binding where practical.
- **V1-SEC-004:** LAN Access Codes and other printer credentials must never be committed, logged, returned in normal APIs, or placed in browser persistent storage.
- **V1-SEC-005:** Memory-only credential handling is the default during onboarding/validation.
- **V1-SEC-006:** If remembered credentials are later enabled, use only the dedicated encrypted secrets boundary.
- **V1-SEC-007:** TLS/authentication controls on the printer connection must not be deliberately weakened or bypassed.
- **V1-SEC-008:** Browser/integration data is normalized and sanitized; raw private printer payloads remain adapter-internal.
- **V1-SEC-009:** Machine-to-machine integration identities require authentication independent of the no-login browser decision.
- **V1-SEC-010:** No printer control/write surface exists in the production V1 adapter/API.

## 7. Deployment requirements

- Node.js/TypeScript application architecture approved in M1 remains the baseline.
- Docker/Docker Compose is the recommended production packaging.
- SQLite remains the V1 datastore.
- The normal server must run without Bambu Studio, proprietary Bambu libraries, GUI packages, or paid cloud services.
- Direct local development remains supported.
- Production target includes always-on Ubuntu/Linux mini PCs.
- Server-side printer access must work from the container/network configuration documented for the supported deployment.

## 8. Explicitly out of V1

The following are **not V1 features** even if technically discoverable:

- start, pause, resume, stop, or reprint;
- motion/jog/home;
- temperature/fan set-point control;
- AMS load/unload/drying/control;
- calibration;
- firmware management;
- printer-side file upload/download/delete/rename/move;
- printer camera/live stream/recording/timelapse access;
- Bambu account/cloud integration;
- Bambu Connect;
- Bambu Network Plugin;
- Bambu Studio runtime dependency;
- Developer Mode;
- Fleet Hub;
- vendor/private/partner APIs;
- automatic printer discovery as a mandatory user journey;
- remote Internet access;
- multi-user/RBAC;
- general automation/rules engine;
- slicing or print-farm scheduling;
- native mobile app;
- paid external service dependency.

These capabilities remain preserved in the original PRD for possible future projects/releases and require separate feasibility, legal/interface, architecture, and Product Owner approval before re-entry.

## 9. V1 acceptance criteria

V1 is acceptable when:

1. At least the Product Owner-approved supported printer set provides useful direct plugin-free local monitoring.
2. Supported printers can be manually configured without Bambu desktop/cloud software on the server.
3. Multiple supported printers can be monitored concurrently.
4. Live/stale/offline/reconnect semantics behave safely.
5. Core observed telemetry is normalized, persisted, and visible in fleet/device pages.
6. Useful print/session history is generated from observed data.
7. Notifications and maintenance workflows operate from local data.
8. The normalized read-only API and Home Assistant integration are usable.
9. Docker deployment on the target Ubuntu mini PC is documented and repeatable.
10. Backup/restore and sanitized diagnostics are tested.
11. No proprietary Bambu runtime is packaged or required.
12. No V1 path uses Developer Mode, private cloud/client impersonation, paid vendor service, or printer write/control operations.

## 10. Requirements traceability

The original `PRODUCT_REQUIREMENTS.md` remains the immutable full-scope requirements baseline.

This V1 document intentionally selects and narrows that baseline. Existing original requirement IDs remain valid historical references. New `V1-*` IDs identify the active deliverable requirements for the simplified V1.

Any future promotion of an original deferred requirement back into active scope requires an explicit Product Owner decision and corresponding update to this document.
