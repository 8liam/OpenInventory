import { LOGIN_COOLDOWN_KEY } from "../../src/lib/storage/storage.config.ts";
import type { Database } from "../db/db.types.ts";
import type { SavedSession } from "../steam/session-file.ts";
import type { SessionStore } from "../steam/session-store.ts";

/**
 * Brings a pre-multi-account data directory up to date and returns every account that has a
 * saved login. Safe to run on every start: the legacy session moves once, and rows already
 * keyed by SteamID (units, value history, case history) need no change to stay with it.
 */
export function bootstrapAccounts(db: Database, sessions: SessionStore): readonly SavedSession[] {
  const migrated = sessions.migrateLegacy();
  if (migrated) {
    // A throttle recorded under the old single key still applies to that account.
    const legacyCooldown = db.getCacheStale(LOGIN_COOLDOWN_KEY);
    if (legacyCooldown) db.setCache(`${LOGIN_COOLDOWN_KEY}:${migrated.steamId}`, legacyCooldown);
  }
  const saved = sessions.listSaved();
  for (const session of saved) db.addAccount(session.steamId);
  return saved;
}
