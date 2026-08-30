// SPDX-License-Identifier: MPL-2.0

import type {
  ApiEnvelope,
  DeviceDetailDto,
  DeviceSnapshotEventDto,
  DeviceStateChangedEventDto,
  DeviceSummaryDto,
  HealthDto,
  RealPrinterDiscoveryDto,
  RealPrinterConnectionDto,
  RealPrinterConnectionRequest,
  RealPrinterReconfigurationRequest,
  RealPrinterRemovalDto,
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
 * Attempts server-side discovery for sanitized real-printer onboarding candidates.
 */
export async function fetchRealPrinterCandidates(): Promise<RealPrinterDiscoveryDto> {
  const response = await fetch("/api/v1/real-printer-candidates");
  if (!response.ok) {
    throw new Error(`Real-printer discovery failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ discovery: RealPrinterDiscoveryDto }>;
  return body.data.discovery;
}

/**
 * Loads configured real printers without private host, serial, Access Code or TLS identity fields.
 */
export async function fetchRealPrinters(): Promise<RealPrinterConnectionDto[]> {
  const response = await fetch("/api/v1/real-printers");
  if (!response.ok) {
    throw new Error(`Configured real-printer request failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ printers: RealPrinterConnectionDto[] }>;
  return body.data.printers;
}

/**
 * Configures one real printer through the server-side memory-only M2 onboarding boundary.
 */
export async function connectRealPrinter(request: RealPrinterConnectionRequest): Promise<RealPrinterConnectionDto> {
  const response = await fetch("/api/v1/real-printers", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    throw new Error(`Real-printer onboarding failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ printer: RealPrinterConnectionDto }>;
  return body.data.printer;
}

/**
 * Reconfigures one existing real printer; omitted private fields reuse server process-memory values.
 */
export async function reconfigureRealPrinter(
  printerId: string,
  request: RealPrinterReconfigurationRequest
): Promise<RealPrinterConnectionDto> {
  const response = await fetch(`/api/v1/real-printers/${encodeURIComponent(printerId)}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(request)
  });
  if (!response.ok) {
    throw new Error(`Real-printer reconfiguration failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ printer: RealPrinterConnectionDto }>;
  return body.data.printer;
}

/**
 * Removes one process-memory real-printer configuration without deleting normalized history.
 */
export async function removeRealPrinter(printerId: string): Promise<RealPrinterRemovalDto> {
  const response = await fetch(`/api/v1/real-printers/${encodeURIComponent(printerId)}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    throw new Error(`Real-printer removal failed with ${response.status}`);
  }
  const body = (await response.json()) as ApiEnvelope<{ removal: RealPrinterRemovalDto }>;
  return body.data.removal;
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
