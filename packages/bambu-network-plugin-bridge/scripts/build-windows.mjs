// SPDX-License-Identifier: MPL-2.0

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (process.platform !== "win32") {
  throw new Error("The M2 native Network Plugin bridge probe currently supports Windows only.");
}

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(packageRoot, "native", "bambu-network-plugin-bridge.cpp");
const buildDirectory = path.join(packageRoot, "build");
const outputPath = path.join(buildDirectory, "bambu-network-plugin-bridge.exe");
const vswhere = path.join(
  process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)",
  "Microsoft Visual Studio",
  "Installer",
  "vswhere.exe"
);

const installationPath = execFileSync(
  vswhere,
  ["-latest", "-products", "*", "-requires", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64", "-property", "installationPath"],
  { encoding: "utf8" }
).trim();
if (!installationPath) {
  throw new Error("Visual Studio C++ Build Tools were not found.");
}

mkdirSync(buildDirectory, { recursive: true });
const vcvars = path.join(installationPath, "VC", "Auxiliary", "Build", "vcvars64.bat");
const buildScriptPath = path.join(buildDirectory, "build-native.cmd");
writeFileSync(
  buildScriptPath,
  [
    "@echo off",
    `call "${vcvars}" >nul`,
    "if errorlevel 1 exit /b %errorlevel%",
    `cl.exe /nologo /std:c++17 /EHsc /MD /O2 /Fe:"${outputPath}" "${sourcePath}" /link kernel32.lib wintrust.lib crypt32.lib`
  ].join("\r\n")
);

try {
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/c", "build-native.cmd"], {
    cwd: buildDirectory,
    stdio: "inherit"
  });
} finally {
  rmSync(buildScriptPath, { force: true });
}

console.log("Built sanitized optional Network Plugin bridge probe.");
