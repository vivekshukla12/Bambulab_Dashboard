// SPDX-License-Identifier: MPL-2.0

import {
  createBambuReadonlyAdapter,
  discoverBambuPrinters,
  type BambuDiscoveredPrinterCandidate,
  type BambuPrinterConnectionInput,
  type BambuReadonlyAdapter,
  type BambuTransportFactory
} from "@bpd/adapter-bambu-readonly";
import { createSyntheticAdapter } from "@bpd/adapter-synthetic";
import {
  envelope,
  toDeviceDetailDto,
  toDeviceSummaryDto,
  toSseDeviceEventDto,
  type HealthDto,
  type RealPrinterCandidateDto,
  type RealPrinterConnectionRequest
} from "@bpd/contracts";
import { DeviceStateService } from "@bpd/device-core";
import { getDashboardDiscoveryDescriptor } from "@bpd/discovery";
import { createLogger, createRequestId } from "@bpd/observability";
import { DashboardDatabase } from "@bpd/persistence";
import Fastify, { type FastifyInstance } from "fastify";
import type { ServerConfig } from "./config.js";
import { registerStaticShell } from "./static.js";

/**
 * Runtime handles returned by the server factory for tests and process lifecycle.
 */
export interface DashboardServer {
  server: FastifyInstance;
  deviceService: DeviceStateService;
  database: DashboardDatabase;
  realAdapter: BambuReadonlyAdapter;
  close(): Promise<void>;
}

/**
 * Test/runtime hooks for server-owned adapter wiring.
 */
export interface DashboardServerOptions {
  realTransportFactory?: BambuTransportFactory;
  realPrinterDiscovery?: () => Promise<BambuDiscoveredPrinterCandidate[]>;
}

/**
 * Builds the read-only dashboard server and starts adapter observation.
 */
export async function buildDashboardServer(config: ServerConfig, options: DashboardServerOptions = {}): Promise<DashboardServer> {
  const logger = createLogger("server");
  const database = await DashboardDatabase.open({
    databasePath: config.databasePath,
    logger: logger.child({ component: "database" })
  });
  const syntheticAdapter = createSyntheticAdapter({ intervalMs: config.syntheticIntervalMs });
  const realAdapter = createBambuReadonlyAdapter(
    options.realTransportFactory ? { transportFactory: options.realTransportFactory } : {}
  );
  const discoverRealPrinters = options.realPrinterDiscovery ?? (() => discoverBambuPrinters());
  const discoveredCandidates = new Map<string, BambuDiscoveredPrinterCandidate>();
  const deviceService = new DeviceStateService([syntheticAdapter, realAdapter], database, logger.child({ component: "device-core" }));
  await deviceService.start();

  const server = Fastify({
    logger: false,
    genReqId: createRequestId
  });

  server.addHook("onRequest", async (request) => {
    logger.info("request started", {
      requestId: request.id,
      method: request.method,
      url: request.url
    });
  });

  server.get("/api/v1/devices", async (request) =>
    envelope({ devices: deviceService.listDevices().map(toDeviceSummaryDto) }, request.id)
  );

  server.get<{ Params: { id: string } }>("/api/v1/devices/:id", async (request, reply) => {
    const device = deviceService.getDevice(request.params.id);
    if (!device) {
      return reply.code(404).send(envelope({ error: "Device not found" }, request.id));
    }
    return envelope({ device: toDeviceDetailDto(device) }, request.id);
  });

  server.get<{ Params: { id: string } }>("/api/v1/devices/:id/state", async (request, reply) => {
    const device = deviceService.getDevice(request.params.id);
    if (!device) {
      return reply.code(404).send(envelope({ error: "Device not found" }, request.id));
    }
    return envelope({ state: device.state }, request.id);
  });

  server.get("/api/v1/real-printers", async (request) =>
    envelope({ printers: realAdapter.listConfiguredPrinters() }, request.id)
  );

  server.get("/api/v1/real-printer-candidates", async (request) => {
    const candidates = await discoverRealPrinters().catch(() => []);
    discoveredCandidates.clear();
    for (const candidate of candidates) {
      discoveredCandidates.set(candidate.id, candidate);
    }
    return envelope(
      {
        discovery: {
          candidates: candidates.map(toRealPrinterCandidateDto),
          discoveryMethod: "mdns",
          manualFallbackAvailable: true,
          note:
            candidates.length > 0
              ? "Server-side mDNS discovery found sanitized printer candidates; Access Codes remain memory-only."
              : "No server-side mDNS candidates found; use the manual host fallback."
        }
      },
      request.id
    );
  });

  server.post<{ Body: RealPrinterConnectionRequest }>("/api/v1/real-printers", async (request, reply) => {
    try {
      const printer = await realAdapter.configurePrinter(toBambuConnectionInput(request.body, discoveredCandidates));
      return envelope({ printer }, request.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid real-printer configuration.";
      return reply.code(400).send(envelope({ error: message }, request.id));
    }
  });

  server.get("/api/v1/health", async (request) =>
    envelope(await buildHealthDto(config, database, deviceService, realAdapter), request.id)
  );

  server.get("/api/v1/events", async (_request, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "x-accel-buffering": "no"
    });

    const writeEvent = (eventName: string, payload: unknown) => {
      reply.raw.write(`event: ${eventName}\n`);
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    writeEvent("device.snapshot", {
      type: "device.snapshot",
      eventId: `snapshot-${Date.now()}`,
      emittedAt: new Date().toISOString(),
      devices: deviceService.listDevices().map(toDeviceSummaryDto)
    });

    const unsubscribe = deviceService.subscribe((event) => {
      const dto = toSseDeviceEventDto(event);
      writeEvent(dto.type, dto);
    });

    reply.raw.on("close", unsubscribe);
  });

  registerStaticShell(server, config.webDistPath);

  return {
    server,
    deviceService,
    database,
    realAdapter,
    close: async () => {
      await server.close();
      await deviceService.stop();
      await database.close();
    }
  };
}

