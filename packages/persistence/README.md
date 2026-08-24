# Persistence Package

## Purpose

Owns SQLite/Kysely storage, explicit migrations and repository methods for M1 state.

## Responsibilities

- Open SQLite with foreign keys, WAL and busy timeout.
- Run immutable sequential migrations.
- Store device registry, capabilities, current states, raw telemetry and durable operational events.
- Keep raw telemetry separate from durable operational history.

## Public Contracts

Exports `DashboardDatabase`, migration utilities and persistence record types.

## Owned Data

Owns SQLite schema and data access. Domain/UI code must not depend on table details.

## Events

Receives normalized state updates from device core for persistence; does not emit live events.

## Invariants

- Migrations run from an empty database to current state.
- Foreign keys are enabled.
- Raw telemetry retention policy is represented separately from durable events.
- Secrets are not stored in normal persistence tables.

## Dependencies

Allowed: `better-sqlite3`, Kysely, domain and observability.

## Extension Points

Future repositories can be added behind explicit service methods instead of leaking raw SQL.

## Tests

Migration and restart persistence tests use temporary real SQLite databases.

## Forbidden Dependencies

No React, Fastify route handlers, adapter implementations, browser storage, real printer credentials or encryption-key recovery logic.
