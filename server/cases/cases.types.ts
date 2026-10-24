import type { OpeningKind } from "../../src/lib/cases/cases.types.ts";

/** One page of the account's inventory history, as returned by the community endpoint. */
export type HistoryPage = {
  readonly html: string;
  /** Item descriptions per app id, keyed `classid_instanceid`. */
  readonly descriptions: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  /** Where the next (older) page starts; absent on the last page. */
  readonly cursor: HistoryCursor | undefined;
};

export type HistoryCursor = {
  readonly time: number;
  readonly timeFrac: number;
  readonly s: string;
};

/** Why a page could not be read; `auth` means the web session needs refreshing. */
export type HistoryFailure = "auth" | "rate-limited" | "unavailable";

export type HistoryItem = {
  readonly name: string;
  /** Steam economy image path; expand with the usual size suffix. */
  readonly icon: string | null;
  /** Rarity colour as 6 hex digits, no `#`. */
  readonly color: string | null;
  /** Internal type tag, e.g. CSGO_Type_WeaponCase. */
  readonly type: string | null;
  readonly wear: string | null;
  readonly statTrak: boolean;
  readonly collection: string | null;
};

export type HistoryEvent = {
  /** Stable Steam id of the event, shared by all its items. */
  readonly id: string;
  /** Epoch ms, minute precision. */
  readonly occurredAt: number;
  readonly description: string;
  readonly lost: readonly HistoryItem[];
  readonly gained: readonly HistoryItem[];
};

export type EventKind = OpeningKind | "other";

/** Persisted progress of reading the history backwards from now. */
export type HistorySyncState = {
  /** True once a pass has reached the oldest page; only then may a sync stop at known events. */
  readonly complete: boolean;
  /** The oldest page boundary reached so far, to resume an interrupted first pass. */
  readonly resumeFrom: HistoryCursor | undefined;
  readonly updatedAt: number;
};
