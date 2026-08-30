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

## R-013 — Real-printer read access is viable, but full control path remains unavailable under project constraints

- **Description:** Bambu's published authorization-control guidance explicitly preserves third-party read-only printer status/print-progress access, including Home Assistant-style monitoring, but critical write/control operations require stronger authorized paths. The product owner excludes Developer Mode, Fleet Hub hardware/partner authorization is not being pursued, and cloud-client impersonation is prohibited. Therefore a real read-only dashboard is viable, while broad real-printer control remains unavailable under current constraints.
- **Likelihood:** High
- **Impact:** High
- **Mitigation:** Make the first real-device adapter explicitly read-only; maintain a per-model/per-firmware capability matrix for A1 Mini and X2D; validate actual exposed fields before claiming support; keep write/control capabilities disabled unless separately documented and authorized; retain deterministic synthetic adapters for regression tests.
- **Owner:** Product owner / architecture
- **Status:** Open / accepted current constraint
- **Related milestone:** M1-M2 onward

## R-014 — Standard-mode read-only status path may vary by firmware/model or become less accessible

- **Description:** Although Bambu publicly states that printer status pushes remain available to third-party monitoring, the exact field set, authentication behavior, cadence, reconnect behavior or firmware enforcement may differ between A1 Mini and X2D or change over time. A technically successful connection may still expose too little stable data for a useful product. On 2026-08-30 the Product Owner reported that the current prototype could not connect to the X2D while that printer was actively printing; the cause is not yet verified and the finding must be investigated without collecting private evidence in the repository.
- **Likelihood:** High
- **Impact:** Critical
- **Mitigation:** Keep M2 blocked from acceptance while the X2D finding is unresolved; investigate only the approved standard-mode local read-only path; use sanitized/mock regression tests for code changes; validate the Product Owner's current firmware on both devices; record a sanitized capability matrix and timing/reliability evidence; isolate the transport behind `adapter-bambu-readonly`; retain synthetic regression internally; stop before M3 if either device cannot meet the usefulness threshold without prohibited mechanisms.
- **Owner:** Architecture / Product owner
- **Status:** Open — observed X2D active-print connection failure; remediation/verification pending
- **Related milestone:** M2

## R-015 — Real LAN Access Code or private device evidence could leak during M2 debugging

- **Description:** M2 introduces real printer credentials and private LAN telemetry into local development. Debugging, logs, screenshots, shell history, CI configuration, issue/PR comments, packet captures or test fixtures could accidentally expose LAN Access Codes, local addresses, identifiers or raw private payloads in the public repository.
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Default M2 real credentials to memory-only/non-persisted handling; never run real-device tests in public CI; redact sensitive fields; prohibit raw private payload/device dumps and identifiers in Git; use local-only debugging evidence and convert findings into sanitized summaries/project-authored synthetic fixtures before commit; review the PR for sensitive material before acceptance.
- **Owner:** Security / Architecture
- **Status:** Open
- **Related milestone:** M2

## R-016 — Read-only MQTTS transport assumptions may depend on unofficial implementation details

- **Description:** Bambu publicly confirms that status pushes remain available, but not every low-level transport/authentication detail required by an independent client may be formally documented in public vendor material. Community implementations may reveal practical behavior, but copying proprietary code or depending on a security bypass would violate project constraints.
- **Likelihood:** Medium
- **Impact:** High
- **Mitigation:** Authorize only standard-mode read-only status consumption; use public vendor statements and legally compatible open-source interoperability references carefully; preserve provenance; do not copy proprietary Bambu network-plugin code; do not bypass signatures/authentication/TLS; stop and surface the boundary if a working client would require prohibited behavior.
- **Owner:** Product owner / Architecture
- **Status:** Open
- **Related milestone:** M2
