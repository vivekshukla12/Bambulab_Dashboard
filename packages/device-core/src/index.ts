// SPDX-License-Identifier: MPL-2.0

import type { AdapterHealth, ReadOnlyDeviceAdapter } from "@bpd/adapter-api";
import type { DeviceEvent, DeviceId, NormalizedDevice } from "@bpd/domain";
import type { Logger } from "@bpd/observability";
import type { DashboardDatabase } from "@bpd/persistence";
import { summarizeFleet, type FleetTelemetrySummary } from "@bpd/telemetry";

/**
 * Listener receiving server-owned normalized device events.
 */
export type DeviceCoreEventListener = (event: DeviceEvent) => void;

/**
 * Credential-free event pipeline health.
 */
export interface EventPipelineHealth {
  status: "ok" | "degraded";
  subscribers: number;
  lastEventAt?: string;
}

/**
 * Device-core runtime health snapshot.
 */
export interface DeviceCoreHealth {
  adapters: AdapterHealth[];
  events: EventPipelineHealth;
  fleet: FleetTelemetrySummary;
}

/**
 * Server-owned live state service for normalized read-only adapters.
 */
export class DeviceStateService {
  private readonly devices = new Map<DeviceId, NormalizedDevice>();
  private readonly subscribers = new Set<DeviceCoreEventListener>();
  private readonly adapterUnsubscribers: Array<() => void> = [];
  private lastEventAt: string | undefined;
  private started = false;

  constructor(
    private readonly adapters: ReadOnlyDeviceAdapter[],
    private readonly database: DashboardDatabase,
    private readonly logger: Logger
  ) {}

  /**
   * Starts adapters, seeds state, persists registry data and begins event fan-out.
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    for (const adapter of this.adapters) {
      this.adapterUnsubscribers.push(adapter.subscribe((event) => void this.handleAdapterEvent(event)));
      const discovered = await adapter.discoverDevices();
      for (const device of discovered) {
        this.devices.set(device.identity.id, device);
        await this.database.upsertDevice(device);
        await this.database.recordState(device.state);
      }
      await adapter.start();
      this.logger.info("read-only adapter started", { adapterId: adapter.adapterId, devices: discovered.length });
    }

    this.started = true;
  }

  /**
   * Stops adapter observation and event fan-out.
   */
  async stop(): Promise<void> {
    for (const unsubscribe of this.adapterUnsubscribers.splice(0)) {
      unsubscribe();
    }
    for (const adapter of this.adapters) {
      await adapter.stop();
    }
    this.started = false;
  }

  /**
   * Lists current normalized devices in a stable display order.
   */
  listDevices(): NormalizedDevice[] {
    return [...this.devices.values()].sort((a, b) => a.identity.displayName.localeCompare(b.identity.displayName));
  }

  /**
   * Returns one current normalized device if known.
   */
  getDevice(deviceId: DeviceId): NormalizedDevice | undefined {
    return this.devices.get(deviceId);
  }

  /**
   * Subscribes to server-owned normalized events.
   */
  subscribe(listener: DeviceCoreEventListener): () => void {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  }

  /**
   * Reports credential-free live service health.
   */
  health(): DeviceCoreHealth {
    const events: EventPipelineHealth = {
      status: "ok",
      subscribers: this.subscribers.size
    };
    if (this.lastEventAt) {
      events.lastEventAt = this.lastEventAt;
    }
    return {
      adapters: this.adapters.map((adapter) => adapter.health()),
      events,
      fleet: summarizeFleet(this.listDevices())
    };
  }

  private async handleAdapterEvent(event: DeviceEvent): Promise<void> {
    this.devices.set(event.device.identity.id, event.device);
    this.lastEventAt = event.emittedAt;
    await this.database.upsertDevice(event.device);
    await this.database.recordState(event.device.state);
    for (const subscriber of this.subscribers) {
      subscriber(event);
    }
  }
}
