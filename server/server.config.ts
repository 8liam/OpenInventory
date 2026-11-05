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

export const SERVER_LIMITS = {
  /** Minimum gap between persisted value snapshots. */
  snapshotIntervalMs: 60 * 60 * 1000,
  snapshotRetentionDays: 730,
  /** Lets unit contents finish loading before the first background snapshot. */
  snapshotInitialDelayMs: 90_000,
  basicAuthRealm: "OpenInventory",
  basicAuthUser: "openinventory",
} as const;

/** Content types for static files, keyed by lowercase extension; anything else is octet-stream. */
export const MIME_TYPES: Readonly<Record<string, string>> = {
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
};

/** Hardening headers attached to every response the server writes. */
export const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
} as const;
