import {
  GC_ATTRIBUTE,
  IMAGE_SIZE_SUFFIX,
  ITEM_DATA,
  ITEM_DEF,
  SOUVENIR_QUALITY,
  STEAM_ECONOMY_IMAGE_MARKER,
  WEAR_BANDS,
} from "../../src/lib/storage/storage.config.ts";
import type { StickerView } from "../../src/lib/items/item.types.ts";
import type { Database } from "../db/db.types.ts";
import type { GcItem } from "../steam/steam.types.ts";
import type {
  Catalog,
  CollectionRecord,
  DescribedItem,
  GraffitiRecord,
  NamedRecord,
  SkinRecord,
} from "./catalog.types.ts";

const UNKNOWN_CATEGORY = "Other";
const NO_WEAR = "Not Painted";
const NAME_PREFIX = {
  slab: "Sticker Slab | ",
  sticker: "Sticker | ",
  souvenirCharm: "Souvenir Charm | ",
  /** Vanilla knives and gloves are listed with a star; the base-weapon data omits it. */
  star: "★ ",
} as const;
const VANILLA_SKIN = "Vanilla";
const STARRED_CATEGORIES: readonly string[] = ["Knives", "Gloves"];

async function loadFile<T>(db: Database, name: string): Promise<T[]> {
  const key = `${ITEM_DATA.cachePrefix}${name}`;
  const fresh = db.getCache(key, ITEM_DATA.cacheTtlMs);
  if (fresh) return JSON.parse(fresh) as T[];
  try {
    const response = await fetch(`${ITEM_DATA.baseUrl}/${name}.json`, {
      signal: AbortSignal.timeout(ITEM_DATA.fetchTimeoutMs),
    });
    if (!response.ok) throw new Error(`${name}.json returned ${response.status}`);
    const text = await response.text();
    db.setCache(key, text);
    return JSON.parse(text) as T[];
  } catch (error) {
    console.warn(`[catalog] ${name} unavailable:`, error);
    const stale = db.getCacheStale(key); // stale data beats none
    return stale ? (JSON.parse(stale) as T[]) : [];
  }
}

export function sizedImage(url: string | undefined | null): string | null {
  if (!url) return null;
  return url.includes(STEAM_ECONOMY_IMAGE_MARKER) ? `${url}${IMAGE_SIZE_SUFFIX}` : url;
}

export function wearNameFor(float: number): string {
  return (WEAR_BANDS.find((band) => float < band.max) ?? WEAR_BANDS[WEAR_BANDS.length - 1]).name;
}

function byDefIndex<T extends NamedRecord>(records: readonly T[]): Map<number, T> {
  const map = new Map<number, T>();
  for (const record of records)
    if (record.def_index !== undefined) map.set(Number(record.def_index), record);
  return map;
}

function readUInt32(item: GcItem, attributeId: number): number | undefined {
  const bytes = item.attribute?.find((a) => a.def_index === attributeId)?.value_bytes;
  return bytes && bytes.length >= 4 ? bytes.readUInt32LE(0) : undefined;
}

function hasAttribute(item: GcItem, attributeId: number): boolean {
  return item.attribute?.some((a) => a.def_index === attributeId) ?? false;
}

/**
 * Decodes raw GC items into names/images using public item data. Resolves in
 * the order paint -> kit -> charm -> music -> def_index, against ByMykel's
 * Steam-CDN-backed data.
 */
