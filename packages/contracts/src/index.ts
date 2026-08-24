// SPDX-License-Identifier: MPL-2.0

import type {
  CapabilityDescriptor,
  DeviceEvent,
  DeviceId,
  DeviceLifecycle,
  DeviceState,
  FreshnessQuality,
  NormalizedDevice
} from "@bpd/domain";

/**
 * Current public REST API version for the M1 prototype.
 */
export const API_VERSION = "v1" as const;

/**
 * Standard API envelope. The request identifier is safe to log and contains no secrets.
 */
export interface ApiEnvelope<T> {
  data: T;
  meta: {
    apiVersion: typeof API_VERSION;
    generatedAt: string;
    requestId: string;
  };
}

/**
 * Browser-safe capability DTO.
 */
export interface CapabilityDto extends CapabilityDescriptor {}

/**
 * Browser-safe device state DTO.
 */
export interface DeviceStateDto extends DeviceState {}

/**
 * Compact fleet card DTO.
 */
export interface DeviceSummaryDto {
  id: DeviceId;
  displayName: string;
  modelHint: string;
  adapterId: string;
  source: string;
  location?: string;
  lifecycle: DeviceLifecycle;
  quality: FreshnessQuality;
  statusMessage: string;
  updatedAt: string;
  progressPercent?: number;
  activeJobName?: string;
  capabilities: CapabilityDto[];
}

/**
 * Detailed device DTO for capability-driven pages.
 */
export interface DeviceDetailDto extends DeviceSummaryDto {
  firmwareVersion?: string;
  state: DeviceStateDto;
}

/**
 * Read-only health details exposed by M1 diagnostics.
 */
export interface HealthDto {
  server: {
    status: "ok" | "degraded";
    uptimeSeconds: number;
    startedAt: string;
  };
  database: {
    status: "ok" | "degraded";
    path: string;
    journalMode: string;
    foreignKeys: boolean;
  };
  simulator: {
    status: "ok" | "degraded";
    adapterId: string;
    scenario: string;
    devices: number;
    currentStep: number;
  };
  events: {
    status: "ok" | "degraded";
    subscribers: number;
    lastEventAt?: string;
  };
  discovery: {
    serviceName: string;
    targetHost: string;
    advertised: boolean;
    manualUrl: string;
    note: string;
  };
}

/**
 * Initial SSE event carrying the current fleet snapshot.
 */
export interface DeviceSnapshotEventDto {
  type: "device.snapshot";
  eventId: string;
  emittedAt: string;
  devices: DeviceSummaryDto[];
}

/**
 * Incremental SSE event carrying one changed device.
 */
export interface DeviceStateChangedEventDto {
  type: "device.state.changed";
  eventId: string;
  emittedAt: string;
  device: DeviceSummaryDto;
  state: DeviceStateDto;
}

/**
 * All M1 browser SSE payloads.
 */
export type SseEventDto = DeviceSnapshotEventDto | DeviceStateChangedEventDto;

/**
 * Wraps data in the versioned API envelope.
 */
export function envelope<T>(data: T, requestId: string, generatedAt = new Date().toISOString()): ApiEnvelope<T> {
  return {
    data,
    meta: {
      apiVersion: API_VERSION,
      generatedAt,
      requestId
    }
  };
}

/**
 * Converts a normalized device into the compact browser-safe fleet DTO.
 */
export function toDeviceSummaryDto(device: NormalizedDevice): DeviceSummaryDto {
  const summary: DeviceSummaryDto = {
    id: device.identity.id,
    displayName: device.identity.displayName,
    modelHint: device.identity.modelHint,
    adapterId: device.identity.adapterId,
    source: device.identity.source,
    lifecycle: device.state.lifecycle,
    quality: device.state.observation.quality,
    statusMessage: device.state.statusMessage,
    updatedAt: device.state.observation.receivedAt,
    capabilities: device.capabilities
  };
  if (device.identity.location) {
    summary.location = device.identity.location;
  }
  if (device.state.telemetry.print) {
    summary.progressPercent = device.state.telemetry.print.progressPercent;
    summary.activeJobName = device.state.telemetry.print.displayName;
  }
  return summary;
}

/**
 * Converts a normalized device into the browser-safe detail DTO.
 */
export function toDeviceDetailDto(device: NormalizedDevice): DeviceDetailDto {
  const detail: DeviceDetailDto = {
    ...toDeviceSummaryDto(device),
    state: device.state
  };
  if (device.identity.firmwareVersion) {
    detail.firmwareVersion = device.identity.firmwareVersion;
  }
  return detail;
}

/**
 * Converts a domain event to the public SSE event contract.
 */
export function toSseDeviceEventDto(event: DeviceEvent): DeviceStateChangedEventDto {
  return {
    type: "device.state.changed",
    eventId: event.eventId,
    emittedAt: event.emittedAt,
    device: toDeviceSummaryDto(event.device),
    state: event.device.state
  };
}
