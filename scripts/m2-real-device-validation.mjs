// SPDX-License-Identifier: MPL-2.0

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const configPath = path.resolve(root, process.argv[2] ?? "secrets/m2-printers.local.json");
const { createBambuReadonlyAdapter } = await import("../packages/adapter-bambu-readonly/dist/index.js");

const config = await readValidationConfig(configPath);
const durationSeconds = positiveNumber(config.durationSeconds, 120);
const adapter = createBambuReadonlyAdapter();
const evidence = new Map();

adapter.subscribe((event) => recordDeviceEvent(evidence, event.device));

for (const printer of config.printers) {
  await adapter.configurePrinter(toConnectionInput(printer));
}

await adapter.start();
await wait(durationSeconds * 1000);
const devices = await adapter.discoverDevices();
await adapter.stop();

const generatedAt = new Date().toISOString();
const report = {
  generatedAt,
  durationSeconds,
  validationMode: "local-only",
  credentialPolicy: "memory-only; access codes are not printed, logged, persisted or returned",
  printersConfigured: adapter.listConfiguredPrinters().map((printer) => ({
    id: printer.id,
    modelHint: printer.modelHint,
    source: printer.source,
    connectionState: printer.connectionState,
    credentialMode: printer.credentialMode,
    lastObservationAt: printer.lastObservationAt ?? null
  })),
  capabilityMatrix: devices.map((device) => ({
    id: device.identity.id,
    modelHint: device.identity.modelHint,
    lifecycle: device.state.lifecycle,
    quality: device.state.observation.quality,
    capabilities: device.capabilities.map((capability) => ({
      key: capability.key,
      classification: classifyCapability(device.identity.id, capability.key, evidence),
      support: capability.support,
      quality: capability.quality
    }))
  }))
};

console.log(JSON.stringify(report, null, 2));

async function readValidationConfig(filePath) {
  try {
    const parsed = JSON.parse(await readFile(filePath, "utf8"));
    if (!Array.isArray(parsed.printers) || parsed.printers.length === 0) {
      throw new Error("Config must contain a non-empty printers array.");
    }
    return parsed;
  } catch (error) {
    console.error(`Unable to read M2 local validation config at ${path.relative(root, filePath)}.`);
    console.error("Create secrets/m2-printers.local.json from the runbook template. Do not commit it.");
    throw error;
  }
}

function toConnectionInput(printer) {
  const input = {
    id: requiredString(printer.id, "id"),
    displayName: requiredString(printer.displayName ?? printer.id, "displayName"),
    modelHint: requiredString(printer.modelHint, "modelHint"),
    host: requiredString(printer.host, "host"),
    serialNumber: requiredString(printer.serialNumber, "serialNumber"),
    accessCode: requiredString(printer.accessCode, "accessCode")
  };
  if (printer.port !== undefined) {
    input.port = Number(printer.port);
  }
  if (printer.caCertificatePath) {
    input.caCertificatePath = path.resolve(root, printer.caCertificatePath);
  }
  if (printer.staleAfterMs !== undefined) {
    input.staleAfterMs = Number(printer.staleAfterMs);
  }
  if (printer.offlineAfterMs !== undefined) {
    input.offlineAfterMs = Number(printer.offlineAfterMs);
  }
  return input;
}

function recordDeviceEvent(evidence, device) {
  const deviceEvidence = getOrCreate(evidence, device.identity.id, () => new Map());
  remember(deviceEvidence, "printer.status", device.state.lifecycle, device.state.observation.quality);
  if (device.state.telemetry.print?.progressPercent !== undefined) {
    remember(deviceEvidence, "print.progress", device.state.telemetry.print.progressPercent, device.state.observation.quality);
  }
  const temperatures = device.state.telemetry.temperatures;
  if (temperatures?.nozzleC !== undefined) {
    remember(deviceEvidence, "temperature.nozzle", temperatures.nozzleC, device.state.observation.quality);
  }
  if (temperatures?.bedC !== undefined) {
    remember(deviceEvidence, "temperature.bed", temperatures.bedC, device.state.observation.quality);
  }
  if (temperatures?.chamberC !== undefined) {
    remember(deviceEvidence, "temperature.chamber", temperatures.chamberC, device.state.observation.quality);
  }
}

function remember(deviceEvidence, key, value, quality) {
  const capability = getOrCreate(deviceEvidence, key, () => ({ liveCount: 0, values: new Set(), degradedCount: 0 }));
  if (quality === "live") {
    capability.liveCount += 1;
  }
  if (quality === "degraded" || quality === "stale" || quality === "unavailable") {
    capability.degradedCount += 1;
  }
  capability.values.add(String(value));
}

function classifyCapability(deviceId, key, evidence) {
  const capability = evidence.get(deviceId)?.get(key);
  if (!capability || capability.liveCount === 0) {
    return "not-tested";
  }
  if (capability.degradedCount > capability.liveCount) {
    return "unreliable";
  }
  if (capability.values.size > 1) {
    return "proven-live";
  }
  return "proven-static";
}

function getOrCreate(map, key, create) {
  const existing = map.get(key);
  if (existing) {
    return existing;
  }
  const value = create();
  map.set(key, value);
  return value;
}

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required local validation field: ${field}.`);
  }
  return value.trim();
}

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
