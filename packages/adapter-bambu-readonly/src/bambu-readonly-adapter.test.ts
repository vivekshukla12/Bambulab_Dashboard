// SPDX-License-Identifier: MPL-2.0

import { assertReadOnlyAdapterContract, type ReadOnlyDeviceAdapter } from "@bpd/adapter-api";
import { Buffer } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createBambuReadonlyAdapter,
  discoverBambuPrinters,
  normalizeBambuStatusPayload,
  parseBambuSsdpCandidate,
  parseBambuStatusPayload,
  type BambuMqttsTransportConfig,
  type BambuMqttsStatusTransport,
  type BambuSsdpDiscoverySocket,
  type BambuStatusMessage,
  type BambuTransportState
} from "./index.js";

const fixedNow = () => new Date("2026-08-24T12:00:00.000Z");

class MockTransport implements BambuMqttsStatusTransport {
  readonly statusListeners = new Set<(message: BambuStatusMessage) => void>();
  readonly stateListeners = new Set<(state: BambuTransportState) => void>();
  readonly errorListeners = new Set<(error: Error) => void>();
  starts = 0;
  stops = 0;

  async start(): Promise<void> {
    this.starts += 1;
    this.emitState("connected");
  }

  async stop(): Promise<void> {
    this.stops += 1;
    this.emitState("closed");
  }

  onStatus(listener: (message: BambuStatusMessage) => void): () => void {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  onState(listener: (state: BambuTransportState) => void): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  emitStatus(payload: unknown, receivedAt = "2026-08-24T12:00:02.000Z"): void {
    const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
    for (const listener of this.statusListeners) {
      listener({
        topic: "device/private-serial/report",
        payload: Buffer.from(serialized, "utf8"),
        receivedAt
      });
    }
  }

  emitState(state: BambuTransportState): void {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  emitError(): void {
    for (const listener of this.errorListeners) {
      listener(new Error("synthetic transport failure"));
    }
  }
}

class ActivePrintFirstTransport extends MockTransport {
  override async start(): Promise<void> {
    this.starts += 1;
    this.emitStatus(x2dActivePrintPayload());
    this.emitState("connected");
  }
}

class MockSsdpSocket implements BambuSsdpDiscoverySocket {
  readonly errorListeners = new Set<(error: Error) => void>();
  readonly messageListeners = new Set<(message: Buffer, remoteInfo: { address: string }) => void>();
  readonly sends: Array<{ address: string; message: Buffer; port: number }> = [];
  boundPort?: number;
  closed = false;
  loopback?: boolean;
  sendError?: Error;
  ttl?: number;

  bind(port: number, callback: () => void): void {
    this.boundPort = port;
    callback();
  }

  close(): void {
    this.closed = true;
  }

  on(event: "message", listener: (message: Buffer, remoteInfo: { address: string }) => void): this {
    if (event === "message") {
      this.messageListeners.add(listener);
    }
    return this;
  }

  once(event: "error", listener: (error: Error) => void): this {
    if (event === "error") {
      this.errorListeners.add(listener);
    }
    return this;
  }

  send(message: Buffer, port: number, address: string, callback: (error: Error | null) => void): void {
    this.sends.push({ address, message, port });
    callback(this.sendError ?? null);
  }

  setMulticastLoopback(enabled: boolean): void {
    this.loopback = enabled;
  }

  setMulticastTTL(ttl: number): void {
    this.ttl = ttl;
  }

  emitMessage(message: string, address = "192.0.2.42"): void {
    for (const listener of this.messageListeners) {
      listener(Buffer.from(message, "utf8"), { address });
    }
  }

  emitError(): void {
    for (const listener of this.errorListeners) {
      listener(new Error("synthetic SSDP socket failure"));
    }
  }
}

afterEach(() => {
  vi.useRealTimers();
});

describe("BambuReadonlyAdapter", () => {
  it("satisfies the shared read-only adapter contract with a configured printer", async () => {
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput());
    await adapter.start();
    transports[0]?.emitStatus(realStatusPayload());

    await assertReadOnlyAdapterContract(adapter);
    const devices = await adapter.discoverDevices();
    expect(devices[0]?.identity.source).toBe("bambu-readonly");
    expect(devices[0]?.state.telemetry.print?.progressPercent).toBe(42);
  });

  it("accumulates partial printer-originated reports without flickering observed fields to unknown", async () => {
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput());
    await adapter.start();
    transports[0]?.emitStatus({
      print: {
        gcode_state: "RUNNING",
        mc_percent: 12,
        nozzle_temper: "57.8125"
      }
    });
    transports[0]?.emitStatus(
      {
        print: {
          wifi_signal: "-65dBm"
        }
      },
      "2026-08-24T12:00:05.000Z"
    );

    const device = (await adapter.discoverDevices())[0];
    expect(device?.state.lifecycle).toBe("printing");
    expect(device?.state.telemetry.print?.progressPercent).toBe(12);
    expect(device?.state.telemetry.temperatures?.nozzleC).toBe(57.8125);
    expect(device?.capabilities.find((capability) => capability.key === "printer.status")?.support).toBe("supported");
    expect(device?.capabilities.find((capability) => capability.key === "print.progress")?.support).toBe("supported");
    expect(device?.capabilities.find((capability) => capability.key === "temperature.nozzle")?.support).toBe("supported");
    expect(device?.capabilities.find((capability) => capability.key === "network.wifi")?.support).toBe("supported");
  });

  it("lets explicit idle reports end an accumulated print snapshot", async () => {
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput());
    await adapter.start();
    transports[0]?.emitStatus(realStatusPayload());
    transports[0]?.emitStatus(
      {
        print: {
          gcode_state: "IDLE"
        }
      },
      "2026-08-24T12:30:00.000Z"
    );

    const device = (await adapter.discoverDevices())[0];
    expect(device?.state.lifecycle).toBe("connected");
    expect(device?.state.telemetry.print).toBeUndefined();
    expect(device?.state.telemetry.temperatures?.nozzleC).toBe(214.5);
    expect(device?.capabilities.find((capability) => capability.key === "print.progress")?.support).toBe("supported");
  });

