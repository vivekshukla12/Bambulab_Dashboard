// SPDX-License-Identifier: MPL-2.0

import type {
  BambuDiscoveredPrinterCandidate,
  BambuMqttsStatusTransport,
  BambuStatusMessage,
  BambuTransportFactory,
  BambuTransportState
} from "@bpd/adapter-bambu-readonly";
import { randomUUID } from "node:crypto";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { access, mkdtemp, rm } from "node:fs/promises";
import { isIP } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_DISCOVERY_TIMEOUT_MS = 5_000;
const DEFAULT_BRIDGE_START_TIMEOUT_MS = 15_000;
const NETWORK_PLUGIN_SOURCE = "bambu-network-plugin" as const;

/** Runtime paths for the user-installed official Bambu component and this project-authored helper. */
export interface BambuNetworkPluginRuntimePaths {
  bridgeExecutablePath: string;
  pluginLibraryPath: string;
  studioExecutablePath: string;
  certificateFilePath: string;
}

/** Sanitized availability result for diagnostics and the local feasibility probe. */
export interface BambuNetworkPluginProbeResult {
  available: boolean;
  reason: "available" | "component-absent" | "unsupported-platform" | "untrusted-or-incompatible";
  pluginVersion?: string;
  abiPrefix?: string;
}

/** Handlers for one local read-only monitor process. */
export interface BambuNetworkPluginMonitorHandlers {
  onState(state: BambuTransportState): void;
  onStatus(payload: string, receivedAt: string): void;
  onError(error: Error): void;
}

/** Lifecycle handle returned by the native bridge runtime. */
export interface BambuNetworkPluginMonitor {
  ready: Promise<void>;
  stop(): Promise<void>;
}

/** Mockable boundary around the optional native helper. */
export interface BambuNetworkPluginBridgeRuntime {
  probe(): Promise<BambuNetworkPluginProbeResult>;
  discover(timeoutMs: number): Promise<unknown[]>;
  openMonitor(
    config: Parameters<BambuTransportFactory>[0],
    handlers: BambuNetworkPluginMonitorHandlers
  ): Promise<BambuNetworkPluginMonitor>;
}

/** Options for constructing the optional bridge runtime. */
export interface BambuNetworkPluginBridgeOptions {
  paths?: Partial<BambuNetworkPluginRuntimePaths>;
  env?: NodeJS.ProcessEnv;
  now?: () => Date;
  runtime?: BambuNetworkPluginBridgeRuntime;
}

/** Options for official-plugin discovery parsing and tests. */
export interface BambuNetworkPluginDiscoveryOptions extends BambuNetworkPluginBridgeOptions {
  timeoutMs?: number;
  idFactory?: () => string;
}

/** Resolves only normal official-install locations unless explicit local paths are supplied. */
export function resolveBambuNetworkPluginRuntimePaths(
  options: Pick<BambuNetworkPluginBridgeOptions, "env" | "paths"> = {}
): BambuNetworkPluginRuntimePaths {
  const env = options.env ?? process.env;
  const appData = env.APPDATA ?? "";
  const programFiles = env.ProgramFiles ?? "C:\\Program Files";
  const defaultBridge = fileURLToPath(new URL("../build/bambu-network-plugin-bridge.exe", import.meta.url));
  const studioExecutablePath =
    options.paths?.studioExecutablePath ??
    env.BPD_BAMBU_STUDIO_PATH ??
    path.join(programFiles, "Bambu Studio", "bambu-studio.exe");
  return {
    bridgeExecutablePath:
      options.paths?.bridgeExecutablePath ?? env.BPD_BAMBU_NETWORK_PLUGIN_BRIDGE_PATH ?? defaultBridge,
    pluginLibraryPath:
      options.paths?.pluginLibraryPath ??
      env.BPD_BAMBU_NETWORK_PLUGIN_PATH ??
      path.join(appData, "BambuStudio", "plugins", "bambu_networking.dll"),
    studioExecutablePath,
    certificateFilePath:
      options.paths?.certificateFilePath ??
      env.BPD_BAMBU_STUDIO_CERT_PATH ??
      path.join(path.dirname(studioExecutablePath), "resources", "cert", "slicer_base64.cer")
  };
}

