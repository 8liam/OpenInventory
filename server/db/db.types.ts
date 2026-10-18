import type { GcItem } from "../steam/steam.types.ts";

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
  readonly close: () => void;
};
