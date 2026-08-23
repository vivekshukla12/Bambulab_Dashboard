// SPDX-License-Identifier: MPL-2.0

import { randomUUID } from "node:crypto";

/**
 * Stable structured logger used by the M1 server-side prototype.
 */
export interface Logger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
  child(fields: Record<string, unknown>): Logger;
}

/**
 * Generates a request identifier suitable for API envelopes and logs.
 */
export function createRequestId(): string {
  return randomUUID();
}

/**
 * Creates a JSON logger that redacts credential-like fields before writing.
 */
export function createLogger(scope: string, baseFields: Record<string, unknown> = {}): Logger {
  const emit = (level: "info" | "warn" | "error", message: string, fields: Record<string, unknown> = {}) => {
    const payload = redactSensitiveFields({
      level,
      scope,
      message,
      time: new Date().toISOString(),
      ...baseFields,
      ...fields
    });
    const serialized = JSON.stringify(payload);
    if (level === "error") {
      console.error(serialized);
    } else if (level === "warn") {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  };

  return {
    info: (message, fields) => emit("info", message, fields),
    warn: (message, fields) => emit("warn", message, fields),
    error: (message, fields) => emit("error", message, fields),
    child: (fields) => createLogger(scope, { ...baseFields, ...fields })
  };
}

/**
 * Redacts sensitive fields recursively while preserving diagnostic shape.
 */
export function redactSensitiveFields(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveFields);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (isSensitiveKey(key)) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = redactSensitiveFields(nested);
      }
    }
    return result;
  }

  return value;
}

function isSensitiveKey(key: string): boolean {
  return /(authorization|access.?code|password|secret|token|api.?key|private.?key|credential)/i.test(key);
}
