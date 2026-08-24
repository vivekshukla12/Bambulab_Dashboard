// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from "vitest";
import { redactSensitiveFields } from "./index.js";

describe("redactSensitiveFields", () => {
  it("redacts credential-like fields recursively", () => {
    expect(
      redactSensitiveFields({
        requestId: "safe",
        accessCode: "12345678",
        nested: {
          authorization: "Bearer secret-token",
          payload: "safe"
        }
      })
    ).toEqual({
      requestId: "safe",
      accessCode: "[REDACTED]",
      nested: {
        authorization: "[REDACTED]",
        payload: "safe"
      }
    });
  });
});
