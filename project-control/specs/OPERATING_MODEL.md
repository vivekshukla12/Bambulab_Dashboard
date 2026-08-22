# Bambu Printer Dashboard — Project Operating Model

**Status:** M0 governance baseline for product-owner review  
**Repository:** `https://github.com/vivekshukla12/Bambulab_Dashboard`

## Purpose

Bambu Printer Dashboard is a local-first browser/PWA product for monitoring and managing compatible Bambu Lab printers and related devices. It is capability-driven, security/audit focused, and designed for an always-on LAN server. It must remain outside V1 slicing, automatic printer/job assignment, general print-farm scheduling, remote Internet access, multi-user/RBAC, and other explicit PRD non-goals.

The product owner retains authority over scope, architecture, milestones, major dependencies, security/privacy boundaries, public branding, and merge decisions.

## Source of truth

GitHub is authoritative for current project state, architecture/specifications, milestone state, branches, PRs, merge state, commit SHAs, decisions, risks, Codex prompts, handoffs, and committed validation evidence.

Before making current-state claims, reconcile:

1. `project-control/handoffs/CHATGPT_HANDOVER.md`
2. `project-control/status/CURRENT_STATUS.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. relevant specifications, branch/PR state, and commit SHA in GitHub.

Chat history, AI memory, Codex reports, and local-machine claims are not authoritative unless independently verified.

## Mandatory control structure

```text
project-control/
  handoffs/CHATGPT_HANDOVER.md
  status/CURRENT_STATUS.md
  specs/
  decisions/DECISION_LOG.md
  risks/RISK_REGISTER.md
  feedback/
prompts/codex/
  RESUME.md
  NEXT_PROMPT.md
src/
tests/
test-fixtures/synthetic/
```

## Iterative prototype delivery model

M0 is the one-time governance/bootstrap milestone. **Every major product milestone from M1 onward must end with a runnable, testable prototype.** A milestone is not considered complete merely because code or documentation exists.

For each major product milestone:

1. Define the smallest coherent prototype increment that proves the milestone objective.
2. Keep the application runnable throughout development where practical.
3. Provide a reproducible local/staging run path and deterministic synthetic scenarios.
4. Preserve previously validated behavior unless an approved requirement intentionally changes it.
5. Run automated tests and perform hands-on prototype validation.
6. Capture product-owner feedback, usability findings, defects, real-device/interface findings where explicitly authorized, and architecture/security lessons.
7. Classify feedback as: **fix before completion**, **approved carry-forward**, **future consideration**, or **rejected/out of scope**.
8. Update requirements, specifications, decisions, risks, and project-control state when feedback changes project intent.
9. Shape and authorize the next milestone only after reconciling the tested prototype feedback with the next planned requirements.
10. Prototype speed must never bypass security, privacy, legal/interface, data-hygiene, test, or scope guardrails.

The delivery loop is:

```text
Approved milestone scope
        ↓
Controlled implementation
        ↓
Runnable prototype
        ↓
Automated + hands-on validation
        ↓
Feedback / findings
        ↓
Fix or record carry-forward
        ↓
Product-owner milestone decision
        ↓
Merge + project-control reconciliation
        ↓
Shape and authorize next milestone
```

Prototype behavior is not automatically a permanent API/product contract; material contracts and requirement deviations must be captured deliberately in specifications/decisions.

## Codex operating model

Codex is an implementation agent, not the product owner. Executable work must be controlled from GitHub through:

```text
prompts/codex/RESUME.md
prompts/codex/NEXT_PROMPT.md
```

Standard resume instruction:

```text
resume Bambu Printer Dashboard from GitHub. Read prompts/codex/RESUME.md and follow it exactly.
```

Codex must not independently start a milestone, expand scope, merge a PR, change architecture/security/auth/privacy assumptions, add significant dependencies/infrastructure/services, connect to production/customer systems, persist credentials, or begin later-milestone work.

## Milestone governance

Every milestone definition must include:

- objective;
- prototype outcome;
- in-scope requirements;
- explicit non-goals;
- architecture/security/privacy constraints;
- deliverables;
- automated tests;
- hands-on prototype validation scenarios;
- acceptance criteria;
- feedback capture/reconciliation requirements;
- required project-control updates;
- PR/merge requirements;
- stop conditions.

Completion requires implementation, tests, documentation, project-control updates, expected PR/merge state, verified commit SHA, working prototype evidence, and product-owner validation/decision.

## Pull request governance

Unless explicitly approved otherwise:

```text
feature/milestone branch
        ↓
