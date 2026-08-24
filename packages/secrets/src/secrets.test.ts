// SPDX-License-Identifier: MPL-2.0

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EncryptedFileSecretStore, InMemorySecretStore } from "./index.js";

describe("SecretStore", () => {
  it("stores process-memory synthetic secrets without persistence", async () => {
    const store = new InMemorySecretStore();
    await store.set("synthetic-access-code", "synthetic-only");
    expect(await store.get("synthetic-access-code")).toBe("synthetic-only");
    await store.delete("synthetic-access-code");
    expect(await store.get("synthetic-access-code")).toBeUndefined();
  });

  it("encrypts synthetic values before writing them to disk", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "bpd-secret-"));
    const filePath = path.join(directory, "vault.json");
    const store = new EncryptedFileSecretStore(filePath, "synthetic-test-key");

    await store.set("synthetic-access-code", "synthetic-only-secret");
    const raw = await readFile(filePath, "utf8");
    expect(raw).not.toContain("synthetic-only-secret");
    expect(await store.get("synthetic-access-code")).toBe("synthetic-only-secret");
    await store.delete("synthetic-access-code");
    expect(await store.listNames()).toEqual([]);
    await rm(directory, { recursive: true, force: true });
  });
});
