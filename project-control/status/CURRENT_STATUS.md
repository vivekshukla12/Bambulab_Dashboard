# Current Status

## Current milestone

M2 — Direct plugin-free local printer monitoring / supported-model gate

## State

**SCOPE RESET APPROVED — DIRECT-ONLY V1 CLEANUP QUEUED.**

On 10 October 2026 the Product Owner approved DEC-019 and replaced the prior Network Plugin production direction with a smaller V1: Docker-native, local-first, plugin-free, cloud-free and read-only.

The original full-scope PRD remains unchanged at `project-control/specs/PRODUCT_REQUIREMENTS.md`. The authoritative current V1 requirements are now `project-control/specs/V1_PRODUCT_REQUIREMENTS.md`.

PR #3 remains open, draft and unmerged on `m2/real-device-readonly-prototype`. M3 remains blocked until the M2 scope reset is implemented and validated.

## Current V1 architecture

Production V1 may use only:

`supported printer -> direct local encrypted read-only status -> normalized server/domain -> browser/history/integrations`

V1 explicitly excludes:

- Bambu Network Plugin;
- Bambu Studio runtime dependency;
- Bambu Connect;
- Bambu Cloud/private APIs;
- Developer Mode;
- Fleet Hub;
- paid vendor connectivity services;
- vendor outreach/partner authorization;
- printer write/control operations.

Manual printer onboarding is an approved normal workflow. SSDP discovery may remain only as best-effort convenience.

## Prior evidence retained

- M0 and M1 are complete/merged.
- Direct local A1 Mini monitoring previously produced live printer telemetry.
- The official Network Plugin spike proved that Bambu telemetry can be useful on A1 Mini/X2D, but under DEC-019 that spike is historical evidence only and is no longer a production architecture candidate.
- X2D still requires a clean **direct plugin-free** M2 retest before it can be claimed supported.
- Existing synthetic regression infrastructure remains required.

## Current M2 objective

1. Remove the Network Plugin bridge/package/runtime path from active V1 code/docs/tests while preserving historical decision/research records.
2. Keep and harden the direct local read-only MQTTS adapter.
3. Make manual onboarding first-class and sufficient.
4. Retain SSDP only as optional convenience.
5. Validate direct A1 Mini monitoring.
6. Retest X2D directly without Network Plugin/Bambu software.
7. Record supported/experimental/unsupported model status.
8. Validate stale/offline/reconnect and concurrent operation for the supported set.
9. Keep all credentials/private device evidence out of Git/CI.

If X2D cannot meet the direct-path support threshold, do not add another proprietary workaround. Return to the Product Owner to accept X2D as experimental/unsupported or stop/re-scope.

## Authority

- Current V1 requirements: `project-control/specs/V1_PRODUCT_REQUIREMENTS.md`
- Current decision: `project-control/decisions/DEC-019_SIMPLIFIED_PLUGIN_FREE_V1.md`
- Roadmap: `project-control/specs/MILESTONE_PLAN.md`
- Execution gate: `prompts/codex/NEXT_PROMPT.md` — QUEUED for direct-only V1 cleanup and M2 reset.

Do not merge PR #3 or begin M3 without explicit Product Owner approval.