  it("keeps configured-printer diagnostics credential-free", async () => {
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => new MockTransport()
    });

    await adapter.configurePrinter(
      realPrinterInput({ accessCode: "SYNTHETIC_ACCESS_CODE", serialNumber: "SYNTHETIC_SERIAL_FOR_TEST" })
    );

    const serialized = JSON.stringify({
      health: adapter.health(),
      configured: adapter.listConfiguredPrinters()
    });
    expect(serialized).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(serialized).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
    expect(serialized).not.toContain("192.168.");
    expect(serialized).toContain("memory-only");
  });

  it("keeps local TLS trust profile details inside the adapter boundary", async () => {
    const transportConfigs: BambuMqttsTransportConfig[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: (config) => {
        transportConfigs.push(config);
        return new MockTransport();
      }
    });

    await adapter.configurePrinter(
      realPrinterInput({
        host: "192.0.2.10",
        tlsServerName: "SYNTHETIC_TLS_SERVER_NAME",
        tlsTrustProfile: "local-printer-chain"
      })
    );
    await adapter.start();

    expect(transportConfigs[0]?.tlsTrustProfile).toBe("local-printer-chain");
    expect(transportConfigs[0]?.tlsServerName).toBe("SYNTHETIC_TLS_SERVER_NAME");
    const serialized = JSON.stringify(adapter.listConfiguredPrinters());
    expect(serialized).not.toContain("192.0.2.10");
    expect(serialized).not.toContain("SYNTHETIC_TLS_SERVER_NAME");
    expect(serialized).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(serialized).not.toContain("SYNTHETIC_SERIAL_FOR_TEST");
  });

  it("handles an X2D-shaped active-print status frame during connection startup", async () => {
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => new ActivePrintFirstTransport()
    });

    await adapter.configurePrinter(realPrinterInput({ id: "x2d", displayName: "X2D", modelHint: "X2D" }));
    await adapter.start();

    const device = (await adapter.discoverDevices())[0];
    expect(device?.identity.modelHint).toBe("X2D");
    expect(device?.state.lifecycle).toBe("printing");
    expect(device?.state.telemetry.print?.progressPercent).toBe(64);
    expect(device?.state.telemetry.temperatures?.bedC).toBe(61);
  });

  it("reconfigures an active X2D session by replacing the transport and credential material", async () => {
    const transports: MockTransport[] = [];
    const transportConfigs: BambuMqttsTransportConfig[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: (config) => {
        transportConfigs.push(config);
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput({ id: "x2d", displayName: "X2D", modelHint: "X2D" }));
    await adapter.start();
    transports[0]?.emitStatus(x2dActivePrintPayload());

    const reconfigured = await adapter.reconfigurePrinter("x2d", {
      displayName: "Corrected X2D",
      modelHint: "X2D",
      host: "corrected-printer.local",
      serialNumber: "NEW_SYNTHETIC_SERIAL",
      accessCode: "NEW_SYNTHETIC_ACCESS_CODE",
      tlsTrustProfile: "local-printer-chain"
    });
    transports[0]?.emitStatus({ print: { mc_percent: 99 } }, "2026-08-24T12:05:00.000Z");
    transports[1]?.emitStatus({ print: { print_status: "RUNNING", print_progress: 71 } }, "2026-08-24T12:05:01.000Z");

    const device = (await adapter.discoverDevices())[0];
    expect(reconfigured?.displayName).toBe("Corrected X2D");
    expect(transports[0]?.stops).toBe(1);
    expect(transportConfigs[1]?.host).toBe("corrected-printer.local");
    expect(transportConfigs[1]?.serialNumber).toBe("NEW_SYNTHETIC_SERIAL");
    expect(transportConfigs[1]?.accessCode).toBe("NEW_SYNTHETIC_ACCESS_CODE");
    expect(device?.identity.displayName).toBe("Corrected X2D");
    expect(device?.state.telemetry.print?.progressPercent).toBe(71);
    const serialized = JSON.stringify(adapter.listConfiguredPrinters());
    expect(serialized).not.toContain("NEW_SYNTHETIC_ACCESS_CODE");
    expect(serialized).not.toContain("NEW_SYNTHETIC_SERIAL");
    expect(serialized).not.toContain("corrected-printer.local");
  });

  it("forgets a configured printer and ignores later events from the old transport", async () => {
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput({ id: "x2d", displayName: "X2D", modelHint: "X2D" }));
    await adapter.start();
    transports[0]?.emitStatus(x2dActivePrintPayload());

    await expect(adapter.forgetPrinter("x2d")).resolves.toBe(true);
    expect(transports[0]?.stops).toBe(1);
    transports[0]?.emitStatus({ print: { print_status: "RUNNING", print_progress: 88 } }, "2026-08-24T12:10:00.000Z");

    expect(await adapter.discoverDevices()).toHaveLength(0);
    expect(adapter.listConfiguredPrinters()).toHaveLength(0);
  });

  it("marks stale and unavailable states without presenting stale data as live", async () => {
    vi.useFakeTimers();
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput({ staleAfterMs: 1_000, offlineAfterMs: 2_000 }));
    await adapter.start();
    transports[0]?.emitStatus(realStatusPayload());

    await vi.advanceTimersByTimeAsync(1_001);
    expect((await adapter.discoverDevices())[0]?.state.observation.quality).toBe("stale");
    expect((await adapter.discoverDevices())[0]?.state.lifecycle).toBe("stale");

    await vi.advanceTimersByTimeAsync(1_000);
    expect((await adapter.discoverDevices())[0]?.state.observation.quality).toBe("unavailable");
    expect((await adapter.discoverDevices())[0]?.state.telemetry.print).toBeUndefined();
  });

  it("reconnects with bounded backoff after transport close", async () => {
    vi.useFakeTimers();
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      reconnectInitialMs: 250,
      reconnectMaxMs: 500,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput());
    await adapter.start();
    transports[0]?.emitState("closed");
    expect((await adapter.discoverDevices())[0]?.state.lifecycle).toBe("reconnecting");

    await vi.advanceTimersByTimeAsync(251);
    expect(transports).toHaveLength(2);
    expect(transports[0]?.stops).toBe(1);
    expect(transports[1]?.starts).toBe(1);
  });

  it("stops an errored transport before creating the reconnect replacement", async () => {
    vi.useFakeTimers();
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      reconnectInitialMs: 250,
      reconnectMaxMs: 500,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput());
    await adapter.start();
    transports[0]?.emitError();
    await Promise.resolve();

    expect(transports[0]?.stops).toBe(1);
    await vi.advanceTimersByTimeAsync(251);
    expect(transports).toHaveLength(2);
    expect(transports[1]?.starts).toBe(1);
  });

  it("recycles a silent connected transport after the offline freshness window", async () => {
    vi.useFakeTimers();
    const transports: MockTransport[] = [];
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      reconnectInitialMs: 250,
      reconnectMaxMs: 500,
      transportFactory: () => {
        const transport = new MockTransport();
        transports.push(transport);
        return transport;
      }
    });

    await adapter.configurePrinter(realPrinterInput({ staleAfterMs: 100, offlineAfterMs: 200 }));
    await adapter.start();

    await vi.advanceTimersByTimeAsync(201);
    expect((await adapter.discoverDevices())[0]?.state.observation.quality).toBe("unavailable");
    expect(transports[0]?.stops).toBe(1);

    await vi.advanceTimersByTimeAsync(251);
    expect(transports).toHaveLength(2);
    expect(transports[1]?.starts).toBe(1);
  });

  it("exposes no printer write/control surface", () => {
    const adapter: ReadOnlyDeviceAdapter = createBambuReadonlyAdapter();
    const maybeControl = adapter as unknown as Record<string, unknown>;
    expect(maybeControl.sendCommand).toBeUndefined();
    expect(maybeControl.publishMqtt).toBeUndefined();
    expect(maybeControl.pausePrint).toBeUndefined();
    expect(maybeControl.resumePrint).toBeUndefined();
    expect(maybeControl.setTemperature).toBeUndefined();
    expect(maybeControl.uploadFile).toBeUndefined();
  });
});

