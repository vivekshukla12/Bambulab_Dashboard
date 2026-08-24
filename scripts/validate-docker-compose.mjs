// SPDX-License-Identifier: MPL-2.0

import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const projectName = process.env.COMPOSE_PROJECT_NAME || `bpd-m1-validation-${process.pid}`;
const dashboardBaseUrl = process.env.BPD_DOCKER_VALIDATE_URL || "http://127.0.0.1:3001";
const startupTimeoutMs = Number.parseInt(process.env.BPD_DOCKER_VALIDATE_TIMEOUT_MS || "120000", 10);
const pollIntervalMs = 1000;

try {
  await compose(["down", "--volumes", "--remove-orphans"], { allowFailure: true });
  await compose(["build"]);
  await compose(["up", "-d"]);
  await waitForDashboard();

  const rootStatus = await fetchStatus("/");
  assert(rootStatus === 200, `expected dashboard root HTTP 200, received ${rootStatus}`);

  const devices = await fetchEnvelope("/api/v1/devices");
  assert(Array.isArray(devices.devices), "expected /api/v1/devices data.devices array");
  assert(devices.devices.length === 2, `expected 2 synthetic devices, received ${devices.devices.length}`);
  assert(
    devices.devices.some((device) => device.id === "synthetic-a1-mini"),
    "expected synthetic-a1-mini device"
  );
  assert(devices.devices.some((device) => device.id === "synthetic-x2d"), "expected synthetic-x2d device");

  const health = await fetchEnvelope("/api/v1/health");
  assert(health.database?.status === "ok", `expected database status ok, received ${health.database?.status}`);
  assert(health.database?.journalMode === "wal", `expected SQLite WAL mode, received ${health.database?.journalMode}`);
  assert(health.database?.foreignKeys === true, "expected SQLite foreign keys enabled");

  const firstContainerId = await composeOutput(["ps", "-q", "dashboard"]);
  const beforeRestart = await databaseCounts();
  assertPersistedRows(beforeRestart, "initial startup");

  await compose(["restart", "dashboard"]);
  await waitForDashboard();
  const afterRestart = await databaseCounts();
  assertCountsDidNotDecrease(beforeRestart, afterRestart, "container restart");

  await compose(["up", "-d", "--force-recreate", "dashboard"]);
  await waitForDashboard();
  const secondContainerId = await composeOutput(["ps", "-q", "dashboard"]);
  assert(firstContainerId.trim() !== secondContainerId.trim(), "expected force-recreate to replace the container");
  const afterRecreate = await databaseCounts();
  assertCountsDidNotDecrease(beforeRestart, afterRecreate, "container recreation");

  console.log(
    JSON.stringify(
      {
        status: "passed",
        projectName,
        dashboardBaseUrl,
        rootStatus,
        devices: devices.devices.map((device) => device.id),
        health: {
          databaseStatus: health.database.status,
          journalMode: health.database.journalMode,
          foreignKeys: health.database.foreignKeys
        },
        persistence: {
          beforeRestart,
          afterRestart,
          afterRecreate
        }
      },
      null,
      2
    )
  );
} finally {
  if (process.env.BPD_KEEP_DOCKER_VALIDATION !== "1") {
    await compose(["down", "--volumes", "--remove-orphans"], { allowFailure: true });
  }
}

async function waitForDashboard() {
  const deadline = Date.now() + startupTimeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const status = await fetchStatus("/api/v1/health");
      if (status === 200) {
        return;
      }
      lastError = new Error(`health returned HTTP ${status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(pollIntervalMs);
  }
  throw new Error(`dashboard did not become healthy within ${startupTimeoutMs}ms: ${lastError?.message}`);
}

async function fetchStatus(path) {
  const response = await fetch(new URL(path, dashboardBaseUrl));
  return response.status;
}

async function fetchEnvelope(path) {
  const response = await fetch(new URL(path, dashboardBaseUrl));
  assert(response.ok, `${path} returned HTTP ${response.status}`);
  const body = await response.json();
  assert(body.meta?.apiVersion === "v1", `${path} did not return the v1 API envelope`);
  return body.data;
}

async function databaseCounts() {
  const raw = await composeOutput([
    "exec",
    "-T",
    "dashboard",
    "node",
    "--input-type=module",
    "-e",
    [
      "import Database from 'better-sqlite3';",
      "const db = new Database('/data/dashboard.sqlite');",
      "const count = (table) => db.prepare(`select count(*) as count from ${table}`).get().count;",
      "const result = {",
      "devices: count('devices'),",
      "currentDeviceStates: count('current_device_states'),",
      "rawTelemetrySamples: count('raw_telemetry_samples'),",
      "operationalEvents: count('operational_events')",
      "};",
      "db.close();",
      "console.log(JSON.stringify(result));"
    ].join("")
  ]);
  return JSON.parse(raw);
}

function assertPersistedRows(counts, phase) {
  assert(counts.devices >= 2, `${phase}: expected at least 2 persisted devices, received ${counts.devices}`);
  assert(
    counts.currentDeviceStates >= 2,
    `${phase}: expected at least 2 persisted current states, received ${counts.currentDeviceStates}`
  );
  assert(
    counts.rawTelemetrySamples > 0,
    `${phase}: expected raw telemetry samples in the persistent database`
  );
  assert(counts.operationalEvents > 0, `${phase}: expected operational events in the persistent database`);
}

function assertCountsDidNotDecrease(before, after, phase) {
  assertPersistedRows(after, phase);
  for (const key of Object.keys(before)) {
    assert(after[key] >= before[key], `${phase}: ${key} decreased from ${before[key]} to ${after[key]}`);
  }
}

async function compose(args, options = {}) {
  await runDockerCompose(args, { ...options, inheritOutput: true });
}

async function composeOutput(args) {
  const result = await runDockerCompose(args, { inheritOutput: false });
  return result.stdout.trim();
}

function runDockerCompose(args, { allowFailure = false, inheritOutput = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn("docker", ["compose", "-p", projectName, ...args], {
      env: { ...process.env, COMPOSE_PROJECT_NAME: projectName },
      shell: process.platform === "win32"
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (inheritOutput) {
        process.stdout.write(chunk);
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (inheritOutput) {
        process.stderr.write(chunk);
      }
    });
    child.on("error", (error) => {
      if (allowFailure) {
        resolve({ stdout, stderr });
        return;
      }
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0 || allowFailure) {
        resolve({ stdout, stderr });
        return;
      }
      reject(new Error(`docker compose ${args.join(" ")} exited with ${code}\n${stderr}`));
    });
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
