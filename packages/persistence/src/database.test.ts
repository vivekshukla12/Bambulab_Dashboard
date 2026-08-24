// SPDX-License-Identifier: MPL-2.0

import { describe, expect, it } from "vitest";
import { createSyntheticAdapter } from "@bpd/adapter-synthetic";
import { createTempDatabase } from "@bpd/test-support";
import { DashboardDatabase } from "./index.js";

describe("DashboardDatabase", () => {
  it("migrates an empty database and persists current synthetic state across restart", async () => {
    const temp = await createTempDatabase();
    const adapter = createSyntheticAdapter({ intervalMs: 1000 });
    const [device] = await adapter.discoverDevices();
    if (!device) {
      throw new Error("Expected synthetic device fixture.");
    }

    const first = await DashboardDatabase.open({ databasePath: temp.databasePath });
    await first.upsertDevice(device);
    await first.recordState(device.state);
    const counts = await first.counts();
    expect(counts.devices).toBe(1);
    expect(counts.rawTelemetrySamples).toBe(1);
    await first.close();

    const second = await DashboardDatabase.open({ databasePath: temp.databasePath });
    const states = await second.listPersistedStates();
    expect(states).toHaveLength(1);
    expect(states[0]?.deviceId).toBe(device.identity.id);
    const health = await second.health();
    expect(health.foreignKeys).toBe(true);
    expect(health.journalMode).toContain("wal");
    await second.close();
    await temp.dispose();
  });
});
