# Security and Privacy Guardrails

Status: **M0 baseline**

## Access and authentication

- V1 production access is LAN-only.
- HTTPS is required even on LAN.
- Authentication is mandatory.
- Prefer officially supported Bambu-account sign-in for device association only if supported and legally/technically appropriate; otherwise use a secure local fallback.
- V1 application user model is one authenticated user; RBAC is out of scope.
- API write/control exposure requires strong authentication and explicit capability boundaries.

## Credentials and secrets

- Never hardcode or commit credentials, tokens, webhook secrets, encryption keys, or backup secrets.
- Never log authorization headers or sensitive credentials.
- Sensitive configuration must be protected at rest.
- Backup possession alone must not reveal protected secrets, while disaster recovery to new hardware must remain possible.
- The exact key-encryption and recovery model is unresolved and requires an explicit M1 security decision.

## Control safety

- Destructive/high-impact actions require explicit confirmation.
- Model-generated or externally supplied control parameters are untrusted input and must be validated independently of prompts.
- Authorization/policy enforcement must be application-controlled and fail closed on security-relevant ambiguity.
- Stale/offline state must never be shown as live.
- Do not bypass, disable, or weaken vendor/device authentication, certificate checks, access controls, or technical protections merely to obtain functionality.
- A technically reachable interface is not automatically an approved interface; material legal, contractual, IP, or security uncertainty is a stop condition.

## Camera privacy

- Homepage camera streams are off by default and opt-in per stream.
- A global disable-all-cameras control and per-device privacy toggles are required.
- Camera access/actions must be auditable.

## Audit/history

- Maintain a practical structured audit trail covering authentication, commands, files, configuration, API/cloud activity, failures/restarts, cameras, callbacks, and security events.
- Default retention is 90 days.
- The application must not expose purge for records younger than 90 days.
- Tamper resistance/evidence against a host administrator is a feasibility/security design item; do not over-claim immutability before that design is approved.

## Repository and test data

Do not commit customer/production-derived sensitive data, real identifiers, credentials, raw production API responses, production logs, screenshots containing private data, real transaction/person records, or live camera/media captures.

Use deterministic synthetic fixtures under `test-fixtures/synthetic/`.

## Production gate

A dedicated threat model/security review is required before production release.
