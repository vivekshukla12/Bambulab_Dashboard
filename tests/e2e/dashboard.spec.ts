// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "@playwright/test";

test("fleet and device views show synthetic devices and read-only state transitions", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Printer Monitoring" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workshop A1 Mini" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Studio X2D" })).toBeVisible();

  await expect(page.getByText("Printing from synthetic queue")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("No fresh update within simulator freshness window")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Synthetic printer connection unavailable")).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("Recovered and receiving fresh updates")).toBeVisible({ timeout: 10000 });

  await page.goto("/devices/synthetic-x2d");
  await expect(page.getByRole("heading", { name: "Studio X2D" })).toBeVisible();
  await expect(page.getByText("Chamber temperature").first()).toBeVisible();
  await expect(page.getByText("supported").first()).toBeVisible();
});

test("diagnostics expose database simulator event and discovery status", async ({ page }) => {
  await page.goto("/diagnostics");
  await expect(page.getByText("Database")).toBeVisible();
  await expect(page.getByText("Synthetic adapter")).toBeVisible();
  await expect(page.getByText("bambu-dashboard.local")).toBeVisible();
  await expect(page.getByText("M1 records the dashboard local-name target")).toBeVisible();
});

test("PWA shell registers on localhost and shows explicit offline state", async ({ context, page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Printer Monitoring" })).toBeVisible();

  const serviceWorkerState = await page.evaluate(async () => {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      return "unsupported";
    }
    const registration = await navigator.serviceWorker.ready;
    return registration.active?.state ?? "missing";
  });
  expect(serviceWorkerState).toBe("activated");

  await page.reload();
  await expect(page.getByRole("heading", { name: "Printer Monitoring" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Printer Monitoring" })).toBeVisible();
  await expect(page.getByText("live read-only updates are paused")).toBeVisible();
  await context.setOffline(false);
});
