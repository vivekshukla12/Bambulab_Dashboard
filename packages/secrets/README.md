# Secrets Package

## Purpose

Defines the dedicated secret-store boundary and synthetic-safe encrypted-at-rest direction for remembered printer credentials in later milestones.

## Responsibilities

- Provide a minimal get/set/delete/list contract.
- Keep encryption implementation details out of domain, UI and normal persistence.
- Support synthetic-only tests without real Access Codes.

## Public Contracts

Exports `SecretStore`, `InMemorySecretStore` and `EncryptedFileSecretStore`.

## Owned Data

Secret values belong only behind this boundary. M1 tests use synthetic values.

## Events

None in M1.

## Invariants

- Secret values are never logged by this package.
- File-backed storage encrypts values before writing them.
- Machine-independent disaster-recovery key design is not claimed in M1.

## Dependencies

Node.js standard cryptography and filesystem APIs only.

## Extension Points

Future secret providers can implement `SecretStore` after security review.

## Tests

Synthetic secret persistence tests validate set/get/delete behavior without real credentials.

## Forbidden Dependencies

No React, Fastify, normal API response DTOs, browser storage, real Access Codes or backup key-recovery implementation.
