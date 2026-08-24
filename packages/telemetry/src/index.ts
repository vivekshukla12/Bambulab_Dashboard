// SPDX-License-Identifier: MPL-2.0

import type { DeviceState, FreshnessQuality, NormalizedDevice } from "@bpd/domain";

/**
 * Approved raw telemetry retention range for M1/V1.
 */
export interface RawTelemetryRetentionPolicy {
  defaultDays: 30;
  minimumDays: 1;
  maximumDays: 365;
  configuredDays: number;
}

/**
 * Compact fleet status derived from normalized device states.
 */
export interface FleetTelemetrySummary {
  totalDevices: number;
  liveDevices: number;
  staleDevices: number;
  unavailableDevices: number;
  printingDevices: number;
  degradedDevices: number;
}

/**
 * Validates and normalizes raw telemetry retention into the approved 1-365 day range.
 */
export function createRawTelemetryRetentionPolicy(configuredDays = 30): RawTelemetryRetentionPolicy {
  if (!Number.isInteger(configuredDays) || configuredDays < 1 || configuredDays > 365) {
    throw new RangeError("Raw telemetry retention must be an integer from 1 through 365 days.");
  }

  return {
    defaultDays: 30,
    minimumDays: 1,
    maximumDays: 365,
    configuredDays
  };
}

/**
 * Produces a safe fleet summary without treating stale or unavailable data as live.
 */
export function summarizeFleet(devices: NormalizedDevice[]): FleetTelemetrySummary {
  const states = devices.map((device) => device.state);
  return {
    totalDevices: devices.length,
    liveDevices: countQuality(states, "live"),
    staleDevices: countQuality(states, "stale"),
    unavailableDevices: countQuality(states, "unavailable"),
    degradedDevices: countQuality(states, "degraded"),
    printingDevices: states.filter((state) => state.lifecycle === "printing").length
  };
}

function countQuality(states: DeviceState[], quality: FreshnessQuality): number {
  return states.filter((state) => state.observation.quality === quality).length;
}
