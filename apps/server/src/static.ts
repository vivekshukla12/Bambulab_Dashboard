// SPDX-License-Identifier: MPL-2.0

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

/**
 * Registers minimal static serving for production-like runs without adding a separate dependency.
 */
export function registerStaticShell(server: FastifyInstance, webDistPath: string | undefined): void {
  if (!webDistPath || !existsSync(webDistPath)) {
    return;
  }

  server.get("/*", async (request, reply) => {
    if (request.url.startsWith("/api/")) {
      return reply.code(404).send({ error: "Not found" });
    }
    return sendStaticFile(request, reply, webDistPath);
  });
}

async function sendStaticFile(request: FastifyRequest, reply: FastifyReply, webDistPath: string): Promise<void> {
  const url = new URL(request.url, "http://localhost");
  const requestedPath = decodeURIComponent(url.pathname);
  const safeRelative = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const candidate = path.resolve(webDistPath, safeRelative);
  const root = path.resolve(webDistPath);
  const filePath = candidate.startsWith(root) ? candidate : path.join(root, "index.html");
  const fallback = path.join(root, "index.html");
  const resolved = existsSync(filePath) && (await stat(filePath)).isFile() ? filePath : fallback;
  reply.header("content-type", MIME_TYPES[path.extname(resolved)] ?? "application/octet-stream");
  return reply.send(createReadStream(resolved));
}
