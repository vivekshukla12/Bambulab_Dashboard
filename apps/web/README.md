# Web App

## Purpose

Provides the React/Vite read-only dashboard shell for fleet, device views and minimum M2 real-printer onboarding.

## Responsibilities

- Render the synthetic fleet and minimal capability-driven device detail views.
- Provide a minimum real-printer setup form with server-side discovery candidate selection and manual fallback for local Product Owner validation.
- Consume only `@bpd/contracts` API/SSE DTOs.
- Present live, stale, unavailable, reconnecting and recovered states explicitly.
- Provide the PWA manifest, service worker registration and offline indication.
- Stay responsive across desktop, tablet and mobile.

## Public Contracts

The web app has no public package API. Its network contract is the versioned read-only REST/SSE API documented by `@bpd/contracts`.

## Owned Data

Only transient browser presentation state is owned here. No credentials or printer secrets are stored in browser storage; the LAN Access Code field is cleared after submit. Discovery candidates are sanitized DTOs; endpoint details remain server-side. Real Access Code entry through the browser form is limited to `localhost`/loopback on the server machine or HTTPS-served dashboards; remote LAN HTTP validation uses the local CLI config path instead.

## Events

Consumes `device.snapshot` and `device.state.changed` SSE events.

## Invariants

- No queued offline writes.
- No direct printer or vendor-protocol access.
- No model-name feature branching; capability rendering is data-driven.

## Dependencies

Allowed: React, React Router, Vite, lucide icons and `@bpd/contracts`.

## Extension Points

Later milestones can add widgets/presets and richer views while keeping capability rendering data-driven. UI modernization remains outside M2.

## Tests

Core browser journeys are covered by Playwright E2E tests in `tests/e2e`.

## Forbidden Dependencies

The web app must not import adapter implementations, persistence, server internals, printer protocols, secrets modules or Node-only APIs.
