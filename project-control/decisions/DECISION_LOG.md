# Decision Log

## DEC-001 — Adopt GitHub as authoritative project state

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** GitHub is the source of truth for status, architecture, milestones, PR/merge/commit state, Codex prompts, specifications, handoffs, decisions, risks, feedback, and committed validation evidence.
- **Rationale:** Establish durable, verifiable project continuity and prevent chat/agent reports from becoming implicit state.
- **Alternatives considered:** Chat history or agent memory as authority — rejected.
- **Consequences:** Current-state claims require GitHub verification; project-control files must remain current.
- **Approved by:** Product owner via project bootstrap instruction and operating model.
- **Related milestone / PR:** M0 / governance bootstrap.

## DEC-002 — Adopt PRD v1.0 as requirements baseline

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** Preserve the 18 August 2026 PRD as the initial requirements baseline; maintain stable requirement IDs and record explicit deviations when feasibility constrains intent.
- **Rationale:** Provides a traceable functional/security/non-functional baseline.
- **Alternatives considered:** Re-authoring requirements during bootstrap — rejected.
- **Consequences:** Implementation must trace to PRD requirements; feasibility findings do not silently rewrite the baseline.
- **Approved by:** Product owner via bootstrap request.
- **Related milestone / PR:** M0 / governance bootstrap.

## DEC-003 — Governance before feature development

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** Complete and review M0 repository/governance foundation before substantive feature development.
- **Rationale:** Prevent scope, security, architecture, and agent-control drift.
- **Alternatives considered:** Begin implementation immediately — rejected by operating model.
- **Consequences:** `NEXT_PROMPT.md` remains HOLD until M0 is reviewed and approved.
- **Approved by:** Product owner via operating model.
- **Related milestone / PR:** M0.

## DEC-004 — Technology stack remains undecided in M0

- **Date:** 2026-08-22
- **Status:** Superseded by DEC-014
- **Decision:** No application framework, frontend framework, datastore, Bambu transport, camera stack, deployment packaging, or secret-recovery mechanism is selected during M0.
- **Rationale:** The PRD identifies material feasibility/security questions that must be resolved before these choices are safe.
- **Alternatives considered:** Pick a conventional stack during bootstrap — deferred to avoid accidental architecture authorization.
- **Consequences:** M1 must produce explicit architecture decisions and prove them in a runnable synthetic prototype.
- **Approved by:** Product owner through approval of M0 on 2026-08-22; actual technology selections remained subject to M1 authorization/decision until DEC-014.
- **Related milestone / PR:** M0 → M1.

## DEC-005 — Adopt MPL-2.0 and explicit third-party trademark posture

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** Use Mozilla Public License 2.0 for repository source code. Maintain `NOTICE` and `TRADEMARKS.md` to preserve project attribution and clearly state that Bambu Printer Dashboard is an independent/unofficial interoperability project with no claimed Bambu Lab affiliation or endorsement.
- **Rationale:** Enable public use and future contribution while retaining file-level copyleft for covered modifications, preserving attribution, and separating software licensing from third-party trademark/branding rights.
- **Alternatives considered:** MIT/Apache-2.0 permissive licensing; stronger copyleft such as AGPL.
- **Consequences:** Contributors must respect MPL-2.0; third-party marks/assets are not licensed by this repository; public product naming remains subject to trademark review.
- **Approved by:** Product owner through repository creation/license selection and project instructions.
- **Related milestone / PR:** M0.

## DEC-006 — Technical interface availability does not constitute authorization

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** Bambu Lab APIs, cloud services, authentication mechanisms, local protocols, camera/media interfaces, documentation, and other vendor-controlled interfaces require technical/security/contractual/legal feasibility review before implementation where material uncertainty exists. Security controls and access restrictions must not be bypassed merely to obtain functionality.
- **Rationale:** Preserve lawful interoperability intent and prevent implementation convenience from overriding vendor rights, security boundaries, or project governance.
- **Alternatives considered:** Implement every technically reachable interface and address terms later — rejected.
- **Consequences:** M1 must maintain a capability/interface feasibility matrix and unresolved items are stop conditions.
- **Approved by:** Product owner through project instructions.
- **Related milestone / PR:** M0/M1.

