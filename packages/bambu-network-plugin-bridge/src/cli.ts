// SPDX-License-Identifier: MPL-2.0

import {
  discoverBambuPrintersWithNetworkPlugin,
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
  } catch {
    console.log(
      JSON.stringify({
        available: false,
        discoveryMethod: "bambu-network-plugin",
        candidateCount: 0,
        reason: "official-plugin-discovery-failed"
      })
    );
    process.exitCode = 1;
  }
} else {
  console.error("Use probe or discover.");
  process.exitCode = 2;
}
