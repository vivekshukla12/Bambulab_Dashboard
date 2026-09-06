// SPDX-License-Identifier: MPL-2.0

import {
  discoverBambuPrintersWithNetworkPlugin,
  isBambuNetworkPluginCountryCodeError,
  probeBambuNetworkPlugin
} from "./index.js";

const command = process.argv[2] ?? "probe";

if (command === "probe") {
  const result = await probeBambuNetworkPlugin();
  console.log(JSON.stringify(result));
  process.exitCode = result.available ? 0 : 1;
} else if (command === "discover") {
  try {
    const candidates = await discoverBambuPrintersWithNetworkPlugin();
    console.log(
      JSON.stringify({
        available: true,
        discoveryMethod: "bambu-network-plugin",
        candidateCount: candidates.length,
        modelFamilies: [...new Set(candidates.map((candidate) => candidate.modelHint))].sort()
      })
    );
  } catch (error) {
    const countryCodeUnavailable = isBambuNetworkPluginCountryCodeError(error);
    console.log(
      JSON.stringify({
        available: false,
        discoveryMethod: "bambu-network-plugin",
        candidateCount: 0,
        reason: countryCodeUnavailable ? "country-code-unavailable" : "official-plugin-discovery-failed",
        ...(countryCodeUnavailable ? { diagnostic: error.message } : {})
      })
    );
    process.exitCode = 1;
  }
} else {
  console.error("Use probe or discover.");
  process.exitCode = 2;
}