export async function loadCatalog(db: Database): Promise<Catalog> {
  const [
    skins,
    bases,
    crates,
    keys,
    tools,
    agents,
    collectibles,
    stickers,
    patches,
    graffiti,
    keychains,
    highlights,
    music,
    collections,
  ] = await Promise.all([
    loadFile<SkinRecord>(db, "skins_not_grouped"),
    loadFile<NamedRecord>(db, "base_weapons"),
    loadFile<NamedRecord>(db, "crates"),
    loadFile<NamedRecord>(db, "keys"),
    loadFile<NamedRecord>(db, "tools"),
    loadFile<NamedRecord>(db, "agents"),
    loadFile<NamedRecord>(db, "collectibles"),
    loadFile<NamedRecord>(db, "stickers"),
    loadFile<NamedRecord>(db, "patches"),
    loadFile<GraffitiRecord>(db, "graffiti"),
    loadFile<NamedRecord>(db, "keychains"),
    loadFile<NamedRecord>(db, "highlights"),
    loadFile<NamedRecord>(db, "music_kits"),
    loadFile<CollectionRecord>(db, "collections"),
  ]);

  // skins_not_grouped has no collection data; join it from collections.json by skin_id.
  const collectionsBySkin = new Map<string, string[]>();
  for (const collection of collections) {
    for (const entry of collection.contains) {
      collectionsBySkin.set(entry.id, [...(collectionsBySkin.get(entry.id) ?? []), collection.id]);
    }
  }
  const collectionIdsOf = (skin: SkinRecord): readonly string[] =>
    (skin.skin_id ? collectionsBySkin.get(skin.skin_id) : undefined) ?? [];

  const skinByKey = new Map<string, SkinRecord>();
  /** Vanilla knives/gloves carry no rarity of their own; they share their category's skin tier. */
  const rarityByCategory = new Map<string, NonNullable<NamedRecord["rarity"]>>();
  const skinsByBase = new Map<string, SkinRecord[]>();
  const byHash = new Map<string, Omit<NamedRecord, "category"> & { category?: string }>();
  const outputsByPool = new Map<string, SkinRecord[]>();
  for (const skin of skins) {
    if (!skin.weapon || skin.paint_index === undefined) continue;
    const flags = `${skin.stattrak ? 1 : 0}:${skin.souvenir ? 1 : 0}`;
    const base = `${skin.weapon.weapon_id}:${skin.paint_index}:${flags}`;
    skinByKey.set(`${base}:${skin.wear?.name ?? NO_WEAR}`, skin);
    skinsByBase.set(base, [...(skinsByBase.get(base) ?? []), skin]);
    if (skin.market_hash_name)
      byHash.set(skin.market_hash_name, { ...skin, category: skin.category?.name });
    const tier = skin.category?.name;
    if (tier && skin.rarity && STARRED_CATEGORIES.includes(tier) && !rarityByCategory.has(tier))
      rarityByCategory.set(tier, skin.rarity);
    if (skin.souvenir) continue;
    for (const collectionId of collectionIdsOf(skin)) {
      const pool = `${collectionId}:${skin.rarity?.id}:${skin.stattrak ? 1 : 0}`;
      outputsByPool.set(pool, [...(outputsByPool.get(pool) ?? []), skin]);
    }
  }
  const hashSources: readonly (readonly [string, readonly NamedRecord[]])[] = [
    ["Container", crates],
    ["Key", keys],
    ["Tool", tools],
    ["Agent", agents],
    ["Collectible", collectibles],
    ["Sticker", stickers],
    ["Patch", patches],
    ["Charm", keychains],
    ["Highlight", highlights],
    ["Music Kit", music],
    ["Weapon", bases],
  ];
  for (const [category, records] of hashSources) {
    for (const record of records) {
      if (record.market_hash_name && !byHash.has(record.market_hash_name))
        byHash.set(record.market_hash_name, { ...record, category });
    }
  }

  const genericByDef = byDefIndex([
    ...bases,
    ...crates,
    ...keys,
    ...tools,
    ...agents,
    ...collectibles,
  ]);
  const stickerByKit = byDefIndex(stickers);
  const patchByKit = byDefIndex(patches);
  const keychainById = byDefIndex(keychains);
  const highlightById = byDefIndex(highlights);
  const musicById = byDefIndex(music);
  const graffitiByKit = new Map<number, GraffitiRecord[]>();
  for (const record of graffiti) {
    const kit = Number(record.def_index);
    graffitiByKit.set(kit, [...(graffitiByKit.get(kit) ?? []), record]);
  }

  function stickerViews(item: GcItem): StickerView[] {
    return (item.stickers ?? []).flatMap((sticker) => {
      const record = stickerByKit.get(sticker.sticker_id);
      return record ? [{ name: record.name, imageUrl: sizedImage(record.image) }] : [];
    });
  }

  function describe(item: GcItem): DescribedItem {
    const float = item.paint_wear;
    const isStatTrak = hasAttribute(item, GC_ATTRIBUTE.killEater);
    const isSouvenir = item.quality === SOUVENIR_QUALITY;
    const wearName = float === undefined ? null : wearNameFor(float);
    const kitId = item.stickers?.[0]?.sticker_id;

    let record: NamedRecord | undefined;
    let category = UNKNOWN_CATEGORY;
    let name: string | undefined;
    let marketHashName: string | undefined;
    let skinFacts: DescribedItem["skin"] = null;

    if (item.paint_index !== undefined && wearName) {
      const base = `${item.def_index}:${Math.round(item.paint_index)}`;
      const skin =
        skinByKey.get(`${base}:${isStatTrak ? 1 : 0}:${isSouvenir ? 1 : 0}:${wearName}`) ??
        skinByKey.get(`${base}:0:0:${wearName}`);
      if (skin) {
        record = skin;
        category = skin.category?.name ?? "Skin";
        skinFacts = {
          collectionIds: collectionIdsOf(skin),
          rarityId: skin.rarity?.id ?? "",
          isStatTrak: skin.stattrak === true,
          isSouvenir: skin.souvenir === true,
        };
      }
    } else if (item.def_index === ITEM_DEF.sticker && kitId !== undefined) {
      record = stickerByKit.get(kitId);
      category = "Sticker";
    } else if (item.def_index === ITEM_DEF.patch && kitId !== undefined) {
      record = patchByKit.get(kitId);
      category = "Patch";
    } else if (
      (item.def_index === ITEM_DEF.sealedGraffiti || item.def_index === ITEM_DEF.graffiti) &&
      kitId !== undefined
    ) {
      const options = graffitiByKit.get(kitId) ?? [];
      const tint = readUInt32(item, GC_ATTRIBUTE.sprayTintId);
      record = options.find((g) => (g.tint?.id ?? undefined) === tint) ?? options[0];
      category = "Graffiti";
    } else if (item.def_index === ITEM_DEF.charm) {
      const sticker = readUInt32(item, GC_ATTRIBUTE.keychainSticker);
      const highlight = readUInt32(item, GC_ATTRIBUTE.keychainHighlight);
      const charm = readUInt32(item, GC_ATTRIBUTE.keychainId);
      if (sticker !== undefined) {
        const base = stickerByKit.get(sticker);
        if (base) {
          record = base;
          name = base.name.replace(NAME_PREFIX.sticker, NAME_PREFIX.slab);
        }
        category = "Sticker Slab";
      } else if (highlight !== undefined) {
        record = highlightById.get(highlight);
        category = "Souvenir Charm";
        if (record) name = `${NAME_PREFIX.souvenirCharm}${record.name}`;
      } else if (charm !== undefined) {
        record = keychainById.get(charm);
        category = "Charm";
      }
    } else if (item.def_index === ITEM_DEF.musicKit) {
      const id = readUInt32(item, GC_ATTRIBUTE.musicId);
      record = id === undefined ? undefined : musicById.get(id);
      category = "Music Kit";
    }

    if (!record) {
      record = genericByDef.get(item.def_index);
      if (record && category === UNKNOWN_CATEGORY) {
        category = record.category?.name ?? categoryForDef(item.def_index);
        if (STARRED_CATEGORIES.includes(category)) {
          const starred = record.name.startsWith(NAME_PREFIX.star)
            ? record.name
            : `${NAME_PREFIX.star}${record.name}`;
          marketHashName = starred;
          name = `${starred} | ${VANILLA_SKIN}`;
        }
      }
    }

    const rarity = record?.rarity ?? rarityByCategory.get(category);
    const resolvedName = name ?? record?.name ?? `Item #${item.def_index}`;
    return {
      skin: skinFacts,
      view: {
        id: item.id,
        name: resolvedName,
        marketHashName: marketHashName ?? name ?? record?.market_hash_name ?? record?.name ?? null,
        imageUrl: sizedImage(record?.image),
        rarityColor: rarity?.color ?? null,
        rarityName: rarity?.name ?? null,
        category,
        customName: item.custom_name ?? null,
        wear: float ?? null,
        wearName,
        isStatTrak,
        isSouvenir,
        stickers: item.paint_index === undefined ? [] : stickerViews(item),
        tradableAfter:
          item.tradable_after && item.tradable_after.getTime() > Date.now()
            ? item.tradable_after.getTime()
            : null,
      },
    };
  }

  function categoryForDef(defIndex: number): string {
    if (crates.some((c) => Number(c.def_index) === defIndex)) return "Container";
    if (keys.some((c) => Number(c.def_index) === defIndex)) return "Key";
    if (agents.some((c) => Number(c.def_index) === defIndex)) return "Agent";
    if (collectibles.some((c) => Number(c.def_index) === defIndex)) return "Collectible";
    if (tools.some((c) => Number(c.def_index) === defIndex)) return "Tool";
    return "Weapon";
  }

  return {
    describe,
    skinImage: (hash) => sizedImage(byHash.get(hash)?.image),
    tradeUpOutputs: (collectionId, rarityId, isStatTrak) =>
      outputsByPool.get(`${collectionId}:${rarityId}:${isStatTrak ? 1 : 0}`) ?? [],
    resolveWear: (record, float) => {
      if (!record.weapon || record.paint_index === undefined) return undefined;
      const base = `${record.weapon.weapon_id}:${record.paint_index}:${record.stattrak ? 1 : 0}:${record.souvenir ? 1 : 0}`;
      return skinByKey.get(`${base}:${wearNameFor(float)}`);
    },
  };
}
