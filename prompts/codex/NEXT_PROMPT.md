# Next Codex Task

## Status
HOLD — M2 remediation implemented locally; await technical review, PR-head CI evidence and Product Owner retest direction.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Objective
Remediate the Product Owner's 2026-08-30 M2 readiness findings on draft PR #3 before asking for further detailed real-device validation.

Implementation note: local remediation on 2026-08-30 added automatic discovery initiation/rescan, safe edit/reconfigure, safe remove/delete, real-printer-focused default Fleet UX with explicit synthetic regression mode, mocked X2D active-print startup hardening, focused tests and docs/project-control updates. M2 remains unaccepted and PR #3 remains draft/unmerged.

The authoritative feedback for this task is:

- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

M2 remains a real-device gate. This task does not authorize M2 acceptance, merge, M3 work, frontend modernization, printer control, or any security/interface expansion.

## Read first
Read only the minimum context required:

1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`
3. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
4. `project-control/specs/OPERATING_MODEL.md`
5. `project-control/specs/M1_ARCHITECTURE.md`
6. `project-control/decisions/DECISION_LOG.md` — especially DEC-006, DEC-010 through DEC-015
7. `project-control/risks/RISK_REGISTER.md` — especially R-014 through R-016
8. affected onboarding/adapter/server/web module documentation, contracts, and focused tests.

Do not recursively ingest unrelated M3+ implementation areas.

## Required remediation

### 1. Automatic server-side discovery in normal onboarding

The current user-triggered Discover button is insufficient as the primary UX.

Implement bounded **automatic server-side printer discovery** when the fleet/onboarding experience is entered and no suitable configured real-printer state makes a scan unnecessary. Provide a visible **rescan/refresh** action as a secondary control.

The UI must expose clear sanitized states for:
- searching;
- candidates found;
- no candidates found;
- discovery failed/manual fallback available.

Do not implement browser-side LAN scanning.

For a discovered candidate, prefill/use only sanitized candidate data and ask the Product Owner for the minimum additional information required for the approved local read connection, such as the LAN Access Code and any unavoidable metadata discovery does not safely/reliably provide.

Preserve reliable manual IP/hostname + minimum required access metadata fallback.

### 2. Edit / reconfigure configured real printers

Add a safe user-facing flow to edit/reconfigure an existing real-printer onboarding entry when details were entered incorrectly or changed.

Requirements:
- allow non-secret configuration fields to be corrected;
- never return/display the existing LAN Access Code;
- changing credentials requires the user to supply a new Access Code;
- preserve process-memory-only credential policy unless separately authorized;
- reconnect cleanly using the corrected configuration;
- no raw/private connection details in normal diagnostics.

### 3. Remove configured real printers

Add a clear remove/delete action for configured real printers with an appropriate confirmation.

Removal must:
- disconnect/stop the adapter cleanly;
- remove the printer from active onboarding/runtime configuration;
- clear associated process-memory credential material and transient discovery/onboarding state;
- remove or safely reconcile associated current-state registration without leaking private values;
- not introduce destructive history deletion unless separately required/authorized. Historical normalized observations, if retained, must remain credential-free and clearly attributable without requiring private identifiers.

### 4. Real-printer-focused product UX; preserve synthetic regression internally

The Product Owner no longer wants synthetic printer cards mixed into the normal real-printer product experience.

Do **not** delete the deterministic synthetic adapter/scenario infrastructure: it remains an approved permanent regression/test path under the existing architecture and M2 contract.

Instead:
- normal product/fleet view should default to real-printer operation once real onboarding is in use;
- synthetic devices should be hidden/disabled from the ordinary user-facing fleet by default;
- keep an explicit development/test/diagnostic mechanism for synthetic scenarios and automated tests;
- preserve all existing deterministic synthetic regression coverage.

This is not authorization for broad UI modernization.

### 5. X2D connection while actively printing

The Product Owner reports a local real-device finding: the X2D could not be connected while the printer was actively printing. A1 Mini basic telemetry had connected successfully in earlier testing.

Investigate and harden the connection lifecycle using only the already-approved **standard-mode local MQTTS read-only** interface.

Rules:
- do not request or commit private printer identifiers/credentials/raw payloads;
- do not use Developer Mode;
- do not use Fleet Hub;
- do not impersonate Bambu cloud clients;
- do not use private/partner authorization;
- do not execute printer write/control commands;
- do not weaken/disable TLS, authentication, authorization, signatures, or other security controls;
- do not copy proprietary Bambu implementation code.

Use mocked/sanitized tests to cover any code-path remediation. If reliable X2D connection during printing cannot be achieved under the approved path, document the sanitized technical boundary and stop rather than bypassing it.

### 6. Tests and documentation

Add or update focused automated tests for at least:
- automatic discovery initiation;
- rescan/refresh;
- no-candidate and discovery-failure fallback states;
- edit/reconfigure flow;
- credential replacement/redaction behavior;
- remove printer and adapter cleanup;
- synthetic-device suppression/default product behavior while preserving synthetic regression mode;
- X2D-relevant connection lifecycle behavior that can be represented with mocked/sanitized transports;
- absence of printer write/control surface.

Run the repository's existing validation suite including build/tests, Playwright E2E, documentation/license checks, and Docker/Compose CI validation as applicable.

Update affected module docs/runbooks/contracts and reconcile:
- `project-control/feedback/M2_REAL_DEVICE_VALIDATION_EVIDENCE.md`;
- `project-control/status/CURRENT_STATUS.md`;
- `project-control/handoffs/CHATGPT_HANDOVER.md`;
- `project-control/risks/RISK_REGISTER.md` if the X2D finding changes R-014/R-016 assessment;
- PR #3 description/evidence if stale.

## Retest gate

Do not claim M2 ready for detailed Product Owner testing until the remediation is implemented and automated validation passes.

The next Product Owner hands-on retest should be able to verify, without editing repository secret files:

1. app/server automatically discovers compatible printers when entering onboarding;
2. Product Owner selects a candidate and supplies only required remaining data/Access Code;
3. an incorrectly configured printer can be edited/reconfigured;
4. a configured printer can be removed and re-added;
5. normal fleet UI is focused on real printers rather than synthetic demo devices;
6. A1 Mini remains connectable;
7. X2D can connect while printing, or the approved-path limitation is surfaced clearly and safely.

## PR / authority

Continue only on existing branch `m2/real-device-readonly-prototype` and draft PR #3.

Keep PR #3 draft and unmerged. Product Owner acceptance and merge authorization remain separate decisions. Do not begin M3.
