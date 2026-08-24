// SPDX-License-Identifier: MPL-2.0

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "apps/server/**/*.test.ts"],
    testTimeout: 15000,
    hookTimeout: 15000
  },
  resolve: {
    conditions: ["development"]
  }
});
