# Device Core Package

## Purpose

Owns server-side live device state, adapter subscription lifecycle, freshness reconciliation and persistence handoff.

## Responsibilities

- Start/stop read-only adapters.
- Maintain the current normalized device registry and state map.
- Remove a device from the live registry when an active runtime configuration is deleted without deleting normalized history.
- Fan out normalized events to API/SSE consumers.
- Persist device registry, current state and raw telemetry samples.

## Public Contracts

Exports `DeviceStateService` and event subscription types.

## Owned Data

Owns in-memory current device state. Durable state is delegated to `@bpd/persistence`.

## Events

Consumes adapter events and emits device-core state events to server subscribers.

## Invariants

- Server-owned state is authoritative for browser clients.
- Stale/offline/unavailable state remains explicit.
- Adapter-private payloads and credentials never reach the browser.

## Dependencies

Allowed: adapter API, domain, persistence, telemetry and observability.

## Extension Points

Future read-only adapters can be registered here after Product Owner authorization.

## Tests

Core behavior is covered through server integration and adapter tests.

## Forbidden Dependencies

No React, direct UI code, Bambu protocol implementation, write/control interface, camera/media code or browser storage.
