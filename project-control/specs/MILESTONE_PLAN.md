# Milestone Plan — Simplified Plugin-Free V1

**Status:** Product Owner approved planning baseline under DEC-019.  
**Current V1 authority:** `project-control/specs/V1_PRODUCT_REQUIREMENTS.md`

The original full-scope PRD remains preserved unchanged in `PRODUCT_REQUIREMENTS.md`. This roadmap schedules only the smaller V1 that can be built today without Bambu Network Plugin, Bambu Studio, Bambu Connect, Bambu Cloud/private APIs, Developer Mode, Fleet Hub, paid services, or vendor outreach.

Every M1+ milestone must leave a runnable/testable prototype and reconcile feedback before the next milestone is authorized.

## M0 — Repository and governance foundation

**Status:** Complete and merged.

**Outcome:** GitHub governance, licensing, security/privacy guardrails, project-control model, decision/risk tracking and Codex execution gate.

---

## M1 — Application architecture + synthetic prototype

**Status:** Complete and merged.

**Outcome:** Node.js/TypeScript monorepo, React/Vite frontend, Fastify server, SQLite/Kysely persistence, REST/SSE contracts, synthetic adapter, tests, TypeDoc, Docker packaging and documented read-only architecture.

---

## M2 — Direct local printer monitoring + support gate

**Objective:** Establish the production printer path with **no proprietary Bambu software dependency**.

**Prototype outcome:** Docker/local server can manually configure and monitor the Product Owner-approved supported printers through the direct local encrypted read-only path. Best-effort discovery may exist but manual onboarding is fully sufficient.

**Required work:**
- remove the Network Plugin bridge/package/runtime path from the active V1 implementation and docs while preserving historical decisions/research;
- keep direct local MQTTS read-only adapter only;
- preserve safe TLS validation and credential handling;
- make manual onboarding a first-class normal workflow;
- keep SSDP discovery only as optional best-effort convenience;
- validate A1 Mini direct monitoring;
- retest X2D using only the direct plugin-free path;
- establish the supported/experimental/unsupported model matrix;
- verify live/stale/offline/reconnect semantics;
- verify simultaneous monitoring for the supported printer set;
- persist normalized observations without raw private payloads.

**Acceptance rule:** A printer model enters supported V1 only if useful direct local monitoring is proven. Failure of X2D direct monitoring does not force another integration layer; it may be marked experimental/unsupported with Product Owner approval.

**Non-goals:** Network Plugin, Bambu Studio/Connect/cloud, Developer Mode, printer commands, cameras, printer files/media.

---

## M3 — Fleet dashboard + device pages + observed history

**Objective:** Turn proven direct telemetry into the core daily monitoring experience.

**Prototype outcome:** A useful multi-printer fleet/home dashboard and capability-driven printer detail pages backed by durable normalized history.

**Required work:**
- fleet cards with status, progress and key telemetry;
- capability-driven device pages;
- stale/offline/reconnecting UX;
- observed print-session/history model;
- search/filter for devices and observed jobs/history;
- simple tags/groups/locations;
- useful diagnostics without private identifiers;
- retain synthetic mode for regression tests.

**Feedback focus:** daily usefulness, telemetry clarity, navigation, multi-printer density, unsupported-state UX and history quality.

---

## M4 — Filament/AMS read-only + maintenance + alerts

**Objective:** Add operational value that depends only on local observed data or dashboard-owned records.

**Prototype outcome:** Read-only AMS/filament information where available, local spool catalog, maintenance tracking/reminders and useful local alerts.

**Required work:**
- read-only AMS/slot/filament state only when passively reported;
- manual filament/spool catalog and associations;
- maintenance task catalog and service history;
- manual/time-based and observed-usage reminders;
- ICS/calendar export;
- in-app Alerts Center;
- browser notifications where supported;
- completion/offline/stale/recovered/error notifications derived from observed state.

**Non-goals:** AMS control, vendor account sync, paid notification services.

---

## M5 — Local integration API + Home Assistant

**Objective:** Make the dashboard a clean local data source for smart-home and automation systems without becoming an automation engine.

**Prototype outcome:** Documented normalized read-only integration API/events plus a working Home Assistant integration for supported printer entities/events.

**Required work:**
- separately authenticated machine-to-machine identity boundary;
- typed/schema-documented read-only API;
- local event delivery;
- Home Assistant entities for availability, lifecycle, progress, temperatures and other validated telemetry;
- Home Assistant events for completion/offline/stale/recovered where reliable;
- optional local webhooks/scripts/MCP consumers within the same read-only boundary;
- no printer command/control endpoint.

**Non-goal:** first-party Alexa/Google automation; Home Assistant may bridge those ecosystems.

---

## M6 — Production operations + backup/restore + portability

**Objective:** Make the Dockerized application dependable on an always-on Ubuntu mini PC.

**Prototype outcome:** Repeatable Docker deployment with persistent data, backup/restore, health/diagnostics and documented recovery.

**Required work:**
- production Docker/Docker Compose path;
- Ubuntu mini-PC deployment documentation;
- persistent SQLite/data volume strategy;
- service health and startup/recovery checks;
- backup and restore of dashboard-owned data;
- approved handling of remembered secrets if enabled;
- migration between supported Docker hosts;
- upgrade procedure and rollback/recovery strategy;
- resource-footprint validation.

**Non-goals:** Bambu desktop software, proprietary runtime mounts, paid hosted services, remote Internet access.

---

## M7 — V1 release candidate

**Objective:** Harden the simplified product into a release-quality local monitoring dashboard.

**Prototype outcome:** Deployable V1 release candidate with a documented supported-printer matrix and complete installation/operations guidance.

**Required work:**
- regression and real-device reliability pass for supported models;
- security/privacy review of the actual V1 surface;
- license/dependency/provenance review;
- backup/restore drill;
- Home Assistant validation;
- responsive/PWA quality pass;
- documentation and onboarding polish;
- branding/trademark review;
- explicit unsupported/deferred capability documentation;
- clean repository with obsolete spike runtime code removed from active product paths.

**Release rule:** V1 claims only direct plugin-free capabilities proven on supported printers and fully local dashboard-owned features defined by `V1_PRODUCT_REQUIREMENTS.md`.

## Deferred future-project backlog

Preserved in the original `PRODUCT_REQUIREMENTS.md` but intentionally unscheduled for V1:

- printer control/write operations;
- camera/live view/recordings/timelapses;
- printer-side files/media operations;
- Bambu Cloud/account integration;
- Bambu Connect workflows;
- Bambu Network Plugin or other proprietary Bambu runtime integration;
- Developer Mode;
- Fleet Hub/partner interfaces;
- remote Internet access;
- native mobile app;
- multi-user/RBAC;
- full analytics;
- general rules/automation engine;
- slicing/print-farm scheduling.

Any deferred capability requires a new Product Owner decision and feasibility/security/interface review before entering an implementation milestone.

## Roadmap rule

This plan is not an automatic queue. At every milestone boundary, GitHub state, hands-on evidence and Product Owner feedback determine whether the next milestone is authorized.
