// SPDX-License-Identifier: MPL-2.0

import type { AdapterEventListener, AdapterHealth, ReadOnlyDeviceAdapter } from "@bpd/adapter-api";
import type {
  CapabilityDescriptor,
  DeviceEvent,
  DeviceId,
  DeviceLifecycle,
  DeviceState,
  FreshnessQuality,
  NormalizedDevice,
  PrintJobSnapshot,
  TemperatureTelemetry
} from "@bpd/domain";
import { normalizeProgressPercent } from "@bpd/domain";
import { createHash, randomUUID } from "node:crypto";
import { createSocket } from "node:dgram";
import { readFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import { isIP } from "node:net";
import {
  connect as connectTls,
  type ConnectionOptions,
  type DetailedPeerCertificate,
  type PeerCertificate,
  type TLSSocket
} from "node:tls";

const ADAPTER_ID = "bambu-readonly-m2";
const SOURCE = "bambu-readonly";
const DEFAULT_PORT = 8883;
const DEFAULT_USERNAME = "bblp";
const DEFAULT_STALE_AFTER_MS = 30_000;
const DEFAULT_OFFLINE_AFTER_MS = 90_000;
const DEFAULT_RECONNECT_INITIAL_MS = 1_000;
const DEFAULT_RECONNECT_MAX_MS = 30_000;
const MQTT_CONNECT_TIMEOUT_MS = 10_000;
const DEFAULT_DISCOVERY_TIMEOUT_MS = 2_500;
const MDNS_MULTICAST_ADDRESS = "224.0.0.251";
const MDNS_PORT = 5353;
const BAMBULAB_MDNS_SERVICE_TYPES = ["_bambu._tcp.local", "_bblp._tcp.local", "_printer._tcp.local"];

/**
 * Runtime phase for one configured real printer connection.
 */
export type BambuConnectionPhase =
  | "configured"
  | "connecting"
  | "connected"
  | "stale"
  | "unavailable"
  | "reconnecting"
  | "stopped";

/**
 * Redacted failure categories safe for local validation evidence and diagnostics.
 */
export type BambuFailureCategory =
  | "none"
  | "start-failed"
  | "stream-closed"
  | "transport-error"
  | "malformed-status"
  | "stale-timeout"
  | "offline-timeout";

/**
 * TLS trust source for the credential-bearing MQTTS connection.
 */
export type BambuTlsTrustProfile = "system" | "local-printer-chain";

/**
 * User-provided M2 real-printer connection fields. Sensitive values remain process-memory only.
 */
export interface BambuPrinterConnectionInput {
  id?: DeviceId;
  displayName: string;
  modelHint: string;
  host: string;
  serialNumber: string;
  accessCode: string;
  port?: number;
  username?: string;
  caCertificatePath?: string;
  tlsServerName?: string;
  tlsTrustProfile?: BambuTlsTrustProfile;
  staleAfterMs?: number;
  offlineAfterMs?: number;
}

/**
 * Safe reconfiguration patch for an existing process-memory printer connection. Omitted private fields reuse the
 * current in-memory values; a supplied Access Code replaces the old credential.
 */
export interface BambuPrinterReconfigurationInput {
  candidateId?: string;
  displayName?: string;
  modelHint?: string;
  host?: string;
  serialNumber?: string;
  accessCode?: string;
  port?: number;
  username?: string;
  caCertificatePath?: string;
  tlsServerName?: string;
  tlsTrustProfile?: BambuTlsTrustProfile;
  staleAfterMs?: number;
  offlineAfterMs?: number;
}

/**
 * Credential-free connection summary safe for API and diagnostics.
 */
export interface SanitizedBambuPrinterConnection {
  id: DeviceId;
  displayName: string;
  modelHint: string;
  source: typeof SOURCE;
  configuredAt: string;
  connectionState: BambuConnectionPhase;
  credentialMode: "memory-only";
  lastObservationAt?: string;
}

/**
 * Credential-free connection diagnostics for local-only M2 validation evidence.
 */
export interface BambuConnectionDiagnostics extends SanitizedBambuPrinterConnection {
  lastFailureCategory: BambuFailureCategory;
}

/**
 * Sanitized server-side discovery candidate. Host remains server-side and must not be committed as evidence.
 */
export interface BambuDiscoveredPrinterCandidate {
  id: string;
  displayName: string;
  modelHint: string;
  host: string;
  port: number;
  source: "mdns";
  discoveredAt: string;
  endpointHint: string;
  requiresAccessCode: true;
}

/**
 * Options for bounded server-side printer discovery.
 */
export interface BambuPrinterDiscoveryOptions {
  timeoutMs?: number;
  serviceTypes?: string[];
  now?: () => Date;
}

/**
 * Production MQTTS transport configuration. Host, serial and access code must not be logged.
 */
export interface BambuMqttsTransportConfig {
  host: string;
  port: number;
  username: string;
  accessCode: string;
  serialNumber: string;
  caCertificatePath?: string;
  tlsServerName?: string;
  tlsTrustProfile: BambuTlsTrustProfile;
  clientId?: string;
  keepAliveSeconds?: number;
}

/**
 * Status message delivered by the read-only transport.
 */
export interface BambuStatusMessage {
  topic: string;
  payload: Buffer;
  receivedAt: string;
}

/**
 * Narrow transport state used by the adapter for freshness and recovery semantics.
 */
export type BambuTransportState = "connecting" | "connected" | "closed";

/**
 * MQTTS status transport boundary. Implementations may connect/subscribe/read only.
 */
export interface BambuMqttsStatusTransport {
  start(): Promise<void>;
  stop(): Promise<void>;
  onStatus(listener: (message: BambuStatusMessage) => void): () => void;
  onState(listener: (state: BambuTransportState) => void): () => void;
  onError(listener: (error: Error) => void): () => void;
}

/**
 * Creates a transport for one configured printer. Tests inject mocked transports here.
 */
export type BambuTransportFactory = (config: BambuMqttsTransportConfig) => BambuMqttsStatusTransport;

/**
 * Options for the bounded real read-only adapter.
 */
export interface BambuReadonlyAdapterOptions {
  transportFactory?: BambuTransportFactory;
  now?: () => Date;
  reconnectInitialMs?: number;
  reconnectMaxMs?: number;
}

interface InternalPrinterConfig {
  id: DeviceId;
  displayName: string;
  modelHint: string;
  host: string;
  port: number;
  username: string;
  serialNumber: string;
  accessCode: string;
  configuredAt: string;
  staleAfterMs: number;
  offlineAfterMs: number;
  caCertificatePath?: string;
  tlsServerName?: string;
  tlsTrustProfile: BambuTlsTrustProfile;
}

interface NormalizationContext {
  adapterId: string;
  source: string;
  deviceId: DeviceId;
  displayName: string;
  modelHint: string;
  sequence: number;
  receivedAt: string;
}

/**
 * Real read-only adapter for standard-mode local Bambu MQTTS status reports.
 */
export class BambuReadonlyAdapter implements ReadOnlyDeviceAdapter {
  readonly adapterId = ADAPTER_ID;
  private readonly listeners = new Set<AdapterEventListener>();
  private readonly sessions = new Map<DeviceId, PrinterSession>();
  private readonly transportFactory: BambuTransportFactory;
  private readonly now: () => Date;
  private readonly reconnectInitialMs: number;
  private readonly reconnectMaxMs: number;
  private started = false;
  private lastEventAt: string | undefined;
  private observationCount = 0;
  private nextGeneratedId = 1;

  constructor(options: BambuReadonlyAdapterOptions = {}) {
    this.transportFactory = options.transportFactory ?? ((config) => new NodeMqttsStatusTransport(config));
    this.now = options.now ?? (() => new Date());
    this.reconnectInitialMs = options.reconnectInitialMs ?? DEFAULT_RECONNECT_INITIAL_MS;
    this.reconnectMaxMs = options.reconnectMaxMs ?? DEFAULT_RECONNECT_MAX_MS;
  }

  async start(): Promise<void> {
    if (this.started) {
      return;
    }
    this.started = true;
    for (const session of this.sessions.values()) {
      await session.start();
    }
  }

  async stop(): Promise<void> {
    for (const session of this.sessions.values()) {
      await session.stop();
    }
    this.started = false;
  }

  async discoverDevices(): Promise<NormalizedDevice[]> {
    return [...this.sessions.values()].map((session) => session.currentDevice());
  }

  async getCurrentState(deviceId: DeviceId): Promise<DeviceState | undefined> {
    return this.sessions.get(deviceId)?.currentDevice().state;
  }

  subscribe(listener: AdapterEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  health(): AdapterHealth {
    const degraded = [...this.sessions.values()].some((session) => session.connectionState() !== "connected");
    const health: AdapterHealth = {
      adapterId: this.adapterId,
      status: degraded ? "degraded" : "ok",
      scenario: "m2-standard-mode-local-mqtts-readonly",
      devices: this.sessions.size,
      currentStep: this.observationCount
    };
    if (this.lastEventAt) {
      health.lastEventAt = this.lastEventAt;
    }
    return health;
  }

  /**
   * Configures one real printer with process-memory-only credentials and starts observation when the adapter is running.
   */
  async configurePrinter(input: BambuPrinterConnectionInput): Promise<SanitizedBambuPrinterConnection> {
    const config = this.toInternalConfig(input);
    await this.sessions.get(config.id)?.stop();
    const session = new PrinterSession({
      config,
      adapterId: this.adapterId,
      source: SOURCE,
      transportFactory: this.transportFactory,
      now: this.now,
      reconnectInitialMs: this.reconnectInitialMs,
      reconnectMaxMs: this.reconnectMaxMs,
      publish: (device) => this.publish(device)
    });
    this.sessions.set(config.id, session);
    this.publish(session.currentDevice());
    if (this.started) {
      await session.start();
    }
    return session.toSanitizedConnection();
  }

  /**
   * Reconfigures one existing printer without returning or exposing previous process-memory credentials.
   */
  async reconfigurePrinter(
    deviceId: DeviceId,
    input: BambuPrinterReconfigurationInput
  ): Promise<SanitizedBambuPrinterConnection | undefined> {
    const current = this.sessions.get(deviceId);
    if (!current) {
      return undefined;
    }
    return this.configurePrinter(current.toReconfiguredConnectionInput(input));
  }

  /**
   * Returns configured real-printer summaries without host, serial, access code or raw payload data.
   */
  listConfiguredPrinters(): SanitizedBambuPrinterConnection[] {
    return [...this.sessions.values()].map((session) => session.toSanitizedConnection());
  }

  /**
   * Returns credential-free connection diagnostics for local validation evidence.
   */
  listConnectionDiagnostics(): BambuConnectionDiagnostics[] {
    return [...this.sessions.values()].map((session) => session.toConnectionDiagnostics());
  }

  /**
   * Removes process-memory connection details for one configured real printer.
   */
  async forgetPrinter(deviceId: DeviceId): Promise<boolean> {
    const session = this.sessions.get(deviceId);
    if (!session) {
      return false;
    }
    await session.stop();
    this.sessions.delete(deviceId);
    return true;
  }

  private publish(device: NormalizedDevice): void {
    const event: DeviceEvent = {
      type: "device.state.changed",
      eventId: `${this.adapterId}-${device.identity.id}-${device.state.sequence}`,
      emittedAt: device.state.observation.receivedAt,
      device
    };
    this.lastEventAt = event.emittedAt;
    this.observationCount += 1;
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private toInternalConfig(input: BambuPrinterConnectionInput): InternalPrinterConfig {
    const id = sanitizeDeviceId(input.id) ?? `bambu-real-${this.nextGeneratedId++}`;
    const config: InternalPrinterConfig = {
      id,
      displayName: requireNonBlank(input.displayName, "displayName"),
      modelHint: requireNonBlank(input.modelHint, "modelHint"),
      host: requireNonBlank(input.host, "host"),
      port: input.port ?? DEFAULT_PORT,
      username: input.username ?? DEFAULT_USERNAME,
      serialNumber: requireNonBlank(input.serialNumber, "serialNumber"),
      accessCode: requireNonBlank(input.accessCode, "accessCode"),
      configuredAt: this.now().toISOString(),
      staleAfterMs: positiveInteger(input.staleAfterMs, DEFAULT_STALE_AFTER_MS),
      offlineAfterMs: positiveInteger(input.offlineAfterMs, DEFAULT_OFFLINE_AFTER_MS),
      tlsTrustProfile: input.tlsTrustProfile ?? "system"
    };
    if (input.caCertificatePath) {
      config.caCertificatePath = input.caCertificatePath;
    }
    if (input.tlsServerName) {
      config.tlsServerName = input.tlsServerName;
    }
    return config;
  }
}

/**
 * Factory for the M2 real read-only adapter.
 */
export function createBambuReadonlyAdapter(options?: BambuReadonlyAdapterOptions): BambuReadonlyAdapter {
  return new BambuReadonlyAdapter(options);
}

/**
 * Attempts server-side mDNS discovery for Bambu-compatible local printer candidates.
 */
export async function discoverBambuPrinters(
  options: BambuPrinterDiscoveryOptions = {}
): Promise<BambuDiscoveredPrinterCandidate[]> {
  const timeoutMs = positiveInteger(options.timeoutMs, DEFAULT_DISCOVERY_TIMEOUT_MS);
  const serviceTypes = (options.serviceTypes ?? BAMBULAB_MDNS_SERVICE_TYPES).map(normalizeDnsName);
  const discoveredAt = (options.now ?? (() => new Date()))().toISOString();

  return new Promise((resolve) => {
    const socket = createSocket({ type: "udp4", reuseAddr: true });
    const records: MdnsRecord[] = [];
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      try {
        socket.close();
      } catch {
        // Closing a UDP socket after a local discovery error has no evidence value.
      }
      resolve(candidatesFromMdnsRecords(records, serviceTypes, discoveredAt));
    };
    const timer = setTimeout(finish, timeoutMs);

    socket.on("message", (message) => {
      records.push(...parseMdnsRecords(message));
    });
    socket.once("error", finish);
    socket.bind(MDNS_PORT, () => {
      try {
        socket.addMembership(MDNS_MULTICAST_ADDRESS);
        socket.setMulticastTTL(1);
      } catch {
        finish();
        return;
      }
      for (const serviceType of serviceTypes) {
        const query = encodeMdnsPtrQuery(serviceType);
        socket.send(query, MDNS_PORT, MDNS_MULTICAST_ADDRESS, (error) => {
          if (error) {
            finish();
          }
        });
      }
    });
  });
}

interface PrinterSessionOptions {
  config: InternalPrinterConfig;
  adapterId: string;
  source: string;
  transportFactory: BambuTransportFactory;
  now: () => Date;
  reconnectInitialMs: number;
  reconnectMaxMs: number;
  publish(device: NormalizedDevice): void;
}

class PrinterSession {
  private readonly config: InternalPrinterConfig;
  private readonly adapterId: string;
  private readonly source: string;
  private readonly transportFactory: BambuTransportFactory;
  private readonly now: () => Date;
  private readonly reconnectInitialMs: number;
  private readonly reconnectMaxMs: number;
  private readonly publish: (device: NormalizedDevice) => void;
  private transport: BambuMqttsStatusTransport | undefined;
  private unsubscribers: Array<() => void> = [];
  private reconnectTimer: NodeJS.Timeout | undefined;
  private staleTimer: NodeJS.Timeout | undefined;
  private offlineTimer: NodeJS.Timeout | undefined;
  private phase: BambuConnectionPhase = "configured";
  private sequence = 0;
  private reconnectDelayMs: number;
  private device: NormalizedDevice;
  private observedStatusPayload: Record<string, unknown> | undefined;
  private lastObservationAt: string | undefined;
  private lastFailureCategory: BambuFailureCategory = "none";
  private recyclingTransport = false;
  private stopped = false;

  constructor(options: PrinterSessionOptions) {
    this.config = options.config;
    this.adapterId = options.adapterId;
    this.source = options.source;
    this.transportFactory = options.transportFactory;
    this.now = options.now;
    this.reconnectInitialMs = options.reconnectInitialMs;
    this.reconnectMaxMs = options.reconnectMaxMs;
    this.publish = options.publish;
    this.reconnectDelayMs = this.reconnectInitialMs;
    this.device = this.placeholderDevice("reconnecting", "degraded", "Configured real printer; waiting for first read-only status update.");
  }

  async start(): Promise<void> {
    this.stopped = false;
    await this.connect();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.clearTimers();
    await this.closeCurrentTransport();
    this.phase = "stopped";
  }

  currentDevice(): NormalizedDevice {
    return this.device;
  }

  connectionState(): BambuConnectionPhase {
    return this.phase;
  }

  toSanitizedConnection(): SanitizedBambuPrinterConnection {
    const connection: SanitizedBambuPrinterConnection = {
      id: this.config.id,
      displayName: this.config.displayName,
      modelHint: this.config.modelHint,
      source: SOURCE,
      configuredAt: this.config.configuredAt,
      connectionState: this.phase,
      credentialMode: "memory-only"
    };
    if (this.lastObservationAt) {
      connection.lastObservationAt = this.lastObservationAt;
    }
    return connection;
  }

  toConnectionDiagnostics(): BambuConnectionDiagnostics {
    return {
      ...this.toSanitizedConnection(),
      lastFailureCategory: this.lastFailureCategory
    };
  }

  toReconfiguredConnectionInput(input: BambuPrinterReconfigurationInput): BambuPrinterConnectionInput {
    const next: BambuPrinterConnectionInput = {
      id: this.config.id,
      displayName: optionalNonBlank(input.displayName) ?? this.config.displayName,
      modelHint: optionalNonBlank(input.modelHint) ?? this.config.modelHint,
      host: optionalNonBlank(input.host) ?? this.config.host,
      serialNumber: optionalNonBlank(input.serialNumber) ?? this.config.serialNumber,
      accessCode: optionalNonBlank(input.accessCode) ?? this.config.accessCode,
      port: input.port ?? this.config.port,
      username: optionalNonBlank(input.username) ?? this.config.username,
      staleAfterMs: input.staleAfterMs ?? this.config.staleAfterMs,
      offlineAfterMs: input.offlineAfterMs ?? this.config.offlineAfterMs,
      tlsTrustProfile: input.tlsTrustProfile ?? this.config.tlsTrustProfile
    };
    const caCertificatePath = optionalNonBlank(input.caCertificatePath) ?? this.config.caCertificatePath;
    const tlsServerName = optionalNonBlank(input.tlsServerName) ?? this.config.tlsServerName;
    if (caCertificatePath) {
      next.caCertificatePath = caCertificatePath;
    }
    if (tlsServerName) {
      next.tlsServerName = tlsServerName;
    }
    return next;
  }

  private async connect(): Promise<void> {
    if (this.stopped) {
      return;
    }
    this.phase = this.phase === "unavailable" ? "reconnecting" : "connecting";
    this.publishTransition("degraded", "Connecting to real printer read-only status stream.");
    await this.closeCurrentTransport();
    if (this.stopped) {
      return;
    }
    const transportConfig: BambuMqttsTransportConfig = {
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      accessCode: this.config.accessCode,
      serialNumber: this.config.serialNumber,
      tlsTrustProfile: this.config.tlsTrustProfile
    };
    if (this.config.caCertificatePath) {
      transportConfig.caCertificatePath = this.config.caCertificatePath;
    }
    if (this.config.tlsServerName) {
      transportConfig.tlsServerName = this.config.tlsServerName;
    }
    this.transport = this.transportFactory(transportConfig);
    this.unsubscribers.push(
      this.transport.onStatus((message) => this.handleStatus(message)),
      this.transport.onState((state) => this.handleTransportState(state)),
      this.transport.onError(() => this.handleTransportError())
    );
    this.scheduleFreshnessTimers();

    try {
      await this.transport.start();
    } catch {
      await this.recoverTransport("start-failed", "Read-only status stream failed to start; reconnecting with bounded backoff.");
    }
  }

  private handleStatus(message: BambuStatusMessage): void {
    try {
      this.sequence += 1;
      this.phase = "connected";
      this.reconnectDelayMs = this.reconnectInitialMs;
      this.lastObservationAt = message.receivedAt;
      const payload = parseBambuStatusPayload(message.payload);
      this.observedStatusPayload = mergeBambuStatusPayload(this.observedStatusPayload, payload);
      this.device = normalizeBambuStatusPayload(this.observedStatusPayload, {
        adapterId: this.adapterId,
        source: this.source,
        deviceId: this.config.id,
        displayName: this.config.displayName,
        modelHint: this.config.modelHint,
        sequence: this.sequence,
        receivedAt: message.receivedAt
      });
      this.scheduleFreshnessTimers();
      this.publish(this.device);
    } catch {
      this.lastFailureCategory = "malformed-status";
      this.phase = "reconnecting";
      this.publishTransition("degraded", "Received malformed read-only printer status; waiting for the next valid update.");
    }
  }

  private handleTransportState(state: BambuTransportState): void {
    if (this.stopped) {
      return;
    }
    if (state === "connected") {
      this.phase = "connected";
      this.scheduleFreshnessTimers();
      if (!this.lastObservationAt) {
        this.publishTransition("degraded", "Connected to read-only status stream; waiting for printer status payload.");
      }
      return;
    }
    if (state === "closed") {
      void this.recoverTransport("stream-closed", "Read-only status stream interrupted; reconnecting with bounded backoff.");
    }
  }

  private handleTransportError(): void {
    if (this.stopped) {
      return;
    }
    void this.recoverTransport("transport-error", "Read-only status stream error; reconnecting with bounded backoff.");
  }

  private async recoverTransport(category: BambuFailureCategory, message: string): Promise<void> {
    if (this.stopped || this.recyclingTransport) {
      return;
    }
    this.lastFailureCategory = category;
    this.phase = "reconnecting";
    this.publishTransition("degraded", message);
    this.clearFreshnessTimers();
    await this.closeCurrentTransport();
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.stopped) {
      return;
    }
    const delayMs = this.reconnectDelayMs;
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, this.reconnectMaxMs);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.connect();
    }, delayMs);
  }

  private scheduleFreshnessTimers(): void {
    if (this.stopped) {
      return;
    }
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
    }
    if (this.offlineTimer) {
      clearTimeout(this.offlineTimer);
    }
    this.staleTimer = setTimeout(() => {
      this.lastFailureCategory = "stale-timeout";
      this.phase = "stale";
      this.publishTransition("stale", "No fresh real-printer status update within the observed freshness window.");
    }, this.config.staleAfterMs);
    this.offlineTimer = setTimeout(() => {
      void this.markUnavailableAndReconnect();
    }, this.config.offlineAfterMs);
  }

  private async markUnavailableAndReconnect(): Promise<void> {
    if (this.stopped || this.recyclingTransport) {
      return;
    }
    this.lastFailureCategory = "offline-timeout";
    this.phase = "unavailable";
    this.sequence += 1;
    this.device = this.placeholderDevice("unavailable", "unavailable", "Real printer status stream unavailable.");
    this.publish(this.device);
    this.clearFreshnessTimers();
    await this.closeCurrentTransport();
    this.scheduleReconnect();
  }

  private publishTransition(quality: FreshnessQuality, message: string): void {
    this.sequence += 1;
    this.device = {
      ...this.device,
      state: {
        ...this.device.state,
        sequence: this.sequence,
        lifecycle: lifecycleFromPhase(this.phase),
        statusMessage: message,
        observation: {
          adapterId: this.adapterId,
          source: this.source,
          observedAt: this.lastObservationAt ?? this.now().toISOString(),
          receivedAt: this.now().toISOString(),
          quality
        }
      },
      capabilities: this.device.capabilities.map((capability) => ({
        ...capability,
        quality,
        updatedAt: this.now().toISOString()
      }))
    };
    this.publish(this.device);
  }

  private placeholderDevice(lifecycle: DeviceLifecycle, quality: FreshnessQuality, message: string): NormalizedDevice {
    const receivedAt = this.now().toISOString();
    return {
      identity: {
        id: this.config.id,
        displayName: this.config.displayName,
        modelHint: this.config.modelHint,
        adapterId: this.adapterId,
        source: this.source
      },
      capabilities: defaultCapabilities(this.adapterId, receivedAt, quality),
      state: {
        deviceId: this.config.id,
        sequence: this.sequence,
        lifecycle,
        statusMessage: message,
        telemetry: {},
        observation: {
          adapterId: this.adapterId,
          source: this.source,
          observedAt: receivedAt,
          receivedAt,
          quality
        }
      }
    };
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.clearFreshnessTimers();
  }

  private clearFreshnessTimers(): void {
    if (this.staleTimer) {
      clearTimeout(this.staleTimer);
      this.staleTimer = undefined;
    }
    if (this.offlineTimer) {
      clearTimeout(this.offlineTimer);
      this.offlineTimer = undefined;
    }
  }

  private clearTransportSubscriptions(): void {
    for (const unsubscribe of this.unsubscribers.splice(0)) {
      unsubscribe();
    }
  }

  private async closeCurrentTransport(): Promise<void> {
    const transport = this.transport;
    this.transport = undefined;
    this.clearTransportSubscriptions();
    if (!transport) {
      return;
    }
    this.recyclingTransport = true;
    try {
      await transport.stop();
    } catch {
      // Transport shutdown errors are intentionally reduced to the redacted category already recorded by the caller.
    } finally {
      this.recyclingTransport = false;
    }
  }
}

