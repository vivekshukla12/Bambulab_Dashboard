// SPDX-License-Identifier: MPL-2.0

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageLockPath = path.join(root, "package-lock.json");
const outputPath = path.join(root, "docs", "development", "dependency-licenses.json");

const incompatibleMarkers = [
  "UNLICENSED",
  "SEE LICENSE IN",
  "PROPRIETARY",
  "COMMERCIAL",
  "GPL",
  "AGPL",
  "LGPL"
];

const packageLock = JSON.parse(await readFile(packageLockPath, "utf8"));
const packages = packageLock.packages ?? {};
const inventory = [];
const failures = [];

for (const [packagePath, metadata] of Object.entries(packages)) {
  if (!packagePath.startsWith("node_modules/")) {
    continue;
  }
  if (metadata.link === true) {
    continue;
  }

  const name = metadata.name ?? packagePath.replace("node_modules/", "");
  const version = metadata.version ?? "unknown";
  const license = normalizeLicense(metadata.license);
  const record = {
    name,
    version,
    license,
    path: packagePath,
    dev: Boolean(metadata.dev)
  };
  inventory.push(record);

  if (!license) {
    failures.push(`${name}@${version} has no license metadata`);
    continue;
  }

  const upperLicense = license.toUpperCase();
  if (incompatibleMarkers.some((marker) => upperLicense.includes(marker))) {
    failures.push(`${name}@${version} has unresolved or incompatible license metadata: ${license}`);
  }
}

inventory.sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`));

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), packages: inventory }, null, 2)}\n`,
  "utf8"
);

if (failures.length > 0) {
  console.error("Dependency license check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Dependency license inventory wrote ${inventory.length} packages to ${path.relative(root, outputPath)}.`);
}

function normalizeLicense(license) {
  if (Array.isArray(license)) {
    return license.map(normalizeLicense).filter(Boolean).join(" OR ");
  }
  if (typeof license === "object" && license !== null) {
    return license.type ?? "";
  }
  if (typeof license === "string") {
    return license.trim();
  }
  return "";
}
