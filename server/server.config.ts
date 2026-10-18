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
