// SPDX-License-Identifier: MPL-2.0

import { afterEach, describe, expect, it } from "vitest";
import type { BambuMqttsStatusTransport, BambuStatusMessage, BambuTransportState } from "@bpd/adapter-bambu-readonly";
import { createTempDatabase, type TempDatabase } from "@bpd/test-support";
import { buildDashboardServer, type DashboardServer } from "./app.js";
import { loadServerConfig } from "./config.js";

let dashboard: DashboardServer | undefined;
let temp: TempDatabase | undefined;

afterEach(async () => {
  await dashboard?.close();
  await temp?.dispose();
  dashboard = undefined;
  temp = undefined;
});

describe("Fastify API", () => {
  it("returns synthetic devices and credential-free diagnostics", async () => {
    temp = await createTempDatabase();
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    });

    const devicesResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/devices" });
    expect(devicesResponse.statusCode).toBe(200);
    const devices = devicesResponse.json();
    expect(devices.data.devices).toHaveLength(2);
    expect(JSON.stringify(devices)).not.toMatch(/access.?code|password|secret|token/i);

    const healthResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/health" });
    expect(healthResponse.statusCode).toBe(200);
    const health = healthResponse.json();
    expect(health.data.database.foreignKeys).toBe(true);
    expect(health.data.simulator.devices).toBe(2);
    expect(health.data.discovery.targetHost).toBe("bambu-dashboard.local");
  });

  it("returns 404 for unknown devices without exposing implementation details", async () => {
    temp = await createTempDatabase();
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    });

    const response = await dashboard.server.inject({ method: "GET", url: "/api/v1/devices/not-real" });
    expect(response.statusCode).toBe(404);
    expect(response.json().data.error).toBe("Device not found");
  });

  it("accepts real-printer onboarding without returning credentials or private identifiers", async () => {
    temp = await createTempDatabase();
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    }, { realTransportFactory: () => new MockRealTransport() });

    const response = await dashboard.server.inject({
      method: "POST",
      url: "/api/v1/real-printers",
      payload: {
        displayName: "Product Owner A1 Mini",
        modelHint: "A1 Mini",
        host: "example-printer.local",
        serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
        accessCode: "SYNTHETIC_ACCESS_CODE"
      }
    });
    expect(response.statusCode).toBe(200);
    const serialized = response.body;
    expect(serialized).toContain("memory-only");
    expect(serialized).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(serialized).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
    expect(serialized).not.toContain("example-printer.local");

    const healthResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/health" });
    expect(healthResponse.statusCode).toBe(200);
    expect(healthResponse.body).toContain("bambu-readonly-m2");
    expect(healthResponse.body).not.toContain("SYNTHETIC_ACCESS_CODE");
  });
});

class MockRealTransport implements BambuMqttsStatusTransport {
  async start(): Promise<void> {}

  async stop(): Promise<void> {}

  onStatus(_listener: (message: BambuStatusMessage) => void): () => void {
    return () => undefined;
  }

  onState(_listener: (state: BambuTransportState) => void): () => void {
    return () => undefined;
  }

  onError(_listener: (error: Error) => void): () => void {
    return () => undefined;
  }
}
