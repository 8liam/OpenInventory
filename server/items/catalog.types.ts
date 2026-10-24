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

/** A knife or glove a case can drop (an entry of a crate's `contains_rare`). */
export type SpecialRecord = Omit<NamedRecord, "id"> & {
  readonly id: string;
  readonly paint_index?: string | null;
  /** Doppler-family phase ("Phase 1", "Ruby", ...); null for other finishes. */
  readonly phase?: string | null;
};

export type CrateRecord = NamedRecord & {
  readonly type?: string | null;
  readonly contains?: readonly { readonly id: string }[];
  readonly contains_rare?: readonly SpecialRecord[];
};

export type GraffitiRecord = NamedRecord & { readonly tint?: { readonly id: number } | null };

/** Everything a trade-up needs to know about the skin an input resolved to. */
export type SkinFacts = {
  readonly skinId: string | null;
  readonly collectionIds: readonly string[];
  readonly rarityId: string;
  readonly isStatTrak: boolean;
  readonly isSouvenir: boolean;
};

export type DescribedItem = {
  readonly view: ItemBase;
  readonly skin: SkinFacts | null;
};

/** A knife or glove outcome of a covert trade-up, resolved for a StatTrak flag and float. */
export type SpecialOutcome = {
  readonly id: string;
  readonly name: string;
  readonly marketHashName: string;
  readonly imageUrl: string | null;
  readonly minFloat: number | null;
  readonly maxFloat: number | null;
  /** The record the float resolves to; undefined when the item is unpainted (vanilla). */
  readonly wearName: string | null;
};

export type Catalog = {
  readonly describe: (item: GcItem) => DescribedItem;
  readonly skinImage: (marketHashName: string) => string | null;
  readonly tradeUpOutputs: (
    collectionId: string,
    rarityId: string,
    isStatTrak: boolean,
  ) => readonly SkinRecord[];
  /** Knives and gloves dropped by the cases that contain this skin. */
  readonly specialsFor: (skinId: string) => readonly SpecialRecord[];
  /** The knife/glove listing for a StatTrak flag, with its wear resolved from `float`. */
  readonly resolveSpecial: (
    special: SpecialRecord,
    isStatTrak: boolean,
    averageFloat: number,
  ) => SpecialOutcome | undefined;
  readonly resolveWear: (record: SkinRecord, float: number) => SkinRecord | undefined;
};
