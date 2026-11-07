import type { ItemView } from "../../src/lib/items/item.types.ts";
import type { StorageUnit } from "../../src/lib/storage/storage.types.ts";
import type { StoredShareLink } from "./share.types.ts";

/** Recognisable private values: a leak anywhere in a public payload shows up as one of these strings. */
export const PRIVATE = {
  steamId: "76561190000000777",
  personaName: "PrivatePersonaName",
  assetId: "9988776655",
  unitId: "5544332211",
  unitName: "Locker Alpha",
  terminalExpiry: 1_900_000_000_000,
} as const;

export const OWNER_STEAM_ID = PRIVATE.steamId;

export function makeItem(overrides: Partial<ItemView> = {}): ItemView {
  return {
    id: PRIVATE.assetId,
    name: "AK-47 | Redline",
    marketHashName: "AK-47 | Redline (Field-Tested)",
    imageUrl: "https://cdn.example/redline.png",
    rarityColor: "#d32ce6",
    rarityName: "Classified",
    category: "Rifle",
    customName: null,
    wear: 0.2,
    wearName: "Field-Tested",
    isStatTrak: false,
    isSouvenir: false,
    stickers: [{ name: "Sticker", imageUrl: null }],
    charms: [],
    pattern: 42,
    videoUrl: null,
    terminal: { isActive: true, expiresAt: PRIVATE.terminalExpiry, isFinalOffer: false },
    tradableAfter: 1_800_000_000_000,
    price: 12.5,
    locationId: PRIVATE.unitId,
    locationName: PRIVATE.unitName,
    ...overrides,
  };
}

export const UNIT: StorageUnit = {
  id: PRIVATE.unitId,
  name: PRIVATE.unitName,
  itemCount: 1,
  loaded: true,
};

export function makeLink(overrides: Partial<StoredShareLink> = {}): StoredShareLink {
  return {
    id: "3f2c1a4e-9b7d-4c8e-8a1f-0d2e3f4a5b6c",
    steamId: OWNER_STEAM_ID,
    tokenHash: "unused",
    scope: { kind: "all" },
    hidePrices: false,
    currency: "USD",
    marketplace: "buff163",
    createdAt: 1_700_000_000_000,
    expiresAt: null,
    ...overrides,
  };
}
