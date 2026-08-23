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
  TemperatureTelemetry
} from "@bpd/domain";
import { normalizeProgressPercent } from "@bpd/domain";

const ADAPTER_ID = "synthetic-m1";
const SOURCE = "synthetic";
const BASE_TIME = Date.UTC(2026, 7, 23, 12, 0, 0);

interface SyntheticDeviceFixture {
  id: DeviceId;
  displayName: string;
  modelHint: string;
  location: string;
  firmwareVersion: string;
  capabilities: Omit<CapabilityDescriptor, "source" | "updatedAt" | "quality">[];
  temperatureProfile: TemperatureTelemetry;
  jobName: string;
  progressOffset: number;
  scenarioOffset: number;
}

interface ScenarioStep {
  lifecycle: DeviceLifecycle;
  quality: FreshnessQuality;
  message: string;
  progressPercent?: number;
  stage?: string;
}

/**
 * Permanent synthetic fixture definitions. These are shaped for product validation and contain no real device dumps.
 */
export const SYNTHETIC_DEVICE_FIXTURES: SyntheticDeviceFixture[] = [
  {
    id: "synthetic-a1-mini",
    displayName: "Workshop A1 Mini",
    modelHint: "A1 Mini-shaped synthetic device",
    location: "Workshop",
    firmwareVersion: "synthetic-1.0.0",
    progressOffset: 0,
    scenarioOffset: 0,
    jobName: "Calibration cube",
    temperatureProfile: {
      nozzleC: 212,
      bedC: 61
    },
    capabilities: [
      capability("printer.status", "Printer status", "supported"),
      capability("print.progress", "Print progress", "supported"),
      capability("temperature.nozzle", "Nozzle temperature", "supported"),
      capability("temperature.bed", "Bed temperature", "supported"),
      capability("temperature.chamber", "Chamber temperature", "unsupported", "Open-frame synthetic device has no chamber sensor."),
      capability("network.wifi", "Wi-Fi signal", "supported"),
      capability("filament.externalSpool", "External spool", "supported"),
      capability("filament.amsSlots", "AMS slots", "unknown", "M1 does not implement real AMS integration."),
      capability("camera.feed", "Camera feed", "unsupported"),
      capability("energy.power", "Power telemetry", "unknown")
    ]
  },
  {
    id: "synthetic-x2d",
    displayName: "Studio X2D",
    modelHint: "X2D-shaped synthetic device",
    location: "Studio",
    firmwareVersion: "synthetic-2.0.0",
    progressOffset: 18,
    scenarioOffset: 1,
    jobName: "Functional bracket",
    temperatureProfile: {
      nozzleC: 246,
      bedC: 74,
      chamberC: 38
    },
    capabilities: [
      capability("printer.status", "Printer status", "supported"),
      capability("print.progress", "Print progress", "supported"),
      capability("temperature.nozzle", "Nozzle temperature", "supported"),
      capability("temperature.bed", "Bed temperature", "supported"),
      capability("temperature.chamber", "Chamber temperature", "supported"),
      capability("network.wifi", "Wi-Fi signal", "supported"),
      capability("filament.externalSpool", "External spool", "unsupported"),
      capability("filament.amsSlots", "AMS slot telemetry", "unknown", "Capability placeholder only; real AMS validation is outside M1."),
      capability("camera.feed", "Camera feed", "unknown", "Camera support is validation-dependent and outside M1."),
      capability("energy.power", "Power telemetry", "supported")
    ]
  }
];

const SCENARIO: ScenarioStep[] = [
  { lifecycle: "connected", quality: "live", message: "Connected and idle" },
  { lifecycle: "printing", quality: "live", message: "Printing from synthetic queue", progressPercent: 12, stage: "first layers" },
  { lifecycle: "printing", quality: "live", message: "Printing from synthetic queue", progressPercent: 32, stage: "infill" },
  { lifecycle: "stale", quality: "stale", message: "No fresh update within simulator freshness window", progressPercent: 32, stage: "last observed infill" },
  { lifecycle: "unavailable", quality: "unavailable", message: "Synthetic printer connection unavailable" },
  { lifecycle: "reconnecting", quality: "degraded", message: "Reconnecting after synthetic transport interruption" },
  { lifecycle: "recovered", quality: "live", message: "Recovered and receiving fresh updates", progressPercent: 48, stage: "outer walls" }
];

/**
 * Runtime options for the deterministic synthetic read-only adapter.
 */
export interface SyntheticAdapterOptions {
  intervalMs?: number;
}

/**
 * Read-only adapter that emits deterministic normalized synthetic printer state.
 */
export class SyntheticReadOnlyAdapter implements ReadOnlyDeviceAdapter {
  readonly adapterId = ADAPTER_ID;
  private readonly listeners = new Set<AdapterEventListener>();
  private readonly intervalMs: number;
  private timer: NodeJS.Timeout | undefined;
  private step = 0;
  private lastEventAt: string | undefined;

