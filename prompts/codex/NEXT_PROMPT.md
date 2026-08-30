# Next Codex Task

## Status
QUEUED — replace the failed M2 mDNS discovery assumption with server-side Bambu-compatible SSDP discovery, then return for technical review and Product Owner retest.

## Milestone
M2 — Real A1 Mini + X2D read-only GO/NO-GO prototype

## Objective
Unblock M2 Product Owner testing after the 2026-08-30 retest showed that automatic discovery / Rescan still returns no usable printer candidates.

Research record:
- `project-control/reviews/M2_DISCOVERY_INTERFACE_RESEARCH_2026-08-30.md`

Product Owner feedback:
- `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`

The current PR #3 implementation uses mDNS service queries. Public Bambu Studio behavior/issues plus mature independent integrations provide strong evidence that Bambu LAN printer discovery uses SSDP/multicast rather than the current mDNS assumption. Automatic discovery is therefore still considered technically feasible; the current discovery mechanism is the blocker.

This task does not authorize M2 acceptance, merge, M3 work, Developer Mode, printer control, Bambu Cloud client impersonation, proprietary Network Plugin integration, private/partner authorization, or security weakening.

## Read first
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/reviews/M2_DISCOVERY_INTERFACE_RESEARCH_2026-08-30.md`
3. `project-control/feedback/M2_PRODUCT_OWNER_FEEDBACK_2026-08-30.md`
4. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/specs/M1_ARCHITECTURE.md`
7. `project-control/decisions/DECISION_LOG.md` — especially DEC-006 and DEC-010 through DEC-015
8. `project-control/risks/RISK_REGISTER.md` — especially R-014 through R-016
9. affected adapter/server/web contracts, tests and module documentation only as needed.

## Required implementation

### 1. Replace mDNS printer discovery with SSDP

Replace the current Bambu-printer mDNS discovery implementation in `packages/adapter-bambu-readonly` with independently implemented server-side SSDP discovery using Node standard-library networking where practical; do not add a significant dependency without Product Owner approval.

Use standard SSDP behavior and validate Bambu printer advertisements/responses, including the publicly observed Bambu service type:

`urn:bambulab-com:device:3dprinter:1`

The implementation may use bounded active SSDP M-SEARCH and/or passive NOTIFY observation as appropriate. Do not copy proprietary Bambu Network Plugin code or third-party implementation code.

Discovery must:
- run server-side only;
- start automatically in the normal onboarding flow when appropriate;
- support explicit Rescan;
- deduplicate candidates;
- expose only sanitized candidate data to the browser;
- keep raw LAN endpoint/identifier details server-side;
- clearly distinguish `searching`, `found`, `none`, and `failed` states;
- time out cleanly rather than hanging;
- preserve manual IP/hostname + minimum access metadata fallback because multicast can fail across VLANs, AP isolation, guest networks, firewalls, containers, VPNs, or multicast-suppressed LANs.

Do not present discovery as guaranteed zero-configuration across all networks.

### 2. Candidate onboarding

For a discovered printer, prefill whatever can be safely and reliably derived from SSDP and ask the user only for the remaining required information.

The normal expected UX is:

`Searching LAN -> discovered printer candidate(s) -> select candidate -> enter LAN Access Code / unavoidable missing metadata -> Connect`

Do not claim that a printer can be fully auto-added without user confirmation/credentials when the approved standard-mode connection requires a LAN Access Code.

Retain the already implemented Edit/Reconfigure and Remove/Delete flows and the real-printer-focused normal fleet UX.

### 3. Keep current approved read-only transport

Do not replace the approved local MQTTS read-only monitoring path merely to solve discovery.

The proprietary Bambu Network Plugin and direct Bambu Cloud login are not authorized by this task. Research found that neither is necessary to solve LAN discovery/read-only monitoring. If SSDP discovery succeeds but the approved X2D read path still fails, document the sanitized boundary and return for Product Owner architecture/interface decision rather than silently adding another vendor interface.

### 4. Security / privacy constraints

Do not:
- use Developer Mode;
- use Fleet Hub;
- impersonate Bambu Studio/Handy/Connect or other official cloud clients;
- use undocumented private Bambu Cloud APIs;
- use private/partner credentials;
- execute printer write/control commands;
- weaken TLS/certificate/authentication/authorization/signature checks;
- commit Access Codes, serials, MACs, local IPs, raw SSDP/MQTT packet dumps, private payloads or unsanitized logs;
- copy proprietary Bambu Network Plugin implementation code.

### 5. Automated evidence

Add focused project-authored/sanitized tests for:
- parsing representative SSDP responses/NOTIFY messages;
- Bambu service-type filtering;
- candidate sanitization and deduplication;
- automatic scan initiation;
- Rescan;
- no-candidate timeout;
- socket/discovery failure fallback;
- manual fallback remaining available;
- no browser exposure of private endpoint/credential fields;
- existing edit/reconfigure/remove flows;
- synthetic regression mode;
- no printer write/control surface.

Run the existing validation suites, including build/Vitest, Playwright, TypeDoc/license checks and Docker/Compose CI validation.

Do not run real-device validation yourself unless actually executing on the Product Owner LAN with locally supplied credentials. Never request credentials through GitHub/chat.

## Documentation / project-control

After implementation:
- update affected adapter/server/web module docs and M2 runbook;
- update `project-control/feedback/M2_REAL_DEVICE_VALIDATION_EVIDENCE.md` with sanitized implementation evidence only;
- update `project-control/status/CURRENT_STATUS.md`;
- update `project-control/handoffs/CHATGPT_HANDOVER.md`;
- reconcile R-014/R-016 if findings materially change them;
- update PR #3 description if stale;
- set `NEXT_PROMPT.md` back to HOLD pending technical review / Product Owner retest.

## Retest gate

Do not claim M2 ready for detailed validation until PR-head automated/CI evidence passes and technical review accepts the SSDP remediation.

The Product Owner retest should verify:
1. entering onboarding automatically finds A1 Mini/X2D when LAN multicast conditions permit;
2. Rescan actually refreshes SSDP discovery;
3. selecting a candidate requires only Access Code / genuinely unavoidable missing metadata;
4. manual fallback remains usable if SSDP cannot cross the local network topology;
5. edit/reconfigure and remove/re-add still work;
6. A1 Mini remains connectable;
7. X2D can connect during an active print, or its remaining approved-path limitation is surfaced clearly.

## PR / authority

Continue only on existing branch `m2/real-device-readonly-prototype` and draft PR #3. Keep it draft and unmerged. Product Owner acceptance and merge authorization remain separate decisions. Do not begin M3.