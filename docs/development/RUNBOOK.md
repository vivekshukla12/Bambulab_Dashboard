# Development Runbook

## Local Development

1. Install Node.js 24 LTS and npm 11.
2. Run `npm install`.
3. Run `npm run dev:server` in one terminal.
4. Run `npm run dev:web -- --host 127.0.0.1` in another terminal.
5. Open `http://127.0.0.1:5173`.

The Vite dev server proxies read-only API and SSE requests to the Fastify server at `http://127.0.0.1:3001`.

For M2 real-printer onboarding, use the Fleet setup panel's server-side discovery button first where available; it returns sanitized candidates only and keeps raw endpoint details on the server. Enter a real LAN Access Code in the browser form only from `localhost`/loopback on the same server machine or from an HTTPS-served dashboard. Use the local CLI validation config instead of the browser form when operating over remote LAN HTTP.

## Production-Like Local Run

1. Run `npm run build`.
2. Run `npm start`.
3. Open `http://127.0.0.1:3001`.

By default, local data is stored under `.data/dashboard.sqlite`.

## Docker Compose

Run `docker compose up --build`. The prototype is available at `http://127.0.0.1:3001`, with persistent SQLite data mounted in the `dashboard-data` volume.

Run `npm run docker:validate` in a Docker-capable environment to build the image, start Compose, verify the dashboard/API/health endpoints and confirm SQLite persistence across container restart and recreation.

## Validation Commands

- `npm run build`
- `npm run test`
- `npm run test:e2e`
- `npm run docs:typedoc`
- `npm run licenses`
- `npm run docker:validate`

## M2 Local Real-Device Validation

Real-device validation is local-only and must be run on the Product Owner's LAN. Do not run it in public/shared CI and do not commit the local config file or raw output containing private details.

1. Build the TypeScript packages with `npm run build:ts`.
2. Create `secrets/m2-printers.local.json`; the `secrets/` folder is ignored by Git.
3. Use sanitized `id` and `displayName` values in that file.
4. Optionally use the dashboard's server-side discovery in the Fleet panel to identify candidates, then keep private hosts/serials/Access Codes only in the ignored local config.
5. Run `npm run m2:validate:real -- secrets/m2-printers.local.json`.
6. For hands-on local entry without writing a config file, run `npm run m2:validate:real -- --interactive`; prompts go to stderr, stdout remains the sanitized JSON report and serial/Access Code entry is hidden.
7. Copy only sanitized capability classifications, timing summaries and pass/fail rows into repository evidence.

Template:

```json
{
  "durationSeconds": 180,
  "printers": [
    {
      "id": "a1-mini",
      "displayName": "A1 Mini",
      "modelHint": "A1 Mini",
      "host": "LOCAL_HOST_OR_IP_NOT_FOR_COMMIT",
      "port": 8883,
      "serialNumber": "LOCAL_SERIAL_NOT_FOR_COMMIT",
      "accessCode": "LOCAL_ACCESS_CODE_NOT_FOR_COMMIT",
      "caCertificatePath": "secrets/bambu-local-ca.pem"
    },
    {
      "id": "x2d",
      "displayName": "X2D",
      "modelHint": "X2D",
      "host": "LOCAL_HOST_OR_IP_NOT_FOR_COMMIT",
      "port": 8883,
      "serialNumber": "LOCAL_SERIAL_NOT_FOR_COMMIT",
      "accessCode": "LOCAL_ACCESS_CODE_NOT_FOR_COMMIT",
      "caCertificatePath": "secrets/bambu-local-ca.pem"
    }
  ]
}
```

The script prints sanitized JSON only: configured sanitized IDs/model hints, pre-stop connection state, credential mode, current quality/lifecycle, initial connection timing, update cadence/latency summaries, redacted failure categories and capability classifications. It does not print host, serial number, Access Code, raw transport errors or raw MQTT payloads.

## Security Notes

The current prototype is read-only and has no dashboard login. LAN reachability means read access to dashboard-visible data. HTTP is acceptable for the read-only prototype shell, while the architecture remains HTTPS-capable for later sensitive or write/control capabilities.

M2 real-printer Access Codes are sensitive device credentials. The dashboard keeps them process-memory-only by default, never persists them, never stores them in browser storage and never returns them through diagnostics. The Access Code still passes from the browser form to the local server in a request body during onboarding, so browser credential entry is restricted to `localhost`/loopback on the server machine or HTTPS-served dashboards. Remote LAN HTTP is acceptable for read-only viewing only; use `npm run m2:validate:real -- secrets/m2-printers.local.json` for remote LAN HTTP feasibility validation.
