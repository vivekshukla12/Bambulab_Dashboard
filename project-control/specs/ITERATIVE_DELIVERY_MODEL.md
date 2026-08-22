# Iterative Delivery and Prototype Feedback Model

**Status:** M0 baseline

## Principle

Bambu Printer Dashboard will be developed through successive **working prototypes**, not through long implementation phases that defer product validation until the end.

M0 establishes governance and is not a product prototype. Each major product milestone from **M1 onward** must leave the repository at a runnable, demonstrable prototype state.

## Required milestone cycle

### 1. Plan
Define the milestone objective, requirements, non-goals, security/architecture constraints, and the minimum coherent prototype outcome.

### 2. Implement
Build the increment on a milestone/feature branch and draft PR. Preserve the previously validated prototype unless an approved decision intentionally changes behavior.

### 3. Automated validation
Run milestone-relevant unit, integration, contract, scenario, security, and regression tests. Synthetic test scenarios must remain available even when real-device validation is later approved.

### 4. Prototype validation
Run the product through documented local/staging steps. Validate the milestone's user journeys and operational scenarios hands-on. Real printers are opt-in test targets only when explicitly authorized; staging remains synthetic/no-real-printer by default.

### 5. Capture feedback
Record observations under `project-control/feedback/` using the milestone feedback template. Feedback may include:

- user experience/usability;
- missing or confusing behavior;
- defects/regressions;
- performance/resource findings;
- device/capability/interface findings;
- architecture/security/privacy issues;
- operational/deployment findings;
- requirement clarifications;
- future ideas.

### 6. Triage
Every material feedback item receives one disposition:

- **FIX BEFORE COMPLETE** — acceptance cannot be met without it.
- **CARRY FORWARD** — approved input to a named future milestone.
- **FUTURE CONSIDERATION** — useful but not authorized scope.
- **REJECTED / OUT OF SCOPE** — intentionally not pursued.

### 7. Reconcile project state
If feedback changes product intent, update the PRD/specification through an explicit decision/deviation. Update risks, decisions, status, handover, and milestone plan as appropriate.

### 8. Milestone decision
The product owner decides whether to:

- approve/merge the milestone;
- require additional fixes/revalidation;
- reduce or change the milestone scope through an explicit decision;
- pause for architecture/security/legal investigation.

### 9. Shape the next milestone
The next milestone's final scope is produced from **both** the planned roadmap and validated feedback from the current prototype. Do not mechanically execute a prewritten roadmap when prototype evidence suggests the plan should change.

## Prototype acceptance evidence

Each major milestone should provide, where applicable:

- startup/run instructions;
- supported test environment description;
- synthetic scenario instructions;
- automated test results/CI evidence;
- manual validation checklist;
- known limitations;
- screenshots or recordings only when they contain no sensitive/customer/private device data;
- milestone feedback record;
- verified PR/head/merge commit identifiers.

## Guardrail

A prototype is not permission to weaken security, use unapproved vendor interfaces, commit live/private data, or implement later scope. Fast learning is the purpose of prototyping; bypassing project controls is not.
