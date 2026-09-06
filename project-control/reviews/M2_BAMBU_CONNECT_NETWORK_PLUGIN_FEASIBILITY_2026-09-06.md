# M2 Bambu Connect / Network Plugin Feasibility Review — 2026-09-06

## Product Owner direction

The Product Owner reaffirmed the existing no-outreach policy: do not contact Bambu Lab and do not pursue developer-partner authorization. The Product Owner is willing to use Bambu Connect for authorization if it is a publicly supported and legally/contractually defensible route, and had previously indicated openness to the Bambu Network Plugin if it can be used within approved boundaries.

## Public-source findings

### Bambu Connect

Bambu Lab publicly documents Bambu Connect as the supported user-mediated path for authorization-controlled third-party operations. Bambu states that restricted functions can be invoked through the Bambu Connect URL Scheme and that third-party slicers can continue integration through Bambu Connect.

This supports treating Bambu Connect as a user-mediated handoff for the functions its documented URL scheme exposes. It does **not** establish Bambu Connect as a general OAuth/token broker, printer-enumeration API, telemetry API, or permission to extract/reuse Bambu Connect credentials, tokens, private IPC, or cloud traffic.

### Updated Network Plugin

Bambu Lab publicly states that monitoring functions such as printer status, temperature, position and speed remain accessible and that unofficial software can explore integration using the updated network plug-in library. Bambu also describes the new network plugin as providing a secure interface for printer control and monitoring.

Bambu Studio's public AGPL source exposes a `NetworkAgent` integration boundary around the separately distributed network plugin, including public wrapper functions/callbacks for SSDP messages, discovery, local connection, local messages, subscriptions and printer connection. These public source declarations are evidence of an intended integration boundary; they do not license copying of Bambu Studio implementation code or redistribution of the proprietary plugin.

### Cloud boundary

Bambu Lab states that Bambu Cloud is private infrastructure governed by its user agreement and that unofficial software must not impersonate official Bambu clients. Therefore this project must not implement reverse-engineered Bambu Cloud login/API access, falsify official-client identity, extract Bambu Connect/Studio cloud credentials, or otherwise use Bambu Connect as a route to impersonate an official cloud client.

### Licensing / redistribution boundary

Bambu Lab describes its networking plugin as an independent closed-source component distributed separately from Bambu Studio. Public material reviewed for this decision does not establish a redistribution license that would allow this MPL-2.0 project to bundle the plugin.

Therefore the only approved feasibility posture is to rely on a **user-installed official Bambu networking component**, detected/used at runtime if a documented public integration boundary is sufficient. The repository must not include, redistribute, download, patch, reverse engineer, or copy the proprietary plugin binary.

## Feasibility recommendation

Authorize one bounded M2 feasibility spike using the public, no-outreach path:

1. Preserve DEC-011: no Bambu outreach and no Developer Mode.
2. Treat Bambu Connect only as a documented user-mediated authorization/action handoff; do not extract tokens or private credentials from it.
3. Evaluate whether a user-installed official Bambu Network Plugin can provide reliable printer discovery and read-only local monitoring through the public integration boundary exposed/documented by Bambu Studio and Bambu's public guidance.
4. Limit the spike to discovery, local connection and read-only status/telemetry callbacks needed for A1 Mini and X2D feasibility.
5. Do not invoke restricted write/control APIs, cloud-login APIs, bind/unbind, print initiation, motion, calibration, camera initiation or arbitrary command passthrough.
6. Do not copy Bambu Studio AGPL implementation code into this MPL repository. Implement any bridge independently from documented/public declarations and behavior.
7. Do not bundle or redistribute Bambu's proprietary Network Plugin. If runtime use requires an official component, it must already be installed by the user through Bambu's official software/distribution path.
8. Stop if the public interface is insufficient without binary reverse engineering, private cloud APIs, client impersonation, security weakening or prohibited credential extraction.

This is a feasibility spike only, not permanent approval of a proprietary runtime dependency. If successful, return for Product Owner architecture/dependency/licensing review before making the Network Plugin a supported product dependency.

