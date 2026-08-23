// SPDX-License-Identifier: MPL-2.0

import type {
  ApiEnvelope,
  DeviceDetailDto,
  DeviceSnapshotEventDto,
  DeviceStateChangedEventDto,
  DeviceSummaryDto,
  HealthDto,
  SseEventDto
} from "@bpd/contracts";

/**
 * Loads the current fleet snapshot through the versioned read-only API.
 */
export async function fetchDevices(): Promise<DeviceSummaryDto[]> {
  const response = await fetch("/api/v1/devices");
  if (!response.ok) {
    throw new Error(`Device request failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ devices: DeviceSummaryDto[] }>;
  return body.data.devices;
}

/**
 * Loads one device detail through the versioned read-only API.
 */
export async function fetchDevice(deviceId: string): Promise<DeviceDetailDto> {
  const response = await fetch(`/api/v1/devices/${encodeURIComponent(deviceId)}`);
  if (!response.ok) {
    throw new Error(`Device detail request failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ device: DeviceDetailDto }>;
  return body.data.device;
}

/**
 * Loads credential-free server diagnostics.
 */
export async function fetchHealth(): Promise<HealthDto> {
  const response = await fetch("/api/v1/health");
  if (!response.ok) {
    throw new Error(`Health request failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<HealthDto>;
  return body.data;
}

/**
 * Opens the live SSE stream and normalizes event parsing.
 */
export function subscribeToDeviceEvents(onEvent: (event: SseEventDto) => void, onError: () => void): () => void {
  const source = new EventSource("/api/v1/events");
  source.addEventListener("device.snapshot", (event) => onEvent(JSON.parse(event.data) as DeviceSnapshotEventDto));
  source.addEventListener("device.state.changed", (event) => onEvent(JSON.parse(event.data) as DeviceStateChangedEventDto));
  source.onerror = () => onError();
  return () => source.close();
}
