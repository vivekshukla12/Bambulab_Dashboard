# M2 Real-Device Validation Runbook

This runbook supports `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`.

## Scope

Validate only the Product Owner's A1 Mini and X2D on the Product Owner LAN through the approved standard-mode local MQTTS read-only status path.

Do not use Developer Mode, Fleet Hub, cloud-client impersonation, write/control commands, disabled TLS validation, authorization bypasses, proprietary implementation copying, packet captures for committed evidence or public CI secrets.

## Local Config

Create `secrets/m2-printers.local.json` from the template in `docs/development/RUNBOOK.md`. The file must stay uncommitted. Use sanitized aliases for `id` and `displayName` because those may appear in sanitized evidence. For hands-on local entry without writing a config file, run `npm run m2:validate:real -- --interactive`; prompts go to stderr, stdout remains the sanitized JSON report, and serial/Access Code entry is hidden.

If the printer's certificate chain is not trusted by the local machine, use `tlsTrustProfile: "local-printer-chain"` or provide a local CA certificate path through `caCertificatePath`. File-based and interactive local validation default to `local-printer-chain`. The local-printer-chain profile probes the printer certificate before credentials are sent, derives the local issuer/certificate identity in process memory and then keeps TLS certificate validation enabled for the credential-bearing MQTTS connection. Do not disable TLS certificate validation.

Enter a real LAN Access Code through the browser form only from `localhost`/loopback on the same server machine or from an HTTPS-served dashboard. For remote LAN HTTP validation, use this CLI config path instead of browser credential entry.

The dashboard automatically starts bounded server-side discovery from the Fleet onboarding panel when no configured real printer makes that scan unnecessary. Discovery uses local SSDP from the server process for the Bambu printer service type `urn:bambulab-com:device:3dprinter:1`, returns sanitized candidates to the browser and preserves manual host entry as fallback when discovery is unavailable or unreliable. Use the visible rescan action to refresh discovery. Configured real printers can be edited/reconfigured or removed from the same panel; existing Access Codes are never displayed back, and entering a new Access Code replaces the in-memory credential.

For the bounded official Network Plugin feasibility retest on Windows, install Bambu Studio and its Network Plugin only through Bambu's normal distribution path, then exit Bambu Studio before running the standalone bridge so the two processes do not compete for the plugin's local listener. Build and probe the project-authored helper, run sanitized discovery, and enable the bridge only for that server process:

```powershell
npm run m2:network-plugin:build
npm run m2:network-plugin:probe
npm run m2:network-plugin:discover
$env:BPD_BAMBU_NETWORK_PLUGIN_BRIDGE = "1"
npm run dev:server
```

Run `npm run dev:web -- --host 127.0.0.1` in a second terminal and open `http://127.0.0.1:5173`. A discovered official-plugin candidate resolves host and serial only on the server; the browser asks for the LAN Access Code but does not receive those private fields. If the component is absent, unsigned, signed by a different publisher or ABI-incompatible, the bridge fails closed. Remove the environment flag to return to direct MQTTS/SSDP. Do not copy the installed plugin into this repository or provide credentials in chat/Git.

The normal Fleet view is real-printer focused and hides deterministic synthetic cards by default. Use `/?synthetic=1` only for development/regression validation of synthetic scenarios.

## Commands

```bash
npm run validate
npm run test:e2e
npm run m2:validate:real -- secrets/m2-printers.local.json
npm run m2:validate:real -- --interactive
npm run m2:network-plugin:build
npm run m2:network-plugin:probe
npm run m2:network-plugin:discover
```

Run the real validation for each printer individually and with both printers in the same config. Run during idle and, where practical, during a real print so progress and print-session transitions can be classified.

## Evidence To Commit

Commit only sanitized summaries:

- capability matrix values: `proven-live`, `proven-static`, `unavailable`, `unreliable`, `not-tested`;
- model family and firmware version without serial/MAC/IP/account identifiers;
- aggregate initial connection and update cadence timing;
- stale/offline/reconnect/recovery pass/fail;
- simultaneous dual-device pass/fail;
- real print-session transition/progress pass/fail;
- redacted error categories.

Do not commit Access Codes, serial numbers, MAC addresses, local IPs, account identifiers, raw MQTT/device payloads, packet captures, private printer media or unsanitized logs.
