# Contracts Package

## Purpose

Defines versioned REST and SSE DTOs shared by the Fastify server and React browser client.

## Responsibilities

- API envelope and health DTOs.
- Device summary/detail/state DTOs.
- Sanitized real-printer discovery/onboarding DTOs.
- SSE event DTOs.
- Mappers from normalized domain objects to browser-safe contracts.

## Public Contracts

Exports API version constants, DTO interfaces and mapper functions from `src/index.ts`.

## Owned Data

No persistence is owned here. DTOs are transport contracts only.

## Events

Defines `device.snapshot` and `device.state.changed` SSE payloads consumed by the web app.

## Invariants

- Contracts are versioned under API `v1`.
- DTOs must never contain credentials, LAN Access Codes or adapter-private payloads.
- Real-printer discovery DTOs must not expose LAN hosts, serial numbers, Access Codes, TLS server identities or raw mDNS records.
- Read-only contracts do not expose printer control commands.

## Dependencies

Allowed: `@bpd/domain`.

## Extension Points

Future integration schemas should be added here only after their security boundary is approved.

## Tests

Contract mapper behavior is covered through server integration and adapter tests.

## Forbidden Dependencies

No React, Fastify, SQLite, adapter implementation, secrets or filesystem dependencies.
