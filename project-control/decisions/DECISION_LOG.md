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
- **Status:** Pending M1
- **Decision:** No application framework, frontend framework, datastore, Bambu transport, camera stack, deployment packaging, or secret-recovery mechanism is selected during M0.
- **Rationale:** The PRD identifies material feasibility/security questions that must be resolved before these choices are safe.
- **Alternatives considered:** Pick a conventional stack during bootstrap — deferred to avoid accidental architecture authorization.
- **Consequences:** M1 must produce explicit architecture decisions and prove them in a runnable synthetic prototype.
- **Approved by:** Pending product-owner approval of M0/M1 plan.
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
