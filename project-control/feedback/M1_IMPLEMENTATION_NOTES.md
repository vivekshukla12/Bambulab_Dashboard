# M1 Implementation Notes

Status: implemented on Draft PR #2 for technical-lead/Product Owner review.

Branch: `m1/synthetic-dashboard-prototype`

PR: `https://github.com/vivekshukla12/Bambulab_Dashboard/pull/2`

## Automated Validation

Executed on 2026-08-23 with Node.js `v24.14.0` and npm `11.13.0`.

| Command | Result | Notes |
|---|---|---|
| `npm install` | Passed | 235 packages installed; npm reported 0 vulnerabilities. |
| `npm run build` | Passed | TypeScript project references and Vite production bundle succeeded. |
| `npm run test` | Passed | 5 files, 9 Vitest tests. |
| `npm run docs:typedoc` | Passed | Generated HTML reference docs at `docs/generated/typedoc`. |
| `npm run licenses` | Passed | Wrote 274 external package records to `docs/development/dependency-licenses.json`. |
| `npm run validate` | Passed | Runs build, Vitest, TypeDoc and license inventory. |
| `npm run test:e2e` | Passed | 9 Playwright tests across desktop/tablet/mobile Chromium projects. |
| `npm run docker:build` | Blocked locally | `docker` is not installed/on PATH in this environment. |

## Hands-On Validation Evidence

1. Fresh local run path: implemented and exercised through `npm install`, `npm run dev:server`, `npm run dev:web -- --host 127.0.0.1` and Playwright against `http://127.0.0.1:5173`.
2. Docker Compose run path: `Dockerfile`, `docker-compose.yml`, `npm run docker:build` and `npm run docker:up` are present; execution is not locally validated because Docker is unavailable.
3. Fleet view displays two synthetic devices: `Workshop A1 Mini` and `Studio X2D`.
4. Capability sets visibly differ: `temperature.chamber` is unsupported on the A1 Mini-shaped fixture and supported on the X2D-shaped fixture.
5. Live synthetic printing telemetry reaches the UI through SSE and is validated by Playwright.
6. Stale state appears explicitly as `No fresh update within simulator freshness window`.
7. Unavailable state appears explicitly as `Synthetic printer connection unavailable`.
8. Reconnecting and recovered transitions are visible and validated.
9. SQLite-backed state survives restart in the persistence integration test; production-like local run uses `.data/dashboard.sqlite`.
10. Health diagnostics report server, database/storage, simulator, event pipeline and dashboard discovery state.
11. Desktop, tablet and mobile layouts are covered by Playwright viewports.
12. PWA service worker/offline shell behavior is validated on localhost as a browser-supported secure context; offline state is explicit and no queued writes exist.
13. TypeDoc generated output exists under `docs/generated/typedoc`, with public contract docs for domain, adapter API, contracts, persistence, device core, discovery, secrets, telemetry and observability.
14. Module README files and `docs/architecture/MODULE_MAP.md` provide scoped maintenance guidance.
15. Direct production-like run via `npm run build` + `npm start` returned HTTP 200 for `/`, `/api/v1/devices` and `/api/v1/health`. A process sample showed Node working sets of approximately 63.8 MB, 50.2 MB and 48.9 MB across the npm/server process tree.
16. Dependency-license report passed with no unresolved incompatible/unknown external dependency reported by the M1 checker.

## Known Limitations

- Docker/Compose build and run were not executable in this local environment because Docker is not installed.
- mDNS/local hostname advertisement is represented as a safe discovery descriptor with manual IP/port fallback; cross-platform advertisement is intentionally best-effort and not claimed as universally working in M1.
- The prototype contains only deterministic synthetic devices and synthetic secrets tests. It does not access real printers, real credentials, Bambu protocols, Developer Mode, Fleet Hub or cloud APIs.
