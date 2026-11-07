import type { ItemView } from "../../src/lib/items/item.types.ts";

/** Thresholds already converted into the response currency. */
export type SellThresholds = {
  readonly spikeRatio: number;
  readonly declineShare: number;
  readonly minTrendPrice: number;
  readonly idleMinCount: number;
  readonly idleMaxUnitPrice: number;
};

export type SuggestionItem = Pick<
  ItemView,
  | "id"
  | "name"
  | "marketHashName"
  | "imageUrl"
  | "rarityColor"
  | "locationId"
  | "price"
  | "tradableAfter"
>;
