# Synthetic Adapter Package

## Purpose

Provides permanent deterministic synthetic devices and scenarios for M1 development, tests and future regression coverage.

## Responsibilities

- Provide A1 Mini-shaped and X2D-shaped synthetic devices.
- Implement the same read-only adapter contract intended for future real adapters.
- Emit deterministic connected, printing, stale, unavailable, reconnecting and recovered transitions.

## Public Contracts

Exports `SyntheticReadOnlyAdapter`, `createSyntheticAdapter` and synthetic fixture metadata.

## Owned Data

Owns only deterministic fixture definitions and in-memory scenario state.

## Events

Emits normalized read-only device state events through `@bpd/adapter-api`.

## Invariants

- Fixtures contain no real printer dumps, identifiers, credentials or private media.
- Capability differences are data-driven.
- No printer write/control method exists.

## Dependencies

Allowed: `@bpd/adapter-api` and `@bpd/domain`.

## Extension Points

Additional synthetic scenario steps can be added when later milestones need deterministic regression fixtures.

## Tests

Adapter contract tests live beside the adapter implementation.

## Forbidden Dependencies

No network access, real Bambu protocol code, SQLite, React, Fastify, secrets or camera/media code.
