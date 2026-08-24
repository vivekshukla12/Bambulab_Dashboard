// SPDX-License-Identifier: MPL-2.0

import { afterEach, describe, expect, it } from "vitest";
import type {
  BambuDiscoveredPrinterCandidate,
  BambuMqttsStatusTransport,
  BambuMqttsTransportConfig,
  BambuStatusMessage,
  BambuTransportState
} from "@bpd/adapter-bambu-readonly";
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
    const transportConfigs: BambuMqttsTransportConfig[] = [];
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    }, { realTransportFactory: (config) => {
      transportConfigs.push(config);
      return new MockRealTransport();
    } });

    const response = await dashboard.server.inject({
      method: "POST",
      url: "/api/v1/real-printers",
      payload: {
        displayName: "Product Owner A1 Mini",
        modelHint: "A1 Mini",
        host: "example-printer.local",
        serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
        accessCode: "SYNTHETIC_ACCESS_CODE",
        tlsTrustProfile: "local-printer-chain",
        tlsServerName: "SYNTHETIC_TLS_SERVER_NAME"
      }
    });
    expect(response.statusCode).toBe(200);
    expect(transportConfigs[0]?.tlsTrustProfile).toBe("local-printer-chain");
    expect(transportConfigs[0]?.tlsServerName).toBe("SYNTHETIC_TLS_SERVER_NAME");
    const serialized = response.body;
    expect(serialized).toContain("memory-only");
    expect(serialized).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(serialized).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
    expect(serialized).not.toContain("example-printer.local");
    expect(serialized).not.toContain("SYNTHETIC_TLS_SERVER_NAME");

    const healthResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/health" });
    expect(healthResponse.statusCode).toBe(200);
    expect(healthResponse.body).toContain("bambu-readonly-m2");
    expect(healthResponse.body).not.toContain("SYNTHETIC_ACCESS_CODE");
  });

  it("rejects invalid TLS trust profiles before configuring the real adapter", async () => {
    temp = await createTempDatabase();
    const transportConfigs: BambuMqttsTransportConfig[] = [];
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    }, { realTransportFactory: (config) => {
      transportConfigs.push(config);
      return new MockRealTransport();
    } });

    const response = await dashboard.server.inject({
      method: "POST",
      url: "/api/v1/real-printers",
      payload: {
        displayName: "Product Owner A1 Mini",
        modelHint: "A1 Mini",
        host: "example-printer.local",
        serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
        accessCode: "SYNTHETIC_ACCESS_CODE",
        tlsTrustProfile: "disabled"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain("Invalid real-printer TLS trust profile.");
    expect(response.body).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(response.body).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
    expect(transportConfigs).toHaveLength(0);
  });

  it("discovers sanitized real-printer candidates and resolves selected endpoints server-side", async () => {
    temp = await createTempDatabase();
    const transportConfigs: BambuMqttsTransportConfig[] = [];
    dashboard = await buildDashboardServer(
      {
        ...loadServerConfig({}),
        databasePath: temp.databasePath,
        syntheticIntervalMs: 1000
      },
      {
        realPrinterDiscovery: async () => [
          {
            id: "bambu-mdns-synthetic",
            displayName: "Product Owner A1 Mini",
            modelHint: "A1 Mini",
            host: "private-printer.local",
            port: 8883,
            source: "mdns",
            discoveredAt: "2026-08-24T20:00:00.000Z",
            endpointHint: "_bambu._tcp.local candidate on port 8883",
            requiresAccessCode: true
          } satisfies BambuDiscoveredPrinterCandidate
        ],
        realTransportFactory: (config) => {
          transportConfigs.push(config);
          return new MockRealTransport();
        }
      }
    );

    const candidatesResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/real-printer-candidates" });
    expect(candidatesResponse.statusCode).toBe(200);
    expect(candidatesResponse.body).toContain("bambu-mdns-synthetic");
    expect(candidatesResponse.body).toContain("Product Owner A1 Mini");
    expect(candidatesResponse.body).not.toContain("private-printer.local");
    expect(candidatesResponse.body).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(candidatesResponse.body).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");

    const connectResponse = await dashboard.server.inject({
      method: "POST",
      url: "/api/v1/real-printers",
      payload: {
        candidateId: "bambu-mdns-synthetic",
        displayName: "Product Owner A1 Mini",
        modelHint: "A1 Mini",
        serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
        accessCode: "SYNTHETIC_ACCESS_CODE"
      }
    });

    expect(connectResponse.statusCode).toBe(200);
    expect(transportConfigs[0]?.host).toBe("private-printer.local");
    expect(connectResponse.body).toContain("memory-only");
    expect(connectResponse.body).not.toContain("private-printer.local");
    expect(connectResponse.body).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(connectResponse.body).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
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
