import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_PORT = 4174;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_DATA_DIR = join(homedir(), ".openinventory");
const ALLOWED_HOSTS_SEPARATOR = ",";
/** A `:port` written on an allowed-host entry; the guard compares hostnames only. */
const PORT_SUFFIX = /:\d+$/;

/** Everything configurable through the environment, in one place. */
export const ENV = {
  host: "OPENINVENTORY_HOST",
  port: "OPENINVENTORY_PORT",
  dataDir: "OPENINVENTORY_DATA_DIR",
  password: "OPENINVENTORY_PASSWORD",
  webDir: "OPENINVENTORY_WEB_DIR",
  allowedHosts: "OPENINVENTORY_ALLOWED_HOSTS",
  reportPeriod: "OPENINVENTORY_REPORT_PERIOD",
  reportWebhookUrl: "OPENINVENTORY_REPORT_WEBHOOK_URL",
} as const;

export type ServerSettings = {
  readonly host: string;
  readonly port: number;
  readonly dataDir: string;
  /** When set, every request must present it via HTTP basic auth. */
  readonly password: string | undefined;
  /** Directory of the built web app to serve; undefined in dev (Vite serves it). */
  readonly webDir: string | undefined;
  /** Extra hostnames accepted without a password; a leading dot matches subdomains. */
  readonly allowedHosts: readonly string[];
  readonly reportPeriod: "weekly" | "monthly";
  readonly reportWebhookUrl: string | undefined;
};

export function readSettings(env: NodeJS.ProcessEnv = process.env): ServerSettings {
  const port = Number(env[ENV.port] ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port <= 0)
    throw new Error(`${ENV.port} must be a positive integer`);
  const reportPeriod = env[ENV.reportPeriod] ?? "weekly";
  if (reportPeriod !== "weekly" && reportPeriod !== "monthly")
    throw new Error(`${ENV.reportPeriod} must be weekly or monthly`);
  const reportWebhookUrl = env[ENV.reportWebhookUrl] || undefined;
  if (reportWebhookUrl) {
    let parsed: URL;
    try {
      parsed = new URL(reportWebhookUrl);
    } catch {
      throw new Error(`${ENV.reportWebhookUrl} must be an HTTPS URL`);
    }
    if (parsed.protocol !== "https:")
      throw new Error(`${ENV.reportWebhookUrl} must be an HTTPS URL`);
  }
  return {
    host: env[ENV.host] ?? DEFAULT_HOST,
    port,
    dataDir: env[ENV.dataDir] ?? DEFAULT_DATA_DIR,
    password: env[ENV.password] || undefined,
    webDir: env[ENV.webDir] || undefined,
    allowedHosts: (env[ENV.allowedHosts] ?? "")
      .split(ALLOWED_HOSTS_SEPARATOR)
      .map((entry) => entry.trim().toLowerCase().replace(PORT_SUFFIX, ""))
      .filter(Boolean),
    reportPeriod,
    reportWebhookUrl,
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
  reportCheckIntervalMs: 60 * 60 * 1000,
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

/**
 * Hostnames always accepted when no password is set. A DNS-rebinding page needs a
 * name whose public DNS it controls, so names that never resolve through public DNS
 * are safe: loopback, mDNS (`.local`), RFC 8375 home networks, ICANN's private-use
 * `.internal` and Tailscale MagicDNS. IP literals and single-label names (`nas`, a
 * Docker service) are accepted separately. A leading dot matches any subdomain.
 */
export const DEFAULT_ALLOWED_HOSTS = [
  "localhost",
  ".localhost",
  ".local",
  ".home.arpa",
  ".internal",
  ".ts.net",
] as const;

/** Process exit codes: a drained shutdown versus one forced by a repeated signal. */
export const EXIT_CODE = { clean: 0, forced: 1 } as const;

/** Hardening headers set on every response at the top of the request handler. */
export const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
} as const;