/** Probes the signed user-installed official plugin without accessing user configuration or printer credentials. */
export async function probeBambuNetworkPlugin(
  options: BambuNetworkPluginBridgeOptions = {}
): Promise<BambuNetworkPluginProbeResult> {
  if (!options.runtime && process.platform !== "win32") {
    return { available: false, reason: "unsupported-platform" };
  }
  const runtime = options.runtime ?? new NativeBambuNetworkPluginRuntime(resolveBambuNetworkPluginRuntimePaths(options), options.now);
  try {
    return await runtime.probe();
  } catch (error) {
    return {
      available: false,
      reason: isMissingComponentError(error) ? "component-absent" : "untrusted-or-incompatible"
    };
  }
}

/**
 * Discovers local printers through the signed user-installed official Network Plugin. Private endpoints and serials
 * remain in the server-side candidate object and are omitted by the browser DTO boundary.
 */
export async function discoverBambuPrintersWithNetworkPlugin(
  options: BambuNetworkPluginDiscoveryOptions = {}
): Promise<BambuDiscoveredPrinterCandidate[]> {
  const runtime = options.runtime ?? new NativeBambuNetworkPluginRuntime(resolveBambuNetworkPluginRuntimePaths(options), options.now);
  const now = options.now ?? (() => new Date());
  const idFactory = options.idFactory ?? randomUUID;
  const timeoutMs = positiveInteger(options.timeoutMs, DEFAULT_DISCOVERY_TIMEOUT_MS);
  const payloads = await runtime.discover(timeoutMs);
  const candidates = new Map<string, BambuDiscoveredPrinterCandidate>();
  for (const payload of payloads) {
    const candidate = parseBambuNetworkPluginDiscoveryPayload(payload, {
      discoveredAt: now().toISOString(),
      idFactory
    });
    if (candidate) {
      candidates.set(`${candidate.host}:${candidate.port}`, candidate);
    }
  }
  return [...candidates.values()].sort((left, right) => left.displayName.localeCompare(right.displayName));
}

/** Creates an opt-in transport factory backed by the official plugin's local read-only callback surface. */
export function createBambuNetworkPluginTransportFactory(
  options: BambuNetworkPluginBridgeOptions = {}
): BambuTransportFactory {
  const runtime = options.runtime ?? new NativeBambuNetworkPluginRuntime(resolveBambuNetworkPluginRuntimePaths(options), options.now);
  const now = options.now ?? (() => new Date());
  return (config) => new OfficialPluginStatusTransport(config, runtime, now);
}

/** Parses one public discovery callback payload into a private server-side candidate. */
export function parseBambuNetworkPluginDiscoveryPayload(
  payload: unknown,
  options: { discoveredAt?: string; idFactory?: () => string } = {}
): BambuDiscoveredPrinterCandidate | undefined {
  let record: Record<string, unknown>;
  try {
    const parsed = typeof payload === "string" ? (JSON.parse(payload) as unknown) : payload;
    if (!isRecord(parsed)) {
      return undefined;
    }
    record = parsed;
  } catch {
    return undefined;
  }

  const host = stringValue(record.dev_ip);
  const serialNumber = stringValue(record.dev_id);
  if (!host || !isPrivateIpv4(host) || !serialNumber || !/^[A-Za-z0-9_-]{4,128}$/.test(serialNumber)) {
    return undefined;
  }
  const modelHint = modelHintFromPlugin(stringValue(record.dev_type));
  const displayName = sanitizeDiscoveryLabel(stringValue(record.dev_name)) || modelHint;
  return {
    id: `bambu-network-plugin-${(options.idFactory ?? randomUUID)()}`,
    displayName,
    modelHint,
    host,
    port: 8883,
    serialNumber,
    source: NETWORK_PLUGIN_SOURCE,
    discoveredAt: options.discoveredAt ?? new Date().toISOString(),
    endpointHint: "Official Bambu Network Plugin candidate; local read-only connection",
    requiresAccessCode: true,
    requiresSerialNumber: false
  };
}