interface MdnsRecord {
  name: string;
  type: number;
  ptr?: string;
  srv?: {
    port: number;
    target: string;
  };
  txt?: Map<string, string>;
  address?: string;
}

interface MdnsReadNameResult {
  name: string;
  nextOffset: number;
}

function encodeMdnsPtrQuery(serviceType: string): Buffer {
  const header = Buffer.alloc(12);
  header.writeUInt16BE(1, 4);
  return Buffer.concat([header, encodeDnsName(serviceType), Buffer.from([0, 12, 0, 1])]);
}

function encodeDnsName(name: string): Buffer {
  const labels = normalizeDnsName(name).split(".");
  const chunks = labels.map((label) => Buffer.concat([Buffer.from([Buffer.byteLength(label)]), Buffer.from(label, "utf8")]));
  return Buffer.concat([...chunks, Buffer.from([0])]);
}

function parseMdnsRecords(message: Buffer): MdnsRecord[] {
  if (message.length < 12) {
    return [];
  }
  let offset = 12;
  const questionCount = message.readUInt16BE(4);
  const answerCount = message.readUInt16BE(6);
  const authorityCount = message.readUInt16BE(8);
  const additionalCount = message.readUInt16BE(10);

  for (let index = 0; index < questionCount; index += 1) {
    const questionName = readDnsName(message, offset);
    offset = questionName.nextOffset + 4;
    if (offset > message.length) {
      return [];
    }
  }

  const records: MdnsRecord[] = [];
  const recordCount = answerCount + authorityCount + additionalCount;
  for (let index = 0; index < recordCount; index += 1) {
    const recordName = readDnsName(message, offset);
    offset = recordName.nextOffset;
    if (offset + 10 > message.length) {
      break;
    }
    const type = message.readUInt16BE(offset);
    const rdLength = message.readUInt16BE(offset + 8);
    const rdOffset = offset + 10;
    const nextOffset = rdOffset + rdLength;
    if (nextOffset > message.length) {
      break;
    }
    const record: MdnsRecord = {
      name: recordName.name,
      type
    };
    if (type === 12) {
      record.ptr = readDnsName(message, rdOffset).name;
    } else if (type === 33 && rdLength >= 6) {
      record.srv = {
        port: message.readUInt16BE(rdOffset + 4),
        target: readDnsName(message, rdOffset + 6).name
      };
    } else if (type === 16) {
      record.txt = parseTxtRecord(message.subarray(rdOffset, nextOffset));
    } else if (type === 1 && rdLength === 4) {
      record.address = [...message.subarray(rdOffset, nextOffset)].join(".");
    }
    records.push(record);
    offset = nextOffset;
  }
  return records;
}

