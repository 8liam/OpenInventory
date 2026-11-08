export const CASES_PAGE = {
  /** How often to refresh while a history sync is running. */
  pollMs: 2_500,
} as const;

/** The kinds of inventory-history event the Cases page can break down, in pill order. */
export const OPENING_KINDS = ["case", "souvenir", "capsule", "tradeUp", "drop"] as const;
export const DEFAULT_OPENING_KIND = "case" satisfies (typeof OPENING_KINDS)[number];

/** Published case drop rates, in percent. These apply to weapon cases only. */
export const CASE_DROP_ODDS = {
  milSpec: 79.92,
  restricted: 15.98,
  classified: 3.2,
  covert: 0.64,
  gold: 0.26,
} as const;

/** Kinds whose items can be StatTrak; the counter is noise everywhere else. */
export const STATTRAK_KINDS: readonly (typeof OPENING_KINDS)[number][] = ["case", "souvenir"];

/** Row counts the placeholder panels draw; they match the most the server returns per list. */
export const CASES_SKELETON = {
  rarityRows: 6,
  rarestRows: 8,
  topRows: 10,
  sourceRows: 8,
  recentRows: 12,
} as const;
