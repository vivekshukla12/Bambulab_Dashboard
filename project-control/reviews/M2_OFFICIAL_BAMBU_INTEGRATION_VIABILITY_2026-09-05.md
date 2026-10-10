# M2 Official Bambu Integration Viability Review — 2026-09-05

## Context

The Product Owner has determined that continued investment is justified only if Bambu Printer Dashboard can use a legally/contractually supported Bambu Lab integration path. Repeated local discovery remediation has not produced a satisfactory automatic-onboarding experience. The Product Owner is willing to use Bambu Cloud, Bambu Connect, Network Plugin, Farm Manager, or another Bambu-supported interface if that use is authorized and suitable for this product. If no supported path exists, the preferred disposition is to terminate the project rather than continue reverse-engineering around vendor controls.

## Official-source findings

### 1. Unofficial Bambu Cloud impersonation is not acceptable

Bambu Lab stated on 2026-05-07 that its cloud is private infrastructure governed by a user agreement and that unofficial software must not impersonate official Bambu clients to access that cloud.

Source:
- https://blog.bambulab.com/setting-the-record-straight-on-cloud-access-and-community/

Project consequence:
- do not implement reverse-engineered Bambu Studio/Handy/Connect cloud login;
- do not inject identity metadata to appear as an official Bambu client;
- do not use undocumented/private cloud APIs unless Bambu explicitly authorizes this project to do so.

### 2. Bambu explicitly offers a supported third-party / farm-management partnership route

Bambu Lab's third-party integration guidance states that farm-management software developers can work directly with Bambu Lab to implement proper authorization controls and gives `devpartner@bambulab.com` for partnership inquiries.

Source:
- https://blog.bambulab.com/updates-and-third-party-integration-with-bambu-connect/

The same guidance states that Bambu Connect and a new network plugin are intended to provide a secure interface for third-party printer control and monitoring.

Project consequence:
- a legitimate vendor-supported integration path exists in principle;
- access terms, API/interface scope, redistribution rights, authentication model, supported operating systems, pricing/fees, and suitability for an open-source MPL-2.0 dashboard remain unknown until Bambu provides project-specific documentation/authorization.

### 3. Bambu Farm Manager is an official local fleet product, but no public API contract was established by this review

Bambu Lab officially launched Bambu Farm Manager as a local-network fleet-management product with real-time monitoring and control. Public Bambu material confirms the product exists and is intended for multi-printer fleet operation.

Source:
- https://blog.bambulab.com/bambu-lab-introduces-local-fleet-control-with-bambu-farm-manager/

Community posts mention a server-side HTTP API, but this review did not find an official public API contract suitable for implementation. Therefore the dashboard must not depend on an undocumented Farm Manager API without Bambu authorization/documentation.

## Legal / contractual conclusion

This is not legal advice. Based on Bambu's current public statements:

- **Direct unofficial Bambu Cloud integration:** not an acceptable project path.
- **Bambu-supported partnership / authorization path:** explicitly available in principle and is the appropriate next viability test.
- **Bambu Connect / Network Plugin / Farm Manager integration:** potentially viable only under Bambu-supported terms and documented interfaces; not yet authorized for implementation in this repository.

## Product / architecture recommendation

Stop additional SSDP/mDNS/cloud reverse-engineering work now.

Change M2 from an implementation/test milestone to an **external integration viability gate**:

1. contact Bambu Lab through the official third-party developer/partnership channel;
2. describe this project as an independent, open-source, local-first read-only/multi-printer monitoring dashboard;
3. ask whether Bambu offers a documented supported interface for:
   - enumerating printers bound to the user's account or available on the LAN;
   - obtaining sanitized printer identity/model/capability metadata;
   - read-only telemetry/status monitoring;
   - local or cloud-backed multi-printer monitoring;
   - authentication suitable for a third-party application without impersonating Bambu clients;
   - open-source redistribution / MPL-2.0 compatibility;
   - expected licensing, commercial-use, fee, NDA, certificate/key, and platform requirements;
4. do not resume implementation until the interface and terms are reviewed and approved by the Product Owner;
5. if Bambu declines, does not provide a supported integration suitable for this product, or requires terms incompatible with the Product Owner's open-source/local-first goals, recommend project termination rather than continuing unsupported reverse engineering.

## Gate state

M2 implementation: **HOLD** pending official Bambu integration viability.

PR #3 remains draft and unmerged. M3 remains blocked.