function readDnsName(message: Buffer, offset: number, depth = 0): MdnsReadNameResult {
  if (depth > 8 || offset >= message.length) {
    return { name: "", nextOffset: offset };
  }
  const labels: string[] = [];
  let cursor = offset;
  let nextOffset = offset;
  let jumped = false;

  while (cursor < message.length) {
    const length = message[cursor] ?? 0;
    if (length === 0) {
      if (!jumped) {
        nextOffset = cursor + 1;
      }
      break;
    }
    if ((length & 0xc0) === 0xc0) {
      if (cursor + 1 >= message.length) {
        break;
      }
      const pointer = ((length & 0x3f) << 8) | (message[cursor + 1] ?? 0);
      if (!jumped) {
        nextOffset = cursor + 2;
      }
      const pointed = readDnsName(message, pointer, depth + 1);
      if (pointed.name) {
        labels.push(pointed.name);
      }
      jumped = true;
      break;
    }
    if ((length & 0xc0) !== 0 || cursor + 1 + length > message.length) {
      break;
    }
    cursor += 1;
    labels.push(message.subarray(cursor, cursor + length).toString("utf8"));
    cursor += length;
    if (!jumped) {
      nextOffset = cursor;
    }
  }

  return {
    name: normalizeDnsName(labels.join(".")),
    nextOffset
  };
}

