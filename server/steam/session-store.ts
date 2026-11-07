import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { STEAM_ID_PATTERN } from "../../src/lib/accounts/accounts.config.ts";
import { createSessionFile, type SavedSession } from "./session-file.ts";

/** Where sessions lived before multi-account support: one file for the one account. */
export const LEGACY_SESSION_FILE = "session.json";
export const SESSIONS_DIR = "sessions";
const SESSION_EXTENSION = ".json";

/** One session file per account (`sessions/<steamId>.json`), so accounts never share a token. */
export function createSessionStore(dataDir: string) {
  const dir = join(dataDir, SESSIONS_DIR);
  const fileFor = (steamId: string) => {
    if (!STEAM_ID_PATTERN.test(steamId)) throw new Error(`Invalid SteamID: ${steamId}`);
    return createSessionFile(join(dir, steamId + SESSION_EXTENSION));
  };
  return {
    forAccount: fileFor,
    /** Every account that has a usable saved login, oldest file name first. */
    listSaved(): SavedSession[] {
      if (!existsSync(dir)) return [];
      const saved: SavedSession[] = [];
      for (const name of readdirSync(dir).sort()) {
        if (!name.endsWith(SESSION_EXTENSION)) continue;
        const steamId = name.slice(0, -SESSION_EXTENSION.length);
        if (!STEAM_ID_PATTERN.test(steamId)) continue;
        const session = fileFor(steamId).load();
        if (session?.steamId === steamId) saved.push(session);
      }
      return saved;
    },
    /**
     * Moves the single-account `session.json` into `sessions/`. The new file is written
     * (and flushed) before the old one is removed, so a crash never leaves no copy.
     * Returns the migrated session, if there was one.
     */
    migrateLegacy(): SavedSession | undefined {
      const legacyPath = join(dataDir, LEGACY_SESSION_FILE);
      const legacy = createSessionFile(legacyPath);
      const session = legacy.load();
      if (!session || !STEAM_ID_PATTERN.test(session.steamId)) return undefined;
      const target = fileFor(session.steamId);
      if (!target.load()) target.save(session);
      legacy.clear();
      rmSync(legacyPath, { force: true });
      return session;
    },
  };
}

export type SessionStore = ReturnType<typeof createSessionStore>;
