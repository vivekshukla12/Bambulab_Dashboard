# Bambu Network Plugin Bridge Feasibility Package

## Purpose

Owns the bounded M2 feasibility bridge to a Bambu Network Plugin already installed by the user through official Bambu Studio distribution. This is an opt-in spike, not approval of a permanent proprietary runtime dependency.

## Public Boundary

The bridge is independently implemented from the public Bambu Studio declarations in `NetworkAgent.hpp` and `bambu_networking.hpp`, pinned to ABI prefix `02.08.02`. It exposes only:

- runtime compatibility probing;
- printer discovery callbacks;
- local printer connection/disconnection;
- local read-only message/status callbacks.

No Bambu binary, header, source implementation, credential, endpoint, or device payload is copied into this repository.

## Security Invariants

- Runtime use is disabled unless `BPD_BAMBU_NETWORK_PLUGIN_BRIDGE=1` is set.
- The helper accepts only a validly signed networking DLL whose signer certificate matches the installed Bambu Studio executable.
- The official plugin runs with isolated temporary config and log directories; it does not read the user's Bambu Studio configuration.
- Plugin country/region initialization uses `BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE` when explicitly set. Otherwise the project-authored helper reads only the current Windows user's geographic region through the documented [`GetUserDefaultGeoName`](https://learn.microsoft.com/windows/win32/api/winnls/nf-winnls-getuserdefaultgeoname) API.
- Country/region values are normalized to uppercase and checked against ISO 3166-1 alpha-2 codes before plugin initialization. An invalid override, numeric Windows M.49 result, or unavailable region fails closed with a sanitized instruction to set the override; there is no default country.
- Printer host, serial and LAN Access Code remain server/child-process memory only. The Access Code is passed through the child environment, removed from that environment immediately, and never placed in command-line arguments.
- Native helper output is private IPC consumed by the server. Browser DTOs remain sanitized and contain no host, serial, Access Code, raw plugin payload or TLS identity.
- The helper neither resolves nor exposes arbitrary message-send, cloud-login, bind/unbind, print, motion, calibration, camera, file-transfer, or other write/control entry points.
- Missing, unsigned, differently signed, incompatible or incomplete official components fail closed.

## Windows Build And Probe

Requirements:

- official Bambu Studio and its Network Plugin installed normally by the user;
- Visual Studio C++ Build Tools;
- Node.js 24 and npm 11.

From the repository root:

```powershell
npm run m2:network-plugin:build
npm run m2:network-plugin:probe
npm run m2:network-plugin:discover
```

The commands print only sanitized availability/version/count information. They do not print discovered addresses, serials or raw callback payloads.

The probe reports the non-secret normalized country code when it is available. To override a missing or incorrect Windows geographic-region setting, set your own ISO 3166-1 alpha-2 code before probing. Lowercase input is accepted and normalized; invalid or unassigned codes are rejected without echoing the supplied value.

```powershell
$env:BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE = "DE"
npm run m2:network-plugin:probe
```

Remove the override to return to automatic Windows geographic-region resolution:

```powershell
Remove-Item Env:BPD_BAMBU_NETWORK_PLUGIN_COUNTRY_CODE -ErrorAction SilentlyContinue
```

Exit Bambu Studio before standalone discovery or dashboard testing. Local inspection on the Product Owner workstation showed that a running Studio instance already owned the plugin's discovery/listener ports, so concurrent execution does not provide an unambiguous bridge result.

To run the dashboard with this optional feasibility bridge:

```powershell
$env:BPD_BAMBU_NETWORK_PLUGIN_BRIDGE = "1"
npm run dev:server
npm run dev:web -- --host 127.0.0.1
```

Unset the flag to return to the existing direct read-only MQTTS/SSDP implementation.

For the Product Owner's clean Network Plugin retest, fully exit Bambu Studio first, including any background instance. Then run the build, probe and discovery commands above before starting the server and web commands. Do not place printer hosts, serial numbers or LAN Access Codes in commands, screenshots, logs or repository files; enter requested printer credentials only through the local dashboard flow.

## Tests

Offline tests use project-authored mocks for the bridge process boundary. Public CI never loads or requires the proprietary plugin.