function parseTxtRecord(data: Buffer): Map<string, string> {
  const txt = new Map<string, string>();
  let offset = 0;
  while (offset < data.length) {
    const length = data[offset] ?? 0;
    offset += 1;
    if (length === 0 || offset + length > data.length) {
      continue;
    }
    const entry = data.subarray(offset, offset + length).toString("utf8");
    offset += length;
    const separator = entry.indexOf("=");
    if (separator === -1) {
      txt.set(entry.toLowerCase(), "true");
    } else {
      txt.set(entry.slice(0, separator).toLowerCase(), entry.slice(separator + 1));
    }
  }
  return txt;
}

function candidatesFromMdnsRecords(
  records: MdnsRecord[],
  serviceTypes: string[],
  discoveredAt: string
): BambuDiscoveredPrinterCandidate[] {
  const services = new Map<string, { serviceType: string; srv?: MdnsRecord["srv"]; txt?: Map<string, string> }>();
  const addresses = new Map<string, string>();

  for (const record of records) {
    if (record.type === 12 && record.ptr && serviceTypes.includes(record.name)) {
      const existing = services.get(record.ptr) ?? { serviceType: record.name };
      services.set(record.ptr, existing);
    }
    const serviceType = serviceTypeForInstance(record.name, serviceTypes);
    if (serviceType && (record.srv || record.txt)) {
      const existing = services.get(record.name) ?? { serviceType };
      if (record.srv) {
        existing.srv = record.srv;
      }
      if (record.txt) {
        existing.txt = record.txt;
      }
      services.set(record.name, existing);
    }
    if (record.address) {
      addresses.set(record.name, record.address);
    }
  }

  const candidates = new Map<string, BambuDiscoveredPrinterCandidate>();
  for (const [serviceName, service] of services) {
    const host = service.srv?.target;
    if (!host || !looksLikeBambuCandidate(serviceName, service.serviceType, service.txt)) {
      continue;
    }
    const port = service.serviceType === "_printer._tcp.local" ? DEFAULT_PORT : service.srv?.port ?? DEFAULT_PORT;
    const endpointHost = stripLocalRoot(host);
    const address = addresses.get(host);
    const id = candidateId(serviceName, endpointHost, port);
    candidates.set(id, {
      id,
      displayName: sanitizeDiscoveryLabel(instanceName(serviceName, service.serviceType)),
      modelHint: inferDiscoveredModelHint(serviceName, service.txt),
      host: endpointHost || address || host,
      port,
      source: "mdns",
      discoveredAt,
      endpointHint: `${service.serviceType} candidate on port ${port}`,
      requiresAccessCode: true
    });
  }
  return [...candidates.values()].sort((left, right) => left.displayName.localeCompare(right.displayName));
}

