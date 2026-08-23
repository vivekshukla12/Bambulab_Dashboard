# M1 Development Runbook

## Local Development

1. Install Node.js 24 LTS and npm 11.
2. Run `npm install`.
3. Run `npm run dev:server` in one terminal.
4. Run `npm run dev:web -- --host 127.0.0.1` in another terminal.
5. Open `http://127.0.0.1:5173`.

The Vite dev server proxies read-only API and SSE requests to the Fastify server at `http://127.0.0.1:3001`.

## Production-Like Local Run

1. Run `npm run build`.
2. Run `npm start`.
3. Open `http://127.0.0.1:3001`.

By default, local data is stored under `.data/dashboard.sqlite`.

## Docker Compose

Run `docker compose up --build`. The prototype is available at `http://127.0.0.1:3001`, with persistent SQLite data mounted in the `dashboard-data` volume.

## Validation Commands

- `npm run build`
- `npm run test`
- `npm run test:e2e`
- `npm run docs:typedoc`
- `npm run licenses`

## Security Notes

M1 is read-only and has no dashboard login. LAN reachability means read access to dashboard-visible synthetic data. HTTP is acceptable for this M1 read-only prototype, while the architecture remains HTTPS-capable for later sensitive or write/control capabilities.
