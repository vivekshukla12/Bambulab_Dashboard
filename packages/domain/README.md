# Domain Package

## Purpose

Defines normalized read-only product concepts shared across server, adapters, persistence and contracts.

## Responsibilities

- Device identity and capability descriptors.
- Read-only freshness, quality and lifecycle vocabulary.
- Normalized current-state snapshots and adapter event shapes.

## Public Contracts

Exports TypeScript types and helper functions from `src/index.ts`.

## Owned Data

No persistence is owned here; this package owns only pure domain types and invariants.

## Events

Defines event shapes but does not emit or subscribe to runtime events.

## Invariants

- Stale, unavailable and degraded states are first-class and cannot be confused with live state.
- Capabilities are explicit: supported, unsupported or unknown.
- M1 read adapters expose readable data only.

## Dependencies

None.

## Extension Points

Future product concepts should enter here only when they are stable cross-module contracts.

## Tests

Domain helpers are exercised through adapter and contract tests.

## Forbidden Dependencies

No React, Fastify, SQLite, adapter implementation, secrets, filesystem or network dependencies.
