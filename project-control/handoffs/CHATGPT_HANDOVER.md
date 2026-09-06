# Bambu Printer Dashboard ChatGPT Handover

## Repository authority

GitHub is authoritative: `vivekshukla12/Bambulab_Dashboard`.

At the start of a new project/milestone chat, reconcile:
1. `project-control/status/CURRENT_STATUS.md`
2. `project-control/handoffs/CHATGPT_HANDOVER.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `project-control/specs/OPERATING_MODEL.md`
5. relevant milestone/spec files
6. `project-control/decisions/DECISION_LOG.md` plus current dedicated decision records
7. `project-control/risks/RISK_REGISTER.md`
8. actual branch/PR/merge/commit/CI state.

## Product/governance baseline

Bambu Printer Dashboard is an independent, open-source, local-first/read-only-first monitoring dashboard for compatible Bambu Lab printers. Product Owner controls scope, architecture, dependencies, security/privacy boundaries, milestone acceptance and merges. Repository license is MPL-2.0.

Completed:
- M0 merged: `bad179a0f847f9a478e2c167e62dd94760baa105`
- M1 merged: `42821596cc0bf80a302b12287063b3ee17f58f3a`

M1 UI modernization remains deferred.

## Current milestone

M2 — Real A1 Mini + X2D integration feasibility / GO-NO-GO.

**Current state: QUEUED for one bounded no-outreach Bambu Connect / user-installed Network Plugin feasibility spike.**

Draft PR #3 remains open/draft/unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked. Merge is not authorized.

Current authoritative decision:
- `project-control/decisions/DEC-018_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY.md`

Current feasibility review:
- `project-control/reviews/M2_BAMBU_CONNECT_NETWORK_PLUGIN_FEASIBILITY_2026-09-06.md`

Codex gate:
- `prompts/codex/NEXT_PROMPT.md` — QUEUED for the bounded feasibility spike only.

## Governance correction — 2026-09-06

The Product Owner reaffirmed that contacting Bambu Lab / pursuing developer-partner authorization is a no-go and noted that this had already been decided in DEC-011. The previous outreach-based DEC-017 continuation gate conflicted with that direction.

DEC-018 restores the no-outreach policy and supersedes DEC-017 to the extent it required vendor contact/partner authorization. `DECISION_LOG.md` still needs a mechanical index/status reconciliation in the next project-control maintenance commit; until then the dedicated DEC-018 record is authoritative for the current gate.

Do not contact Bambu Lab.

## Technical history

M2 has already tried:
- custom mDNS printer discovery — hands-on failure;
- custom SSDP discovery targeting `urn:bambulab-com:device:3dprinter:1` — automated/CI success, but Product Owner reports real automatic discovery still fails;
- manual local read-only MQTTS path — A1 Mini previously showed limited basic telemetry;
- X2D active-print connection — unresolved failure.

The Product Owner does not want further unsupported discovery/cloud reverse-engineering. If the final publicly supported no-contact integration surface cannot satisfy the product, recommend project termination.

## Public Bambu integration conclusion

### Bambu Connect

Bambu publicly documents Bambu Connect as the user-mediated path for authorization-controlled third-party operations via a URL Scheme. Treat it only as that documented handoff. It is not established as a general OAuth/token, printer enumeration or telemetry API.

Never scrape/extract Bambu Connect credentials/tokens/private IPC or use it to obtain private cloud authorization for this dashboard.

### Updated Network Plugin

Bambu publicly states that monitoring functions such as status/temperature/position/speed remain accessible and that unofficial software can explore integration using the updated Network Plugin.

Bambu Studio public source exposes a `NetworkAgent` wrapper boundary around the separately distributed plugin, including discovery/SSDP, local-connect/local-message, subscription and printer-connect functions.

The networking plugin is separately distributed and proprietary/non-free. Public research has not established a redistribution right compatible with bundling it into this MPL repository. Therefore the spike may use only an **official Bambu component already installed by the user** through Bambu's normal distribution path.

Do not copy Bambu Studio AGPL implementation code into this MPL repository. Any bridge must be independently implemented from public declarations/documented behavior.

### Cloud

Bambu states that Bambu Cloud is private infrastructure governed by its user agreement and that unofficial clients must not impersonate official Bambu clients. Direct reverse-engineered cloud login/API use remains prohibited.

## Spike boundaries

Allowed only for feasibility:
- detect a user-installed official Bambu networking component;
- use a public integration boundary if sufficient;
- test printer discovery/enumeration;
- test local connection;
- test read-only status/telemetry callbacks/subscriptions;
- normalize results through existing read-only architecture;
- A1 Mini + X2D only.

Prohibited:
- vendor outreach/partner authorization;
- Developer Mode;
- private/undocumented Bambu Cloud API use;
- official-client impersonation;
- credential/token/private-key extraction;
- private IPC/cloud traffic interception;
- bundling/downloading/redistributing/patching/reverse-engineering the proprietary plugin;
- copying AGPL implementation code;
- printer write/control, bind/unbind, printing, motion, calibration or camera initiation;
- security weakening/bypass.

This is not permanent approval of the Network Plugin as a product dependency. A successful spike returns to the Product Owner for an explicit architecture/dependency/licensing decision.

## Outcome gate

- If user-installed official Network Plugin + public boundary reliably provides A1 Mini and X2D discovery/read-only monitoring: return to HOLD for independent review and Product Owner architecture decision.
- If it cannot, and Bambu Connect does not expose a documented monitoring/discovery API: recommend M2 NO-GO and project termination rather than another workaround.

Never merge PR #3 without explicit Product Owner authorization and do not begin M3.