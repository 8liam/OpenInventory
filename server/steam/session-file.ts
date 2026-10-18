import { chmodSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type SavedSession = {
  readonly refreshToken: string;
  readonly accountName: string;
  readonly steamId: string;
  /** Persona name, cached so it shows immediately after a restart. */
  readonly displayName?: string;
};

const FILE_NAME = "session.json";
const FILE_MODE = 0o600;
const DIR_MODE = 0o700;

function isSavedSession(value: unknown): value is SavedSession {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.refreshToken === "string" &&
    typeof record.accountName === "string" &&
    typeof record.steamId === "string"
  );
}

/** Owner-read/write only; the refresh token grants access to the Steam account. */
export function createSessionFile(dataDir: string) {
  const file = join(dataDir, FILE_NAME);
  return {
    load(): SavedSession | undefined {
      try {
        const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
        return isSavedSession(parsed) ? parsed : undefined;
      } catch {
        return undefined;
      }
    },
    save(session: SavedSession): void {
      mkdirSync(dataDir, { recursive: true, mode: DIR_MODE });
      writeFileSync(file, JSON.stringify(session), { mode: FILE_MODE });
      chmodSync(file, FILE_MODE);
    },
    clear(): void {
      rmSync(file, { force: true });
    },
  };
}
