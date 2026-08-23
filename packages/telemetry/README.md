# Telemetry Package

## Purpose

Provides pure helpers for freshness, fleet summary and raw telemetry retention policy.

## Responsibilities

- Derive high-level fleet counts from normalized state.
- Represent the approved 1-365 day raw telemetry retention range.
- Keep quality/freshness semantics consistent.

## Public Contracts

Exports retention and summary helpers from `src/index.ts`.

## Owned Data

No runtime state or persistence is owned here.

## Events

Consumes no live events; operates on supplied snapshots.

## Invariants

- Retention days are clamped/validated to 1 through 365.
- Stale and unavailable states are never summarized as live.

## Dependencies

Allowed: `@bpd/domain`.

## Extension Points

Later milestones can add aggregation helpers here when persistence repositories own the actual storage.

## Tests

Covered through device-core and persistence behavior in M1.

## Forbidden Dependencies

No React, Fastify, SQLite, adapter implementation, filesystem, network or secrets dependencies.
