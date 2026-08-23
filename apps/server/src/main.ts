// SPDX-License-Identifier: MPL-2.0

import { createLogger } from "@bpd/observability";
import { buildDashboardServer } from "./app.js";
import { loadServerConfig } from "./config.js";

const logger = createLogger("main");
const config = loadServerConfig();
const dashboard = await buildDashboardServer(config);

await dashboard.server.listen({ host: config.host, port: config.port });
logger.info("Bambu Printer Dashboard M1 prototype listening", {
  host: config.host,
  port: config.port,
  databasePath: config.databasePath
});

const shutdown = async () => {
  logger.info("shutdown requested");
  await dashboard.close();
  process.exit(0);
};

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());
