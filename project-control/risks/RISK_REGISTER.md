# Risk Register

| ID | Description | Likelihood | Impact | Mitigation | Owner | Status | Related milestone |
|---|---|---:|---:|---|---|---|---|
| R-001 | Bambu account auth, APIs/device interfaces, trademarks or terms may constrain planned functionality or distribution. | High | High | Legal/interface feasibility review before committing architecture or release claims. | Product owner / M1 | Open | M1 |
| R-002 | LAN vs cloud capability coverage may differ by model/feature, undermining local-first assumptions. | High | High | Build capability matrix; isolate vendor adapters; degrade unsupported functions explicitly. | Architecture | Open | M1-M3 |
| R-003 | Camera protocols/auth/concurrency/recording support may be inconsistent or resource-intensive. | Medium | High | Feasibility test per initial device; opt-in cameras; resource budgets; privacy/audit controls. | Architecture/Security | Open | M1, M5 |
| R-004 | 90-day audit tamper evidence may be difficult to guarantee against a host administrator. | Medium | High | Define precise threat model and tamper-evidence claims; avoid unprovable immutability language. | Security | Open | M1, M6 |
| R-005 | Backup encryption plus disaster recovery to new hardware can create key-recovery or secret-exposure failure modes. | High | High | Explicit key hierarchy/recovery design and restore drills before implementation. | Security/Operations | Open | M1, M8 |
| R-006 | HTTPS on a private LAN/PWA may create certificate trust and browser UX constraints. | High | Medium | Evaluate local CA/self-signed/reverse-proxy options and PWA/browser behavior in M1. | Architecture | Open | M1-M2 |
| R-007 | Fully automatic updates with migration and rollback can cause data loss or service outage if not strongly gated. | Medium | High | Signed/verified update design, mandatory successful backup, health checks, rollback testing. | Operations | Open | M1, M8 |
| R-008 | Capability differences across current/future printers/AMS units may cause UI and domain assumptions to become model-specific. | High | Medium | Capability-driven model; synthetic matrix tests; no model-name branching unless unavoidable and documented. | Architecture | Open | M1-M5 |
| R-009 | Stale telemetry or partial disconnection could lead users/integrations to act on invalid state. | Medium | High | Explicit freshness semantics, unavailable state, reconnect logic, API timestamps/quality indicators. | Architecture/Security | Open | M3+ |
| R-010 | Strong local API/control exposure increases attack surface on the LAN. | Medium | High | Strong per-integration authentication/authorization design, input validation, safe defaults, audit, threat model. | Security | Open | M1, M7 |

## R-011 — Trademark/product-name confusion

- **Description:** The working name includes “Bambu”, which may create trademark, nominative-use, or affiliation-confusion concerns even with an independence disclaimer.
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Maintain prominent unofficial-project disclaimer; do not use vendor logos/brand trade dress without rights; keep naming provisional; perform trademark/name review before production V1 branding.
- **Owner:** Product owner
- **Status:** Open
- **Related milestone:** M1 / release readiness

## R-012 — Vendor terms/interface authorization mismatch

- **Description:** A technically accessible local/cloud/device interface may not be authorized or suitable for third-party use, or its terms may change.
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** M1 interface/legal feasibility matrix; prefer officially supported interfaces; treat material uncertainty as a stop condition; do not circumvent access/security controls; design adapters so unsupported interfaces can be disabled/replaced.
- **Owner:** Product owner / architecture
- **Status:** Open
- **Related milestone:** M1 onward

## R-013 — No currently authorized general real-printer integration path under project constraints

- **Description:** The product owner has excluded Bambu printer Developer Mode and deferred Bambu Lab developer-partner contact. Fleet Hub's documented API requires Developer Center authorization and Bambu-issued credentials/certificates, while Bambu Connect is not documented as a general headless always-on monitoring/control API. Under these constraints, the project currently lacks an approved general interface for full live telemetry and control of real printers.
- **Likelihood:** High
- **Impact:** High
- **Mitigation:** Keep all printer transport behind replaceable capability-driven adapters; build and validate the product platform with deterministic synthetic adapters; separately classify every PRD feature as independent, adapter-ready, or interface-blocked; periodically re-evaluate publicly documented supported Bambu interfaces without using Developer Mode, cloud impersonation, or private partnership material.
- **Owner:** Product owner / architecture
- **Status:** Open / accepted current constraint
- **Related milestone:** M1 onward
