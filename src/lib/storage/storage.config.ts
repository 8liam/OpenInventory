export const STORAGE_API = {
  refresh: "/api/refresh",
  items: "/api/items",
  dashboard: "/api/dashboard",
  cases: "/api/cases",
  casesSync: "/api/cases/sync",
  state: "/api/state",
  events: "/api/events",
  qrLogin: "/api/auth/qr",
  logout: "/api/auth/logout",
  tradeUp: "/api/tradeup",
  transfer: "/api/transfer",
  transferCancel: "/api/transfer/cancel",
  transferDismiss: "/api/transfer/dismiss",
  renameUnit: "/api/units/rename",
} as const;

export const AUTH_STATUS = {
  signedOut: "signed-out",
  qrPending: "qr-pending",
  connecting: "connecting",
  ready: "ready",
  error: "error",
} as const;

export const STORAGE_LIMITS = {
  qrLoginTimeoutMs: 120_000,
  webSessionTimeoutMs: 15_000,
  gcConnectTimeoutMs: 30_000,
  reconnectBaseMs: 2_000,
  reconnectMaxMs: 5 * 60_000,
  unitRefreshDebounceMs: 2_000,
  /** How long to wait for the GC to confirm one item move. */
  moveConfirmTimeoutMs: 15_000,
  /** Pause between moves so the GC is never flooded. */
  moveGapMs: 300,
  /** CS2 caps custom names (name tags, storage units) at this many characters. */
  unitNameMaxLength: 20,
  /** How long to wait for the GC to report the new name. */
  renameConfirmTimeoutMs: 10_000,
  /** CS2 storage units hold at most this many items. */
  unitCapacity: 1000,
  maxItemsPerTransfer: 1000,
  maxRequestBytes: 1_000_000,
  contentsSettleMs: 15_000,
  contentsPollMs: 100,
} as const;

export const SSE_KEEP_ALIVE_MS = 15_000;

const ITEM_API_BASE = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";

/** Public item metadata (names, Steam CDN images, collections). */
export const ITEM_DATA = {
  baseUrl: ITEM_API_BASE,
  files: [
    "skins_not_grouped",
    "base_weapons",
    "crates",
    "keys",
    "tools",
    "agents",
    "collectibles",
    "stickers",
    "patches",
    "graffiti",
    "keychains",
    "highlights",
    "music_kits",
  ],
  cachePrefix: "items:",
  cacheTtlMs: 24 * 60 * 60 * 1000,
  fetchTimeoutMs: 60_000,
} as const;

export const PRICE_DATA = {
  /** Static USD price files per marketplace plus an exchange-rate file, all from CSGOTrader. */
  baseUrl: "https://prices.csgotrader.app/latest",
  ratesFile: "exchange_rates",
  cachePrefix: "prices:",
  cacheTtlMs: 10 * 60 * 1000,
  fetchTimeoutMs: 30_000,
} as const;

/** Steam economy images accept a size suffix; keeps thumbnails small. */
export const IMAGE_SIZE_SUFFIX = "/128fx128f";
export const STEAM_ECONOMY_IMAGE_MARKER = "/economy/image/";

export const ITEM_DEF = {
  sticker: 1209,
  patch: 4609,
  sealedGraffiti: 1348,
  graffiti: 1349,
  charm: 1355,
  storageUnit: 1201,
  musicKit: 1314,
} as const;

export const CS2_APP_ID = 730;

/** GC message ids sent without a wrapper in globaloffensive. */
export const GC_MESSAGE = { nameItem: 1006 } as const;

/** EResults meaning the saved refresh token itself is no longer valid (steam-user EResult). */
export const TOKEN_REJECTED_ERESULTS: readonly number[] = [5, 15, 26, 27, 43, 65];

/** Raw GC attribute ids (item attribute definition indexes). */
export const GC_ATTRIBUTE = {
  killEater: 80,
  musicId: 166,
  sprayTintId: 233,
  keychainId: 299,
  keychainPattern: 306,
  keychainHighlight: 314,
  keychainSticker: 321,
} as const;

export const SOUVENIR_QUALITY = 12;

export const TRADE_UP = {
  inputCount: 10,
  defaultInputRarity: "rarity_rare_weapon",
  rarityOrder: [
    "rarity_common_weapon",
    "rarity_uncommon_weapon",
    "rarity_rare_weapon",
    "rarity_mythical_weapon",
    "rarity_legendary_weapon",
    "rarity_ancient_weapon",
  ],
} as const;

export const WEAR_BANDS = [
  { name: "Factory New", max: 0.07 },
  { name: "Minimal Wear", max: 0.15 },
  { name: "Field-Tested", max: 0.38 },
  { name: "Well-Worn", max: 0.45 },
  { name: "Battle-Scarred", max: 1.0001 },
] as const;

export const DASHBOARD = {
  dayMs: 86_400_000,
  topHoldingCount: 10,
  /** Rows shown in each of the lowest-float, highest-float and stacks lists. */
  highlightCount: 5,
  /** A stack is two or more copies of the same item. */
  stackMinCount: 2,
  wearOrder: ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"],
} as const;

/** GC ItemCustomizationNotification ids used to confirm storage unit moves. */
export const CASKET_NOTIFICATION = {
  tooFull: 1011,
  added: 1013,
  removed: 1014,
  inventoryFull: 1015,
} as const;

/**
 * The GC lists placeholder ("default") items whose ids have the top four bits set
 * (0xF000…), with the def index in the low bits. Real assets have small ids.
 */
export const PLACEHOLDER_ITEM_ID = { shiftBits: 60n, topNibble: 0xfn } as const;
