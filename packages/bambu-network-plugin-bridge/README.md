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

Exit Bambu Studio before standalone discovery or dashboard testing. Local inspection on the Product Owner workstation showed that a running Studio instance already owned the plugin's discovery/listener ports, so concurrent execution does not provide an unambiguous bridge result.

To run the dashboard with this optional feasibility bridge:

```powershell
$env:BPD_BAMBU_NETWORK_PLUGIN_BRIDGE = "1"
npm run dev:server
npm run dev:web -- --host 127.0.0.1
```

Unset the flag to return to the existing direct read-only MQTTS/SSDP implementation.

## Tests

Offline tests use project-authored mocks for the bridge process boundary. Public CI never loads or requires the proprietary plugin.
