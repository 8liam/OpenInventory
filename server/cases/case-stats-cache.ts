import type { CaseStats, OpeningKind } from "../../src/lib/cases/cases.types.ts";
import type { Database } from "../db/db.types.ts";
import { buildCaseStats } from "./case-stats.ts";

type Entry = { readonly version: number; readonly stats: CaseStats };

export type CaseStatsCache = {
  readonly get: (steamId: string, kind: OpeningKind) => CaseStats;
};

/** Memoizes `buildCaseStats` per (steamId, kind) until new history rows are stored. */
export function createCaseStatsCache(
  db: Pick<Database, "historyVersion" | "loadHistoryEvents">,
): CaseStatsCache {
  const entries = new Map<string, Entry>();
  return {
    get(steamId, kind) {
      const key = JSON.stringify([steamId, kind]);
      const version = db.historyVersion();
      const hit = entries.get(key);
      if (hit?.version === version) return hit.stats;
      const stats = buildCaseStats(db.loadHistoryEvents(steamId), kind);
      entries.set(key, { version, stats });
      return stats;
    },
  };
}
