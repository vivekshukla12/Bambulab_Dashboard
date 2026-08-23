// SPDX-License-Identifier: MPL-2.0

/**
 * Identifies a dashboard device in normalized API, persistence and adapter contracts.
 */
export type DeviceId = string;

/**
 * Identifies the adapter that produced a device, capability or state observation.
 */
export type AdapterId = string;

/**
 * M1 support status for a normalized device capability.
 */
export type CapabilitySupport = "supported" | "unsupported" | "unknown";

/**
 * M1 exposes only readable device capabilities. Future controllable/configurable access must be separately governed.
 */
export type CapabilityAccess = "readable";

/**
 * Truthful quality/freshness state for a capability or current device snapshot.
 */
export type FreshnessQuality = "live" | "stale" | "unavailable" | "degraded";

/**
 * User-facing normalized lifecycle state. These are not printer commands.
 */
export type DeviceLifecycle = "connected" | "printing" | "stale" | "unavailable" | "reconnecting" | "recovered";

/**
 * Identifies common capability categories without hard-coding behavior to model names.
 */
export type CapabilityKey =
  | "printer.status"
  | "print.progress"
  | "temperature.nozzle"
  | "temperature.bed"
  | "temperature.chamber"
  | "network.wifi"
  | "filament.externalSpool"
  | "filament.amsSlots"
  | "camera.feed"
  | "energy.power";

/**
 * Metadata about the origin and quality of an observed value.
 */
export interface ObservationMetadata {
  /** Adapter source that normalized the value. */
  adapterId: AdapterId;
  /** Synthetic, future-real, or another approved source family. */
  source: string;
  /** Time reported by the source or simulator. */
  observedAt: string;
  /** Time accepted by the dashboard server. */
  receivedAt: string;
  /** Truthful current quality of this observation. */
  quality: FreshnessQuality;
}

/**
 * Runtime-discovered capability descriptor.
 */
export interface CapabilityDescriptor {
  key: CapabilityKey;
  label: string;
  support: CapabilitySupport;
  access: CapabilityAccess;
  quality: FreshnessQuality;
  source: string;
  updatedAt: string;
  notes?: string;
}

/**
 * Device identity stored independently from any vendor-private payload.
 */
export interface DeviceIdentity {
  id: DeviceId;
  displayName: string;
  modelHint: string;
  adapterId: AdapterId;
  source: string;
  location?: string;
  firmwareVersion?: string;
}

/**
 * Normalized temperature values. Unsupported sensors should be absent rather than fabricated.
 */
export interface TemperatureTelemetry {
  nozzleC?: number;
  bedC?: number;
  chamberC?: number;
}

/**
 * Normalized print progress. M1 contains only synthetic read-only values.
 */
export interface PrintJobSnapshot {
  jobId: string;
  displayName: string;
  stage: string;
  progressPercent: number;
  elapsedSeconds: number;
  remainingSeconds?: number;
}

/**
 * Current normalized read-only state for a device.
 */
export interface DeviceState {
  deviceId: DeviceId;
  sequence: number;
  lifecycle: DeviceLifecycle;
  statusMessage: string;
  telemetry: {
    temperatures?: TemperatureTelemetry;
    print?: PrintJobSnapshot;
  };
  observation: ObservationMetadata;
}

/**
 * Device registry entry plus current capabilities and initial state.
 */
export interface NormalizedDevice {
  identity: DeviceIdentity;
  capabilities: CapabilityDescriptor[];
  state: DeviceState;
}

/**
 * Runtime event emitted by read-only adapters and device-core.
 */
export interface DeviceEvent {
  type: "device.state.changed" | "device.registry.changed";
  eventId: string;
  emittedAt: string;
  device: NormalizedDevice;
}

/**
 * Returns true only when the supplied quality is safe to present as live.
 */
export function isLiveQuality(quality: FreshnessQuality): boolean {
  return quality === "live";
}

/**
 * Clamps a print-progress value into the API-supported 0-100 range.
 */
export function normalizeProgressPercent(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Creates a stable summary label for quality/freshness display and tests.
 */
export function summarizeQuality(quality: FreshnessQuality): string {
  switch (quality) {
    case "live":
      return "Live";
    case "stale":
      return "Stale";
    case "unavailable":
      return "Unavailable";
    case "degraded":
      return "Degraded";
  }
}
