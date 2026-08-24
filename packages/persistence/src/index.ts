// SPDX-License-Identifier: MPL-2.0

import Database from "better-sqlite3";
import { Kysely, SqliteDialect, sql } from "kysely";
import type { Generated } from "kysely";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { CapabilityDescriptor, DeviceState, NormalizedDevice } from "@bpd/domain";
import type { Logger } from "@bpd/observability";

interface MigrationTable {
  id: string;
  applied_at: string;
}

interface DevicesTable {
  id: string;
  display_name: string;
  model_hint: string;
  adapter_id: string;
  source: string;
  location: string | null;
  firmware_version: string | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

interface DeviceCapabilitiesTable {
  device_id: string;
  capability_key: string;
  label: string;
  support: string;
  access: string;
  quality: string;
  source_adapter: string;
  updated_at: string;
  notes: string | null;
}

interface CurrentDeviceStatesTable {
  device_id: string;
  sequence: number;
  lifecycle: string;
  quality: string;
  observed_at: string;
  received_at: string;
  payload_json: string;
}

interface RawTelemetrySamplesTable {
  id: Generated<number>;
  device_id: string;
  captured_at: string;
  sample_kind: string;
  payload_json: string;
}

interface OperationalEventsTable {
  id: Generated<number>;
  device_id: string;
  event_type: string;
  occurred_at: string;
  payload_json: string;
}

interface SettingsTable {
  key: string;
  value_json: string;
  updated_at: string;
}

interface DashboardSchema {
  app_migrations: MigrationTable;
  devices: DevicesTable;
  device_capabilities: DeviceCapabilitiesTable;
  current_device_states: CurrentDeviceStatesTable;
  raw_telemetry_samples: RawTelemetrySamplesTable;
  operational_events: OperationalEventsTable;
  settings: SettingsTable;
}

/**
 * Runtime configuration for the SQLite database boundary.
 */
export interface DashboardDatabaseOptions {
  databasePath: string;
  logger?: Logger;
}

/**
 * Credential-free database health snapshot.
 */
export interface DatabaseHealth {
  status: "ok" | "degraded";
  path: string;
  journalMode: string;
  foreignKeys: boolean;
}

/**
 * SQLite/Kysely repository and migration owner for the M1 prototype.
 */
export class DashboardDatabase {
  private readonly sqlite: Database.Database;
  private readonly db: Kysely<DashboardSchema>;
  private readonly logger: Logger | undefined;

  constructor(private readonly options: DashboardDatabaseOptions) {
    this.logger = options.logger;
    this.sqlite = new Database(options.databasePath);
    this.sqlite.pragma("foreign_keys = ON");
    this.sqlite.pragma("journal_mode = WAL");
    this.sqlite.pragma("busy_timeout = 5000");
    this.db = new Kysely<DashboardSchema>({
      dialect: new SqliteDialect({ database: this.sqlite })
    });
  }

  /**
   * Opens and migrates a database, creating parent directories when needed.
   */
  static async open(options: DashboardDatabaseOptions): Promise<DashboardDatabase> {
    await mkdir(path.dirname(options.databasePath), { recursive: true });
    const database = new DashboardDatabase(options);
    await database.migrate();
    return database;
  }

