// SPDX-License-Identifier: MPL-2.0

import { assertReadOnlyAdapterContract } from "@bpd/adapter-api";
import { describe, expect, it } from "vitest";
import { createSyntheticAdapter } from "./index.js";

describe("SyntheticReadOnlyAdapter", () => {
  it("satisfies the shared read-only adapter contract", async () => {
    const adapter = createSyntheticAdapter({ intervalMs: 1000 });
    await assertReadOnlyAdapterContract(adapter);
  });

  it("exposes different capability sets without changing adapter contract", async () => {
    const adapter = createSyntheticAdapter({ intervalMs: 1000 });
    const devices = await adapter.discoverDevices();
    const a1 = devices.find((device) => device.identity.id === "synthetic-a1-mini");
    const x2d = devices.find((device) => device.identity.id === "synthetic-x2d");
    expect(a1?.capabilities.find((capability) => capability.key === "temperature.chamber")?.support).toBe("unsupported");
    expect(x2d?.capabilities.find((capability) => capability.key === "temperature.chamber")?.support).toBe("supported");
  });

  it("emits deterministic stale unavailable reconnecting and recovered transitions", async () => {
    const adapter = createSyntheticAdapter({ intervalMs: 1000 });
    const observed = new Set<string>();
    const unsubscribe = adapter.subscribe((event) => observed.add(event.device.state.lifecycle));

    for (let index = 0; index < 8; index += 1) {
      adapter.advance();
    }

    unsubscribe();
    expect(observed.has("stale")).toBe(true);
    expect(observed.has("unavailable")).toBe(true);
    expect(observed.has("reconnecting")).toBe(true);
    expect(observed.has("recovered")).toBe(true);
  });
});