function serviceTypeForInstance(name: string, serviceTypes: string[]): string | undefined {
  return serviceTypes.find((serviceType) => name.endsWith(`.${serviceType}`));
}

function instanceName(serviceName: string, serviceType: string): string {
  return serviceName.endsWith(`.${serviceType}`) ? serviceName.slice(0, -serviceType.length - 1) : serviceName;
}

function looksLikeBambuCandidate(serviceName: string, serviceType: string, txt: Map<string, string> | undefined): boolean {
  if (serviceType === "_bambu._tcp.local" || serviceType === "_bblp._tcp.local") {
    return true;
  }
  const haystack = [serviceName, serviceType, ...(txt ? [...txt.values()] : [])].join(" ").toLowerCase();
  return haystack.includes("bambu") || haystack.includes("bblp");
}

function inferDiscoveredModelHint(serviceName: string, txt: Map<string, string> | undefined): string {
  const haystack = [serviceName, ...(txt ? [...txt.values()] : [])].join(" ").toLowerCase();
  if (haystack.includes("a1 mini") || haystack.includes("a1-mini")) {
    return "A1 Mini";
  }
  if (haystack.includes("x2d")) {
    return "X2D";
  }
  if (haystack.includes("x1")) {
    return "X1";
  }
  if (haystack.includes("p1")) {
    return "P1";
  }
  return "Bambu-compatible";
}

