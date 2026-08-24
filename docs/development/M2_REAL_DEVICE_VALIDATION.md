# M2 Real-Device Validation Runbook

This runbook supports `project-control/specs/M2_REAL_DEVICE_VALIDATION.md`.

## Scope

Validate only the Product Owner's A1 Mini and X2D on the Product Owner LAN through the approved standard-mode local MQTTS read-only status path.

Do not use Developer Mode, Fleet Hub, cloud-client impersonation, write/control commands, disabled TLS validation, authorization bypasses, proprietary implementation copying, packet captures for committed evidence or public CI secrets.

## Local Config

Create `secrets/m2-printers.local.json` from the template in `docs/development/RUNBOOK.md`. The file must stay uncommitted. Use sanitized aliases for `id` and `displayName` because those may appear in sanitized evidence.

If the printer's certificate chain is not trusted by the local machine, provide a local CA certificate path through `caCertificatePath`. Do not disable TLS certificate validation.

Enter a real LAN Access Code through the browser form only from `localhost`/loopback on the same server machine or from an HTTPS-served dashboard. For remote LAN HTTP validation, use this CLI config path instead of browser credential entry.

## Commands

```bash
npm run validate
npm run test:e2e
npm run m2:validate:real -- secrets/m2-printers.local.json
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