  constructor(options: SyntheticAdapterOptions = {}) {
    this.intervalMs = options.intervalMs ?? 750;
  }

  async start(): Promise<void> {
    if (this.timer) {
      return;
    }
    this.publishCurrentStep();
    this.timer = setInterval(() => this.advance(), this.intervalMs);
  }

  async stop(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async discoverDevices(): Promise<NormalizedDevice[]> {
    return SYNTHETIC_DEVICE_FIXTURES.map((fixture) => this.toDevice(fixture, this.step + fixture.scenarioOffset));
  }

  async getCurrentState(deviceId: DeviceId): Promise<DeviceState | undefined> {
    const fixture = SYNTHETIC_DEVICE_FIXTURES.find((candidate) => candidate.id === deviceId);
    return fixture ? this.toState(fixture, this.step + fixture.scenarioOffset) : undefined;
  }

  subscribe(listener: AdapterEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  health(): AdapterHealth {
    const health: AdapterHealth = {
      adapterId: this.adapterId,
      status: "ok",
      scenario: "m1-deterministic-fleet",
      devices: SYNTHETIC_DEVICE_FIXTURES.length,
      currentStep: this.step
    };
    if (this.lastEventAt) {
      health.lastEventAt = this.lastEventAt;
    }
    return health;
  }

  /**
   * Advances one deterministic scenario step. Tests can call this without timers.
   */
  advance(): void {
    this.step += 1;
    this.publishCurrentStep();
  }

  private publishCurrentStep(): void {
    for (const fixture of SYNTHETIC_DEVICE_FIXTURES) {
      const device = this.toDevice(fixture, this.step + fixture.scenarioOffset);
      const event: DeviceEvent = {
        type: "device.state.changed",
        eventId: `${this.adapterId}-${device.identity.id}-${device.state.sequence}`,
        emittedAt: device.state.observation.receivedAt,
        device
      };
      this.lastEventAt = event.emittedAt;
      for (const listener of this.listeners) {
        listener(event);
      }
    }
  }

  private toDevice(fixture: SyntheticDeviceFixture, sequence: number): NormalizedDevice {
    const state = this.toState(fixture, sequence);
    return {
      identity: {
        id: fixture.id,
        displayName: fixture.displayName,
        modelHint: fixture.modelHint,
        adapterId: this.adapterId,
        source: SOURCE,
        location: fixture.location,
        firmwareVersion: fixture.firmwareVersion
      },
      capabilities: fixture.capabilities.map((capabilityDescriptor) => ({
        ...capabilityDescriptor,
        source: this.adapterId,
        updatedAt: state.observation.receivedAt,
        quality: state.observation.quality
      })),
      state
    };
  }

  private toState(fixture: SyntheticDeviceFixture, sequence: number): DeviceState {
    const step = SCENARIO[Math.abs(sequence) % SCENARIO.length] ?? requiredScenarioStep(0);
    const receivedAt = new Date(BASE_TIME + sequence * 5000).toISOString();
    const observedAt =
      step.quality === "stale" ? new Date(BASE_TIME + (sequence - 12) * 5000).toISOString() : receivedAt;
    const progressPercent =
      step.progressPercent === undefined ? undefined : normalizeProgressPercent(step.progressPercent + fixture.progressOffset);

    const telemetry: DeviceState["telemetry"] = {};
    if (step.quality !== "unavailable") {
      telemetry.temperatures = fixture.temperatureProfile;
    }
    if (progressPercent !== undefined) {
      telemetry.print = {
        jobId: `${fixture.id}-job-001`,
        displayName: fixture.jobName,
        stage: step.stage ?? "observing",
        progressPercent,
        elapsedSeconds: 120 + sequence * 30,
        remainingSeconds: Math.max(0, 1800 - sequence * 60)
      };
    }

    return {
      deviceId: fixture.id,
      sequence,
      lifecycle: step.lifecycle,
      statusMessage: step.message,
      telemetry,
      observation: {
        adapterId: this.adapterId,
        source: SOURCE,
        observedAt,
        receivedAt,
        quality: step.quality
      }
    };
  }
}

/**
 * Factory for the permanent M1 synthetic adapter.
 */
export function createSyntheticAdapter(options?: SyntheticAdapterOptions): SyntheticReadOnlyAdapter {
  return new SyntheticReadOnlyAdapter(options);
}

function capability(
  key: CapabilityDescriptor["key"],
  label: string,
  support: CapabilityDescriptor["support"],
  notes?: string
): Omit<CapabilityDescriptor, "source" | "updatedAt" | "quality"> {
  const descriptor: Omit<CapabilityDescriptor, "source" | "updatedAt" | "quality"> = {
    key,
    label,
    support,
    access: "readable"
  };
  if (notes) {
    descriptor.notes = notes;
  }
  return descriptor;
}

function requiredScenarioStep(index: number): ScenarioStep {
  const step = SCENARIO[index];
  if (!step) {
    throw new Error(`Missing synthetic scenario step ${index}.`);
  }
  return step;
}
