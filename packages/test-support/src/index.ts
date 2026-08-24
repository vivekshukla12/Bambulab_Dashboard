// SPDX-License-Identifier: MPL-2.0

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Temporary SQLite database descriptor for isolated tests.
 */
export interface TempDatabase {
  databasePath: string;
  dispose(): Promise<void>;
}

/**
 * Creates a unique temporary SQLite path for a test.
 */
export async function createTempDatabase(): Promise<TempDatabase> {
  const directory = await mkdtemp(path.join(tmpdir(), "bpd-m1-"));
  return {
    databasePath: path.join(directory, "dashboard.sqlite"),
    dispose: () => rm(directory, { recursive: true, force: true })
  };
}
