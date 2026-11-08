export const CASES_PAGE = {
  /** How often to refresh while a history sync is running. */
  pollMs: 2_500,
} as const;

/** The kinds of inventory-history event the Cases page can break down, in pill order. */
export const OPENING_KINDS = ["case", "souvenir", "capsule", "tradeUp", "drop"] as const;
export const DEFAULT_OPENING_KIND = "case" satisfies (typeof OPENING_KINDS)[number];

/** Published weapon-case odds in percent, at the linked disclosure's precision. */
export const CASE_DROP_ODDS = {
  milSpec: 79.923,
  restricted: 15.985,
  classified: 3.197,
  covert: 0.639,
  gold: 0.256,
} as const;
export const CASE_DROP_ODDS_SOURCE = "https://www.csgo.com.cn/news/gamebroad/20170911/206155.shtml";

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
