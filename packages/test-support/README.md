# Test Support Package

## Purpose

Provides deterministic test helpers shared by package and server tests.

## Responsibilities

- Create temporary SQLite database paths.
- Dispose temporary files after tests.
- Keep tests synthetic by default.

## Public Contracts

Exports temporary database helper functions from `src/index.ts`.

## Owned Data

Temporary test files only.

## Events

None.

## Invariants

- Helpers never use real printer data or credentials.
- Temporary data is isolated per test.

## Dependencies

Allowed: Node.js filesystem/path APIs and persistence types.

## Extension Points

Additional deterministic fixture helpers can be added as test scenarios grow.

## Tests

Used by persistence and server integration tests.

## Forbidden Dependencies

No React, Fastify ownership, real printer protocols, network discovery, secrets or production data.
