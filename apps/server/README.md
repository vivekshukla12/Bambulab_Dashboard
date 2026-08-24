# Server App

## Purpose

Owns the read-only HTTP boundary: Fastify REST snapshots, Server-Sent Events, diagnostics, static production hosting, synthetic lifecycle wiring and M2 real-printer onboarding.

## Responsibilities

- Start the dashboard service and synthetic adapter.
- Start the M2 Bambu read-only adapter with no real printers configured until local onboarding occurs.
- Expose only versioned read-only API routes.
- Accept process-memory-only real-printer connection details through the server-side onboarding route.
- Keep browser clients behind REST/SSE contracts.
- Serve the built web shell in production-like runs.
- Exclude secrets from logs, health responses and diagnostics.

## Public Contracts

- `GET /api/v1/devices`
- `GET /api/v1/devices/:id`
- `GET /api/v1/devices/:id/state`
- `GET /api/v1/real-printers`
- `POST /api/v1/real-printers`
- `GET /api/v1/events`
- `GET /api/v1/health`

## Owned Data

The server owns process runtime configuration only, including memory-only M2 real-printer Access Codes. Device state is owned by `@bpd/device-core`; persisted state is owned by `@bpd/persistence`.

## Events

Consumes normalized adapter events through device core and emits API DTO events over SSE.

## Invariants

- No write/control printer route exists.
- Real-printer onboarding never returns host, serial number, Access Code or raw status payloads.
- Request identifiers are stable per request and appear in structured logs.
- Health diagnostics remain synthetic-safe and credential-free.

## Dependencies

Allowed: contracts, device core, persistence, synthetic adapter, Bambu read-only adapter, discovery and observability.

## Extension Points

Future real read-only adapter fields can be normalized after M2 evidence. Future authenticated integration APIs must be separate from the read-only browser dashboard.

## Tests

Server integration tests live beside source files and use Fastify injection plus temporary SQLite databases.

## Forbidden Dependencies

The server app must not import React, browser-only code, camera/media code or write/control adapters. Bambu transport implementation remains isolated in `@bpd/adapter-bambu-readonly`.