draft PR
        ↓
implementation
        ↓
automated tests
        ↓
runnable prototype validation
        ↓
independent AI review
        ↓
product-owner feedback / decision
        ↓
fix/reconcile as needed
        ↓
merge approval
```

Tests passing or Codex reporting completion does not constitute merge approval.

## Architecture guardrails

- Local-first wherever supported; cloud-dependent behavior is explicit.
- Capability-driven domain model; avoid model-specific hard coding.
- Vendor/device transport isolated behind adapters.
- Server owns connectivity, freshness, reconciliation, background monitoring, validation, and audit.
- Unsupported/stale/offline capability degrades clearly and safely.
- Secure local API/event layer is an explicit boundary for UI and integrations.
- Portable deployment; avoid unnecessary host coupling.
- PWA offline mode is strictly read-only.
- Minimal, maintained, commercially safe dependency surface.
- Technical reachability of a Bambu/vendor interface does not by itself authorize project use.

Exact application framework, frontend framework, datastore, deployment packaging, Bambu interfaces, camera transport, secret/key recovery, update architecture, and LAN certificate strategy are deliberate M1 decisions.

## Security and privacy guardrails

- V1 production access: LAN-only, HTTPS, authenticated.
- One authenticated application user in V1; no RBAC.
- Strong, separately governed authentication before API control/write exposure.
- Explicit confirmation for destructive/high-impact actions.
- Never hardcode/commit secrets or expose them in logs/diagnostics.
- Never log authorization headers.
- Never disable certificate validation merely for convenience.
- Never bypass/weakening vendor/device authentication, access restrictions, or technical protections merely to obtain functionality.
- Model/external parameters are untrusted and validated independently before execution.
- Camera privacy controls and access/action audit are mandatory.
- Stale/offline state must not appear live.
- Sensitive backups must be strongly encrypted and support approved machine-independent recovery.
- Dedicated threat model/security review is required before production release.

Repository/test data must be synthetic by default. Never commit customer/production-derived sensitive data, real credentials, private live-device dumps, private camera/media content, production logs, or identifying metadata.

## Bambu Lab / third-party intellectual property posture

This is an independent, unofficial third-party interoperability project. It must not claim Bambu Lab affiliation, sponsorship, authorization, certification, maintenance, or endorsement. Bambu Lab marks, product names, logos, software, firmware, services, and other intellectual property remain with their respective rights holders.

Material uncertainty about APIs, cloud authentication, device protocols, camera/media interfaces, terms, trademarks, or security controls is a stop condition requiring feasibility/legal/security review. See `TRADEMARKS.md` and the risk register.

## Decision and risk management

Material architecture/product decisions belong in `project-control/decisions/DECISION_LOG.md`. Material risks belong in `project-control/risks/RISK_REGISTER.md`. Do not silently reverse a recorded decision; propose a new decision with rationale and consequences.

## Stop conditions

Stop and surface a product-owner decision when work would require architectural redesign, new external infrastructure/paid service, significant dependency addition, security/authentication-model change, credential persistence, production/customer access, schema/API contract break, destructive migration, later-milestone scope, use of real sensitive data, violation of a non-goal, unclear material requirement, or unresolved vendor/legal/interface boundary.

## Definition of Done

Unless a milestone explicitly states otherwise, Definition of Done requires:

- implementation complete;
- relevant unit/integration tests passing;
- meaningful failure/edge/regression paths tested;
- runnable prototype available through documented local/staging steps;
- hands-on milestone validation performed and findings recorded;
- feedback triaged and required fixes completed;
- security/privacy implications reviewed;
- synthetic fixtures only by default;
- documentation/specifications updated;
- no accidental scope expansion;
- no secrets or sensitive data committed;
- PR state verified;
- project-control status/handover updated as required;
- acceptance criteria satisfied;
- expected merge state and resulting commit SHA verified.

## Project-specific non-negotiables

1. Every major product milestone from M1 onward ends with a runnable, testable prototype plus feedback review before the next milestone is authorized.
2. The product remains local-first and does not become a slicer, automatic printer/job assignment engine, or general print-farm scheduler in V1.
3. Never bypass vendor/device security, authentication, certificate validation, access restrictions, or legal/contractual boundaries merely to make an integration work.
4. Never commit secrets, credentials, private live-device content, or customer/production-derived sensitive data; use deterministic synthetic fixtures by default.
5. Technology, architecture, milestone scope, and merge decisions remain product-owner controlled; AI/Codex may recommend but cannot silently authorize expansion.
