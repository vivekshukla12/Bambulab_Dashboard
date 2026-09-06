// SPDX-License-Identifier: MPL-2.0

import { createBambuReadonlyAdapter, type BambuMqttsTransportConfig } from "@bpd/adapter-bambu-readonly";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import * as bridgeExports from "./index.js";
import {
  createBambuNetworkPluginTransportFactory,
  discoverBambuPrintersWithNetworkPlugin,
  parseBambuNetworkPluginDiscoveryPayload,
  probeBambuNetworkPlugin,
  type BambuNetworkPluginBridgeRuntime,
  type BambuNetworkPluginMonitor,
  type BambuNetworkPluginMonitorHandlers,
  type BambuNetworkPluginProbeResult
} from "./index.js";

const fixedNow = () => new Date("2026-09-06T12:00:00.000Z");

class MockBridgeRuntime implements BambuNetworkPluginBridgeRuntime {
  probeResult: BambuNetworkPluginProbeResult = {
    available: true,
    reason: "available",
    pluginVersion: "02.08.02.54",
    abiPrefix: "02.08.02"
  };
  discoveryPayloads: unknown[] = [];
  monitorHandlers?: BambuNetworkPluginMonitorHandlers;
  monitorConfig?: BambuMqttsTransportConfig;
  stops = 0;

  async probe(): Promise<BambuNetworkPluginProbeResult> {
    return this.probeResult;
  }

  async discover(): Promise<unknown[]> {
    return this.discoveryPayloads;
  }

  async openMonitor(
    config: BambuMqttsTransportConfig,
    handlers: BambuNetworkPluginMonitorHandlers
  ): Promise<BambuNetworkPluginMonitor> {
    this.monitorConfig = config;
    this.monitorHandlers = handlers;
    return {
      ready: Promise.resolve(),
      stop: async () => {
        this.stops += 1;
      }
    };
  }
}

describe("Bambu Network Plugin bridge", () => {
  it("fails cleanly when the optional official component is absent", async () => {
    const runtime: BambuNetworkPluginBridgeRuntime = {
      probe: async () => {
        throw Object.assign(new Error("private local path"), { code: "COMPONENT_ABSENT" });
      },
      discover: async () => [],
      openMonitor: async () => {
        throw new Error("not used");
      }
    };

    await expect(probeBambuNetworkPlugin({ runtime })).resolves.toEqual({
      available: false,
      reason: "component-absent"
    });
  });

  it("sanitizes public discovery callbacks while retaining connection fields server-side", () => {
    const candidate = parseBambuNetworkPluginDiscoveryPayload(
      {
        dev_name: "Lab 192.168.1.45 AA:BB:CC:DD:EE:FF N2S123456789",
        dev_id: "N2S123456789",
        dev_ip: "192.168.1.45",
        dev_type: "N2S",
        connect_type: "lan"
      },
      { discoveredAt: "2026-09-06T12:00:00.000Z", idFactory: () => "synthetic" }
    );

    expect(candidate).toMatchObject({
      id: "bambu-network-plugin-synthetic",
      displayName: "Lab [redacted] [redacted] [redacted]",
      modelHint: "A1 Mini",
      host: "192.168.1.45",
      serialNumber: "N2S123456789",
      source: "bambu-network-plugin",
      requiresAccessCode: true,
      requiresSerialNumber: false
    });
    expect(candidate?.endpointHint).not.toContain("192.168.1.45");
    expect(candidate?.endpointHint).not.toContain("N2S123456789");
  });

  it("rejects public endpoints and malformed discovery identifiers", () => {
    expect(
      parseBambuNetworkPluginDiscoveryPayload({
        dev_name: "Synthetic",
        dev_id: "SYNTHETIC_SERIAL",
        dev_ip: "203.0.113.10",
        dev_type: "N2S"
      })
    ).toBeUndefined();
    expect(parseBambuNetworkPluginDiscoveryPayload("not-json")).toBeUndefined();
  });

  it("deduplicates official discovery callbacks without returning raw payloads", async () => {
    const runtime = new MockBridgeRuntime();
    runtime.discoveryPayloads = [
      JSON.stringify({ dev_name: "A1 Mini", dev_id: "SYNTHETIC_A1", dev_ip: "10.0.0.20", dev_type: "N2S" }),
      JSON.stringify({ dev_name: "A1 Mini updated", dev_id: "SYNTHETIC_A1", dev_ip: "10.0.0.20", dev_type: "N2S" })
    ];

    const candidates = await discoverBambuPrintersWithNetworkPlugin({
      runtime,
      now: fixedNow,
      idFactory: () => "candidate"
    });

    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.source).toBe("bambu-network-plugin");
    expect(JSON.stringify(candidates[0]?.endpointHint)).not.toContain("10.0.0.20");
  });

  it("normalizes local read-only callbacks through the existing adapter boundary", async () => {
    const runtime = new MockBridgeRuntime();
    const adapter = createBambuReadonlyAdapter({
      now: fixedNow,
      transportFactory: createBambuNetworkPluginTransportFactory({ runtime, now: fixedNow })
    });
    await adapter.configurePrinter({
      displayName: "Synthetic A1",
      modelHint: "A1 Mini",
      host: "10.0.0.20",
      serialNumber: "SYNTHETIC_A1",
      accessCode: "SYNTHETIC_ACCESS_CODE",
      tlsTrustProfile: "local-printer-chain"
    });
    await adapter.start();
    runtime.monitorHandlers?.onState("connected");
    runtime.monitorHandlers?.onStatus(
      JSON.stringify({ print: { gcode_state: "RUNNING", mc_percent: 42, nozzle_temper: 205, bed_temper: 60 } }),
      "2026-09-06T12:00:00.000Z"
    );

    const device = (await adapter.discoverDevices())[0];
    expect(device?.state.lifecycle).toBe("printing");
    expect(device?.state.telemetry.print?.progressPercent).toBe(42);
    expect(device?.state.telemetry.temperatures).toMatchObject({ nozzleC: 205, bedC: 60 });
    expect(JSON.stringify(adapter.listConfiguredPrinters())).not.toContain("SYNTHETIC_ACCESS_CODE");
    expect(JSON.stringify(adapter.listConfiguredPrinters())).not.toContain("10.0.0.20");

    await adapter.stop();
    expect(runtime.stops).toBe(1);
  });

  it("exposes no write/control API and resolves no native write/control entry point", async () => {
    const exportedNames = Object.keys(bridgeExports).join(" ");
    expect(exportedNames).not.toMatch(/sendMessage|startPrint|moveAxis|bindPrinter|camera|control/i);

    const nativeSource = await readFile(
      new URL("../native/bambu-network-plugin-bridge.cpp", import.meta.url),
      "utf8"
    );
    expect(nativeSource).not.toMatch(/bambu_network_(?:send|bind|unbind|start_print|get_camera|install_device_cert)/);
  });
});
