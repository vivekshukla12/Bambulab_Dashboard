// SPDX-License-Identifier: MPL-2.0

import { assertReadOnlyAdapterContract, type ReadOnlyDeviceAdapter } from "@bpd/adapter-api";
import { Buffer } from "node:buffer";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createBambuReadonlyAdapter,
  normalizeBambuStatusPayload,
  parseBambuStatusPayload,
  type BambuMqttsTransportConfig,
  type BambuMqttsStatusTransport,
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
