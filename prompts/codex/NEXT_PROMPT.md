# Next Codex Task

## Status
QUEUED — bounded Bambu Connect / user-installed official Network Plugin feasibility spike only.

## Milestone
M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## Authority / Product Owner direction

The Product Owner reaffirmed on 2026-09-06:
- do **not** contact Bambu Lab or pursue developer-partner authorization;
- do **not** continue unsupported mDNS/SSDP experimentation;
- evaluate Bambu Connect as an authorization route if it can be used through a publicly supported boundary;
- if the final supported no-contact route cannot satisfy the product, recommend project termination rather than further workaround development.

Read first:
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`
3. `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`
4. `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`
5. `project-control/specs/OPERATING_MODEL.md`
6. `project-control/decisions/DECISION_LOG.md` for DEC-006, DEC-011 through DEC-017 historical context
7. `project-control/risks/RISK_REGISTER.md`
8. affected M2 adapter/server modules only as needed.

## Public integration conclusion to use

Bambu's public guidance distinguishes two surfaces:

1. **Bambu Connect** — a user-mediated handoff for authorization-controlled third-party actions through the documented Bambu Connect URL Scheme. Do not treat it as a general OAuth/token, printer enumeration or telemetry API and do not extract/reuse its credentials.
2. **Updated Bambu Network Plugin** — Bambu publicly states monitoring remains accessible and unofficial software can explore integration using the updated Network Plugin. Bambu Studio public source exposes a NetworkAgent boundary with discovery, SSDP, local-connect/local-message, subscription and printer-connect functions around the separately distributed plugin.

Bambu Cloud remains private infrastructure. Do not impersonate official Bambu clients or use undocumented/private cloud APIs.

## Objective

Determine whether an **official Bambu networking component already installed by the user** can provide reliable A1 Mini + X2D discovery/enumeration and read-only local monitoring through a public integration boundary, without redistributing proprietary Bambu software and without vendor outreach.

This is a feasibility spike, not permanent dependency adoption.

## Required spike

### 1. Runtime availability / architecture probe

Determine, from public Bambu Studio declarations and local runtime inspection only, whether the user-installed official Network Plugin can be safely located and invoked through a stable public ABI/surface on the supported development platform.

Do not:
- download the plugin from unofficial sources;
- copy it into the repository;
- bundle or redistribute it;
- patch or reverse engineer its binary;
- inspect/decrypt embedded secrets/private keys;
- hook private IPC/cloud traffic;
- copy Bambu Studio AGPL implementation code into this MPL repository.

If the public boundary cannot be used independently without copying implementation or reverse engineering proprietary internals, STOP and report `not feasible`.

### 2. Isolated optional bridge

If the public boundary is sufficient, create the smallest isolated optional bridge/package needed to prove only:
- discovery / printer enumeration;
- local printer connection;
- local read-only message/status callback;
- read-only subscription where needed;
- normalization into the existing M2 read-only adapter/domain boundary.

The bridge must fail closed when the official user-installed component is absent and must not make the proprietary plugin a committed/build-time repository asset.

Do not permanently replace the existing adapter architecture in this spike.

### 3. Bambu Connect boundary

Bambu Connect may be integrated only through its publicly documented URL Scheme / user-mediated handoff where relevant to prove that restricted authorization remains outside our process.

Do not:
- scrape Bambu Connect;
- extract tokens/cookies/credentials;
- invoke private IPC;
- automate hidden UI/login flows;
- use it to obtain Bambu Cloud credentials;
- claim it authorizes monitoring APIs it does not document.

M2 remains read-only; no restricted action needs to be executed to pass this spike.

### 4. Strict prohibited surface

Do not invoke or expose:
- cloud login or client impersonation;
- bind/unbind;
- start print / file transfer;
- axis/motion;
- calibration;
- temperature/fan/AMS control;
- camera initiation;
- arbitrary send-message/write paths;
- Developer Mode;
- TLS/auth/signature/security weakening.

No real Access Codes, serials, IPs, account tokens, private payloads or raw local logs may enter Git/public CI.

### 5. Automated evidence

Use project-authored mocks/shims representing the public bridge boundary for CI. Add tests proving:
- optional component absent => clean/fallback failure;
- discovery candidates are sanitized;
- read-only callbacks normalize correctly;
- no write/control API is exposed;
- no credentials/private endpoint values are returned to browser/logs;
- existing synthetic regression remains intact;
- existing build/Vitest/Playwright/docs/license checks remain passing.

Do not commit any Bambu binary or proprietary fixture.

### 6. Local Product Owner retest path

If the spike is technically viable, provide a minimal documented local run path that assumes the Product Owner has installed the required official Bambu software/component through Bambu's normal distribution path.

The Product Owner retest must answer only:
1. Does the official component discover/enumerate A1 Mini and X2D automatically?
2. Can the dashboard receive useful read-only local status from each printer?
3. Does this work without Developer Mode, cloud impersonation or extracting Bambu Connect credentials?

Do not ask the Product Owner to supply secrets in GitHub/chat.

## Completion gate

After the spike, set this file back to HOLD and report exactly one technical disposition:

- **FEASIBLE FOR PRODUCT OWNER ARCHITECTURE REVIEW** — public user-installed Network Plugin boundary works for discovery/read-only monitoring. This does not authorize permanent dependency adoption.
- **NOT FEASIBLE — RECOMMEND M2 NO-GO / PROJECT TERMINATION** — public Bambu Connect/Network Plugin surfaces cannot provide the required monitoring path without prohibited techniques.

Update:
- `project-control/status/CURRENT_STATUS.md`
- `project-control/handoffs/CHATGPT_HANDOVER.md`
- M2 evidence/review records
- risk register if needed
- PR #3 description if stale
- index/reconcile DEC-018 into `DECISION_LOG.md` as mechanical project-control maintenance.

## PR / milestone authority

Continue only on existing branch `m2/real-device-readonly-prototype` / draft PR #3.

Do not merge PR #3. Do not begin M3. Do not make the proprietary Network Plugin a permanent dependency without a separate explicit Product Owner decision.