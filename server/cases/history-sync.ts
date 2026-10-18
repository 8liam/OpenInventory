import type { HistorySyncStatus } from "../../src/lib/cases/cases.types.ts";
import type { Database } from "../db/db.types.ts";
import type { StorageGateway } from "../steam/steam.types.ts";
import { HISTORY_API, SYNC_POLICY } from "./cases.config.ts";
import type { HistoryCursor, HistoryPage, HistorySyncState } from "./cases.types.ts";
import { fetchHistoryPage, HistoryError } from "./history-client.ts";
import { parseHistoryPage } from "./history-parser.ts";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type HistorySync = {
  readonly status: (steamId: string) => HistorySyncStatus;
  /** Starts a sync unless one is running. `onlyIfStale` skips a recently finished history. */
  readonly start: (steamId: string, options?: { readonly onlyIfStale?: boolean }) => void;
};

export function createHistorySync(
  db: Database,
  gateway: Pick<StorageGateway, "getWebCookies">,
): HistorySync {
  let running: string | undefined;
  let progress = { pages: 0, events: 0 };
  let failure: string | null = null;

  /** One page, riding out rate limits and one stale-session refresh. */
  async function readPage(steamId: string, before: HistoryCursor | number): Promise<HistoryPage> {
    let refreshed = false;
    for (let attempt = 0; ; attempt++) {
      try {
        return await fetchHistoryPage(steamId, await gateway.getWebCookies(refreshed), before);
      } catch (error) {
        if (!(error instanceof HistoryError)) throw error;
        if (error.failure === "auth" && !refreshed) {
          refreshed = true;
          continue;
        }
        if (error.failure === "rate-limited" && attempt < HISTORY_API.maxRateLimitRetries) {
          await sleep(HISTORY_API.rateLimitBackoffMs);
          continue;
        }
        throw error;
      }
    }
  }

  async function run(steamId: string): Promise<void> {
    const prior = db.loadHistorySync(steamId);
    let state: HistorySyncState = prior ?? { complete: false, resumeFrom: undefined, updatedAt: 0 };
    // An unfinished first pass resumes where it stopped; a finished one starts from now.
    let before: HistoryCursor | number =
      !state.complete && state.resumeFrom ? state.resumeFrom : Math.floor(Date.now() / 1000);
    for (;;) {
      const page = await readPage(steamId, before);
      const events = parseHistoryPage(page);
      const added = db.saveHistoryEvents(steamId, events);
      progress = { pages: progress.pages + 1, events: progress.events + added };
      const reachedEnd = page.cursor === undefined;
      // Once a full pass exists, a page of nothing but known events means we are caught up.
      const caughtUp = state.complete && events.length > 0 && added === 0;
      state = {
        complete: state.complete || reachedEnd,
        resumeFrom: state.complete || reachedEnd ? undefined : page.cursor,
        updatedAt: Date.now(),
      };
      db.saveHistorySync(steamId, state);
      if (reachedEnd || caughtUp || !page.cursor) return;
      before = page.cursor;
      await sleep(HISTORY_API.pageGapMs);
    }
  }

  return {
    status(steamId) {
      const state = db.loadHistorySync(steamId);
      return {
        state: running === steamId ? "running" : failure ? "error" : "idle",
        pages: progress.pages,
        events: progress.events,
        complete: state?.complete ?? false,
        message: running === steamId ? null : failure,
        lastSyncAt: state?.updatedAt || null,
      };
    },
    start(steamId, options) {
      if (running) return;
      const state = db.loadHistorySync(steamId);
      if (options?.onlyIfStale) {
        if (!state?.complete || Date.now() - state.updatedAt < SYNC_POLICY.staleAfterMs) return;
      }
      running = steamId;
      progress = { pages: 0, events: 0 };
      failure = null;
      void run(steamId)
        .catch((error: unknown) => {
          failure = error instanceof Error ? error.message : String(error);
          console.warn("[history]", error);
        })
        .finally(() => {
          running = undefined;
        });
    },
  };
}