describe("Bambu SSDP discovery", () => {
  it("parses representative SSDP responses into internal candidates without exposing raw identifiers", () => {
    const candidate = parseBambuSsdpCandidate(ssdpResponse({ friendlyName: "Workshop A1 Mini 00M09A341234567" }), {
      discoveredAt: "2026-08-30T16:00:00.000Z",
      idFactory: () => "fixed-id",
      remoteAddress: "192.0.2.42"
    });

    expect(candidate).toMatchObject({
      id: "bambu-ssdp-fixed-id",
      displayName: "Workshop A1 Mini [redacted]",
      modelHint: "A1 Mini",
      host: "192.0.2.42",
      port: 8883,
      source: "ssdp",
      discoveredAt: "2026-08-30T16:00:00.000Z",
      requiresAccessCode: true,
      requiresSerialNumber: true
    });
    expect(candidate?.endpointHint).toContain("urn:bambulab-com:device:3dprinter:1");
    expect(candidate?.endpointHint).not.toContain("192.0.2.42");
    expect(JSON.stringify(candidate)).not.toContain("00M09A341234567");
  });

  it("parses Bambu SSDP NOTIFY alive messages and ignores byebye/unrelated services", () => {
    const alive = parseBambuSsdpCandidate(
      ssdpNotify({ friendlyName: "Studio X2D", model: "X2D", nts: "ssdp:alive" }),
      {
        idFactory: () => "notify-id",
        remoteAddress: "192.0.2.43"
      }
    );
    const byebye = parseBambuSsdpCandidate(ssdpNotify({ nts: "ssdp:byebye" }));
    const unrelated = parseBambuSsdpCandidate(ssdpResponse({ serviceType: "upnp:rootdevice" }));

    expect(alive?.displayName).toBe("Studio X2D");
    expect(alive?.modelHint).toBe("X2D");
    expect(byebye).toBeUndefined();
    expect(unrelated).toBeUndefined();
  });

  it("sends bounded M-SEARCH requests, filters Bambu service responses and deduplicates candidates", async () => {
    vi.useFakeTimers();
    const sockets: MockSsdpSocket[] = [];
    const discovery = discoverBambuPrinters({
      timeoutMs: 100,
      now: fixedNow,
      ssdpSocketFactory: () => {
        const socket = new MockSsdpSocket();
        sockets.push(socket);
        return socket;
      }
    });
    const socket = sockets[0];
    expect(socket?.boundPort).toBe(0);
    expect(socket?.ttl).toBe(2);
    expect(socket?.loopback).toBe(false);
    expect(socket?.sends[0]?.address).toBe("239.255.255.250");
    expect(socket?.sends[0]?.port).toBe(1900);
    expect(socket?.sends[0]?.message.toString("utf8")).toContain("ST: urn:bambulab-com:device:3dprinter:1");

    socket?.emitMessage(ssdpResponse({ friendlyName: "Workshop A1 Mini", locationHost: "192.0.2.42" }));
    socket?.emitMessage(ssdpResponse({ friendlyName: "Workshop A1 Mini", locationHost: "192.0.2.42" }));
    socket?.emitMessage(ssdpResponse({ serviceType: "upnp:rootdevice", locationHost: "192.0.2.99" }));
    await vi.advanceTimersByTimeAsync(101);

    const candidates = await discovery;
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.displayName).toBe("Workshop A1 Mini");
    expect(candidates[0]?.host).toBe("192.0.2.42");
    expect(socket?.closed).toBe(true);
  });

  it("returns no candidates after an SSDP timeout while keeping manual fallback possible", async () => {
    vi.useFakeTimers();
    const sockets: MockSsdpSocket[] = [];
    const discovery = discoverBambuPrinters({
      timeoutMs: 100,
      ssdpSocketFactory: () => {
        const socket = new MockSsdpSocket();
        sockets.push(socket);
        return socket;
      }
    });

    await vi.advanceTimersByTimeAsync(101);

    await expect(discovery).resolves.toEqual([]);
    expect(sockets[0]?.closed).toBe(true);
  });

  it("reports socket failures as discovery failures without raw socket details", async () => {
    const sockets: MockSsdpSocket[] = [];
    const discovery = discoverBambuPrinters({
      timeoutMs: 100,
      ssdpSocketFactory: () => {
        const socket = new MockSsdpSocket();
        sockets.push(socket);
        return socket;
      }
    });

    sockets[0]?.emitError();

    await expect(discovery).rejects.toThrow("Server-side SSDP discovery failed.");
    expect(sockets[0]?.closed).toBe(true);
  });
});

