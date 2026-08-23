// SPDX-License-Identifier: MPL-2.0

/**
 * Credential-free dashboard local discovery description for health/admin display.
 */
export interface DashboardDiscoveryDescriptor {
  serviceName: string;
  targetHost: string;
  advertised: boolean;
  manualUrl: string;
  note: string;
}

/**
 * Creates the M1 safe local-name/discovery foundation without scanning for printers.
 */
export function getDashboardDiscoveryDescriptor(options: {
  host: string;
  port: number;
  protocol?: "http" | "https";
  advertised?: boolean;
}): DashboardDiscoveryDescriptor {
  const protocol = options.protocol ?? "http";
  const displayHost = options.host === "0.0.0.0" || options.host === "::" ? "127.0.0.1" : options.host;
  return {
    serviceName: "bambu-dashboard",
    targetHost: "bambu-dashboard.local",
    advertised: options.advertised ?? false,
    manualUrl: `${protocol}://${displayHost}:${options.port}`,
    note:
      "M1 records the dashboard local-name target and keeps manual IP/port fallback. Cross-platform mDNS advertisement is best-effort and deferred where host support differs."
  };
}
