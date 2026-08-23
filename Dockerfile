# SPDX-License-Identifier: MPL-2.0

FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/device-core/package.json packages/device-core/package.json
COPY packages/adapter-api/package.json packages/adapter-api/package.json
COPY packages/adapter-synthetic/package.json packages/adapter-synthetic/package.json
COPY packages/persistence/package.json packages/persistence/package.json
COPY packages/telemetry/package.json packages/telemetry/package.json
COPY packages/discovery/package.json packages/discovery/package.json
COPY packages/secrets/package.json packages/secrets/package.json
COPY packages/observability/package.json packages/observability/package.json
COPY packages/test-support/package.json packages/test-support/package.json
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV BPD_HOST=0.0.0.0
ENV BPD_PORT=3001
ENV BPD_DATABASE_PATH=/data/dashboard.sqlite
ENV BPD_WEB_DIST=/app/apps/web/dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps ./apps
COPY --from=build /app/packages ./packages
COPY --from=build /app/NOTICE ./NOTICE
COPY --from=build /app/LICENSE ./LICENSE
VOLUME ["/data"]
EXPOSE 3001
CMD ["node", "apps/server/dist/main.js"]
