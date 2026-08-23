# Security and Privacy Guardrails

Status: **M1 baseline reconciled to read-only-first V1**

## Access and authentication

- V1 production access remains LAN-only.
- The approved read-only V1 dashboard does **not** require interactive application authentication.
- LAN reachability therefore means read access to the information exposed by the dashboard; setup/admin documentation must state this clearly.
- Production packaging should support LAN-accessible binding and a local-only or selected-interface restriction where feasible.
- Initial read-only LAN deployment may use HTTP.
- HTTPS plus strong authentication becomes mandatory before any printer write/control capability, sensitive remote exposure, multi-user model or comparable security expansion is introduced.
- API write/control exposure is prohibited under the current V1 architecture unless separately Product Owner approved together with authentication/authorization and TLS requirements.

## Printer credentials and secrets

- Never hardcode or commit credentials, LAN Access Codes, tokens, webhook secrets, encryption keys or backup secrets.
- Never log authorization headers, LAN Access Codes or sensitive credentials.
- Printer LAN Access Codes are device credentials even though the dashboard itself has no login.
- When a user enters a printer LAN Access Code, ask whether it may be remembered.
- If the user chooses to remember it, persist it only through the dedicated secrets boundary with approved encryption-at-rest protection.
- If the user chooses not to remember it, keep it only in process memory for the current server runtime and require re-entry after restart.
- Changing from remembered to not-remembered must delete the persisted encrypted copy.
- “Memory only” does not claim generic RAM encryption; it means the application does not intentionally persist the value to disk.
- LAN Access Codes and other secrets must not be exposed in browser local storage, normal API responses, diagnostics bundles, telemetry, source control or plaintext backups.
- Full machine-independent secret recovery and backup key hierarchy remain a later explicit security design item; M1 must not improvise them.

## Read/write separation and control safety

- The current approved printer adapter architecture is read-only.
- Read access does not imply authorization to send commands.
- Any future printer control path must use a separately governed capability/interface and requires explicit Product Owner security/architecture approval.
- Destructive/high-impact actions, if ever approved, require explicit confirmation and authenticated authorization.
- Model-generated or externally supplied control parameters are untrusted input and must be validated independently of prompts.
- Authorization/policy enforcement must fail closed on security-relevant ambiguity.
- Stale/offline state must never be shown as live.
- Do not bypass, disable or weaken vendor/device authentication, certificate checks, access controls or technical protections merely to obtain functionality.
- A technically reachable interface is not automatically an approved interface; material legal, contractual, IP or security uncertainty is a stop condition.

## Network/discovery privacy

- LAN service discovery may be used for dashboard-server discovery and future printer discovery only within approved local-network boundaries.
- Browser clients must not perform arbitrary LAN scanning; printer discovery belongs on the server side.
- Manual server IP/port and printer connection details remain diagnostics/fallback mechanisms, not the default user experience.

## Camera privacy

Camera functionality is not part of the approved M1 implementation. If/when introduced:

- homepage camera streams are off by default and opt-in per stream;
- a global disable-all-cameras control and per-device privacy toggles are required;
- camera access/actions must be auditable;
- camera implementation requires a separate feasibility/security review.

## Audit/history

- Maintain a practical structured audit/history trail covering configuration, API activity, failures/restarts, integration activity, security-relevant events and any future privileged actions.
- The original PRD 90-day audit-retention requirement remains traceable, but telemetry retention is governed separately by the approved data-retention policy.
- The application must not over-claim immutability/tamper resistance against a host administrator before that threat model is explicitly solved.

## Data retention/privacy

Two data-retention classes apply:

1. **Durable operational history:** retain maintenance/analytics-relevant summaries, printer lifecycle metadata, job summaries/outcomes, cumulative usage aggregates, maintenance/service records and significant faults/events for the life of the dashboard/printer unless the user explicitly deletes/resets them.
2. **Raw/high-frequency telemetry:** default retention 30 days; user configurable from 1 through 365 days. Selected compact aggregates may survive expiry where they support maintenance or long-term analytics.

Retention settings must not override stronger security/privacy requirements for secrets or sensitive content.

## Repository and test data

Do not commit customer/production-derived sensitive data, real identifiers, credentials/tokens, LAN Access Codes, raw private live API dumps, production logs, screenshots containing private data, real transaction/person records or live camera/media captures.

Use deterministic synthetic fixtures under `test-fixtures/synthetic/` by default.

M1 implementation and tests must not access real printers unless separately authorized.

## Production gate

A dedicated threat model/security review is required before production release. Any future introduction of write/control capability must trigger an earlier dedicated security review and mandatory authentication + HTTPS.