## DEC-007 — Iterative prototype delivery for every major product milestone

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** M0 is the governance bootstrap. Every major product milestone from M1 onward must end with a runnable/testable prototype, automated and hands-on validation, captured/triaged product-owner feedback, and project-control reconciliation before the next milestone is finalized and authorized.
- **Rationale:** Validate product assumptions early, allow UX/device/architecture feedback to influence subsequent scope, and avoid accumulating untested requirements until late in development.
- **Alternatives considered:** Phase-based delivery where architecture/domain work may remain non-runnable for multiple milestones — rejected.
- **Consequences:** Milestone plans require prototype outcomes and feedback criteria; feedback can reshape later milestones only through explicit decisions; regression preservation becomes part of milestone validation.
- **Approved by:** Product owner on 2026-08-22.
- **Related milestone / PR:** M0 and all M1+ milestones.

## DEC-008 — Apply MPL-2.0 notices to new original source files

- **Date:** 2026-08-22
- **Status:** Approved / baseline
- **Decision:** New original source-code files created for this project must carry an MPL-2.0 source-file notice, normally using an appropriate-comment `SPDX-License-Identifier: MPL-2.0` identifier; the Exhibit A notice is also acceptable. Third-party files must retain their actual upstream license/provenance and must not be falsely relabeled as project-owned MPL code.
- **Rationale:** Make the repository's MPL-2.0 licensing operational at file level and preserve correct attribution/provenance as implementation begins.
- **Alternatives considered:** Rely only on the top-level `LICENSE` file — rejected as less explicit and more fragile when individual source files are redistributed.
- **Consequences:** Codex and contributors must follow the source-file notice policy in `CONTRIBUTING.md`; license/provenance checks become part of review.
- **Approved by:** Product owner through selection of MPL-2.0; implementation detail finalized during M0 completeness review.
- **Related milestone / PR:** M0 and all implementation milestones.

## DEC-009 — Approve M0 repository and governance foundation

- **Date:** 2026-08-22
- **Status:** Approved
- **Decision:** Approve M0 after final completeness review, including the MPL source-file notice clarification added during review. M0 is authorized for merge once the PR is in a mergeable state. This approval does not authorize M1 implementation.
- **Rationale:** The M0 foundation satisfies the required bootstrap controls: authoritative PRD and operating model, governance anchors, architecture/security/privacy/legal guardrails, milestone/feedback model, decision/risk controls, Codex queue/resume controls, licensing/attribution, synthetic test policy, and explicit M1 decision boundaries.
- **Alternatives considered:** Hold M0 for further information — rejected; no remaining M0 information gap was identified that warrants blocking approval.
- **Consequences:** PR #1 may be merged. After merge, project-control state must be reconciled to M0 COMPLETE and M1 PLANNING/HOLD. A specific M1 task still requires separate product-owner authorization before Codex implementation.
- **Approved by:** Product owner on 2026-08-22 after independent M0 completeness review.
- **Related milestone / PR:** M0 / PR #1.

## DEC-010 — Documentation-first modular and token-efficient development

- **Date:** 2026-08-23
- **Status:** Approved / baseline
- **Decision:** All product development must use strong module/package boundaries and heavy developer documentation. Significant modules must carry focused local documentation; public and extension-facing contracts must use the selected language's structured source-documentation and type/schema facilities so IDEs can provide contextual help and generated API/reference documentation can be produced. Repository organization and Codex task instructions must be deliberately token-efficient so routine changes can be made from scoped module context rather than requiring whole-repository re-reading.
- **Rationale:** The product is intended to be extended and maintained over many milestones by human developers and AI implementation agents. Explicit contracts, discoverable documentation, and narrow context boundaries reduce maintenance cost, regression risk, architectural drift, and AI context/token waste.
- **Alternatives considered:** Rely primarily on implementation readability and top-level documentation — rejected because it forces future maintainers and agents to reconstruct module behavior and cross-cutting assumptions repeatedly.
- **Consequences:** M1 technology and repository-structure decisions must include a documentation toolchain and module/context strategy. Documentation updates become part of each implementation change and Definition of Done. The exact documentation standard remained stack-dependent until DEC-014.
- **Approved by:** Product owner on 2026-08-23.
- **Related milestone / PR:** M1 onward.

## DEC-011 — Exclude printer Developer Mode and defer direct Bambu Lab partnership/contact