class OfficialPluginStatusTransport implements BambuMqttsStatusTransport {
  private readonly statusListeners = new Set<(message: BambuStatusMessage) => void>();
  private readonly stateListeners = new Set<(state: BambuTransportState) => void>();
  private readonly errorListeners = new Set<(error: Error) => void>();
  private monitor: BambuNetworkPluginMonitor | undefined;
  private stopping = false;

  constructor(
    private readonly config: Parameters<BambuTransportFactory>[0],
    private readonly runtime: BambuNetworkPluginBridgeRuntime,
    private readonly now: () => Date
  ) {}

  async start(): Promise<void> {
    this.stopping = false;
    this.emitState("connecting");
    try {
      this.monitor = await this.runtime.openMonitor(this.config, {
        onState: (state) => this.emitState(state),
        onStatus: (payload, receivedAt) => {
          const message: BambuStatusMessage = {
            topic: "official-network-plugin/local/report",
            payload: Buffer.from(payload, "utf8"),
            receivedAt
          };
          for (const listener of this.statusListeners) {
            listener(message);
          }
        },
        onError: () => this.emitError()
      });
      await this.monitor.ready;
    } catch {
      this.emitError();
      throw new Error("Official Bambu Network Plugin transport failed to start.");
    }
  }

  async stop(): Promise<void> {
    this.stopping = true;
    const monitor = this.monitor;
    this.monitor = undefined;
    if (monitor) {
      await monitor.stop();
    }
    this.emitState("closed");
  }

