// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from "vitest";
import { redactSensitiveFields } from "./index.js";

describe("redactSensitiveFields", () => {
  it("redacts credential-like fields recursively", () => {
    expect(
      redactSensitiveFields({
        requestId: "safe",
        accessCode: "SYNTHETIC_ACCESS_CODE",
        serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
        ipAddress: "LOCAL_IP_FOR_TEST",
        nested: {
          authorization: "Bearer secret-token",
          payload: "safe"
        }
      })
    ).toEqual({
      requestId: "safe",
      accessCode: "[REDACTED]",
      serialNumber: "[REDACTED]",
      ipAddress: "[REDACTED]",
      nested: {
        authorization: "[REDACTED]",
        payload: "safe"
      }
    });
  });
});
