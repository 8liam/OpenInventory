import { chmodSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export type SavedSession = {
  readonly refreshToken: string;
  readonly accountName: string;
  readonly steamId: string;
  /** Persona name, cached so it shows immediately after a restart. */
  readonly displayName?: string;
};

const TEMP_SUFFIX = ".tmp";
const FILE_MODE = 0o600;
const DIR_MODE = 0o700;

export function isSavedSession(value: unknown): value is SavedSession {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.refreshToken === "string" &&
    typeof record.accountName === "string" &&
    typeof record.steamId === "string"
  );
}

/** Owner-read/write only; the refresh token grants access to the Steam account. */
export function createSessionFile(file: string) {
  const temp = file + TEMP_SUFFIX;
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
      mkdirSync(dirname(file), { recursive: true, mode: DIR_MODE });
      // Write, flush, then rename, so neither a crash nor a power cut can truncate the only copy of the token.
      writeFileSync(temp, JSON.stringify(session), { mode: FILE_MODE, flush: true });
      chmodSync(temp, FILE_MODE);
      renameSync(temp, file);
    },
    clear(): void {
      rmSync(file, { force: true });
      // A crash between write and rename leaves the token in the temp file; sign-out must remove it too.
      rmSync(temp, { force: true });
    },
  };
}
