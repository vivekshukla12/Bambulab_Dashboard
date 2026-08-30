// SPDX-License-Identifier: MPL-2.0

import { readFile } from "node:fs/promises";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const interactive = args.includes("--interactive");
const configArg = args.find((arg) => arg !== "--interactive") ?? "secrets/m2-printers.local.json";
const configPath = path.resolve(root, configArg);

await main().catch((error) => {
  console.error(safeValidationErrorMessage(error));
  process.exitCode = 1;
});

async function main() {
  const { createBambuReadonlyAdapter, discoverBambuPrinters } = await import("../packages/adapter-bambu-readonly/dist/index.js");
  const config = interactive ? await readInteractiveValidationConfig(discoverBambuPrinters) : await readValidationConfig(configPath);
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

async function readInteractiveValidationConfig(discoverBambuPrinters) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    throw new Error("Interactive validation requires a local TTY.");
  }

  const rl = createPromptInterface();
  try {
    console.error("M2 interactive validation keeps credentials in process memory only and does not write a config file.");
    console.error("Attempting server-side mDNS discovery for sanitized local candidates...");
    const candidates = await discoverBambuPrinters().catch(() => []);
    if (candidates.length === 0) {
      console.error("No sanitized mDNS candidates were found; manual host fallback remains available.");
    } else {
      for (const [index, candidate] of candidates.entries()) {
        console.error(`${index + 1}. ${candidate.displayName} / ${candidate.modelHint} (${candidate.endpointHint})`);
      }
    }

    const durationSeconds = positiveInteger(await promptWithDefault(rl, "Observation duration seconds [180]: ", "180"), 180);
    const printerCount = positiveInteger(await promptWithDefault(rl, "Printers to validate [2]: ", "2"), 2);
    const printers = [];

    for (let index = 0; index < printerCount; index += 1) {
      console.error(`Printer ${index + 1}`);
      const candidate = await chooseCandidate(rl, candidates);
      const displayName = await promptWithDefault(
        rl,
        `Display name [${candidate?.displayName ?? `Printer ${index + 1}`}]: `,
        candidate?.displayName ?? `Printer ${index + 1}`
      );
      const modelHint = await promptWithDefault(
        rl,
        `Model hint [${candidate?.modelHint ?? "Bambu-compatible"}]: `,
        candidate?.modelHint ?? "Bambu-compatible"
      );
      const id = await promptWithDefault(rl, `Sanitized id [${defaultPrinterId(displayName, index)}]: `, defaultPrinterId(displayName, index));
      const host = candidate?.host ?? (await promptRequired(rl, "Manual host/IP: ", "host"));
      const port = positiveInteger(
        await promptWithDefault(rl, `MQTTS port [${candidate?.port ?? 8883}]: `, String(candidate?.port ?? 8883)),
        candidate?.port ?? 8883
      );
      const tlsTrustProfile = await promptTlsTrustProfile(rl);
      const tlsServerName = await promptHiddenOptional(rl, "TLS server name override, optional (hidden): ");
      const serialNumber = await promptRequired(rl, "Serial number (hidden): ", "serialNumber", { hidden: true });
      const accessCode = await promptRequired(rl, "LAN Access Code (hidden): ", "accessCode", { hidden: true });
      const caCertificatePath = await promptWithDefault(rl, "CA certificate path, optional []: ", "");
      const printer = {
        id,
        displayName,
        modelHint,
        host,
        port,
        tlsTrustProfile,
        serialNumber,
        accessCode
      };
      if (tlsServerName) {
        printer.tlsServerName = tlsServerName;
      }
      if (caCertificatePath) {
        printer.caCertificatePath = caCertificatePath;
      }
      printers.push(printer);
    }

    return {
      durationSeconds,
      printers
    };
  } finally {
    rl.close();
  }
}

function createPromptInterface() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr, terminal: true });
  rl.stdoutMuted = false;
  const originalWriteToOutput = rl._writeToOutput.bind(rl);
  rl._writeToOutput = (stringToWrite) => {
    if (!rl.stdoutMuted) {
      originalWriteToOutput(stringToWrite);
    }
  };
  return rl;
}

async function promptWithDefault(rl, question, fallback) {
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
}

async function promptRequired(rl, question, field, options = {}) {
  const answer = options.hidden ? await promptHidden(rl, question) : (await rl.question(question)).trim();
  if (!answer) {
    throw new Error(`Missing required local validation field: ${field}.`);
  }
  return answer;
}

async function promptHidden(rl, question) {
  rl.output.write(question);
  rl.stdoutMuted = true;
  try {
    return (await rl.question("")).trim();
  } finally {
    rl.stdoutMuted = false;
    rl.output.write("\n");
  }
}

async function promptHiddenOptional(rl, question) {
  return promptHidden(rl, question);
}

async function promptTlsTrustProfile(rl) {
  const value = await promptWithDefault(rl, "TLS trust profile [local-printer-chain]: ", "local-printer-chain");
  return validateTlsTrustProfile(value);
}

async function chooseCandidate(rl, candidates) {
  if (candidates.length === 0) {
    return undefined;
  }
  const answer = await promptWithDefault(rl, "Candidate number, or Enter for manual fallback []: ", "");
  if (!answer) {
    return undefined;
  }
  const index = Number.parseInt(answer, 10) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= candidates.length) {
    throw new Error("Invalid interactive discovery candidate selection.");
  }
  return candidates[index];
}

function defaultPrinterId(displayName, index) {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `printer-${index + 1}`;
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
  if (printer.tlsServerName) {
    input.tlsServerName = requiredString(printer.tlsServerName, "tlsServerName");
  }
  input.tlsTrustProfile = validateTlsTrustProfile(printer.tlsTrustProfile ?? "local-printer-chain");
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
  if (error instanceof Error && error.message === "Interactive validation requires a local TTY.") {
    return error.message;
  }
  if (error instanceof Error && error.message === "Invalid interactive discovery candidate selection.") {
    return error.message;
  }
  if (error instanceof Error && error.message === "Invalid local validation TLS trust profile.") {
    return error.message;
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

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function validateTlsTrustProfile(value) {
  if (value === "system" || value === "local-printer-chain") {
    return value;
  }
  throw new Error("Invalid local validation TLS trust profile.");
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
