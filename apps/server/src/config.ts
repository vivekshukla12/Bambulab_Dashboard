// SPDX-License-Identifier: MPL-2.0

import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Runtime configuration for the M1 server process.
 */
export interface ServerConfig {
  host: string;
  port: number;
  databasePath: string;
  webDistPath?: string;
  syntheticIntervalMs: number;
  startedAt: string;
}

/**
 * Reads environment variables without accepting credentials or real printer details.
 */
export function loadServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const config: ServerConfig = {
    host: env.BPD_HOST ?? "127.0.0.1",
    port: parseInteger(env.BPD_PORT, 3001),
    databasePath: path.resolve(env.BPD_DATABASE_PATH ?? path.join(repoRoot, ".data", "dashboard.sqlite")),
    syntheticIntervalMs: parseInteger(env.BPD_SYNTHETIC_INTERVAL_MS, 750),
    startedAt: new Date().toISOString()
  };
  config.webDistPath = path.resolve(env.BPD_WEB_DIST ?? path.join(repoRoot, "apps", "web", "dist"));
  return config;
}

function parseInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