  onStatus(listener: (message: BambuStatusMessage) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  onState(listener: (state: BambuTransportState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private emitState(state: BambuTransportState): void {
    if (this.stopping && state !== "closed") {
      return;
    }
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  private emitError(): void {
    const error = new Error("Official Bambu Network Plugin read-only transport failed.");
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }
}

class NativeBambuNetworkPluginRuntime implements BambuNetworkPluginBridgeRuntime {
  private readonly now: () => Date;

  constructor(
    private readonly paths: BambuNetworkPluginRuntimePaths,
    now?: () => Date
  ) {
    this.now = now ?? (() => new Date());
  }

  async probe(): Promise<BambuNetworkPluginProbeResult> {
    await assertFilesExist([
      this.paths.bridgeExecutablePath,
      this.paths.pluginLibraryPath,
      this.paths.studioExecutablePath
    ]);
    const events = await collectNativeEvents(this.spawn("probe"), DEFAULT_BRIDGE_START_TIMEOUT_MS);
    const probe = events.find((event) => event.type === "probe");
    if (!probe || probe.type !== "probe" || probe.available !== true) {
      throw new Error("Official plugin probe failed.");
    }
    const pluginVersion = stringValue(probe.pluginVersion);
    const abiPrefix = stringValue(probe.abiPrefix);
    if (!pluginVersion || !abiPrefix) {
      throw new Error("Official plugin probe returned an incomplete compatibility result.");
    }
    return {
      available: true,
      reason: "available",
      pluginVersion,
      abiPrefix
    };
  }

  async discover(timeoutMs: number): Promise<unknown[]> {
    await assertFilesExist(Object.values(this.paths));
    const runtimeDirectory = await mkdtemp(path.join(tmpdir(), "bpd-network-plugin-"));
    try {
      const events = await collectNativeEvents(
        this.spawn("discover", ["--config-dir", runtimeDirectory, "--timeout-ms", String(timeoutMs)]),
        timeoutMs + DEFAULT_BRIDGE_START_TIMEOUT_MS
      );
      return events
        .filter((event): event is NativePayloadEvent => event.type === "discovery" && typeof event.payloadBase64 === "string")
        .map((event) => decodePrivatePayload(event.payloadBase64));
    } finally {
      await rm(runtimeDirectory, { recursive: true, force: true });
    }
  }

  async openMonitor(
    config: Parameters<BambuTransportFactory>[0],
    handlers: BambuNetworkPluginMonitorHandlers
  ): Promise<BambuNetworkPluginMonitor> {
    await assertFilesExist(Object.values(this.paths));
    const runtimeDirectory = await mkdtemp(path.join(tmpdir(), "bpd-network-plugin-"));
    const child = this.spawn(
      "monitor",
      ["--config-dir", runtimeDirectory],
      {
        BPD_BRIDGE_DEVICE_ID: config.serialNumber,
        BPD_BRIDGE_HOST: config.host,
        BPD_BRIDGE_USERNAME: config.username,
        BPD_BRIDGE_ACCESS_CODE: config.accessCode
      }
    );
    return new NativeMonitor(child, runtimeDirectory, handlers, this.now);
  }

  private spawn(command: "probe" | "discover" | "monitor", extraArguments: string[] = [], privateEnv: NodeJS.ProcessEnv = {}) {
    const args = [
      command,
      "--plugin",
      this.paths.pluginLibraryPath,
      "--studio",
      this.paths.studioExecutablePath,
      ...extraArguments
    ];
    if (command !== "probe") {
      args.push("--cert-file", this.paths.certificateFilePath);
    }
    return spawn(this.paths.bridgeExecutablePath, args, {
      env: { ...minimalChildEnvironment(process.env), ...privateEnv },
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
  }
}

class NativeMonitor implements BambuNetworkPluginMonitor {
  readonly ready: Promise<void>;
  private readySettled = false;
  private stopping = false;
  private resolveReady!: () => void;
  private rejectReady!: (error: Error) => void;
  private buffer = "";

  constructor(
    private readonly child: ChildProcessWithoutNullStreams,
    private readonly runtimeDirectory: string,
    private readonly handlers: BambuNetworkPluginMonitorHandlers,
    private readonly now: () => Date
  ) {
    this.ready = new Promise<void>((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    const startTimer = setTimeout(() => this.failReady(), DEFAULT_BRIDGE_START_TIMEOUT_MS);
    this.child.stderr.resume();
    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (chunk: string) => this.consume(chunk));
    this.child.once("error", () => {
      clearTimeout(startTimer);
      this.failReady();
      this.handlers.onError(new Error("Official Network Plugin bridge process failed."));
    });
    this.child.once("exit", () => {
      clearTimeout(startTimer);
      this.failReady();
      if (!this.stopping) {
        this.handlers.onError(new Error("Official Network Plugin bridge process stopped."));
        this.handlers.onState("closed");
      }
      void rm(this.runtimeDirectory, { recursive: true, force: true });
    });
    this.ready.finally(() => clearTimeout(startTimer)).catch(() => undefined);
  }

  async stop(): Promise<void> {
    this.stopping = true;
    if (this.child.exitCode !== null) {
      await rm(this.runtimeDirectory, { recursive: true, force: true });
      return;
    }
    const exited = new Promise<void>((resolve) => this.child.once("exit", () => resolve()));
    this.child.stdin.end("stop\n");
    const killTimer = setTimeout(() => this.child.kill(), 2_000);
    await exited;
    clearTimeout(killTimer);
    await rm(this.runtimeDirectory, { recursive: true, force: true });
  }

  private consume(chunk: string): void {
    this.buffer += chunk;
    while (true) {
      const newline = this.buffer.indexOf("\n");
      if (newline < 0) {
        return;
      }
      const line = this.buffer.slice(0, newline).trim();
      this.buffer = this.buffer.slice(newline + 1);
      if (line) {
        this.handleLine(line);
      }
    }
  }

  private handleLine(line: string): void {
    let event: NativeEvent;
    try {
      const parsed = JSON.parse(line) as unknown;
      if (!isRecord(parsed) || typeof parsed.type !== "string") {
        return;
      }
      event = parsed as NativeEvent;
    } catch {
      return;
    }
    if (event.type === "ready") {
      this.readySettled = true;
      this.resolveReady();
      return;
    }
    if (event.type === "state" && (event.state === "connected" || event.state === "closed")) {
      this.handlers.onState(event.state);
      return;
    }
    if (event.type === "status" && typeof event.payloadBase64 === "string") {
      this.handlers.onStatus(decodePrivatePayload(event.payloadBase64), this.now().toISOString());
      return;
    }
    if (event.type === "error") {
      this.handlers.onError(new Error("Official Network Plugin reported a read-only connection failure."));
    }
  }

  private failReady(): void {
    if (!this.readySettled) {
      this.readySettled = true;
      this.rejectReady(new Error("Official Network Plugin bridge did not become ready."));
    }
  }
}

interface NativePayloadEvent extends Record<string, unknown> {
  type: "discovery" | "status";
  payloadBase64: string;
}

type NativeEvent =
  | ({ type: "probe"; available?: unknown; pluginVersion?: unknown; abiPrefix?: unknown } & Record<string, unknown>)
  | ({ type: "state"; state?: unknown } & Record<string, unknown>)
  | ({ type: "ready" | "complete" | "error" } & Record<string, unknown>)
  | NativePayloadEvent;

async function collectNativeEvents(
  child: ChildProcessWithoutNullStreams,
  timeoutMs: number
): Promise<NativeEvent[]> {
  return new Promise((resolve, reject) => {
    const events: NativeEvent[] = [];
    let buffer = "";
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      error ? reject(error) : resolve(events);
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(new Error("Official Network Plugin bridge timed out."));
    }, timeoutMs);
    child.stderr.resume();
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        try {
          const event = JSON.parse(line.trim()) as unknown;
          if (isRecord(event) && typeof event.type === "string") {
            events.push(event as NativeEvent);
          }
        } catch {
          // Native output is intentionally ignored unless it is a recognized structured event.
        }
      }
    });
    child.once("error", () => finish(new Error("Official Network Plugin bridge process failed.")));
    child.once("exit", (code) =>
      code === 0
        ? finish()
        : finish(Object.assign(new Error("Official Network Plugin bridge rejected the runtime."), { code: "BRIDGE_REJECTED" }))
    );
  });
}

async function assertFilesExist(paths: string[]): Promise<void> {
  try {
    await Promise.all(paths.map((item) => access(item)));
  } catch {
    throw Object.assign(new Error("Required official component is absent."), { code: "COMPONENT_ABSENT" });
  }
}

function minimalChildEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  return {
    SystemRoot: env.SystemRoot,
    WINDIR: env.WINDIR,
    PATH: env.PATH,
    TEMP: env.TEMP,
    TMP: env.TMP
  };
}

function decodePrivatePayload(value: string): string {
  return Buffer.from(value, "base64").toString("utf8");
}

function isMissingComponentError(error: unknown): boolean {
  return isRecord(error) && error.code === "COMPONENT_ABSENT";
}

function modelHintFromPlugin(value: string | undefined): string {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "N2S" || normalized === "A1 MINI" || normalized === "A1MINI") {
    return "A1 Mini";
  }
  if (normalized === "X2D" || normalized === "O1D") {
    return "X2D";
  }
  return "Bambu-compatible";
}

function sanitizeDiscoveryLabel(value: string | undefined): string {
  return (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[redacted]")
    .replace(/\b(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}\b/gi, "[redacted]")
    .replace(/\b(?=[A-Za-z0-9_-]{10,}\b)(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+\b/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function isPrivateIpv4(value: string): boolean {
  if (isIP(value) !== 4) {
    return false;
  }
  const [first = 0, second = 0] = value.split(".").map(Number);
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isInteger(value) && value > 0 ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
