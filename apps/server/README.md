# Server App

## Purpose

Owns the read-only HTTP boundary for M1: Fastify REST snapshots, Server-Sent Events, diagnostics, static production hosting and lifecycle wiring.

## Responsibilities

- Start the dashboard service and synthetic adapter.
- Expose only versioned read-only API routes.
- Keep browser clients behind REST/SSE contracts.
- Serve the built web shell in production-like runs.
- Exclude secrets from logs, health responses and diagnostics.

## Public Contracts

- `GET /api/v1/devices`
- `GET /api/v1/devices/:id`
- `GET /api/v1/devices/:id/state`
- `GET /api/v1/events`
- `GET /api/v1/health`

## Owned Data

The server owns process runtime configuration only. Device state is owned by `@bpd/device-core`; persisted state is owned by `@bpd/persistence`.

## Events

Consumes normalized adapter events through device core and emits API DTO events over SSE.

## Invariants

- No write/control printer route exists in M1.
- Request identifiers are stable per request and appear in structured logs.
- Health diagnostics remain synthetic-safe and credential-free.

## Dependencies

Allowed: contracts, device core, persistence, synthetic adapter, discovery and observability.

## Extension Points

Future real read-only adapters can be wired into device core after M2 authorization. Future authenticated integration APIs must be separate from the read-only browser dashboard.

## Tests

Server integration tests live beside source files and use Fastify injection plus temporary SQLite databases.

## Forbidden Dependencies

The server app must not import React, browser-only code, real Bambu protocol implementations, printer credentials, camera/media code or write/control adapters.
