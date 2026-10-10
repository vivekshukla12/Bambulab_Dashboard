# Bambu Printer Dashboard

A local-first browser dashboard for monitoring and managing compatible Bambu Lab printers and related devices across a LAN.

> **Project status:** M0 and M1 are complete. V1 scope was simplified under DEC-019 on 10 October 2026. M2 is being reset to direct plugin-free local read-only printer monitoring on draft PR #3; merge is not authorized.

## Unofficial project / trademark notice

**Bambu Printer Dashboard is an independent, third-party open-source interoperability project. It is not affiliated with, sponsored by, authorized by, maintained by, certified by, or endorsed by Bambu Lab.**

Bambu Lab, its product and service names, printer/AMS model names, logos, trademarks, trade names, and other brand identifiers are the property of Bambu Lab and/or their respective rights holders. References in this project are used only to identify products and services with which the software is intended to interoperate or be compatible.

The project intends to respect applicable Bambu Lab terms, intellectual-property rights, authentication/access controls, API/interface requirements, and applicable law. Technical accessibility of an interface is **not** by itself authorization to use it. Features with material legal, contractual, security, trademark, or interface uncertainty must remain behind feasibility/review gates.

See [`TRADEMARKS.md`](TRADEMARKS.md) and [`NOTICE`](NOTICE) for the full project notice.

## Product intent

V1 targets simple local multi-device read-only monitoring, observed print/history visibility, passively reported AMS/filament state, maintenance, notifications, a normalized local API/Home Assistant integration, backup/restore, Docker portability, and a responsive/PWA-capable UI. V1 intentionally excludes Bambu proprietary runtime dependencies and printer control.

V1 is explicitly **not** a slicer, printer-control client, camera/media client, automatic printer/job scheduler, general automation/rules engine, Bambu Cloud/Connect/Network Plugin client, remote-access product, multi-user/RBAC system, native mobile app, or full analytics suite.

## Iterative development model

M0 establishes project governance. **Every major product milestone from M1 onward must deliver a runnable, testable prototype.** Each prototype is exercised through automated tests and hands-on validation, feedback is recorded and triaged, and that evidence is combined with the roadmap to shape the next authorized milestone.

See [`project-control/specs/ITERATIVE_DELIVERY_MODEL.md`](project-control/specs/ITERATIVE_DELIVERY_MODEL.md) and [`project-control/specs/MILESTONE_PLAN.md`](project-control/specs/MILESTONE_PLAN.md).

## Governance

GitHub is the authoritative project state. Read these files first when continuing work:

1. `project-control/handoffs/CHATGPT_HANDOVER.md`
2. `project-control/status/CURRENT_STATUS.md`
3. `prompts/codex/NEXT_PROMPT.md`
4. `prompts/codex/RESUME.md` when Codex work is authorized

Authoritative requirements and guardrails live under `project-control/specs/`. Prototype feedback is captured under `project-control/feedback/`.

## Prototype Run Path

Requirements:

- Node.js 24 LTS
- npm 11

Local development:

```bash
npm install
npm run dev:server
npm run dev:web -- --host 127.0.0.1
```

Open `http://127.0.0.1:5173`. The Vite web app proxies read-only REST/SSE traffic to the Fastify server on `http://127.0.0.1:3001`.

M2 real-printer onboarding uses the direct local read-only path. Manual IP/hostname plus the minimum required printer identity and LAN Access Code is an approved normal workflow. Server-side SSDP may remain as optional best-effort discovery, but discovery failure must never block manual onboarding.

The production V1 architecture does **not** require Bambu Studio, Bambu Connect, Bambu Network Plugin, Bambu Cloud, Developer Mode, Fleet Hub, paid vendor services, or vendor outreach. Real LAN Access Codes remain process-memory-only by default and must not enter Git, logs, browser storage, diagnostics, or public CI.

The normal Fleet view is real-printer focused and hides deterministic synthetic printer cards by default. Open `http://127.0.0.1:5173/?synthetic=1` when you need the explicit synthetic regression view.

Production-like local run:

```bash
npm run build
npm start
```

Open `http://127.0.0.1:3001`. SQLite data is stored under `.data/` by default and is intentionally ignored by Git.

Docker packaging:

```bash
npm run docker:build
npm run docker:up
```

The compose service mounts persistent application data outside the container in the `dashboard-data` volume.

Validation:

```bash
npm run validate
npm run test:e2e
```

M2 local-only real-device validation:

```bash
npm run m2:validate:real -- secrets/m2-printers.local.json
```

For local hands-on entry without writing a config file, run `npm run m2:validate:real -- --interactive`; serial and Access Code prompts are hidden. See `docs/development/M2_REAL_DEVICE_VALIDATION.md`. The `secrets/` directory is ignored by Git and must contain no committed material.

Current product requirements: `project-control/specs/V1_PRODUCT_REQUIREMENTS.md`. The original full-scope PRD remains preserved unchanged in `project-control/specs/PRODUCT_REQUIREMENTS.md`.

## Repository layout

```text
.github/
project-control/
  decisions/
  feedback/
  handoffs/
  risks/
  specs/
  status/
prompts/codex/
apps/
  server/
  web/
packages/
docs/
  architecture/
  development/
  generated/
src/
tests/
test-fixtures/synthetic/
```

## Licensing

Source code is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**. See [`LICENSE`](LICENSE).

New original source files must use the project's MPL-2.0 source-file notice policy documented in [`CONTRIBUTING.md`](CONTRIBUTING.md). Third-party license and provenance notices must be preserved.

The software license does not grant rights to Bambu Lab trademarks or to project-specific branding beyond what applicable law and the relevant rights holders permit. See [`TRADEMARKS.md`](TRADEMARKS.md).

## Contributions

Contributions are welcome as the project matures. Contribution scope remains milestone-controlled. See [`CONTRIBUTING.md`](CONTRIBUTING.md). Unless explicitly agreed otherwise, contributions are submitted under the repository's MPL-2.0 license and contributors retain copyright in their original contributions.

## Security

Security and privacy are architectural requirements. Do not submit credentials, tokens, live device secrets, private camera/media content, or production/customer-derived sensitive data. See [`SECURITY.md`](SECURITY.md).
