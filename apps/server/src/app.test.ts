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

  it("reports no-candidate and failed discovery states with manual fallback", async () => {
    temp = await createTempDatabase();
    dashboard = await buildDashboardServer(
      {
        ...loadServerConfig({}),
        databasePath: temp.databasePath,
        syntheticIntervalMs: 1000
      },
      { realPrinterDiscovery: async () => [] }
    );

    const noneResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/real-printer-candidates" });
    expect(noneResponse.statusCode).toBe(200);
    expect(noneResponse.json().data.discovery.status).toBe("none");
    expect(noneResponse.json().data.discovery.manualFallbackAvailable).toBe(true);

    await dashboard.close();
    dashboard = await buildDashboardServer(
      {
        ...loadServerConfig({}),
        databasePath: temp.databasePath,
        syntheticIntervalMs: 1000
      },
      {
        realPrinterDiscovery: async () => {
          throw new Error("private host specific discovery failure");
        }
      }
    );

    const failedResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/real-printer-candidates" });
    expect(failedResponse.statusCode).toBe(200);
    expect(failedResponse.json().data.discovery.status).toBe("failed");
    expect(failedResponse.json().data.discovery.manualFallbackAvailable).toBe(true);
    expect(failedResponse.body).not.toContain("private host specific discovery failure");
  });

  it("reconfigures an existing real printer without exposing previous or replacement credentials", async () => {
    temp = await createTempDatabase();
    const transportConfigs: BambuMqttsTransportConfig[] = [];
    const transports: MockRealTransport[] = [];
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    }, { realTransportFactory: (config) => {
      transportConfigs.push(config);
      const transport = new MockRealTransport();
      transports.push(transport);
      return transport;
    } });

    const createResponse = await dashboard.server.inject({
      method: "POST",
      url: "/api/v1/real-printers",
      payload: {
        displayName: "Product Owner X2D",
        modelHint: "X2D",
        host: "old-private-printer.local",
        serialNumber: "OLD_SYNTHETIC_SERIAL",
        accessCode: "OLD_SYNTHETIC_ACCESS_CODE",
        tlsTrustProfile: "local-printer-chain"
      }
    });
    const printerId = createResponse.json().data.printer.id as string;

    const patchResponse = await dashboard.server.inject({
      method: "PATCH",
      url: `/api/v1/real-printers/${printerId}`,
      payload: {
        displayName: "Corrected Product Owner X2D",
        modelHint: "X2D",
        host: "new-private-printer.local",
        serialNumber: "NEW_SYNTHETIC_SERIAL",
        accessCode: "NEW_SYNTHETIC_ACCESS_CODE",
        tlsTrustProfile: "system"
      }
    });

    expect(patchResponse.statusCode).toBe(200);
    expect(transports[0]?.stops).toBe(1);
    expect(transportConfigs[1]?.host).toBe("new-private-printer.local");
    expect(transportConfigs[1]?.serialNumber).toBe("NEW_SYNTHETIC_SERIAL");
    expect(transportConfigs[1]?.accessCode).toBe("NEW_SYNTHETIC_ACCESS_CODE");
    expect(transportConfigs[1]?.tlsTrustProfile).toBe("system");
    expect(patchResponse.body).toContain("Corrected Product Owner X2D");
    expect(patchResponse.body).not.toContain("OLD_SYNTHETIC_ACCESS_CODE");
    expect(patchResponse.body).not.toContain("NEW_SYNTHETIC_ACCESS_CODE");
    expect(patchResponse.body).not.toContain("OLD_SYNTHETIC_SERIAL");
    expect(patchResponse.body).not.toContain("NEW_SYNTHETIC_SERIAL");
    expect(patchResponse.body).not.toContain("new-private-printer.local");
  });

  it("removes a configured real printer and clears the live registry without deleting history", async () => {
    temp = await createTempDatabase();
    const transports: MockRealTransport[] = [];
    dashboard = await buildDashboardServer({
      ...loadServerConfig({}),
      databasePath: temp.databasePath,
      syntheticIntervalMs: 1000
    }, { realTransportFactory: () => {
      const transport = new MockRealTransport();
      transports.push(transport);
      return transport;
    } });

    const createResponse = await dashboard.server.inject({
      method: "POST",
      url: "/api/v1/real-printers",
      payload: {
        displayName: "Removable X2D",
        modelHint: "X2D",
        host: "private-printer.local",
        serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
        accessCode: "SYNTHETIC_ACCESS_CODE",
        tlsTrustProfile: "local-printer-chain"
      }
    });
    const printerId = createResponse.json().data.printer.id as string;
    expect((await dashboard.server.inject({ method: "GET", url: "/api/v1/devices" })).body).toContain("Removable X2D");

    const deleteResponse = await dashboard.server.inject({ method: "DELETE", url: `/api/v1/real-printers/${printerId}` });
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json().data.removal).toMatchObject({
      removed: true,
      credentialMaterialCleared: true,
      historyDeleted: false
    });
    expect(deleteResponse.body).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(deleteResponse.body).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
    expect(transports[0]?.stops).toBe(1);

    const printersResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/real-printers" });
    expect(printersResponse.json().data.printers).toHaveLength(0);
    const devicesResponse = await dashboard.server.inject({ method: "GET", url: "/api/v1/devices" });
    expect(devicesResponse.body).not.toContain("Removable X2D");
  });
});

class MockRealTransport implements BambuMqttsStatusTransport {
  starts = 0;
  stops = 0;

  async start(): Promise<void> {
    this.starts += 1;
  }

  async stop(): Promise<void> {
    this.stops += 1;
  }

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