- **Date:** 2026-08-23
- **Status:** Approved / current constraint
- **Decision:** The project will not require or use Bambu printer Developer Mode. The project will also not contact Bambu Lab or pursue developer-partner authorization at this stage. Reverse-engineered cloud-client impersonation remains prohibited under DEC-006.
- **Rationale:** Preserve a low-friction end-user posture that does not require weakening/default-changing printer security settings, and avoid making current development dependent on vendor partnership or private authorization.
- **Alternatives considered:** Direct LAN integration through Developer Mode; immediate Bambu developer-partner/Fleet Hub authorization request — both deferred by product-owner direction.
- **Consequences:** Fleet Hub API cannot be treated as an executable integration path while its developer authorization/certificate requirements remain unmet. Direct Developer Mode MQTT/FTP/live-stream integration is out of scope. Publicly accessible read-only printer status paths explicitly left available by Bambu may still be evaluated under DEC-006. Bambu Connect or any other publicly available user-mediated interface may be evaluated only within its documented supported boundaries and must not be assumed to provide headless control.
- **Approved by:** Product owner on 2026-08-23.
- **Related milestone / PR:** M1 onward.

## DEC-012 — Treat real-printer read-only monitoring as a viable integration target

- **Date:** 2026-08-23
- **Status:** Approved feasibility direction / implementation still gated by M1
- **Decision:** Under DEC-011, the project may pursue a local read-only Bambu printer adapter using printer status information that Bambu explicitly states remains accessible to third-party software under its authorization-control model, without enabling Developer Mode and without impersonating Bambu cloud clients. Physical printer control remains separately blocked unless a documented supported user-mediated or otherwise authorized path is available.
- **Rationale:** Bambu's published authorization-control guidance explicitly states that printer status pushes remain unaffected, identifies Home Assistant monitoring as an intended surviving use case, and states that monitoring data such as print progress/status, temperature, position, and speed remain accessible while critical control operations are restricted.
- **Alternatives considered:** Treat all real-printer integration as blocked — rejected as overly restrictive based on Bambu's published read/write distinction. Use Developer Mode or cloud-client impersonation for broader access — rejected by DEC-011/DEC-006.
- **Consequences:** M1 feasibility work must distinguish `read` from `write` capabilities. A read-only real-device path can become the M2 target after explicit validation on the initial A1 Mini and X2D. Synthetic mode remains mandatory for testing. Unsupported or firmware/model-specific fields must degrade safely, and no write/control path may be inferred from read access.
- **Approved by:** Product owner direction and repository feasibility reconciliation on 2026-08-23; concrete M2 implementation remains subject to a later explicit Product Owner authorization.
- **Related milestone / PR:** M1 → M2.

## DEC-013 — Adopt read-only-first V1 scope and real-device GO/NO-GO roadmap

- **Date:** 2026-08-23
- **Status:** Approved / planning baseline
- **Decision:** Reframe V1 around a genuinely usable local-first read-only operational dashboard for real Bambu printers, while preserving the original PRD for traceability. Create `V1_FEATURE_SCOPE.md` as the authoritative current V1 feature-boundary overlay. Make M2 a mandatory real-device GO/NO-GO milestone on both A1 Mini and X2D before substantial downstream feature investment. Home Assistant becomes the preferred initial smart-home integration layer; Alexa and Google Home may be reached through Home Assistant after validation. Daisy is a future first-party integration target through documented local API/events but must not become an early runtime dependency.
- **Rationale:** Current Bambu constraints allow useful read-only monitoring but do not support a credible promise of broad direct printer control without Developer Mode, Fleet Hub/partner authorization, or other currently excluded paths. Validating actual printer usefulness early prevents investment in a sophisticated platform that cannot satisfy its core purpose.
- **Alternatives considered:** Continue the original roadmap unchanged; build the complete platform before real-printer validation; stop the project immediately because write/control is unavailable. These were rejected in favor of proving the viable monitoring product early and keeping privileged capabilities conditional.
- **Consequences:** M1 remains architecture/synthetic-first but must explicitly prepare M2 real-read validation. M2 cannot pass on synthetic evidence and must test both initial printers. Later milestones expose only validated real capabilities plus fully local product features. Printer controls, camera/media privileges and vendor-dependent operations remain conditional/future unless separately validated and Product Owner approved.
- **Approved by:** Product owner on 2026-08-23.
- **Related milestone / PR:** M1 onward.

## DEC-014 — Approve M1 TypeScript/React/Node/SQLite modular architecture

