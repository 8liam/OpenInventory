import type { ItemBase } from "../../src/lib/items/item.types.ts";
import type { GcItem } from "../steam/steam.types.ts";

export type NamedRecord = {
  readonly id?: string;
  readonly name: string;
  readonly def_index?: number | string;
  readonly image?: string;
  readonly market_hash_name?: string;
  readonly category?: { readonly name: string };
  readonly rarity?: { readonly id: string; readonly name?: string; readonly color: string } | null;
};

export type SkinRecord = NamedRecord & {
  readonly weapon?: { readonly weapon_id: number; readonly name: string };
  readonly pattern?: { readonly name: string };
  readonly paint_index?: string;
  readonly stattrak?: boolean;
  readonly souvenir?: boolean;
  readonly wear?: { readonly name: string };
  readonly min_float?: number;
  readonly max_float?: number;
  readonly skin_id?: string;
};

export type CollectionRecord = {
  readonly id: string;
  readonly name: string;
  readonly contains: readonly { readonly id: string }[];
};

export type GraffitiRecord = NamedRecord & { readonly tint?: { readonly id: number } | null };

/** Everything a trade-up needs to know about the skin an input resolved to. */
export type SkinFacts = {
  readonly collectionIds: readonly string[];
  readonly rarityId: string;
  readonly isStatTrak: boolean;
  readonly isSouvenir: boolean;
};

export type DescribedItem = {
  readonly view: ItemBase;
  readonly skin: SkinFacts | null;
};

export type Catalog = {
  readonly describe: (item: GcItem) => DescribedItem;
  readonly skinImage: (marketHashName: string) => string | null;
  readonly tradeUpOutputs: (
    collectionId: string,
    rarityId: string,
    isStatTrak: boolean,
  ) => readonly SkinRecord[];
  readonly resolveWear: (record: SkinRecord, float: number) => SkinRecord | undefined;
};
