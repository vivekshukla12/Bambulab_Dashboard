// SPDX-License-Identifier: MPL-2.0

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const configPath = path.resolve(root, process.argv[2] ?? "secrets/m2-printers.local.json");

await main().catch((error) => {
  console.error(safeValidationErrorMessage(error));
  process.exitCode = 1;
});

async function main() {
  const { createBambuReadonlyAdapter } = await import("../packages/adapter-bambu-readonly/dist/index.js");
  const config = await readValidationConfig(configPath);
  const durationSeconds = positiveNumber(config.durationSeconds, 120);
  const adapter = createBambuReadonlyAdapter();
  const evidence = new Map();
  const configured = [];

  adapter.subscribe((event) => recordDeviceEvent(evidence, event.device));

  for (const printer of config.printers) {
    const connection = await adapter.configurePrinter(toConnectionInput(printer));
    configured.push(connection);
    getDeviceEvidence(evidence, connection.id).configuredAt = connection.configuredAt;
  }

  const validationStartedAt = new Date().toISOString();
  for (const printer of configured) {
    getDeviceEvidence(evidence, printer.id).connectionAttemptStartedAt = validationStartedAt;
  }

  await adapter.start();
  await wait(durationSeconds * 1000);
  const devices = await adapter.discoverDevices();
  const connectionDiagnostics = adapter.listConnectionDiagnostics();
  await adapter.stop();

  const generatedAt = new Date().toISOString();
  const report = {
    generatedAt,
    durationSeconds,
    validationMode: "local-only",
    credentialPolicy: "memory-only; access codes are not printed, logged, persisted or returned",
    printersConfigured: connectionDiagnostics.map((printer) => ({
      id: printer.id,
      modelHint: printer.modelHint,
      source: printer.source,
      connectionState: printer.connectionState,
      credentialMode: printer.credentialMode,
      lastObservationAt: printer.lastObservationAt ?? null
    })),
    connectionEvidence: connectionDiagnostics.map((printer) => summarizeConnectionEvidence(printer, evidence)),
    capabilityMatrix: devices.map((device) => ({
      id: device.identity.id,
      modelHint: device.identity.modelHint,
      lifecycle: device.state.lifecycle,
      quality: device.state.observation.quality,
      updateEvidence: summarizeUpdateEvidence(evidence.get(device.identity.id)),
      capabilities: device.capabilities.map((capability) => ({
        key: capability.key,
        classification: classifyCapability(device.identity.id, capability.key, evidence),
        support: capability.support,
        quality: capability.quality
      }))
    }))
  };

  console.log(JSON.stringify(report, null, 2));
}

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
  const deviceEvidence = getDeviceEvidence(evidence, device.identity.id);
  const observation = device.state.observation;
  const receivedAt = observation.receivedAt;
  const quality = observation.quality;

  if (
    deviceEvidence.connectionAttemptStartedAt &&
    (quality === "live" || (quality === "degraded" && device.state.lifecycle === "connected")) &&
    !deviceEvidence.firstConnectionObservedAt
  ) {
    deviceEvidence.firstConnectionObservedAt = receivedAt;
  }
  if (quality === "live") {
    if (!deviceEvidence.firstLiveUpdateAt) {
      deviceEvidence.firstLiveUpdateAt = receivedAt;
    }
    deviceEvidence.lastLiveUpdateAt = receivedAt;
    deviceEvidence.liveUpdateTimes.push(receivedAt);
    const latencyMs = Date.now() - Date.parse(receivedAt);
    if (Number.isFinite(latencyMs) && latencyMs >= 0) {
      deviceEvidence.eventLatenciesMs.push(latencyMs);
    }
  }

  for (const capability of device.capabilities) {
    rememberCapability(deviceEvidence, capability.key, capabilityValue(device, capability.key), capability.support, capability.quality);
  }
}

function rememberCapability(deviceEvidence, key, value, support, quality) {
  const capability = getOrCreate(deviceEvidence.capabilities, key, () => ({
    liveCount: 0,
    liveDescriptorCount: 0,
    unavailableCount: 0,
    degradedCount: 0,
    values: new Set()
  }));
  if (quality === "live") {
    capability.liveDescriptorCount += 1;
    if (support === "supported") {
      capability.liveCount += 1;
      capability.values.add(String(value ?? "observed"));
    } else {
      capability.unavailableCount += 1;
    }
  } else if (deviceEvidence.firstLiveUpdateAt && (quality === "degraded" || quality === "stale" || quality === "unavailable")) {
    capability.degradedCount += 1;
  }
}