function sanitizeDiscoveryLabel(value: string): string {
  const normalized = value
    .replace(/([0-9a-f]{2}[:-]){5}[0-9a-f]{2}/gi, "[redacted]")
    .replace(/\b[a-z0-9]{10,}\b/gi, "[redacted]")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();
  return normalized.length > 0 ? normalized : "Discovered Bambu printer";
}

function candidateId(serviceName: string, host: string, port: number): string {
  const digest = createHash("sha256").update(`${serviceName}|${host}|${port}`).digest("hex").slice(0, 12);
  return `bambu-mdns-${digest}`;
}

function normalizeDnsName(value: string): string {
  return value.trim().replace(/\.$/, "").toLowerCase();
}

function stripLocalRoot(value: string): string {
  return value.replace(/\.$/, "");
}

/**
 * Parses a JSON Bambu status payload without exposing raw payloads beyond this package.
 */
export function parseBambuStatusPayload(payload: Buffer | string | unknown): Record<string, unknown> {
  if (Buffer.isBuffer(payload)) {
    return parseBambuStatusPayload(payload.toString("utf8"));
  }
  if (typeof payload === "string") {
    const parsed = JSON.parse(payload) as unknown;
    return parseBambuStatusPayload(parsed);
  }
  if (!isRecord(payload)) {
    throw new Error("Bambu status payload must be a JSON object.");
  }
  return payload;
}

/**
 * Normalizes a Bambu status payload into the shared read-only domain model.
 */
export function normalizeBambuStatusPayload(payload: Record<string, unknown>, context: NormalizationContext): NormalizedDevice {
  const print = isRecord(payload.print) ? payload.print : payload;
  const receivedAt = context.receivedAt;
  const firmwareVersion = stringField(print, "firmware_version", "firmwareVersion");
  const gcodeState = stringField(print, "gcode_state", "print_status", "state", "status") ?? "UNKNOWN";
  const progress = numberField(print, "mc_percent", "progress", "print_progress", "progress_percent");
  const temperatures: TemperatureTelemetry = {};
  const nozzleC = numberField(print, "nozzle_temper", "nozzle_temp", "nozzle_temperature");
  const bedC = numberField(print, "bed_temper", "bed_temp", "bed_temperature");
  const chamberC = numberField(print, "chamber_temper", "chamber_temp", "chamber_temperature");
  if (nozzleC !== undefined) {
    temperatures.nozzleC = nozzleC;
  }
  if (bedC !== undefined) {
    temperatures.bedC = bedC;
  }
  if (chamberC !== undefined) {
    temperatures.chamberC = chamberC;
  }

  const telemetry: DeviceState["telemetry"] = {};
  if (Object.keys(temperatures).length > 0) {
    telemetry.temperatures = temperatures;
  }
  const lifecycle = lifecycleFromGcodeState(gcodeState, progress);
  const printSnapshot = lifecycle === "printing" ? buildPrintSnapshot(print, context.deviceId, gcodeState, progress) : undefined;
  if (printSnapshot) {
    telemetry.print = printSnapshot;
  }
  const identity: NormalizedDevice["identity"] = {
    id: context.deviceId,
    displayName: context.displayName,
    modelHint: context.modelHint,
    adapterId: context.adapterId,
    source: context.source
  };
  if (firmwareVersion) {
    identity.firmwareVersion = firmwareVersion;
  }

  return {
    identity,
    capabilities: capabilitiesFromPayload(print, context.adapterId, receivedAt),
    state: {
      deviceId: context.deviceId,
      sequence: context.sequence,
      lifecycle,
      statusMessage: statusMessageFromLifecycle(lifecycle, gcodeState),
      telemetry,
      observation: {
        adapterId: context.adapterId,
        source: context.source,
        observedAt: receivedAt,
        receivedAt,
        quality: "live"
      }
    }
  };
}

function mergeBambuStatusPayload(
  previous: Record<string, unknown> | undefined,
  incoming: Record<string, unknown>
): Record<string, unknown> {
  if (!previous) {
    return mergeRecords({}, incoming);
  }
  return mergeRecords(previous, incoming);
}

function mergeRecords(previous: Record<string, unknown>, incoming: Record<string, unknown>): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...previous };
  for (const [key, value] of Object.entries(incoming)) {
    const existing = merged[key];
    merged[key] = isRecord(existing) && isRecord(value) ? mergeRecords(existing, value) : value;
  }
  return merged;
}

class NodeMqttsStatusTransport implements BambuMqttsStatusTransport {
  private readonly statusListeners = new Set<(message: BambuStatusMessage) => void>();
  private readonly stateListeners = new Set<(state: BambuTransportState) => void>();
  private readonly errorListeners = new Set<(error: Error) => void>();
  private socket: TLSSocket | undefined;
  private readBuffer = Buffer.alloc(0);
  private pingTimer: NodeJS.Timeout | undefined;
  private packetId = 1;

  constructor(private readonly config: BambuMqttsTransportConfig) {}

  async start(): Promise<void> {
    this.emitState("connecting");
    const localTlsProfile =
      !this.config.caCertificatePath && this.config.tlsTrustProfile === "local-printer-chain"
        ? await discoverLocalPrinterTlsProfile(this.config.host, this.config.port)
        : undefined;
    const ca = this.config.caCertificatePath ? await readFile(this.config.caCertificatePath) : localTlsProfile?.ca;
    const tlsOptions: ConnectionOptions = {
      host: this.config.host,
      port: this.config.port,
      rejectUnauthorized: true
    };
    const tlsServerName = this.config.tlsServerName ?? localTlsProfile?.serverName ?? (isIP(this.config.host) === 0 ? this.config.host : undefined);
    if (tlsServerName) {
      tlsOptions.servername = tlsServerName;
    }
    if (ca) {
      tlsOptions.ca = ca;
    }

    await new Promise<void>((resolve, reject) => {
      let connectTimer: NodeJS.Timeout | undefined;
      const socket = connectTls(tlsOptions, () => {
        if (connectTimer) {
          clearTimeout(connectTimer);
        }
        socket.write(
          encodeConnectPacket({
            clientId: this.config.clientId ?? `bpd-${randomUUID()}`,
            username: this.config.username,
            password: this.config.accessCode,
            keepAliveSeconds: this.config.keepAliveSeconds ?? 30
          })
        );
        resolve();
      });
      connectTimer = setTimeout(() => {
        const error = new Error("MQTTS read-only connection timed out.");
        this.emitError(error);
        socket.destroy(error);
        reject(error);
      }, MQTT_CONNECT_TIMEOUT_MS);
      this.socket = socket;
      socket.on("data", (chunk) => this.handleData(chunk));
      socket.on("error", (error) => {
        if (connectTimer) {
          clearTimeout(connectTimer);
        }
        this.emitError(error);
        reject(error);
      });
      socket.on("close", () => {
        if (connectTimer) {
          clearTimeout(connectTimer);
        }
        this.clearPingTimer();
        this.emitState("closed");
      });
    });
  }