describe("Bambu status parser and normalizer", () => {
  it("normalizes observed print progress and temperatures", () => {
    const device = normalizeBambuStatusPayload(parseBambuStatusPayload(JSON.stringify(realStatusPayload())), {
      adapterId: "bambu-readonly-m2",
      source: "bambu-readonly",
      deviceId: "a1-mini",
      displayName: "A1 Mini",
      modelHint: "A1 Mini",
      sequence: 7,
      receivedAt: "2026-08-24T12:00:02.000Z"
    });

    expect(device.state.lifecycle).toBe("printing");
    expect(device.state.telemetry.temperatures?.nozzleC).toBe(214.5);
    expect(device.state.telemetry.temperatures?.bedC).toBe(60);
    expect(device.state.telemetry.print?.remainingSeconds).toBe(18_000);
    expect(device.capabilities.find((capability) => capability.key === "temperature.chamber")?.support).toBe("unknown");
  });

  it("keeps partial payloads explicit instead of fabricating unsupported data", () => {
    const device = normalizeBambuStatusPayload(parseBambuStatusPayload({ print: { gcode_state: "IDLE" } }), {
      adapterId: "bambu-readonly-m2",
      source: "bambu-readonly",
      deviceId: "x2d",
      displayName: "X2D",
      modelHint: "X2D",
      sequence: 1,
      receivedAt: "2026-08-24T12:00:02.000Z"
    });

    expect(device.state.lifecycle).toBe("connected");
    expect(device.state.telemetry.temperatures).toBeUndefined();
    expect(device.capabilities.find((capability) => capability.key === "print.progress")?.support).toBe("unknown");
  });

  it("rejects malformed payload shapes", () => {
    expect(() => parseBambuStatusPayload("[]")).toThrow(/JSON object/);
    expect(() => parseBambuStatusPayload("not json")).toThrow();
  });
});