  /**
   * Runs immutable sequential migrations from an empty database to the current schema.
   */
  async migrate(): Promise<void> {
    await this.db.schema
      .createTable("app_migrations")
      .ifNotExists()
      .addColumn("id", "text", (column) => column.primaryKey())
      .addColumn("applied_at", "text", (column) => column.notNull())
      .execute();

    await this.applyMigration("0001_m1_initial_state", async () => {
      await this.db.schema
        .createTable("devices")
        .ifNotExists()
        .addColumn("id", "text", (column) => column.primaryKey())
        .addColumn("display_name", "text", (column) => column.notNull())
        .addColumn("model_hint", "text", (column) => column.notNull())
        .addColumn("adapter_id", "text", (column) => column.notNull())
        .addColumn("source", "text", (column) => column.notNull())
        .addColumn("location", "text")
        .addColumn("firmware_version", "text")
        .addColumn("created_at", "text", (column) => column.notNull())
        .addColumn("updated_at", "text", (column) => column.notNull())
        .addColumn("last_seen_at", "text")
        .execute();

      await this.db.schema
        .createTable("device_capabilities")
        .ifNotExists()
        .addColumn("device_id", "text", (column) => column.notNull().references("devices.id").onDelete("cascade"))
        .addColumn("capability_key", "text", (column) => column.notNull())
        .addColumn("label", "text", (column) => column.notNull())
        .addColumn("support", "text", (column) => column.notNull())
        .addColumn("access", "text", (column) => column.notNull())
        .addColumn("quality", "text", (column) => column.notNull())
        .addColumn("source_adapter", "text", (column) => column.notNull())
        .addColumn("updated_at", "text", (column) => column.notNull())
        .addColumn("notes", "text")
        .addPrimaryKeyConstraint("device_capabilities_pk", ["device_id", "capability_key"])
        .execute();

      await this.db.schema
        .createTable("current_device_states")
        .ifNotExists()
        .addColumn("device_id", "text", (column) => column.primaryKey().references("devices.id").onDelete("cascade"))
        .addColumn("sequence", "integer", (column) => column.notNull())
        .addColumn("lifecycle", "text", (column) => column.notNull())
        .addColumn("quality", "text", (column) => column.notNull())
        .addColumn("observed_at", "text", (column) => column.notNull())
        .addColumn("received_at", "text", (column) => column.notNull())
        .addColumn("payload_json", "text", (column) => column.notNull())
        .execute();

      await this.db.schema
        .createTable("raw_telemetry_samples")
        .ifNotExists()
        .addColumn("id", "integer", (column) => column.primaryKey().autoIncrement())
        .addColumn("device_id", "text", (column) => column.notNull().references("devices.id").onDelete("cascade"))
        .addColumn("captured_at", "text", (column) => column.notNull())
        .addColumn("sample_kind", "text", (column) => column.notNull())
        .addColumn("payload_json", "text", (column) => column.notNull())
        .execute();

      await this.db.schema
        .createTable("operational_events")
        .ifNotExists()
        .addColumn("id", "integer", (column) => column.primaryKey().autoIncrement())
        .addColumn("device_id", "text", (column) => column.notNull().references("devices.id").onDelete("cascade"))
        .addColumn("event_type", "text", (column) => column.notNull())
        .addColumn("occurred_at", "text", (column) => column.notNull())
        .addColumn("payload_json", "text", (column) => column.notNull())
        .execute();

      await this.db.schema
        .createTable("settings")
        .ifNotExists()
        .addColumn("key", "text", (column) => column.primaryKey())
        .addColumn("value_json", "text", (column) => column.notNull())
        .addColumn("updated_at", "text", (column) => column.notNull())
        .execute();

      await this.db.schema.createIndex("raw_telemetry_device_time_idx").ifNotExists().on("raw_telemetry_samples").columns(["device_id", "captured_at"]).execute();
      await this.db.schema.createIndex("operational_events_device_time_idx").ifNotExists().on("operational_events").columns(["device_id", "occurred_at"]).execute();
      await this.db.schema.createIndex("devices_adapter_idx").ifNotExists().on("devices").columns(["adapter_id"]).execute();

      await this.db
        .insertInto("settings")
        .values({
          key: "rawTelemetryRetentionDays",
          value_json: JSON.stringify(30),
          updated_at: new Date().toISOString()
        })
        .onConflict((oc) => oc.column("key").doNothing())
        .execute();
    });
  }