If the spike cannot establish reliable A1 Mini and X2D discovery/read-only monitoring within these constraints, Bambu Connect alone does not currently provide a documented general-purpose monitoring/discovery API. Under the Product Owner's viability direction, recommend M2 NO-GO and project termination rather than further workaround development.

## Public references reviewed

- Bambu Lab, “Firmware Update Introducing New Authorization Control System,” 2025-01-16/updated 2025-01-20.
- Bambu Lab, “Updates and Third-Party Integration with Bambu Connect,” 2025-01-20.
- Bambu Lab, “Setting the record straight on Cloud Access and Community,” 2026-05-07.
- Bambu Lab, “AGPL compliance of Bambu Studio,” 2022-12-02.
- BambuStudio public source, `src/slic3r/Utils/NetworkAgent.hpp`, reviewed 2026-09-06.

## Legal note

This is a technical/licensing risk assessment from public materials, not legal advice. The public Bambu statements support third-party use of Bambu Connect and exploration of the updated Network Plugin within documented boundaries, but they do not establish a right to redistribute the proprietary plugin or use undocumented/private Bambu Cloud interfaces.

## Executed spike outcome — 2026-09-06

**Technical disposition: FEASIBLE FOR PRODUCT OWNER ARCHITECTURE REVIEW.**

The public Bambu Studio declarations were sufficient to independently implement a small Windows ABI helper without copying Bambu Studio implementation code. The helper successfully loaded the locally installed official Network Plugin after validating Authenticode on both the plugin and Bambu Studio executable, requiring the signer certificates to match, checking release-mode compatibility and pinning ABI prefix `02.08.02`.

The committed bridge resolves only:

- version/release compatibility and agent lifecycle;
- config/certificate/country initialization;
- SSDP/discovery callback and bounded discovery start/stop;
- local connect/disconnect callback;
- local read-only message callback;
- printer local connect/disconnect.

It does not resolve or expose cloud login, arbitrary send-message, subscription-send, bind/unbind, install-certificate, print, motion, calibration, camera, file-transfer or other write/control entry points. The plugin remains a user-installed runtime asset and is absent from the repository/build artifacts.

Local evidence:

- official Bambu Studio version `02.08.02.61` found;
- user-installed official Network Plugin version `02.08.02.54` found;
- both signatures valid with matching signer certificates;
- required allowed ABI symbols present;
- native helper build and sanitized probe passed;
- one bounded discovery run returned zero candidates while Bambu Studio was concurrently running and owned the plugin's discovery/listener ports.

The concurrent zero-candidate run is not sufficient to classify real discovery as failed. The Product Owner must exit Bambu Studio and perform the documented standalone A1 Mini/X2D retest. Real device discovery, useful read-only callbacks and the X2D active-print case remain unproven, so this disposition is not M2 GO/acceptance and does not authorize permanent adoption.

Automated mocks prove component-absence failure, private/public endpoint filtering, candidate sanitization and deduplication, server-side serial/host resolution, callback normalization through the existing adapter, credential/browser redaction, no write/control export and synthetic/browser regressions.

GitHub Actions run `34022565310` passed Fresh checkout validation (including browser E2E) and Docker Compose validation for implementation commit `0c0e5d5a17bdcfd16082d82efc1129497c769a3e`.

Before permanent adoption, Product Owner review is required for the proprietary dependency, no-redistribution constraint, Windows-only spike scope, ABI/version maintenance, Bambu Studio coexistence and Docker/public-CI limitations. A failed clean A1 Mini/X2D retest should produce an M2 NO-GO / project termination recommendation, not another workaround.

Public declarations used:

- `https://github.com/bambulab/BambuStudio/blob/master/src/slic3r/Utils/NetworkAgent.hpp`
- `https://github.com/bambulab/BambuStudio/blob/master/src/slic3r/Utils/bambu_networking.hpp`
- `https://github.com/bambulab/BambuStudio/blob/master/src/slic3r/Utils/NetworkAgent.cpp`
