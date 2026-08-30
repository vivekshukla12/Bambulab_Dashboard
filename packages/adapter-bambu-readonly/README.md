# Bambu Read-Only Adapter Package

## Purpose

Owns the M2 real Bambu read-only adapter boundary for the approved standard-mode local MQTTS status path.

## Responsibilities

- Connect to locally configured printers through MQTTS without disabling TLS validation.
- Attempt bounded server-side mDNS discovery for sanitized onboarding candidates.
- Subscribe only to printer-originated status report topics.
- Parse and normalize observed status fields into `@bpd/domain` types.
- Accumulate partial printer-originated report frames into one in-memory live snapshot so sparse updates do not flicker already observed capabilities back to unknown.
- Represent missing data through capability support states instead of fabricated defaults.
- Track connection, stale, unavailable and bounded reconnect semantics.
- Reconfigure or forget process-memory printer sessions while stopping old transports before replacement/removal.
- Preserve already observed active-print telemetry if status arrives during connection startup before the transport reports fully connected.
- Keep LAN Access Codes, serial numbers, hostnames/IPs and raw payloads inside the adapter boundary.

## Public Contracts

Exports `BambuReadonlyAdapter`, `createBambuReadonlyAdapter`, `discoverBambuPrinters`, parser/normalizer helpers and transport/discovery/configuration interfaces for mocked offline tests.

## Owned Data

Owns only process-memory runtime connection configuration and current normalized snapshots. Real LAN Access Codes are never persisted by this package.

## Events

Emits normalized read-only device events through the `@bpd/adapter-api` contract.

## Invariants

- No printer write/control method or arbitrary command passthrough exists.
- The production transport never publishes MQTT messages.
- TLS certificate validation remains enabled; callers may provide a local CA certificate path when needed.
- The M2 `local-printer-chain` TLS profile may derive a local issuer and certificate identity from the printer before credentials are sent, then uses that profile for the credential-bearing connection with certificate validation still enabled.
- Health and configured-printer summaries are credential-free and do not expose host/IP, serial, Access Code, TLS identity or raw payload values.
- Reconfiguration may reuse private process-memory fields when omitted; supplying a new Access Code replaces the old in-memory credential without returning either value.

## Dependencies

Allowed: Node.js standard library, `@bpd/adapter-api` and `@bpd/domain`.

## Extension Points

Additional observed fields may be normalized after real-device evidence proves reliability. Unsupported/model-specific fields must remain capability-driven.

## Tests

Adapter contract, parser/normalizer, stale/reconnect and redaction tests live beside the implementation and use mocked transports plus project-authored fixture payloads. Server tests mock discovery to cover sanitized candidate onboarding.

## Forbidden Dependencies

No React, Fastify, SQLite, browser storage, secrets persistence, printer write/control adapters, Bambu cloud-client impersonation, Developer Mode, Fleet Hub, proprietary network-plugin code or disabled TLS validation.