function realPrinterInput(overrides: Partial<Parameters<ReturnType<typeof createBambuReadonlyAdapter>["configurePrinter"]>[0]> = {}) {
  return {
    id: "a1-mini",
    displayName: "A1 Mini",
    modelHint: "A1 Mini",
    host: "example-printer.local",
    serialNumber: "SYNTHETIC_SERIAL_FOR_TEST",
    accessCode: "SYNTHETIC_ACCESS_CODE",
    ...overrides
  };
}

function realStatusPayload() {
  return {
    print: {
      gcode_state: "RUNNING",
      mc_percent: 42,
      nozzle_temper: "214.5",
      bed_temper: 60,
      mc_remaining_time: 300,
      subtask_name: "sanitized cube",
      task_id: "sanitized-task",
      firmware_version: "sanitized-fw"
    }
  };
}

function x2dActivePrintPayload() {
  return {
    print: {
      print_status: "RUNNING",
      print_progress: 64,
      nozzle_temp: 215,
      bed_temp: 61,
      remaining_seconds: 1200,
      project_name: "sanitized active print"
    }
  };
}

function ssdpResponse(options: {
  friendlyName?: string;
  locationHost?: string;
  model?: string;
  serviceType?: string;
} = {}): string {
  const serviceType = options.serviceType ?? "urn:bambulab-com:device:3dprinter:1";
  const lines = [
    "HTTP/1.1 200 OK",
    "CACHE-CONTROL: max-age=1800",
    `LOCATION: http://${options.locationHost ?? "192.0.2.42"}:1900/description.xml`,
    `ST: ${serviceType}`,
    `USN: uuid:synthetic-printer::${serviceType}`,
    options.friendlyName ? `friendly-name: ${options.friendlyName}` : undefined,
    options.model ? `model: ${options.model}` : undefined
  ].filter((line): line is string => Boolean(line));
  return `${lines.join("\r\n")}\r\n\r\n`;
}

function ssdpNotify(options: { friendlyName?: string; model?: string; nts: string }): string {
  const serviceType = "urn:bambulab-com:device:3dprinter:1";
  const lines = [
    "NOTIFY * HTTP/1.1",
    "HOST: 239.255.255.250:1900",
    `LOCATION: http://192.0.2.43:1900/description.xml`,
    `NT: ${serviceType}`,
    `NTS: ${options.nts}`,
    `USN: uuid:synthetic-printer::${serviceType}`,
    options.friendlyName ? `friendly-name: ${options.friendlyName}` : undefined,
    options.model ? `model: ${options.model}` : undefined
  ].filter((line): line is string => Boolean(line));
  return `${lines.join("\r\n")}\r\n\r\n`;
}
