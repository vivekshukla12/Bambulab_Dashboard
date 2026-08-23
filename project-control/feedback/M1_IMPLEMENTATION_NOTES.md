# M1 Implementation Notes

Status: remediation complete on Draft PR #2 for technical-lead/Product Owner review.

Branch: `m1/synthetic-dashboard-prototype`

PR: `https://github.com/vivekshukla12/Bambulab_Dashboard/pull/2`

Validation head for remediation code/workflow changes: `6b23e850ebb88ae4f1b689bef9165f5759737c9f`

## Remediation Evidence

Executed on 2026-08-23 to resolve the technical-lead reproducibility finding.

- Scoped `.gitignore` local secret ignores to `/secrets/` and `/credentials/` so `packages/secrets` can be committed while root-level credential folders remain ignored.
- Committed the complete `packages/secrets` workspace: `package.json`, `tsconfig.json`, module README, source and synthetic tests.
- Added `npm run docker:validate` and the `M1 validation` GitHub Actions workflow so Docker/Compose validation runs in a Docker-capable environment.
- Hardened the Playwright status-message assertion because the same synthetic status can validly appear on more than one device card.
- Verified no other untracked or ignored source/configuration files were required. The only additional ignored runtime files found locally were SQLite files under `apps/server/.data/`.

Fresh checkout from GitHub branch `m1/synthetic-dashboard-prototype` after the remediation code/workflow changes:

| Command | Result | Notes |
|---|---|---|
| `npm ci` | Passed | Clean clone at `C:\Users\vivek\AppData\Local\Temp\bpd-m1-clean-20260823210123`; 235 packages installed; npm reported 0 vulnerabilities. |
| `npm run validate` | Passed | Build, 5 Vitest files / 9 tests, TypeDoc generation and dependency-license inventory all completed. |
| `npm run test:e2e` | Passed | 9 Playwright tests across desktop/tablet/mobile Chromium projects. |

GitHub Actions final branch-head validation:

| Run / job | Result | Evidence |
|---|---|---|
| Push run `32660053417` - Fresh checkout validation | Passed | `npm ci`, `npm run validate`, Chromium install and `npm run test:e2e` succeeded on Ubuntu 24.04 with Node.js `v24.19.0` and npm `11.17.0`. |
| Push run `32660053417` - Docker Compose validation, job `97244708520` | Passed | Docker built `bambu-printer-dashboard:m1` from Node `24-alpine`, started Compose, loaded the dashboard, verified API/health endpoints and validated persistent SQLite state across restart and container recreation. |
| Pull-request run `32660056076` | Passed | Both workflow jobs completed successfully for Draft PR #2 at the same head SHA. |

Docker/Compose validation details from job `97244708520`:

| Check | Result |
|---|---|
| Docker/Compose build | Passed; image `sha256:7dea7106f107200cf02c62ac043dc8b4ef1482ec743de1435392d99ee90aa915` named `bambu-printer-dashboard:m1`. |
| Compose startup | Passed; service reached `http://127.0.0.1:3001`. |
| Dashboard load | Passed; `/` returned HTTP 200. |
| `GET /api/v1/devices` | Passed; returned `synthetic-x2d` and `synthetic-a1-mini`. |
| `GET /api/v1/health` | Passed; database status `ok`, SQLite journal mode `wal`, foreign keys `true`. |
| Persistence across restart | Passed; persisted counts moved from devices `2`, current states `2`, raw telemetry `6`, operational events `6` before restart to `2`, `2`, `12`, `12` after restart. |
| Persistence across container recreation | Passed; after `docker compose up -d --force-recreate dashboard`, counts were devices `2`, current states `2`, raw telemetry `18`, operational events `18` using the same named volume. |

Packaging changes made during remediation:

- No Dockerfile or Compose topology change was required.
- Added `scripts/validate-docker-compose.mjs` as a repeatable Docker validation harness.
- Added `.github/workflows/m1-validation.yml` to run clean-checkout and Docker validation on the PR branch.

Remaining observations:

- This Windows workstation still has no local Docker executable; Docker/Compose evidence was produced by GitHub Actions on Ubuntu 24.04.
- npm emitted non-blocking warnings in Docker about `prebuild-install` deprecation and npm 11 allow-scripts review for `better-sqlite3`/`esbuild`; the build, runtime startup and persistence validation all passed.

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
