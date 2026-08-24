# Observability Package

## Purpose

Provides structured redacting logging and small diagnostics helpers for the server-side M1 prototype.

## Responsibilities

- Generate stable request identifiers.
- Emit structured JSON logs.
- Redact credential-like fields before logging.

## Public Contracts

Exports `createLogger`, `createRequestId` and `redactSensitiveFields`.

## Owned Data

No durable data is owned here.

## Events

No runtime event bus is owned here; callers decide when to log.

## Invariants

- Authorization headers, Access Codes, tokens, keys and passwords are redacted.
- Logs remain JSON-serializable.

## Dependencies

Node.js standard APIs only.

## Extension Points

Future production logging sinks can wrap the same redaction contract.

## Tests

Redaction behavior is covered through server diagnostics and unit tests as needed.

## Forbidden Dependencies

No React, Fastify route ownership, SQLite, adapters, real printer protocols or secrets persistence.
