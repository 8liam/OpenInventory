import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_PORT = 4174;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_DATA_DIR = join(homedir(), ".openinventory");

/** Everything configurable through the environment, in one place. */
export const ENV = {
  host: "OPENINVENTORY_HOST",
  port: "OPENINVENTORY_PORT",
  dataDir: "OPENINVENTORY_DATA_DIR",
  password: "OPENINVENTORY_PASSWORD",
  webDir: "OPENINVENTORY_WEB_DIR",
} as const;

export type ServerSettings = {
  readonly host: string;
  readonly port: number;
  readonly dataDir: string;
  /** When set, every request must present it via HTTP basic auth. */
  readonly password: string | undefined;
  /** Directory of the built web app to serve; undefined in dev (Vite serves it). */
  readonly webDir: string | undefined;
};

export function readSettings(env: NodeJS.ProcessEnv = process.env): ServerSettings {
  const port = Number(env[ENV.port] ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port <= 0)
    throw new Error(`${ENV.port} must be a positive integer`);
  return {
    host: env[ENV.host] ?? DEFAULT_HOST,
    port,
    dataDir: env[ENV.dataDir] ?? DEFAULT_DATA_DIR,
    password: env[ENV.password] || undefined,
    webDir: env[ENV.webDir] || undefined,
  };
}

/** Cache-control for responses that must be revalidated before every reuse. */
export const NO_CACHE = "no-cache";

/** Cache-control for fingerprinted build assets, whose URL changes whenever their content does. */
export const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

/** Content type for static files whose extension is not in `MIME_TYPES`. */
export const DEFAULT_CONTENT_TYPE = "application/octet-stream";

export const TEXT_PLAIN = "text/plain; charset=utf-8";
export const JSON_CONTENT_TYPE = "application/json";

/** Body of the 404 for a static path that resolves to no file. */
export const STATIC_NOT_FOUND_BODY = "Not found";

/** Stops nginx-style reverse proxies from buffering the snapshot stream. */
export const SSE_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": NO_CACHE,
  connection: "keep-alive",
  "x-accel-buffering": "no",
} as const;

export const SERVER_LIMITS = {
  /** Minimum gap between persisted value snapshots. */
  snapshotIntervalMs: 60 * 60 * 1000,
  snapshotRetentionDays: 730,
  /** Lets unit contents finish loading before the first background snapshot. */
  snapshotInitialDelayMs: 90_000,
  /** How long in-flight requests (e.g. SSE streams) get to finish before connections are cut. */
  shutdownGraceMs: 5000,
  basicAuthRealm: "OpenInventory",
  basicAuthUser: "openinventory",
} as const;

/** Content types for static files, keyed by lowercase extension; anything else is `DEFAULT_CONTENT_TYPE`. */
export const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
} as const satisfies Readonly<Record<string, string>>;

/** Process exit codes: a drained shutdown versus one forced by a repeated signal. */
export const EXIT_CODE = { clean: 0, forced: 1 } as const;

/** Hardening headers set on every response at the top of the request handler. */
export const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
} as const;
