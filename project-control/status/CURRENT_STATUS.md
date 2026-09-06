# Current Status

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO

## State

**QUEUED — bounded no-outreach Bambu Connect / user-installed Network Plugin feasibility spike.**

On 2026-09-06 the Product Owner reaffirmed that contacting Bambu Lab / pursuing developer-partner authorization is a no-go. This restores the original DEC-011 no-outreach policy and supersedes the outreach portion of the 2026-09-05 viability gate.

Public-source review found a narrower supported route that does not require vendor contact:

- Bambu Connect is publicly documented as a user-mediated handoff for authorization-controlled third-party operations through its URL Scheme. It is **not** treated as a general OAuth/token, printer-enumeration or telemetry API.
- Bambu states that monitoring functions remain accessible and that unofficial software can explore integration using the updated Network Plugin.
- Bambu Studio public source exposes a NetworkAgent integration boundary around the separately distributed plugin, including discovery, SSDP callback, local-connect/local-message and subscription functions.
- Bambu also states that its cloud is private infrastructure; unofficial software must not impersonate official clients. Reverse-engineered Bambu Cloud access remains prohibited.

Authoritative current decision:
- `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`

Authoritative feasibility review:
- `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`

`DEC-018` supersedes conflicting DEC-017 language that required Bambu outreach. `DECISION_LOG.md` must be mechanically reconciled/indexed in the next project-control maintenance commit.

Executable gate:
- `prompts/codex/NEXT_PROMPT.md` — **QUEUED** for the bounded feasibility spike only.

M2 is not accepted. PR #3 remains draft/unmerged. M3 remains blocked.

## Verified M2 implementation / evidence to date

PR #3 contains:
- local standard-mode MQTTS read-only adapter;
- strict credential-bearing TLS and local certificate handling;
- normalization, freshness, reconnect and sparse-frame accumulation;
- server-side SSDP discovery targeting `urn:bambulab-com:device:3dprinter:1`;
- automatic discovery initiation + Rescan UI;
- manual host fallback;
- Edit/Reconfigure and Remove/Delete flows;
- real-printer-focused normal Fleet UX;
- explicit synthetic regression mode;
- mocked X2D startup lifecycle hardening.

Codex automated evidence on 2026-09-05 passed build/Vitest/TypeDoc/license validation, Playwright E2E, and PR-head GitHub Actions including Docker Compose validation. Product Owner hands-on testing nevertheless reports that automatic printer discovery still fails in the real environment.

Earlier A1 Mini testing established limited basic live telemetry feasibility. X2D connectivity while actively printing remains unresolved.

## Current authorized feasibility route

Codex may perform one narrow spike to determine whether the publicly supported Bambu integration boundary can satisfy M2 without outreach or prohibited techniques.

Allowed:
1. Treat Bambu Connect only as its documented user-mediated authorization/action handoff; no credential/token extraction.
2. Detect/use an **official Bambu Network Plugin already installed by the user** through an official Bambu software/distribution path, if its public integration boundary is sufficient.
3. Independently implement only the minimum bridge needed to test:
   - printer discovery/enumeration;
   - local printer connection;
   - read-only status/telemetry callbacks/subscriptions;
   - A1 Mini and X2D feasibility.
4. Use public Bambu Studio declarations and Bambu public documentation as interoperability references without copying AGPL implementation code into this MPL repository.
5. Keep the existing read-only domain normalization/security boundaries.

Not allowed:
- contacting Bambu Lab or pursuing partner authorization;
- Developer Mode;
- reverse-engineered Bambu Cloud login/API access;
- impersonating Bambu Studio/Handy/Connect or falsifying client identity;
- extracting Bambu Connect/Studio tokens, credentials, private keys or private IPC/cloud traffic;
- bundling, downloading, committing, redistributing, patching or reverse-engineering the proprietary Network Plugin;
- copying Bambu Studio AGPL implementation code into the MPL project;
- printer write/control operations, binding/unbinding, print initiation, motion, calibration or camera initiation;
- security weakening/bypass.

This spike is **not** permanent approval of a proprietary runtime dependency. If technically successful, return for Product Owner architecture/dependency/licensing review before permanent adoption.

## Outcome gate

- **Feasible:** user-installed official Network Plugin reliably enables discovery/local read-only monitoring for A1 Mini and X2D within the approved boundaries. Return to HOLD for independent review and Product Owner architecture decision.
- **Not feasible:** public Bambu Connect / Network Plugin surfaces do not provide sufficient reliable discovery/read-only monitoring without prohibited techniques. Recommend M2 NO-GO and project termination, consistent with Product Owner direction.

Do not begin M3 and do not merge PR #3 without explicit Product Owner authorization.