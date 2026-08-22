# Security Policy

Security is an architectural requirement for Bambu Printer Dashboard.

## Baseline rules

- V1 production access is LAN-only and authenticated.
- HTTPS is required even on LAN.
- Credentials, tokens, authorization headers, webhook secrets, encryption keys, and backup secrets must never be committed or exposed in logs.
- Destructive/high-impact actions require explicit confirmation.
- API write/control operations require strong authentication and explicit capability/policy boundaries.
- External/model-generated command parameters are untrusted input and must be independently validated.
- Camera access and camera actions must be privacy-controlled and auditable.
- Stale/offline device state must never be represented as live state.
- Security-relevant activity must be auditable.
- Tests and fixtures must be synthetic unless the product owner explicitly approves otherwise.
- Staging must not access real printers by default.
- Do not bypass or weaken Bambu Lab/device authentication, certificate checks, access controls, or technical protections merely to make a feature work.
- A technically reachable vendor/device interface is not automatically an approved project interface; unresolved legal, contractual, or security questions are stop conditions.

## Sensitive reports

Until a dedicated private security-reporting channel is established, do **not** put secrets, credentials, exploit details affecting a live deployment, live device dumps, private camera/media content, or user-sensitive data in public GitHub issues or pull requests.

If a report cannot be safely disclosed publicly, contact the repository owner through an appropriate private channel before publishing details. A formal security contact/process will be established before production release.

## Production gate

A dedicated threat model/security review is required before production release.