  async stop(): Promise<void> {
    this.clearPingTimer();
    if (this.socket && !this.socket.destroyed) {
      this.socket.write(encodeSimplePacket(14));
      this.socket.end();
    }
    this.socket = undefined;
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

  private handleData(chunk: Buffer): void {
    this.readBuffer = Buffer.concat([this.readBuffer, chunk]);
    let packet: DecodedPacket | undefined;
    while ((packet = tryDecodePacket(this.readBuffer))) {
      this.readBuffer = this.readBuffer.subarray(packet.bytesConsumed);
      this.handlePacket(packet);
    }
  }

  private handlePacket(packet: DecodedPacket): void {
    if (packet.type === 2) {
      if (packet.payload[1] !== 0) {
        this.emitError(new Error("MQTTS broker rejected read-only connection."));
        this.socket?.end();
        return;
      }
      this.socket?.write(encodeSubscribePacket(this.nextPacketId(), `device/${this.config.serialNumber}/report`));
      return;
    }
    if (packet.type === 3) {
      const publish = decodePublishPacket(packet);
      this.emitStatus({
        topic: publish.topic,
        payload: publish.payload,
        receivedAt: new Date().toISOString()
      });
      return;
    }
    if (packet.type === 9) {
      this.emitState("connected");
      this.startPingTimer();
    }
  }

  private nextPacketId(): number {
    this.packetId = this.packetId >= 65_535 ? 1 : this.packetId + 1;
    return this.packetId;
  }

  private startPingTimer(): void {
    this.clearPingTimer();
    this.pingTimer = setInterval(() => {
      this.socket?.write(encodeSimplePacket(12));
    }, (this.config.keepAliveSeconds ?? 30) * 500);
  }

  private clearPingTimer(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = undefined;
    }
  }

  private emitStatus(message: BambuStatusMessage): void {
    for (const listener of this.statusListeners) {
      listener(message);
    }
  }

  private emitState(state: BambuTransportState): void {
    for (const listener of this.stateListeners) {
      listener(state);
    }
  }

  private emitError(error: Error): void {
    for (const listener of this.errorListeners) {
      listener(error);
    }
  }
}

interface LocalPrinterTlsProfile {
  ca: Buffer;
  serverName?: string;
}

async function discoverLocalPrinterTlsProfile(host: string, port: number): Promise<LocalPrinterTlsProfile> {
  return new Promise((resolve, reject) => {
    let connectTimer: NodeJS.Timeout | undefined;
    const socket = connectTls(
      {
        host,
        port,
        rejectUnauthorized: false
      },
      () => {
        if (connectTimer) {
          clearTimeout(connectTimer);
        }
        const certificate = socket.getPeerCertificate(true);
        socket.destroy();
        const profile = localPrinterTlsProfileFromCertificate(certificate);
        if (!profile) {
          reject(new Error("Local printer TLS profile could not be derived."));
          return;
        }
        resolve(profile);
      }
    );
    connectTimer = setTimeout(() => {
      const error = new Error("Local printer TLS profile probe timed out.");
      socket.destroy(error);
      reject(error);
    }, MQTT_CONNECT_TIMEOUT_MS);
    socket.once("error", (error) => {
      if (connectTimer) {
        clearTimeout(connectTimer);
      }
      reject(error);
    });
    socket.once("close", () => {
      if (connectTimer) {
        clearTimeout(connectTimer);
      }
    });
  });
}

function localPrinterTlsProfileFromCertificate(certificate: PeerCertificate | DetailedPeerCertificate): LocalPrinterTlsProfile | undefined {
  if (!certificate || !certificate.raw) {
    return undefined;
  }
  const caCertificates: Buffer[] = [];
  const seen = new Set<string>();
  let current = (certificate as DetailedPeerCertificate).issuerCertificate;
  while (current?.raw && !seen.has(current.fingerprint256)) {
    seen.add(current.fingerprint256);
    if (current.fingerprint256 !== certificate.fingerprint256) {
      caCertificates.push(current.raw);
    }
    current = current.issuerCertificate;
  }
  if (caCertificates.length === 0) {
    caCertificates.push(certificate.raw);
  }
  const commonName = certificate.subject?.CN;
  const serverName = (Array.isArray(commonName) ? commonName[0] : commonName)?.trim();
  return {
    ca: Buffer.from(caCertificates.map(pemFromDerCertificate).join("")),
    ...(serverName ? { serverName } : {})
  };
}

function pemFromDerCertificate(raw: Buffer): string {
  const base64 = raw.toString("base64").match(/.{1,64}/g)?.join("\n") ?? "";
  return `-----BEGIN CERTIFICATE-----\n${base64}\n-----END CERTIFICATE-----\n`;
}

interface DecodedPacket {
  type: number;
  flags: number;
  payload: Buffer;
  bytesConsumed: number;
}

function encodeConnectPacket(options: {
  clientId: string;
  username: string;
  password: string;
  keepAliveSeconds: number;
}): Buffer {
  const variableHeader = Buffer.concat([
    encodeUtf8("MQTT"),
    Buffer.from([4, 0xc2, options.keepAliveSeconds >> 8, options.keepAliveSeconds & 0xff])
  ]);
  const payload = Buffer.concat([encodeUtf8(options.clientId), encodeUtf8(options.username), encodeUtf8(options.password)]);
  return encodePacket(1, 0, Buffer.concat([variableHeader, payload]));
}

function encodeSubscribePacket(packetId: number, topic: string): Buffer {
  const payload = Buffer.concat([Buffer.from([packetId >> 8, packetId & 0xff]), encodeUtf8(topic), Buffer.from([0])]);
  return encodePacket(8, 2, payload);
}

function encodeSimplePacket(type: number): Buffer {
  return encodePacket(type, 0, Buffer.alloc(0));
}

function encodePacket(type: number, flags: number, payload: Buffer): Buffer {
  return Buffer.concat([Buffer.from([(type << 4) | flags]), encodeRemainingLength(payload.length), payload]);
}

function encodeUtf8(value: string): Buffer {
  const bytes = Buffer.from(value, "utf8");
  return Buffer.concat([Buffer.from([bytes.length >> 8, bytes.length & 0xff]), bytes]);
}

function encodeRemainingLength(length: number): Buffer {
  const bytes: number[] = [];
  let remaining = length;
  do {
    let encoded = remaining % 128;
    remaining = Math.floor(remaining / 128);
    if (remaining > 0) {
      encoded |= 128;
    }
    bytes.push(encoded);
  } while (remaining > 0);
  return Buffer.from(bytes);
}

