# Next Codex Task

## Status
QUEUED — Resume Draft PR #2 only to remediate technical-lead review findings. M2 and all new product scope remain blocked.

## Milestone
M1 — Architecture foundation + synthetic prototype + real-read feasibility design

## Objective
Update existing branch `m1/synthetic-dashboard-prototype` and Draft PR #2 so the committed repository is fully reproducible from a fresh checkout and the approved Docker/Compose deployment path is actually validated. Do not create a new PR unless technically unavoidable. Do not merge.

## Authoritative review finding
The technical-lead review identified a blocking reproducibility defect: the committed PR references a `packages/secrets` workspace from the root build, Dockerfile, generated TypeDoc output and implementation notes, but the PR does not contain the corresponding committed workspace source/package files. The reported successful local build therefore cannot yet be treated as reproducible from GitHub state alone.

Docker/Compose execution is also still unvalidated. Because the production packaging uses Node Alpine with the native `better-sqlite3` dependency, an actual Docker build/run is required before M1 acceptance.

## Required work

1. Verify and commit the complete `packages/secrets` workspace required by the approved M1 architecture, including its `package.json`, TypeScript configuration, source, tests and module README as applicable. Ensure every committed source file follows the MPL-2.0 source-file notice policy.

2. Verify there are no other local-only or untracked source/configuration files required for the build, tests, generated documentation, runtime or Docker packaging.

3. From a fresh/clean checkout of the updated branch, using only files committed to GitHub, run and record:
   - `npm ci`
   - `npm run validate`
   - `npm run test:e2e`

4. In a Docker-capable environment, run and record:
   - Docker/Compose build;
   - startup through Docker Compose;
   - successful dashboard load;
   - successful `GET /api/v1/devices`;
   - successful `GET /api/v1/health`;
   - SQLite persistence across container restart/recreation using the configured persistent volume.

5. If Docker validation exposes a packaging problem involving Node Alpine, `better-sqlite3`, native compilation/runtime libraries or another existing M1 dependency, fix it within the already approved architecture. If resolution would require changing the major approved stack or introducing a significant new infrastructure dependency, stop and report instead of improvising.

6. Update `project-control/feedback/M1_IMPLEMENTATION_NOTES.md` with:
   - fresh-checkout validation evidence;
   - Docker/Compose validation evidence;
   - any packaging change made;
   - any remaining limitation or risk.

7. Reconcile `project-control/status/CURRENT_STATUS.md` and `project-control/handoffs/CHATGPT_HANDOVER.md` only as needed to reflect the remediation state. When remediation is complete, set this file back to `HOLD — PR #2 remediation complete; awaiting technical-lead/Product Owner review`.

## Explicitly prohibited
Do not:
- start M2;
- access or discover real printers;
- use real LAN Access Codes or credentials;
- implement Bambu protocols/MQTT/cloud access, Developer Mode or Fleet Hub;
- add printer write/control functionality;
- add cameras/media, AMS integration, Home Assistant, Alexa, Google Home or Daisy work;
- change the approved major architecture without Product Owner approval;
- merge PR #2.

## Completion report
Push all fixes to the existing Draft PR #2 and report in the PR/repository state:
- new head commit SHA;
- exact files/fixes added or changed;
- results of `npm ci`, `npm run validate`, `npm run test:e2e`;
- Docker/Compose validation results including persistence test;
- remaining limitations/risks, if any.

Codex implementation completion is not M1 acceptance and is not merge authorization. The Product Owner retains final acceptance and merge authority.