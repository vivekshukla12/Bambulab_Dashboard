# Adapter API Package

## Purpose

Defines the normalized read-only adapter contract used by the M1 synthetic adapter and future separately authorized real adapters.

## Responsibilities

- Discovery, current-state and subscription interfaces.
- Adapter health/freshness surface.
- Adapter contract-test helpers.

## Public Contracts

Exports `ReadOnlyDeviceAdapter`, `AdapterEventListener`, `AdapterHealth` and validation helpers.

## Owned Data

No persistent data is owned here. Runtime adapters own their own connection/session state behind this boundary.

## Events

Adapters emit normalized read-only device events defined by `@bpd/domain`.

## Invariants

- No write/control methods are present.
- Vendor payloads and credentials must not cross this boundary.
- Adapters must degrade unsupported or unavailable capabilities explicitly.

## Dependencies

Allowed: `@bpd/domain`.

## Extension Points

Future real read-only adapters should implement this interface and reuse the contract tests.

## Tests

Shared adapter contract tests are exported for implementation packages to invoke.

## Forbidden Dependencies

No React, Fastify, SQLite, Bambu protocol implementation, camera/media implementation or secrets persistence.
