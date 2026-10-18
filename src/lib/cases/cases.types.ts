import type { OPENING_KINDS } from "./cases.config";

export type OpeningKind = (typeof OPENING_KINDS)[number];

export type RaritySlice = {
  readonly label: string;
  readonly color: string;
  readonly count: number;
};

export type PulledItem = {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly color: string | null;
  readonly count: number;
};

export type CaseOpening = {
  readonly itemName: string;
  readonly imageUrl: string | null;
  readonly color: string | null;
  readonly isStatTrak: boolean;
  readonly isGold: boolean;
  readonly caseName: string | null;
  readonly openedAt: number;
};

export type CaseStats = {
  readonly kind: OpeningKind;
  /** How many events of every kind the history holds, for the kind pills. */
  readonly kindCounts: Readonly<Record<OpeningKind, number>>;
  /** Events of the selected kind. */
  readonly total: number;
  readonly gold: number;
  readonly statTrak: number;
  readonly firstOpenedAt: number | null;
  readonly lastOpenedAt: number | null;
  /** Cases opened since the last gold drop (all of them if none yet); null with no cases. */
  readonly casesSinceGold: number | null;
  /** How many cases it took to hit the first gold, counting that one; null if none yet. */
  readonly casesToFirstGold: number | null;
  readonly rarity: readonly RaritySlice[];
  /** The rarest pulls of this kind, rarest first (newest first among equals). */
  readonly rarest: readonly CaseOpening[];
  readonly topItems: readonly PulledItem[];
  readonly topCases: readonly PulledItem[];
  /** Cases opened per calendar month, oldest first. */
  readonly perMonth: readonly { readonly month: string; readonly count: number }[];
  readonly recent: readonly CaseOpening[];
};

export type HistorySyncStatus = {
  readonly state: "idle" | "running" | "error";
  readonly pages: number;
  readonly events: number;
  /** True once the oldest page has been reached at least once. */
  readonly complete: boolean;
  readonly message: string | null;
  readonly lastSyncAt: number | null;
};

export type CasesResponse = {
  readonly stats: CaseStats;
  readonly sync: HistorySyncStatus;
};