  /**
   * Upserts a normalized device registry entry and its current capability descriptors.
   */
  async upsertDevice(device: NormalizedDevice): Promise<void> {
    const now = new Date().toISOString();
    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto("devices")
        .values({
          id: device.identity.id,
          display_name: device.identity.displayName,
          model_hint: device.identity.modelHint,
          adapter_id: device.identity.adapterId,
          source: device.identity.source,
          location: device.identity.location ?? null,
          firmware_version: device.identity.firmwareVersion ?? null,
          created_at: now,
          updated_at: now,
          last_seen_at: device.state.observation.receivedAt
        })
        .onConflict((oc) =>
          oc.column("id").doUpdateSet({
            display_name: device.identity.displayName,
            model_hint: device.identity.modelHint,
            adapter_id: device.identity.adapterId,
            source: device.identity.source,
            location: device.identity.location ?? null,
            firmware_version: device.identity.firmwareVersion ?? null,
            updated_at: now,
            last_seen_at: device.state.observation.receivedAt
          })
        )
        .execute();

      await trx.deleteFrom("device_capabilities").where("device_id", "=", device.identity.id).execute();
      if (device.capabilities.length > 0) {
        await trx
          .insertInto("device_capabilities")
          .values(device.capabilities.map((capability) => toCapabilityRow(device.identity.id, capability)))
          .execute();
      }
    });
  }

  /**
   * Persists the current state and appends raw telemetry plus a durable lifecycle event.
   */
  async recordState(state: DeviceState): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx
        .insertInto("current_device_states")
        .values(toCurrentStateRow(state))
        .onConflict((oc) =>
          oc.column("device_id").doUpdateSet({
            sequence: state.sequence,
            lifecycle: state.lifecycle,
            quality: state.observation.quality,
            observed_at: state.observation.observedAt,
            received_at: state.observation.receivedAt,
            payload_json: JSON.stringify(state)
          })
        )
        .execute();

      await trx
        .insertInto("raw_telemetry_samples")
        .values({
          device_id: state.deviceId,
          captured_at: state.observation.receivedAt,
          sample_kind: "normalized.current_state",
          payload_json: JSON.stringify(state.telemetry)
        })
        .execute();

      await trx
        .insertInto("operational_events")
        .values({
          device_id: state.deviceId,
          event_type: `device.${state.lifecycle}`,
          occurred_at: state.observation.receivedAt,
          payload_json: JSON.stringify({
            sequence: state.sequence,
            quality: state.observation.quality,
            message: state.statusMessage
          })
        })
        .execute();
    });
  }

  /**
   * Returns persisted current states after restart.
   */
  async listPersistedStates(): Promise<DeviceState[]> {
    const rows = await this.db.selectFrom("current_device_states").selectAll().execute();
    return rows.map((row) => JSON.parse(row.payload_json) as DeviceState);
  }

  /**
   * Counts rows by table for validation and health checks.
   */
  async counts(): Promise<{ devices: number; rawTelemetrySamples: number; operationalEvents: number }> {
    const devices = await this.countTable("devices");
    const rawTelemetrySamples = await this.countTable("raw_telemetry_samples");
    const operationalEvents = await this.countTable("operational_events");
    return { devices, rawTelemetrySamples, operationalEvents };
  }

  /**
   * Returns a credential-free database health snapshot.
   */
  async health(): Promise<DatabaseHealth> {
    const journalRow = this.sqlite.pragma("journal_mode", { simple: true }) as string;
    const foreignKeys = Boolean(this.sqlite.pragma("foreign_keys", { simple: true }));
    return {
      status: foreignKeys ? "ok" : "degraded",
      path: this.options.databasePath,
      journalMode: journalRow.toString().toLowerCase(),
      foreignKeys
    };
  }

  /**
   * Closes database resources.
   */
  async close(): Promise<void> {
    await this.db.destroy();
    this.sqlite.close();
  }

  private async applyMigration(id: string, up: () => Promise<void>): Promise<void> {
    const existing = await this.db.selectFrom("app_migrations").select("id").where("id", "=", id).executeTakeFirst();
    if (existing) {
      return;
    }
    this.logger?.info("applying database migration", { migrationId: id });
    await up();
    await this.db.insertInto("app_migrations").values({ id, applied_at: new Date().toISOString() }).execute();
  }

  private async countTable(table: "devices" | "raw_telemetry_samples" | "operational_events"): Promise<number> {
    const result = await this.db.selectFrom(table).select(sql<number>`count(*)`.as("count")).executeTakeFirstOrThrow();
    return Number(result.count);
  }
}

function toCapabilityRow(deviceId: string, capability: CapabilityDescriptor) {
  return {
    device_id: deviceId,
    capability_key: capability.key,
    label: capability.label,
    support: capability.support,
    access: capability.access,
    quality: capability.quality,
    source_adapter: capability.source,
    updated_at: capability.updatedAt,
    notes: capability.notes ?? null
  };
}

function toCurrentStateRow(state: DeviceState) {
  return {
    device_id: state.deviceId,
    sequence: state.sequence,
    lifecycle: state.lifecycle,
    quality: state.observation.quality,
    observed_at: state.observation.observedAt,
    received_at: state.observation.receivedAt,
    payload_json: JSON.stringify(state)
  };
}