- **Date:** 2026-08-23
- **Status:** Approved
- **Decision:** Adopt the M1 architecture recorded in `project-control/specs/M1_ARCHITECTURE.md`: Node.js 24 LTS + TypeScript; React + Vite frontend; Fastify server; SQLite with `better-sqlite3`; Kysely typed SQL/migrations; npm-workspace monorepo with strict package boundaries; Vitest + Playwright testing; TypeDoc plus structured TypeScript source documentation; REST + Server-Sent Events; direct local development plus Docker/Docker Compose production packaging. Significant modules must have local context documentation and public contracts suitable for IDE hover/generated docs.
- **Rationale:** This stack supports a lightweight local-first always-on service, strong type sharing between frontend/backend, excellent IDE/documentation support, explicit modular boundaries, efficient Codex context, mature testing, SQLite-native operation and portable packaging without unnecessary infrastructure.
- **Alternatives considered:** Python/FastAPI backend, Go backend, separate repositories, PostgreSQL, heavier monorepo/application frameworks and heavier frontend state/component frameworks. These remain technically viable but add cross-language contract duplication, operational weight or unnecessary abstraction for current scope.
- **Consequences:** DEC-004 technology deferral is superseded. Codex must not substitute alternative frameworks/datastores/build systems without a new Product Owner-approved decision. Production/core dependencies require open-source, commercial-use-compatible, MPL-2.0-compatible licensing/provenance checks.
- **Approved by:** Product owner on 2026-08-23 after architecture interview and consolidated package review.
- **Related milestone / PR:** M1.

## DEC-015 — Adopt read-only LAN access, discovery and printer-credential policy

- **Date:** 2026-08-23
- **Status:** Approved
- **Decision:** The read-only V1 dashboard has no interactive application login. It is LAN-accessible by default with an option to restrict network binding where feasible. Initial read-only LAN deployment may use HTTP while remaining HTTPS-capable; HTTPS plus strong authentication is mandatory before any future write/control or comparable sensitive capability. The dashboard server should advertise a stable LAN-local service name via mDNS or equivalent so manual server IP/port entry is not the normal UX. Future real-printer onboarding uses server-side LAN discovery plus a user-supplied LAN Access Code, with manual IP/serial/access-code fallback. The user decides per printer whether the Access Code is remembered: remembered values are encrypted at rest through the secrets module; declined values remain process-memory-only and must be re-entered after restart.
- **Rationale:** Read-only LAN monitoring does not justify unnecessary dashboard-login friction, while printer credentials remain sensitive device secrets. Stable local naming and automatic printer discovery reduce setup friction without browser-side LAN scanning. Separating read-only access from future privileged control keeps the current product simple while preserving a hard security gate for later capabilities.
- **Alternatives considered:** Mandatory V1 dashboard authentication; localhost-only dashboard; manual server IP/port; manual-only printer onboarding; always-persisted or never-persisted Access Codes; mandatory HTTPS before the read-only prototype.
- **Consequences:** LAN reachability equals dashboard read access and must be documented clearly. Printer Access Codes must never appear in logs, browser storage, normal API responses, diagnostics, source control or plaintext backups. Switching a printer from remembered to non-remembered must delete its persisted encrypted secret. Real-printer access remains M2 and requires separate authorization.
- **Approved by:** Product owner on 2026-08-23.
- **Related milestone / PR:** M1 architecture; M2 onboarding target.

## DEC-016 — Adopt tiered telemetry/history retention

- **Date:** 2026-08-23
- **Status:** Approved
- **Decision:** Separate durable operational/analytics history from raw high-frequency telemetry. Durable data needed for printer lifecycle, job summaries/outcomes, maintenance/service history, cumulative usage and approved long-term analytics aggregates is retained for the life of the dashboard/printer unless explicitly deleted/reset. Raw/high-frequency telemetry defaults to 30-day retention and is user-configurable from 1 through 365 days. Selected compact aggregates may survive raw-data expiry when useful for maintenance or analytics.
- **Rationale:** Long-term maintenance and future analytics need historical continuity, while retaining dense telemetry indefinitely would create unnecessary database growth and operational cost.
- **Alternatives considered:** One global 30/90/365-day retention period; indefinite retention of all raw telemetry.
- **Consequences:** SQLite schema/jobs must separate durable records/aggregates from expiring raw samples. Retention configuration and cleanup must never delete required secrets/audit data through accidental cross-domain coupling.
- **Approved by:** Product owner on 2026-08-23.
- **Related milestone / PR:** M1 persistence architecture onward.
