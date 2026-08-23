// SPDX-License-Identifier: MPL-2.0

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry"
  },
  webServer: [
    {
      command: "npm run dev:server",
      url: "http://127.0.0.1:3001/api/v1/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    },
    {
      command: "npm run dev --workspace @bpd/web -- --host 127.0.0.1",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
  ],
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1440, height: 900 } }
    },
    {
      name: "tablet",
      use: { browserName: "chromium", viewport: { width: 834, height: 1194 }, hasTouch: true }
    },
    {
      name: "mobile",
      use: { browserName: "chromium", viewport: { width: 393, height: 852 }, isMobile: true, hasTouch: true }
    }
  ]
});
