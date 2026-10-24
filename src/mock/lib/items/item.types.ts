export type StickerView = {
  readonly name: string;
  readonly imageUrl: string | null;
};

/** A charm attached to a weapon (or, for a loose charm, the charm itself). */
export type CharmView = {
  readonly name: string;
  readonly imageUrl: string | null;
  /** The charm's pattern seed, when the GC reports one. */
  readonly pattern: number | null;
};

/** Decoded from a raw Game Coordinator item; independent of where it lives or its price. */
export type ItemBase = {
  readonly id: string;
  readonly name: string;
  readonly marketHashName: string | null;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly rarityName: string | null;
  readonly category: string;
  readonly customName: string | null;
  readonly wear: number | null;
  readonly wearName: string | null;
  readonly isStatTrak: boolean;
  readonly isSouvenir: boolean;
  readonly stickers: readonly StickerView[];
  readonly charms: readonly CharmView[];
  /** Pattern seed of a loose charm; attached charms carry theirs in `charms`. */
  readonly pattern: number | null;
  /** Epoch ms until which the item is trade-locked, if still locked. */
  readonly tradableAfter: number | null;
};

/** One inventory/storage-unit item with its location and market value. */
export type ItemView = ItemBase & {
  /** Lowest listing in the requested currency, or null when unpriced. */
  readonly price: number | null;
  readonly locationId: string;
  readonly locationName: string;
};

export const INVENTORY_LOCATION_ID = "inventory";

export type InventoryResponse = {
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly priceUpdatedAt: number | null;
};

export type TradeUpOutcome = {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly probability: number;
  readonly float: number | null;
  readonly wearName: string;
  readonly price: number | null;
};

/** Skins of one rarity that can go into a trade-up, cheapest first. */
export type TradeUpCandidatesResponse =
  | { readonly ok: false; readonly reason: string }
  | {
      readonly ok: true;
      readonly rarityId: string;
      readonly inputCount: number;
      readonly candidates: readonly ItemView[];
      readonly currency: string;
    };

export type TradeUpOddsResponse =
  | { readonly ok: false; readonly reason: string }
  | {
      readonly ok: true;
      readonly inputCount: number;
      readonly selected: number;
      readonly averageFloat: number;
      readonly inputCost: number;
      readonly expectedValue: number;
      /** Chance the result is worth more than the inputs cost. */
      readonly chanceToProfit: number;
      readonly outcomes: readonly TradeUpOutcome[];
      readonly currency: string;
    };
