// SPDX-License-Identifier: MPL-2.0

import { afterEach, describe, expect, it } from "vitest";
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

describe("M1 Fastify API", () => {
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
});