async function buildHealthDto(
  config: ServerConfig,
  database: DashboardDatabase,
  deviceService: DeviceStateService,
  realAdapter: BambuReadonlyAdapter
): Promise<HealthDto> {
  const databaseHealth = await database.health();
  const deviceHealth = deviceService.health();
  const primaryAdapter = deviceHealth.adapters[0];
  const configuredPrinters = realAdapter.listConfiguredPrinters();
  return {
    server: {
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: config.startedAt
    },
    database: databaseHealth,
    simulator: {
      status: primaryAdapter?.status ?? "degraded",
      adapterId: primaryAdapter?.adapterId ?? "none",
      scenario: primaryAdapter?.scenario ?? "none",
      devices: primaryAdapter?.devices ?? 0,
      currentStep: primaryAdapter?.currentStep ?? 0
    },
    adapters: deviceHealth.adapters,
    realPrinterOnboarding: {
      status: configuredPrinters.length === 0 ? "degraded" : "ok",
      configuredPrinters: configuredPrinters.length,
      credentialMode: "memory-only",
      note: "Real printer Access Codes are process-memory-only for M2 and are not returned by diagnostics."
    },
    events: deviceHealth.events,
    discovery: getDashboardDiscoveryDescriptor({
      host: config.host,
      port: config.port,
      protocol: "http",
      advertised: false
    })
  };
}

function toRealPrinterCandidateDto(candidate: BambuDiscoveredPrinterCandidate): RealPrinterCandidateDto {
  return {
    id: candidate.id,
    displayName: candidate.displayName,
    modelHint: candidate.modelHint,
    source: candidate.source,
    discoveredAt: candidate.discoveredAt,
    endpointHint: candidate.endpointHint,
    requiresAccessCode: true
  };
}

function toBambuConnectionInput(
  body: RealPrinterConnectionRequest,
  discoveredCandidates: Map<string, BambuDiscoveredPrinterCandidate>
): BambuPrinterConnectionInput {
  const candidate = body.candidateId ? discoveredCandidates.get(body.candidateId) : undefined;
  if (body.candidateId && !candidate) {
    throw new Error("Unknown real-printer discovery candidate. Run discovery again or use manual host fallback.");
  }
  const input: BambuPrinterConnectionInput = {
    displayName: requireBodyString(body.displayName, "displayName"),
    modelHint: requireBodyString(body.modelHint, "modelHint"),
    host: candidate?.host ?? requireBodyString(body.host, "host"),
    serialNumber: requireBodyString(body.serialNumber, "serialNumber"),
    accessCode: requireBodyString(body.accessCode, "accessCode")
  };
  const port = body.port ?? candidate?.port;
  if (port !== undefined) {
    input.port = port;
  }
  if (body.caCertificatePath) {
    input.caCertificatePath = body.caCertificatePath;
  }
  if (body.tlsServerName) {
    input.tlsServerName = body.tlsServerName;
  }
  if (body.tlsTrustProfile) {
    input.tlsTrustProfile = requireTlsTrustProfile(body.tlsTrustProfile);
  }
  return input;
}

function requireBodyString(value: string | undefined, field: string): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required real-printer field: ${field}.`);
  }
  return value.trim();
}

function requireTlsTrustProfile(value: string): NonNullable<BambuPrinterConnectionInput["tlsTrustProfile"]> {
  if (value === "system" || value === "local-printer-chain") {
    return value;
  }
  throw new Error("Invalid real-printer TLS trust profile.");
}
