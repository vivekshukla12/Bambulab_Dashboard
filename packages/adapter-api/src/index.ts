// SPDX-License-Identifier: MPL-2.0

import type { AdapterId, DeviceEvent, DeviceId, DeviceState, NormalizedDevice } from "@bpd/domain";

/**
 * Synthetic-safe adapter health surface. Real adapters must not include secrets or private vendor payloads here.
 */
export interface AdapterHealth {
  adapterId: AdapterId;
  status: "ok" | "degraded";
  scenario: string;
  devices: number;
  currentStep: number;
  lastEventAt?: string;
}

/**
 * Callback used by read-only adapters to publish normalized observations.
 */
export type AdapterEventListener = (event: DeviceEvent) => void;

/**
 * Read-only device adapter contract.
 *
 * This interface intentionally contains no printer command, mutation, write, pause, stop,
 * temperature-setpoint, AMS-control, file-management or camera-control method.
 */
export interface ReadOnlyDeviceAdapter {
  readonly adapterId: AdapterId;

  /**
   * Starts adapter background observation.
   */
  start(): Promise<void>;

  /**
   * Stops adapter background observation and releases runtime resources.
   */
  stop(): Promise<void>;

  /**
   * Returns the currently discovered normalized devices.
   */
  discoverDevices(): Promise<NormalizedDevice[]>;

  /**
   * Returns the latest known state for one device, if the adapter knows it.
   */
  getCurrentState(deviceId: DeviceId): Promise<DeviceState | undefined>;

  /**
   * Subscribes to normalized read-only events.
   */
  subscribe(listener: AdapterEventListener): () => void;

  /**
   * Returns a credential-free health snapshot for diagnostics.
   */
  health(): AdapterHealth;
}

/**
 * Minimal reusable assertions for read-only adapter implementations.
 */
export async function assertReadOnlyAdapterContract(adapter: ReadOnlyDeviceAdapter): Promise<void> {
  const devices = await adapter.discoverDevices();
  if (devices.length === 0) {
    throw new Error(`Adapter ${adapter.adapterId} did not expose any deterministic devices.`);
  }

  for (const device of devices) {
    if (device.identity.adapterId !== adapter.adapterId) {
      throw new Error(`Device ${device.identity.id} has mismatched adapter identity.`);
    }
    if (device.capabilities.length === 0) {
      throw new Error(`Device ${device.identity.id} has no capability descriptors.`);
    }
    if (!device.state.observation.receivedAt || !device.state.observation.observedAt) {
      throw new Error(`Device ${device.identity.id} state is missing observation timestamps.`);
    }
  }
}
