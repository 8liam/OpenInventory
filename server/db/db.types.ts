import type { HistoryEvent, HistorySyncState } from "../cases/cases.types.ts";
import type { GcItem } from "../steam/steam.types.ts";
import type { StoredShareLink } from "../share/share.types.ts";

export type ValueSnapshot = {
  readonly takenAt: number;
  readonly totalValue: number;
  readonly inventoryValue: number;
  readonly storageValue: number;
  readonly itemCount: number;
};

export type SnapshotKey = { readonly steamId: string; readonly currency: string };

export type Database = {
  readonly getCache: (key: string, maxAgeMs: number) => string | undefined;
  /** Returns stale values too; used as a fallback when a source is down. */
  readonly getCacheStale: (key: string) => string | undefined;
  readonly setCache: (key: string, value: string) => void;
  readonly saveUnit: (
    steamId: string,
    unitId: string,
    itemCount: number,
    items: readonly GcItem[],
  ) => void;
  readonly loadUnits: (
    steamId: string,
  ) => ReadonlyMap<string, { readonly itemCount: number; readonly items: readonly GcItem[] }>;
  readonly pruneUnits: (steamId: string, keepIds: readonly string[]) => void;
  readonly clearUnits: (steamId: string) => void;
  readonly addSnapshot: (key: SnapshotKey, snapshot: ValueSnapshot) => void;
  readonly lastSnapshotAt: (key: SnapshotKey) => number | undefined;
  readonly listSnapshots: (key: SnapshotKey) => readonly ValueSnapshot[];
  /** Stores events not seen before and returns how many were new. */
  readonly saveHistoryEvents: (steamId: string, events: readonly HistoryEvent[]) => number;
  /** Bumps whenever `saveHistoryEvents` actually adds rows; lets callers invalidate derived data. */
  readonly historyVersion: () => number;
  readonly hasHistoryEvent: (steamId: string, eventId: string) => boolean;
  /** Every stored event, newest first. */
  readonly loadHistoryEvents: (steamId: string) => readonly HistoryEvent[];
  readonly loadHistorySync: (steamId: string) => HistorySyncState | undefined;
  readonly saveHistorySync: (steamId: string, state: HistorySyncState) => void;
  readonly insertShareLink: (link: StoredShareLink) => void;
  /** Every link the account has, newest first. Never includes a token. */
  readonly listShareLinks: (steamId: string) => readonly StoredShareLink[];
  readonly findShareLinkByHash: (tokenHash: string) => StoredShareLink | undefined;
  /** Returns false when no link with that id belongs to the account. */
  readonly deleteShareLink: (steamId: string, id: string) => boolean;
  readonly close: () => void;
};
