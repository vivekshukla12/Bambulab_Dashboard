# M2 Discovery / Interface Research — 2026-08-30

## Trigger

Product Owner retest on 2026-08-30 found the Rescan flow still returned no usable printer candidates, blocking M2 testing. Product Owner asked for renewed research into whether automatic Bambu printer discovery is actually possible and whether the project should instead use the Bambu Network Plugin or Bambu Cloud account integration if legally/contractually acceptable.

## Verified repository fact

PR #3 currently implements printer discovery as server-side mDNS queries for `_bambu._tcp.local`, `_bblp._tcp.local`, and `_printer._tcp.local` via multicast `224.0.0.251:5353` in `packages/adapter-bambu-readonly/src/index.ts`.

The Product Owner's failed Rescan result therefore tests the current mDNS implementation, not all possible Bambu LAN discovery mechanisms.

## External research findings

### 1. Bambu LAN auto-discovery is technically possible

Bambu Studio itself uses LAN auto-discovery. Multiple issues in the official `bambulab/BambuStudio` repository describe printers appearing automatically on the same LAN and users falling back to manual IP entry when discovery fails across Linux, VLANs, Wi-Fi segmentation, or multicast restrictions.

Relevant public sources:
- https://github.com/bambulab/BambuStudio/issues/2426
- https://github.com/bambulab/BambuStudio/issues/9646
- https://github.com/bambulab/BambuStudio/issues/8328

Issue #9646 is particularly relevant: installing Avahi/mDNS did not find the printer, and the report points to SSDP rather than mDNS as the discovery mechanism.

### 2. Independent mature integrations use SSDP, not mDNS, for Bambu printer discovery

The `greghesp/ha-bambulab` Home Assistant integration registers SSDP discovery for service type:

`urn:bambulab-com:device:3dprinter:1`

Public evidence appears in its integration manifest/diagnostics and current configuration flow. It classifies the integration as `local_push` and uses SSDP as the discovery trigger.

Relevant sources:
- https://github.com/greghesp/ha-bambulab
- https://github.com/greghesp/ha-bambulab/blob/main/custom_components/bambu_lab/config_flow.py

Independent `open-bamboo-networking` research likewise documents Bambu LAN discovery as SSDP and describes continuous UDP discovery used to populate printer LAN endpoint information.

Relevant source:
- https://github.com/ClusterM/open-bamboo-networking

These independent sources are technical interoperability evidence, not authorization to copy implementation code. The project should implement SSDP independently using standard UDP/SSDP behavior and retain provenance notes.

### 3. Read-only monitoring remains an officially acknowledged third-party use case

Bambu Lab's authorization-control guidance explicitly states that printer status information such as MQTT status pushes remains unaffected by the authorization mechanism and cites Home Assistant-style monitoring as an example. This supports continued M2 evaluation of read-only monitoring without Developer Mode.

Official sources:
- https://blog.bambulab.com/firmware-update-introducing-new-authorization-control-system-2/
- https://blog.bambulab.com/updates-and-third-party-integration-with-bambu-connect/

### 4. X2D read-only monitoring is technically feasible in the ecosystem

`greghesp/ha-bambulab` added X2D support in release v2.2.22. An early X2D connection issue involved TLS certificate verification and was subsequently marked fixed/upcoming-release. This does not prove this project's implementation is correct, but it is evidence that X2D monitoring is not inherently impossible.

Relevant sources:
- https://github.com/greghesp/ha-bambulab/issues/1973
- https://github.com/greghesp/ha-bambulab/releases

The project's existing `local-printer-chain` trust profile remains the approved direction; TLS verification must not be disabled.

## Network Plugin assessment

Bambu Lab officially states that Bambu Studio normally communicates through its Network Plugin and has described Bambu Connect / the updated network plugin as the supported path for third-party slicer/control integration. However:

- the stock Network Plugin is proprietary/closed-source;
- this project's Node/Fastify server does not currently depend on its C/C++ ABI;
- bundling or redistributing the proprietary binary would create licensing/distribution questions that are not currently resolved;
- using the plugin is unnecessary merely to perform LAN printer discovery or consume read-only status;
- introducing it would be a material dependency/architecture decision requiring separate Product Owner approval and legal/licensing review.

Therefore the Network Plugin should **not** be added for the current M2 discovery remediation.

Official background:
- https://blog.bambulab.com/firmware-update-introducing-new-authorization-control-system-2/
- https://blog.bambulab.com/updates-and-third-party-integration-with-bambu-connect/
- https://blog.bambulab.com/agpl-compliance-of-bambu-studio/

## Bambu Cloud account assessment

Direct use of reverse-engineered Bambu Cloud login/API endpoints is **not approved** for this project.

Bambu Lab stated in May 2026 that its cloud is private infrastructure governed by its user agreement and specifically objected to unofficial clients presenting falsified/official-client identity metadata. The project already prohibits cloud-client impersonation under DEC-006/DEC-011.

No public, general-purpose Bambu Cloud API for this dashboard use case was identified in this research. Community projects demonstrate that cloud login can be made to work technically, but that is not equivalent to an authorized integration contract.

Official source:
- https://blog.bambulab.com/setting-the-record-straight-on-cloud-access-and-community/

If a future cloud dependency becomes necessary, the acceptable routes are an explicitly documented/public Bambu interface or a direct partnership/authorization path, subject to a new Product Owner decision.

## Recommended M2 remediation

1. Replace the current mDNS printer-discovery implementation with **server-side SSDP discovery** targeted to Bambu 3D-printer advertisements/service type, implemented independently with Node standard-library UDP where practical.
2. Support both automatic discovery and explicit Rescan.
3. Keep manual host/IP + required access metadata as the reliable fallback because SSDP is multicast/broadcast-domain dependent and can fail across VLANs, guest Wi-Fi, AP isolation, firewalls, containers, and networks that suppress multicast.
4. Do not require Bambu Cloud login, Bambu Connect, Developer Mode, or the proprietary Network Plugin for M2 discovery/read-only monitoring.
5. Retest A1 Mini and X2D after SSDP remediation.
6. If X2D still cannot establish the approved read-only monitoring path after correct discovery/TLS handling, record the sanitized technical boundary and return for Product Owner architecture/interface reassessment before considering Network Plugin or cloud integration.

## Governance disposition

- Automatic discovery: technically feasible; current mDNS implementation is the likely wrong mechanism.
- SSDP remediation: within existing DEC-015 server-side discovery architecture and does not itself require a new material architecture decision if implemented without a significant new dependency.
- Proprietary Network Plugin: **not authorized yet**; separate Product Owner architecture/licensing decision required before use.
- Direct unofficial Bambu Cloud login/API integration: **not authorized** under current project constraints.
- M2 detailed Product Owner testing remains blocked until discovery remediation is reviewed and retested.