function classifyCapability(deviceId, key, evidence) {
  const deviceEvidence = evidence.get(deviceId);
  const capability = deviceEvidence?.capabilities.get(key);
  if (!deviceEvidence?.connectionAttemptStartedAt || deviceEvidence.liveUpdateTimes.length === 0 || !capability) {
    return "not-tested";
  }
  if (capability.liveCount === 0 && capability.liveDescriptorCount > 0) {
    return "unavailable";
  }
  if (capability.unavailableCount > 0 || capability.degradedCount > capability.liveCount) {
    return "unreliable";
  }
  if (capability.values.size > 1) {
    return "proven-live";
  }
  return "proven-static";
}

function summarizeConnectionEvidence(printer, evidence) {
  const deviceEvidence = evidence.get(printer.id);
  const firstObservedAt = deviceEvidence?.firstLiveUpdateAt ?? deviceEvidence?.firstConnectionObservedAt ?? null;
  const latencyMs = elapsedMs(deviceEvidence?.connectionAttemptStartedAt, firstObservedAt);
  return {
    id: printer.id,
    modelHint: printer.modelHint,
    connectionAttemptStartedAt: deviceEvidence?.connectionAttemptStartedAt ?? null,
    initialConnectionResult: initialConnectionResult(printer, deviceEvidence),
    initialConnectionObservedAt: firstObservedAt,
    initialConnectionLatencyMs: latencyMs,
    finalPreStopConnectionState: printer.connectionState,
    lastObservationAt: printer.lastObservationAt ?? null,
    redactedFailureCategory: redactedFailureCategory(printer, deviceEvidence)
  };
}

function summarizeUpdateEvidence(deviceEvidence) {
  const liveUpdateTimes = deviceEvidence?.liveUpdateTimes ?? [];
  return {
    observedLiveUpdates: liveUpdateTimes.length,
    firstUpdateAt: liveUpdateTimes[0] ?? null,
    lastUpdateAt: liveUpdateTimes.at(-1) ?? null,
    cadenceMs: summarizeNumbers(intervalsMs(liveUpdateTimes)),
    eventLatencyMs: summarizeNumbers(deviceEvidence?.eventLatenciesMs ?? [])
  };
}

function initialConnectionResult(printer, deviceEvidence) {
  if (deviceEvidence?.firstLiveUpdateAt) {
    return "status-observed";
  }
  if (deviceEvidence?.firstConnectionObservedAt) {
    return "transport-connected-no-status";
  }
  if (printer.connectionState === "reconnecting") {
    return "reconnecting-before-status";
  }
  if (printer.connectionState === "unavailable") {
    return "unavailable-before-status";
  }
  return "no-status-observed";
}

function redactedFailureCategory(printer, deviceEvidence) {
  if (printer.lastFailureCategory && printer.lastFailureCategory !== "none") {
    return printer.lastFailureCategory;
  }
  if (!deviceEvidence?.firstConnectionObservedAt) {
    return "no-connection-observed";
  }
  if (!deviceEvidence.firstLiveUpdateAt) {
    return "no-live-status-observed";
  }
  return "none";
}

function capabilityValue(device, key) {
  switch (key) {
    case "printer.status":
      return device.state.lifecycle;
    case "print.progress":
      return device.state.telemetry.print?.progressPercent;
    case "temperature.nozzle":
      return device.state.telemetry.temperatures?.nozzleC;
    case "temperature.bed":
      return device.state.telemetry.temperatures?.bedC;
    case "temperature.chamber":
      return device.state.telemetry.temperatures?.chamberC;
    default:
      return undefined;
  }
}

function getDeviceEvidence(evidence, deviceId) {
  return getOrCreate(evidence, deviceId, () => ({
    configuredAt: null,
    connectionAttemptStartedAt: null,
    firstConnectionObservedAt: null,
    firstLiveUpdateAt: null,
    lastLiveUpdateAt: null,
    liveUpdateTimes: [],
    eventLatenciesMs: [],
    capabilities: new Map()
  }));
}

function summarizeNumbers(values) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted.at(-1),
    average: Math.round(sorted.reduce((sum, value) => sum + value, 0) / sorted.length)
  };
}

function intervalsMs(timestamps) {
  const intervals = [];
  for (let index = 1; index < timestamps.length; index += 1) {
    const interval = Date.parse(timestamps[index]) - Date.parse(timestamps[index - 1]);
    if (Number.isFinite(interval) && interval >= 0) {
      intervals.push(interval);
    }
  }
  return intervals;
}

function elapsedMs(startedAt, observedAt) {
  if (!startedAt || !observedAt) {
    return null;
  }
  const elapsed = Date.parse(observedAt) - Date.parse(startedAt);
  return Number.isFinite(elapsed) && elapsed >= 0 ? elapsed : null;
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

function safeValidationErrorMessage(error) {
  if (error instanceof SyntaxError) {
    return "M2 local validation failed because the local JSON config could not be parsed.";
  }
  if (error instanceof Error && /^Missing required local validation field:/.test(error.message)) {
    return error.message;
  }
  return "M2 local validation failed. Review local-only config and printer reachability without sharing raw errors or private identifiers.";
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