function tryDecodePacket(buffer: Buffer): DecodedPacket | undefined {
  if (buffer.length < 2) {
    return undefined;
  }
  let multiplier = 1;
  let value = 0;
  let index = 1;
  let encodedByte = 0;
  do {
    if (index >= buffer.length) {
      return undefined;
    }
    encodedByte = buffer[index] ?? 0;
    value += (encodedByte & 127) * multiplier;
    multiplier *= 128;
    index += 1;
  } while ((encodedByte & 128) !== 0);

  const bytesConsumed = index + value;
  if (buffer.length < bytesConsumed) {
    return undefined;
  }

  const header = buffer[0] ?? 0;
  return {
    type: header >> 4,
    flags: header & 0x0f,
    payload: buffer.subarray(index, bytesConsumed),
    bytesConsumed
  };
}

function decodePublishPacket(packet: DecodedPacket): { topic: string; payload: Buffer } {
  const topicLength = packet.payload.readUInt16BE(0);
  const topic = packet.payload.subarray(2, 2 + topicLength).toString("utf8");
  const qos = (packet.flags & 0x06) >> 1;
  const payloadOffset = 2 + topicLength + (qos > 0 ? 2 : 0);
  return {
    topic,
    payload: packet.payload.subarray(payloadOffset)
  };
}

function capabilitiesFromPayload(
  print: Record<string, unknown>,
  adapterId: string,
  updatedAt: string
): CapabilityDescriptor[] {
  return [
    capability("printer.status", "Printer status", hasAny(print, "gcode_state", "print_status", "state", "status"), adapterId, updatedAt),
    capability("print.progress", "Print progress", hasAny(print, "mc_percent", "progress", "print_progress", "progress_percent"), adapterId, updatedAt),
    capability("temperature.nozzle", "Nozzle temperature", hasAny(print, "nozzle_temper", "nozzle_temp", "nozzle_temperature"), adapterId, updatedAt),
    capability("temperature.bed", "Bed temperature", hasAny(print, "bed_temper", "bed_temp", "bed_temperature"), adapterId, updatedAt),
    capability("temperature.chamber", "Chamber temperature", hasAny(print, "chamber_temper", "chamber_temp", "chamber_temperature"), adapterId, updatedAt),
    capability("network.wifi", "Wi-Fi signal", hasAny(print, "wifi_signal", "wifiSignal"), adapterId, updatedAt),
    capability("filament.amsSlots", "AMS slot telemetry", hasAny(print, "ams", "ams_status", "ams_rfid_status"), adapterId, updatedAt)
  ];
}

function defaultCapabilities(adapterId: string, updatedAt: string, quality: FreshnessQuality): CapabilityDescriptor[] {
  const descriptors = capabilitiesFromPayload({}, adapterId, updatedAt);
  return descriptors.map((descriptor) => ({ ...descriptor, quality }));
}

function capability(
  key: CapabilityDescriptor["key"],
  label: string,
  observed: boolean,
  adapterId: string,
  updatedAt: string
): CapabilityDescriptor {
  const descriptor: CapabilityDescriptor = {
    key,
    label,
    support: observed ? "supported" : "unknown",
    access: "readable",
    quality: "live",
    source: adapterId,
    updatedAt
  };
  if (!observed) {
    descriptor.notes = "Not yet observed through the approved read-only path.";
  }
  return descriptor;
}

function buildPrintSnapshot(
  print: Record<string, unknown>,
  deviceId: DeviceId,
  gcodeState: string,
  progress: number | undefined
): PrintJobSnapshot | undefined {
  if (progress === undefined) {
    return undefined;
  }
  const jobId =
    stringField(print, "task_id", "subtask_id", "project_id", "gcode_file") ?? `${deviceId}-observed-print`;
  const displayName = stringField(print, "subtask_name", "gcode_file", "project_name") ?? "Printer-reported active print";
  const snapshot: PrintJobSnapshot = {
    jobId,
    displayName,
    stage: gcodeState.toLowerCase(),
    progressPercent: normalizeProgressPercent(progress),
    elapsedSeconds: Math.max(0, numberField(print, "print_duration", "elapsed_time", "mc_print_time") ?? 0)
  };
  const remainingMinutes = numberField(print, "mc_remaining_time");
  const remainingSeconds = numberField(print, "remaining_seconds", "remaining_time_s");
  if (remainingSeconds !== undefined) {
    snapshot.remainingSeconds = Math.max(0, remainingSeconds);
  } else if (remainingMinutes !== undefined) {
    snapshot.remainingSeconds = Math.max(0, remainingMinutes * 60);
  }
  return snapshot;
}

function lifecycleFromGcodeState(state: string, progress: number | undefined): DeviceLifecycle {
  const normalized = state.toUpperCase();
  if (["RUNNING", "PRINTING", "PAUSE", "PAUSED", "PREPARE", "SLICING", "RESUME"].includes(normalized)) {
    return "printing";
  }
  if (["IDLE", "FINISH", "FINISHED", "COMPLETED", "FAILED", "CANCEL", "CANCELED", "CANCELLED"].includes(normalized)) {
    return "connected";
  }
  if (progress !== undefined && progress > 0 && progress < 100) {
    return "printing";
  }
  return "connected";
}

function lifecycleFromPhase(phase: BambuConnectionPhase): DeviceLifecycle {
  switch (phase) {
    case "stale":
      return "stale";
    case "unavailable":
      return "unavailable";
    case "reconnecting":
    case "connecting":
      return "reconnecting";
    case "connected":
      return "connected";
    case "configured":
    case "stopped":
      return "connected";
  }
}

function statusMessageFromLifecycle(lifecycle: DeviceLifecycle, gcodeState: string): string {
  if (lifecycle === "printing") {
    return `Real printer reports ${gcodeState.toLowerCase()} with live read-only progress.`;
  }
  return `Real printer reports ${gcodeState.toLowerCase()} through the read-only status path.`;
}

function hasAny(record: Record<string, unknown>, ...keys: string[]): boolean {
  return keys.some((key) => record[key] !== undefined && record[key] !== null && record[key] !== "");
}

function numberField(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number.parseFloat(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

function stringField(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return value.toString();
    }
  }
  return undefined;
}

function requireNonBlank(value: string | undefined, field: string): string {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required Bambu printer field: ${field}.`);
  }
  return value.trim();
}

function optionalNonBlank(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && value && value > 0 ? Math.round(value) : fallback;
}

function sanitizeDeviceId(value: string | undefined): DeviceId | undefined {
  if (!value) {
    return undefined;
  }
  const sanitized = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-");
  return sanitized.length > 0 ? sanitized : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
