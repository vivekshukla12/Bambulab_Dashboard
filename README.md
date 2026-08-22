# Bambu Printer Dashboard

A local-first browser dashboard for monitoring and managing compatible Bambu Lab printers and related devices across a LAN.

> **Project status:** M0 — repository and governance foundation. Product feature implementation is not yet authorized.

## Unofficial project / trademark notice

**Bambu Printer Dashboard is an independent, third-party open-source interoperability project. It is not affiliated with, sponsored by, authorized by, maintained by, certified by, or endorsed by Bambu Lab.**

Bambu Lab, its product and service names, printer/AMS model names, logos, trademarks, trade names, and other brand identifiers are the property of Bambu Lab and/or their respective rights holders. References in this project are used only to identify products and services with which the software is intended to interoperate or be compatible.

The project intends to respect applicable Bambu Lab terms, intellectual-property rights, authentication/access controls, API/interface requirements, and applicable law. Technical accessibility of an interface is **not** by itself authorization to use it. Features with material legal, contractual, security, trademark, or interface uncertainty must remain behind feasibility/review gates.

See [`TRADEMARKS.md`](TRADEMARKS.md) and [`NOTICE`](NOTICE) for the full project notice.

## Product intent

V1 targets multi-device monitoring, print/job visibility, AMS and filament state, camera/media access where supported, maintenance, notifications, audit/history, a secure local API/event layer, backup/restore/update controls, and an installable PWA.

V1 is explicitly **not** a slicer, automatic printer/job scheduler, general automation/rules engine, remote-access product, multi-user/RBAC system, native mobile app, or full analytics suite.

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
src/
tests/
test-fixtures/synthetic/
```

## Licensing

Source code is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**. See [`LICENSE`](LICENSE).

The software license does not grant rights to Bambu Lab trademarks or to project-specific branding beyond what applicable law and the relevant rights holders permit. See [`TRADEMARKS.md`](TRADEMARKS.md).

## Contributions

Contributions are welcome as the project matures. Contribution scope remains milestone-controlled. See [`CONTRIBUTING.md`](CONTRIBUTING.md). Unless explicitly agreed otherwise, contributions are submitted under the repository's MPL-2.0 license and contributors retain copyright in their original contributions.

## Security

Security and privacy are architectural requirements. Do not submit credentials, tokens, live device secrets, private camera/media content, or production/customer-derived sensitive data. See [`SECURITY.md`](SECURITY.md).
