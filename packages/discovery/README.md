# Discovery Package

## Purpose

Captures the safe M1 dashboard-server local naming/discovery foundation without scanning for or touching real printers.

## Responsibilities

- Describe the target local dashboard name.
- Preserve manual IP/port diagnostics fallback.
- Report that cross-platform mDNS advertisement is best-effort and not required for M1 completion.

## Public Contracts

Exports `getDashboardDiscoveryDescriptor`.

## Owned Data

No persistent data is owned here.

## Events

None in M1.

## Invariants

- No browser-side LAN scanning.
- No printer discovery or access in M1.
- Manual fallback remains available.

## Dependencies

None.

## Extension Points

A later standard mDNS implementation can sit behind this descriptor after platform behavior is validated.

## Tests

Covered by health/diagnostics integration tests.

## Forbidden Dependencies

No Bambu protocol code, printer networking, credentials, React, Fastify route handlers or SQLite.
