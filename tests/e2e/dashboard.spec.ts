// SPDX-License-Identifier: MPL-2.0

import { expect, test, type Page } from "@playwright/test";

const visibleStatusMessage = (page: Page, message: string) =>
  page.locator(".status-message", { hasText: message }).first();

test("normal fleet view is real-printer focused by default", async ({ page }) => {
  let discoveryCalls = 0;
  await page.route("**/api/v1/real-printer-candidates", async (route) => {
    discoveryCalls += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        envelope({
          discovery: {
            status: "none",
            candidates: [],
            discoveryMethod: "mdns",
            manualFallbackAvailable: true,
            note: "No server-side mDNS candidates found; use the manual host fallback."
          }
        })
      )
    });
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Printer Monitoring" })).toBeVisible();
  await expect(page.getByText("No real printers configured")).toBeVisible();
  await expect.poll(() => discoveryCalls).toBe(1);
  await expect(page.getByText("None found")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workshop A1 Mini" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Studio X2D" })).toHaveCount(0);
});

test("synthetic regression view keeps deterministic read-only state transitions", async ({ page }) => {
  await page.goto("/?synthetic=1");

  await expect(page.getByRole("heading", { name: "Printer Monitoring" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workshop A1 Mini" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Studio X2D" })).toBeVisible();

  await expect(visibleStatusMessage(page, "Printing from synthetic queue")).toBeVisible({ timeout: 10000 });
  await expect(visibleStatusMessage(page, "No fresh update within simulator freshness window")).toBeVisible({
    timeout: 10000
  });
  await expect(visibleStatusMessage(page, "Synthetic printer connection unavailable")).toBeVisible({
    timeout: 10000
  });
  await expect(visibleStatusMessage(page, "Recovered and receiving fresh updates")).toBeVisible({ timeout: 10000 });

  await page.goto("/devices/synthetic-x2d");
  await expect(page.getByRole("heading", { name: "Studio X2D" })).toBeVisible();
  await expect(page.getByText("Chamber temperature").first()).toBeVisible();
  await expect(page.getByText("supported").first()).toBeVisible();
});

test("real-printer onboarding automatically discovers, supports reconfigure, and confirms removal", async ({ page }) => {
  let discoveryCalls = 0;
  let patchPayload: unknown;
  let deleteCalls = 0;
  const configuredPrinter = {
    id: "bambu-real-1",
    displayName: "Configured X2D",
    modelHint: "X2D",
    source: "bambu-readonly",
    configuredAt: "2026-08-30T15:30:00.000Z",
    connectionState: "configured",
    credentialMode: "memory-only"
  };

  await page.route("**/api/v1/real-printers", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(envelope({ printers: [configuredPrinter] }))
      });
      return;
    }
    await route.continue();
  });
  await page.route("**/api/v1/real-printer-candidates", async (route) => {
    discoveryCalls += 1;
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(
        envelope({
          discovery: {
            status: "found",
            candidates: [
              {
                id: "bambu-mdns-synthetic",
                displayName: "Discovered X2D",
                modelHint: "X2D",
                source: "mdns",
                discoveredAt: "2026-08-30T15:31:00.000Z",
                endpointHint: "_bambu._tcp.local candidate on port 8883",
                requiresAccessCode: true
              }
            ],
            discoveryMethod: "mdns",
            manualFallbackAvailable: true,
            note: "Server-side mDNS discovery found sanitized printer candidates; Access Codes remain memory-only."
          }
        })
      )
    });
  });
  await page.route("**/api/v1/real-printers/bambu-real-1", async (route) => {
    if (route.request().method() === "PATCH") {
      patchPayload = route.request().postDataJSON();
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            printer: {
              ...configuredPrinter,
              displayName: "Corrected X2D",
              connectionState: "reconnecting"
            }
          })
        )
      });
      return;
    }
    if (route.request().method() === "DELETE") {
      deleteCalls += 1;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(
          envelope({
            removal: {
              id: "bambu-real-1",
              removed: true,
              credentialMaterialCleared: true,
              historyDeleted: false,
              note: "Removed active real-printer configuration and memory-only credential material; normalized history was not deleted."
            }
          })
        )
      });
      return;
    }
    await route.continue();
  });

  await page.goto("/");
  await expect(page.getByText("Configured X2D")).toBeVisible();
  await expect.poll(() => discoveryCalls).toBe(0);

  await page.getByRole("button", { name: /Search|Rescan/ }).click();
  await expect.poll(() => discoveryCalls).toBe(1);
  await expect(page.getByText("1 found")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: "Reconfigure real printer" })).toBeVisible();
  await page.getByLabel("Name").fill("Corrected X2D");
  await page.getByRole("textbox", { name: "Host" }).fill("corrected-printer.local");
  await page.getByRole("textbox", { name: "Serial" }).fill("NEW_SYNTHETIC_SERIAL");
  await page.getByRole("textbox", { name: "LAN Access Code" }).fill("NEW_SYNTHETIC_ACCESS_CODE");
  await page.getByRole("button", { name: "Save" }).click();

  await expect.poll(() => (patchPayload as { accessCode?: string } | undefined)?.accessCode).toBe("NEW_SYNTHETIC_ACCESS_CODE");
  expect(JSON.stringify(patchPayload)).toContain("corrected-printer.local");
  await expect(page.getByRole("textbox", { name: "LAN Access Code" })).toHaveValue("");

  await page.getByRole("button", { name: "Remove" }).click();
  await page.getByRole("button", { name: "Confirm remove" }).click();
  await expect.poll(() => deleteCalls).toBe(1);
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

function envelope(data: unknown) {
  return {
    data,
    meta: {
      apiVersion: "v1",
      generatedAt: "2026-08-30T15:30:00.000Z",
      requestId: "playwright-synthetic"
    }
  };
}
