// server/index.ts
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join as join4, normalize, sep } from "node:path";
import { timingSafeEqual } from "node:crypto";

// src/lib/storage/storage.config.ts
var STORAGE_API = {
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
  tradeUpOdds: "/api/tradeup/odds",
  transfer: "/api/transfer",
  transferCancel: "/api/transfer/cancel",
  transferDismiss: "/api/transfer/dismiss",
  renameUnit: "/api/units/rename",
};
var AUTH_STATUS = {
  signedOut: "signed-out",
  qrPending: "qr-pending",
  connecting: "connecting",
  ready: "ready",
  error: "error",
};
var STORAGE_LIMITS = {
  qrLoginTimeoutMs: 12e4,
  webSessionTimeoutMs: 15e3,
  gcConnectTimeoutMs: 3e4,
  reconnectBaseMs: 2e3,
  reconnectMaxMs: 5 * 6e4,
  unitRefreshDebounceMs: 2e3,
  /** How long to wait for the GC to confirm one item move. */
  moveConfirmTimeoutMs: 15e3,
  /** Pause between moves so the GC is never flooded. */
  moveGapMs: 300,
  /** CS2 caps custom names (name tags, storage units) at this many characters. */
  unitNameMaxLength: 20,
  /** How long to wait for the GC to report the new name. */
  renameConfirmTimeoutMs: 1e4,
  /** CS2 storage units hold at most this many items. */
  unitCapacity: 1e3,
  maxItemsPerTransfer: 1e3,
  maxRequestBytes: 1e6,
  contentsSettleMs: 15e3,
  contentsPollMs: 100,
};
var SSE_KEEP_ALIVE_MS = 15e3;
var ITEM_API_BASE = "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en";
var ITEM_DATA = {
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
  cacheTtlMs: 24 * 60 * 60 * 1e3,
  fetchTimeoutMs: 6e4,
};
var PRICE_DATA = {
  /** Static USD price files per marketplace plus an exchange-rate file, all from CSGOTrader. */
  baseUrl: "https://prices.csgotrader.app/latest",
  ratesFile: "exchange_rates",
  /** Bumped when the stored book shape changes (v2 added Doppler phase prices). */
  cachePrefix: "prices:v2:",
  cacheTtlMs: 10 * 60 * 1e3,
  fetchTimeoutMs: 3e4,
};
var IMAGE_SIZE_SUFFIX = "/128fx128f";
var STEAM_ECONOMY_IMAGE_MARKER = "/economy/image/";
var ITEM_DEF = {
  sticker: 1209,
  patch: 4609,
  sealedGraffiti: 1348,
  graffiti: 1349,
  charm: 1355,
  storageUnit: 1201,
  musicKit: 1314,
};
var CS2_APP_ID = 730;
var GC_MESSAGE = { nameItem: 1006 };
var TOKEN_REJECTED_ERESULTS = [5, 15, 26, 27, 43, 65];
var GC_ATTRIBUTE = {
  killEater: 80,
  musicId: 166,
  sprayTintId: 233,
  keychainId: 299,
  keychainPattern: 306,
  keychainHighlight: 314,
  keychainSticker: 321,
};
var SOUVENIR_QUALITY = 12;
var TRADE_UP = {
  inputCount: 10,
  /** Covert skins trade up to a knife or glove, five at a time. */
  covertRarity: "rarity_ancient_weapon",
  covertInputCount: 5,
  /** Colour of a knife/glove outcome (same gold as the case-opening list). */
  specialColor: "#d4af37",
  /**
   * Odds of each phase within a Doppler-family finish (the finish itself is one
   * equal share of its knife). Fitted to a reference trade-up calculator's output.
   */
  phaseWeights: {
    doppler: {
      "Phase 1": 0.2,
      "Phase 2": 0.2,
      "Phase 3": 0.2,
      "Phase 4": 0.2,
      Ruby: 0.09,
      Sapphire: 0.09,
      "Black Pearl": 0.02,
    },
    gammaDoppler: {
      "Phase 1": 0.23,
      "Phase 2": 0.23,
      "Phase 3": 0.23,
      "Phase 4": 0.23,
      Emerald: 0.08,
    },
  },
  gammaDopplerName: "Gamma Doppler",
  defaultInputRarity: "rarity_rare_weapon",
  rarityOrder: [
    "rarity_common_weapon",
    "rarity_uncommon_weapon",
    "rarity_rare_weapon",
    "rarity_mythical_weapon",
    "rarity_legendary_weapon",
    "rarity_ancient_weapon",
  ],
};
var WEAR_BANDS = [
  { name: "Factory New", max: 0.07 },
  { name: "Minimal Wear", max: 0.15 },
  { name: "Field-Tested", max: 0.38 },
  { name: "Well-Worn", max: 0.45 },
  { name: "Battle-Scarred", max: 1.0001 },
];
var DASHBOARD = {
  dayMs: 864e5,
  topHoldingCount: 10,
  /** Rows shown in each of the lowest-float, highest-float and stacks lists. */
  highlightCount: 5,
  /** A stack is two or more copies of the same item. */
  stackMinCount: 2,
  wearOrder: ["Factory New", "Minimal Wear", "Field-Tested", "Well-Worn", "Battle-Scarred"],
};
var CASKET_NOTIFICATION = {
  tooFull: 1011,
  added: 1013,
  removed: 1014,
  inventoryFull: 1015,
};
var PLACEHOLDER_ITEM_ID = { shiftBits: 60n, topNibble: 0xfn };

// src/lib/cases/cases.config.ts
var OPENING_KINDS = ["case", "souvenir", "capsule", "tradeUp", "drop"];
var DEFAULT_OPENING_KIND = "case";

// server/cases/cases.config.ts
var HISTORY_API = {
  origin: "https://steamcommunity.com",
  appId: 730,
  language: "english",
  loginPath: "/login",
  /** Pause between pages; Steam throttles this endpoint aggressively. */
  pageGapMs: 2500,
  /** Wait before retrying after a 429. */
  rateLimitBackoffMs: 15e3,
  maxRateLimitRetries: 8,
  requestTimeoutMs: 3e4,
};
var HISTORY_SELECTORS = {
  row: ".tradehistoryrow",
  date: ".tradehistory_date",
  time: ".tradehistory_timestamp",
  description: ".tradehistory_event_description",
  itemGroup: ".tradehistory_items",
  sign: ".tradehistory_items_plusminus",
  item: ".history_item",
  itemName: ".history_item_name",
};
var HISTORY_SIGN = { gained: "+", lost: "-" };
var HISTORY_DATE = {
  datePattern: /^(\d{1,2})\s+([A-Za-z]{3}),?\s+(\d{4})$/,
  timePattern: /^(\d{1,2}):(\d{2})\s*(am|pm)$/i,
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
var EVENT_TEXT = {
  unlocked: "Unlocked a container",
  crafted: "Crafted",
  drops: ["Earned a new rank and got a drop", "Got an item drop"],
  ignored: ["Earned due to game play time"],
};
var ITEM_TAGS = {
  rarity: "Rarity",
  type: "Type",
  exterior: "Exterior",
  quality: "Quality",
  itemSet: "ItemSet",
  weaponCase: "CSGO_Type_WeaponCase",
  caseKey: "CSGO_Tool_WeaponCase_KeyTag",
  stickerTool: "CSGO_Tool_Sticker",
  gloves: "Type_Hands",
  knife: "CSGO_Type_Knife",
  statTrak: "StatTrak\u2122",
  souvenirName: "Souvenir",
  starName: "\u2605",
  /** Weapon categories a case can drop (everything under CSGO_Type_ except tools and cases). */
  weaponPrefix: "CSGO_Type_",
};
var RARITY_COLOR = {
  gold: "eb4b4b",
  covert: "eb4b4b",
  classified: "d32ce6",
  restricted: "8847ff",
  milSpec: "4b69ff",
};
var TRADE_UP_INPUT_COUNTS = [10, 5];
var RARITY_BUCKETS = [
  { key: "gold", label: "Gold", color: "d4af37" },
  { key: "covert", label: "Covert", color: RARITY_COLOR.covert },
  { key: "classified", label: "Classified", color: RARITY_COLOR.classified },
  { key: "restricted", label: "Restricted", color: RARITY_COLOR.restricted },
  { key: "milSpec", label: "Mil-Spec", color: RARITY_COLOR.milSpec },
  { key: "other", label: "Other", color: "9ca3af" },
];
var CASE_STATS = {
  topItemCount: 10,
  topCaseCount: 8,
  recentCount: 12,
  rarestCount: 8,
};
var SYNC_POLICY = {
  /** A finished history is topped up with newer events when this old. */
  staleAfterMs: 15 * 6e4,
};

// server/cases/history-classify.ts
function isWeapon(item) {
  const { type } = item;
  if (!type) return false;
  if (type === ITEM_TAGS.gloves || type === ITEM_TAGS.knife) return true;
  return (
    type.startsWith(ITEM_TAGS.weaponPrefix) &&
    type !== ITEM_TAGS.weaponCase &&
    type !== ITEM_TAGS.stickerTool
  );
}
function isGold(item) {
  if (item.type === ITEM_TAGS.knife || item.type === ITEM_TAGS.gloves) return true;
  return item.color === RARITY_COLOR.gold && item.name.includes(ITEM_TAGS.starName);
}
function classifyEvent(event) {
  const [reward] = event.gained;
  if (event.description.includes(EVENT_TEXT.unlocked)) {
    const opened = event.lost.some((item) => item.type === ITEM_TAGS.weaponCase);
    if (reward && isWeapon(reward) && opened) {
      return reward.name.includes(ITEM_TAGS.souvenirName) ? "souvenir" : "case";
    }
    if (reward?.type === ITEM_TAGS.stickerTool) return "capsule";
    return "other";
  }
  if (
    event.description.includes(EVENT_TEXT.crafted) &&
    TRADE_UP_INPUT_COUNTS.includes(event.lost.length) &&
    event.gained.length === 1
  ) {
    return "tradeUp";
  }
  if (EVENT_TEXT.drops.some((text) => event.description.includes(text)) && reward) return "drop";
  return "other";
}

// server/cases/case-stats.ts
var ECONOMY_IMAGE_BASE = "https://community.fastly.steamstatic.com/economy/image/";
function imageUrl(item) {
  return item?.icon ? `${ECONOMY_IMAGE_BASE}${item.icon}${IMAGE_SIZE_SUFFIX}` : null;
}
function bucketKey(item) {
  if (isGold(item)) return "gold";
  switch (item.color) {
    case RARITY_COLOR.covert:
      return "covert";
    case RARITY_COLOR.classified:
      return "classified";
    case RARITY_COLOR.restricted:
      return "restricted";
    case RARITY_COLOR.milSpec:
      return "milSpec";
    default:
      return "other";
  }
}
function rarityRank(opening) {
  if (opening.isGold) return 0;
  const index = RARITY_BUCKETS.findIndex((b) => b.key !== "gold" && b.color === opening.color);
  return index < 0 ? RARITY_BUCKETS.length : index;
}
function monthKey(timestamp) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function sourceOf(event, kind) {
  if (kind === "tradeUp" || kind === "drop") return void 0;
  return event.lost.find((item) => item.type !== ITEM_TAGS.caseKey);
}
function tally(entries, limit) {
  const counts = /* @__PURE__ */ new Map();
  for (const [name, item] of entries) {
    const entry = counts.get(name);
    if (entry) entry.count += 1;
    else counts.set(name, { item, count: 1 });
  }
  return [...counts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit)
    .map(([name, { item, count }]) => ({
      name,
      imageUrl: imageUrl(item),
      color: item.color,
      count,
    }));
}
function withEmptyMonths(counts) {
  const keys = [...counts.keys()].sort();
  const first = keys[0];
  const last = keys[keys.length - 1];
  if (!first || !last) return [];
  const result = [];
  const [startYear = 0, startMonth = 1] = first.split("-").map(Number);
  let cursor = new Date(startYear, startMonth - 1, 1);
  for (;;) {
    const key = monthKey(cursor.getTime());
    result.push({ month: key, count: counts.get(key) ?? 0 });
    if (key === last) return result;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
}
function buildCaseStats(events, kind) {
  const kinds = /* @__PURE__ */ new Map();
  for (const event of events) {
    const eventKind = classifyEvent(event);
    kinds.set(eventKind, [...(kinds.get(eventKind) ?? []), event]);
  }
  const cases = kinds.get(kind) ?? [];
  const openings = cases.flatMap((event) => {
    const [reward] = event.gained;
    if (!reward) return [];
    return [
      {
        itemName: reward.name,
        imageUrl: imageUrl(reward),
        color: reward.color,
        isStatTrak: reward.statTrak,
        isGold: isGold(reward),
        caseName: sourceOf(event, kind)?.name ?? null,
        openedAt: event.occurredAt,
      },
    ];
  });
  const goldIndexNewestFirst = openings.findIndex((o) => o.isGold);
  const goldIndexOldestFirst = openings.map((o) => o.isGold).lastIndexOf(true);
  const rarityCounts = /* @__PURE__ */ new Map();
  for (const event of cases) {
    const reward = event.gained[0];
    if (reward) rarityCounts.set(bucketKey(reward), (rarityCounts.get(bucketKey(reward)) ?? 0) + 1);
  }
  const rarity = RARITY_BUCKETS.map((bucket) => ({
    label: bucket.label,
    color: bucket.color,
    count: rarityCounts.get(bucket.key) ?? 0,
  })).filter((slice) => slice.count > 0);
  const perMonth = /* @__PURE__ */ new Map();
  for (const opening of [...openings].reverse()) {
    const key = monthKey(opening.openedAt);
    perMonth.set(key, (perMonth.get(key) ?? 0) + 1);
  }
  const kindCounts = Object.fromEntries(OPENING_KINDS.map((k) => [k, kinds.get(k)?.length ?? 0]));
  return {
    kind,
    kindCounts,
    total: openings.length,
    gold: openings.filter((o) => o.isGold).length,
    statTrak: openings.filter((o) => o.isStatTrak).length,
    firstOpenedAt: openings[openings.length - 1]?.openedAt ?? null,
    lastOpenedAt: openings[0]?.openedAt ?? null,
    casesSinceGold:
      kind !== "case" || openings.length === 0
        ? null
        : goldIndexNewestFirst < 0
          ? openings.length
          : goldIndexNewestFirst,
    casesToFirstGold: goldIndexOldestFirst < 0 ? null : openings.length - goldIndexOldestFirst,
    rarity,
    rarest: openings
      .map((opening, index) => ({ opening, index, rank: rarityRank(opening) }))
      .sort((a, b) => a.rank - b.rank || a.index - b.index)
      .slice(0, CASE_STATS.rarestCount)
      .map((entry) => entry.opening),
    topItems: tally(
      cases.flatMap((e) => (e.gained[0] ? [[e.gained[0].name, e.gained[0]]] : [])),
      CASE_STATS.topItemCount,
    ),
    topCases: tally(
      cases.flatMap((e) => {
        const source = sourceOf(e, kind);
        return source ? [[source.name, source]] : [];
      }),
      CASE_STATS.topCaseCount,
    ),
    perMonth: withEmptyMonths(perMonth),
    recent: openings.slice(0, CASE_STATS.recentCount),
  };
}

// server/cases/history-client.ts
var HistoryError = class extends Error {
  failure;
  constructor(failure, message) {
    super(message);
    this.failure = failure;
  }
};
function timezoneCookie() {
  return `timezoneOffset=${-(/* @__PURE__ */ new Date().getTimezoneOffset()) * 60},0`;
}
function pageUrl(steamId, before) {
  const cursor = typeof before === "number" ? { time: before, timeFrac: 0, s: void 0 } : before;
  const params = new URLSearchParams({
    ajax: "1",
    l: HISTORY_API.language,
    "cursor[time]": String(cursor.time),
    "cursor[time_frac]": String(cursor.timeFrac),
  });
  if (cursor.s !== void 0) params.set("cursor[s]", cursor.s);
  params.append("app[]", String(HISTORY_API.appId));
  return `${HISTORY_API.origin}/profiles/${steamId}/inventoryhistory/?${params}`;
}
async function fetchHistoryPage(steamId, cookies, before) {
  const response = await fetch(pageUrl(steamId, before), {
    headers: {
      cookie: [...cookies, timezoneCookie()].join("; "),
      "x-requested-with": "XMLHttpRequest",
      accept: "application/json",
    },
    signal: AbortSignal.timeout(HISTORY_API.requestTimeoutMs),
  });
  if (response.status === 429) throw new HistoryError("rate-limited", "Steam is rate limiting");
  if (new URL(response.url).pathname.startsWith(HISTORY_API.loginPath))
    throw new HistoryError("auth", "Steam web session is not signed in");
  if (!response.ok) throw new HistoryError("unavailable", `Steam returned ${response.status}`);
  let body;
  try {
    body = await response.json();
  } catch {
    throw new HistoryError("auth", "Steam returned a non-JSON page");
  }
  if (!body.success || typeof body.html !== "string")
    throw new HistoryError("auth", "Steam did not return history");
  const { cursor } = body;
  return {
    html: body.html,
    descriptions: body.descriptions ?? {},
    cursor:
      cursor?.time === void 0
        ? void 0
        : { time: cursor.time, timeFrac: cursor.time_frac ?? 0, s: cursor.s ?? "" },
  };
}

// server/cases/history-parser.ts
import { parse } from "node-html-parser";
var APP_KEY = String(HISTORY_API.appId);
function tagOf(description, category) {
  return description.tags?.find((tag) => tag.category === category);
}
function toItem(description, fallbackName) {
  return {
    name: description.name ?? fallbackName,
    icon: description.icon_url ?? null,
    color: tagOf(description, ITEM_TAGS.rarity)?.color ?? null,
    type: tagOf(description, ITEM_TAGS.type)?.internal_name ?? null,
    wear: tagOf(description, ITEM_TAGS.exterior)?.name ?? null,
    statTrak: tagOf(description, ITEM_TAGS.quality)?.name === ITEM_TAGS.statTrak,
    collection: tagOf(description, ITEM_TAGS.itemSet)?.name ?? null,
  };
}
function parseHistoryDate(dateText, timeText) {
  const date = HISTORY_DATE.datePattern.exec(dateText.trim());
  const time = HISTORY_DATE.timePattern.exec(timeText.trim());
  if (!date || !time) return void 0;
  const month = HISTORY_DATE.months.findIndex((m) => m.toLowerCase() === date[2]?.toLowerCase());
  if (month < 0) return void 0;
  let hours = Number(time[1]) % 12;
  if (time[3]?.toLowerCase() === "pm") hours += 12;
  return new Date(Number(date[3]), month, Number(date[1]), hours, Number(time[2])).getTime();
}
function itemsOf(group, descriptions) {
  return group.querySelectorAll(HISTORY_SELECTORS.item).flatMap((element) => {
    if (element.getAttribute("data-appid") !== APP_KEY) return [];
    const key = `${element.getAttribute("data-classid")}_${element.getAttribute("data-instanceid")}`;
    const description = descriptions[key];
    const fallback = element.querySelector(HISTORY_SELECTORS.itemName)?.text.trim() ?? key;
    return [toItem(description ?? {}, fallback)];
  });
}
function parseHistoryPage(page) {
  const descriptions = page.descriptions[APP_KEY] ?? {};
  const events = [];
  for (const row of parse(page.html).querySelectorAll(HISTORY_SELECTORS.row)) {
    const description = row.querySelector(HISTORY_SELECTORS.description)?.text.trim();
    const dateCell = row.querySelector(HISTORY_SELECTORS.date);
    const timeText = dateCell?.querySelector(HISTORY_SELECTORS.time)?.text ?? "";
    const dateText = (dateCell?.childNodes[0]?.text ?? "").trim();
    const occurredAt = parseHistoryDate(dateText, timeText);
    const firstItemId = row.querySelector(`${HISTORY_SELECTORS.item}[id]`)?.getAttribute("id");
    if (!description || occurredAt === void 0 || !firstItemId) continue;
    const gained = [];
    const lost = [];
    for (const group of row.querySelectorAll(HISTORY_SELECTORS.itemGroup)) {
      const sign = group.querySelector(HISTORY_SELECTORS.sign)?.text.trim();
      if (sign === HISTORY_SIGN.gained) gained.push(...itemsOf(group, descriptions));
      else if (sign === HISTORY_SIGN.lost) lost.push(...itemsOf(group, descriptions));
    }
    if (gained.length === 0 && lost.length === 0) continue;
    events.push({
      id: firstItemId.split("_")[0] ?? firstItemId,
      occurredAt,
      description,
      lost,
      gained,
    });
  }
  return events;
}

// server/cases/history-sync.ts
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function createHistorySync(db2, gateway2) {
  let running;
  let progress = { pages: 0, events: 0 };
  let failure = null;
  async function readPage(steamId, before) {
    let refreshed = false;
    for (let attempt = 0; ; attempt++) {
      try {
        return await fetchHistoryPage(steamId, await gateway2.getWebCookies(refreshed), before);
      } catch (error) {
        if (!(error instanceof HistoryError)) throw error;
        if (error.failure === "auth" && !refreshed) {
          refreshed = true;
          continue;
        }
        if (error.failure === "rate-limited" && attempt < HISTORY_API.maxRateLimitRetries) {
          await sleep(HISTORY_API.rateLimitBackoffMs);
          continue;
        }
        throw error;
      }
    }
  }
  async function run(steamId) {
    const prior = db2.loadHistorySync(steamId);
    let state = prior ?? { complete: false, resumeFrom: void 0, updatedAt: 0 };
    let before =
      !state.complete && state.resumeFrom ? state.resumeFrom : Math.floor(Date.now() / 1e3);
    for (;;) {
      const page = await readPage(steamId, before);
      const events = parseHistoryPage(page);
      const added = db2.saveHistoryEvents(steamId, events);
      progress = { pages: progress.pages + 1, events: progress.events + added };
      const reachedEnd = page.cursor === void 0;
      const caughtUp = state.complete && events.length > 0 && added === 0;
      state = {
        complete: state.complete || reachedEnd,
        resumeFrom: state.complete || reachedEnd ? void 0 : page.cursor,
        updatedAt: Date.now(),
      };
      db2.saveHistorySync(steamId, state);
      if (reachedEnd || caughtUp || !page.cursor) return;
      before = page.cursor;
      await sleep(HISTORY_API.pageGapMs);
    }
  }
  return {
    status(steamId) {
      const state = db2.loadHistorySync(steamId);
      return {
        state: running === steamId ? "running" : failure ? "error" : "idle",
        pages: progress.pages,
        events: progress.events,
        complete: state?.complete ?? false,
        message: running === steamId ? null : failure,
        lastSyncAt: state?.updatedAt || null,
      };
    },
    start(steamId, options) {
      if (running) return;
      const state = db2.loadHistorySync(steamId);
      if (options?.onlyIfStale) {
        if (!state?.complete || Date.now() - state.updatedAt < SYNC_POLICY.staleAfterMs) return;
      }
      running = steamId;
      progress = { pages: 0, events: 0 };
      failure = null;
      void run(steamId)
        .catch((error) => {
          failure = error instanceof Error ? error.message : String(error);
          console.warn("[history]", error);
        })
        .finally(() => {
          running = void 0;
        });
    },
  };
}

// server/db/db.ts
import { mkdirSync } from "node:fs";
import { join as join2 } from "node:path";
import { DatabaseSync } from "node:sqlite";

// server/server.config.ts
import { homedir } from "node:os";
import { join } from "node:path";
var DEFAULT_PORT = 4174;
var DEFAULT_HOST = "127.0.0.1";
var DEFAULT_DATA_DIR = join(homedir(), ".openinventory");
var ENV = {
  host: "OPENINVENTORY_HOST",
  port: "OPENINVENTORY_PORT",
  dataDir: "OPENINVENTORY_DATA_DIR",
  password: "OPENINVENTORY_PASSWORD",
  webDir: "OPENINVENTORY_WEB_DIR",
};
function readSettings(env = process.env) {
  const port = Number(env[ENV.port] ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port <= 0)
    throw new Error(`${ENV.port} must be a positive integer`);
  return {
    host: env[ENV.host] ?? DEFAULT_HOST,
    port,
    dataDir: env[ENV.dataDir] ?? DEFAULT_DATA_DIR,
    password: env[ENV.password] || void 0,
    webDir: env[ENV.webDir] || void 0,
  };
}
var SERVER_LIMITS = {
  /** Minimum gap between persisted value snapshots. */
  snapshotIntervalMs: 60 * 60 * 1e3,
  snapshotRetentionDays: 730,
  /** Lets unit contents finish loading before the first background snapshot. */
  snapshotInitialDelayMs: 9e4,
  basicAuthRealm: "OpenInventory",
  basicAuthUser: "openinventory",
};

// server/db/db.ts
var DB_FILE = "openinventory.db";
var DAY_MS = 864e5;
var BUFFER_TAG = "Buffer";
var DATE_KEYS = /* @__PURE__ */ new Set(["tradable_after"]);
var SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS unit_contents (
    steam_id TEXT NOT NULL,
    unit_id TEXT NOT NULL,
    item_count INTEGER NOT NULL,
    items_json TEXT NOT NULL,
    loaded_at INTEGER NOT NULL,
    PRIMARY KEY (steam_id, unit_id)
  );
  CREATE TABLE IF NOT EXISTS value_snapshots (
    steam_id TEXT NOT NULL,
    currency TEXT NOT NULL,
    taken_at INTEGER NOT NULL,
    total_value REAL NOT NULL,
    inventory_value REAL NOT NULL,
    storage_value REAL NOT NULL,
    item_count INTEGER NOT NULL,
    PRIMARY KEY (steam_id, currency, taken_at)
  );
  CREATE TABLE IF NOT EXISTS history_events (
    steam_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    occurred_at INTEGER NOT NULL,
    event_json TEXT NOT NULL,
    PRIMARY KEY (steam_id, event_id)
  );
  CREATE TABLE IF NOT EXISTS history_sync (
    steam_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL
  );
`;
function isBufferJson(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    value.type === BUFFER_TAG &&
    Array.isArray(value.data)
  );
}
function reviveItem(key, value) {
  if (isBufferJson(value)) return Buffer.from(value.data);
  if (DATE_KEYS.has(key) && typeof value === "string") return new Date(value);
  return value;
}
function openDatabase(dataDir) {
  mkdirSync(dataDir, { recursive: true });
  const db2 = new DatabaseSync(join2(dataDir, DB_FILE));
  db2.exec(SCHEMA);
  const getCache = db2.prepare("SELECT value, fetched_at FROM cache WHERE key = ?");
  const putCache = db2.prepare(
    "INSERT INTO cache (key, value, fetched_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, fetched_at = excluded.fetched_at",
  );
  const putUnit = db2.prepare(
    "INSERT INTO unit_contents (steam_id, unit_id, item_count, items_json, loaded_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(steam_id, unit_id) DO UPDATE SET item_count = excluded.item_count, items_json = excluded.items_json, loaded_at = excluded.loaded_at",
  );
  const getUnits = db2.prepare(
    "SELECT unit_id, item_count, items_json FROM unit_contents WHERE steam_id = ?",
  );
  const listUnitIds = db2.prepare("SELECT unit_id FROM unit_contents WHERE steam_id = ?");
  const deleteUnit = db2.prepare("DELETE FROM unit_contents WHERE steam_id = ? AND unit_id = ?");
  const deleteUnits = db2.prepare("DELETE FROM unit_contents WHERE steam_id = ?");
  const putSnapshot = db2.prepare(
    "INSERT OR REPLACE INTO value_snapshots (steam_id, currency, taken_at, total_value, inventory_value, storage_value, item_count) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  const lastSnapshot = db2.prepare(
    "SELECT MAX(taken_at) AS taken_at FROM value_snapshots WHERE steam_id = ? AND currency = ?",
  );
  const listSnapshots = db2.prepare(
    "SELECT taken_at, total_value, inventory_value, storage_value, item_count FROM value_snapshots WHERE steam_id = ? AND currency = ? ORDER BY taken_at",
  );
  const insertEvent = db2.prepare(
    "INSERT OR IGNORE INTO history_events (steam_id, event_id, occurred_at, event_json) VALUES (?, ?, ?, ?)",
  );
  const listEvents = db2.prepare(
    "SELECT event_json FROM history_events WHERE steam_id = ? ORDER BY occurred_at DESC, event_id DESC",
  );
  const hasEvent = db2.prepare(
    "SELECT 1 AS present FROM history_events WHERE steam_id = ? AND event_id = ?",
  );
  const getSync = db2.prepare("SELECT state_json FROM history_sync WHERE steam_id = ?");
  const putSync = db2.prepare(
    "INSERT INTO history_sync (steam_id, state_json) VALUES (?, ?) ON CONFLICT(steam_id) DO UPDATE SET state_json = excluded.state_json",
  );
  const pruneSnapshots = db2.prepare("DELETE FROM value_snapshots WHERE taken_at < ?");
  return {
    getCache(key, maxAgeMs) {
      const row = getCache.get(key);
      if (!row || Date.now() - Number(row.fetched_at) > maxAgeMs) return void 0;
      return String(row.value);
    },
    getCacheStale(key) {
      const row = getCache.get(key);
      return row ? String(row.value) : void 0;
    },
    setCache(key, value) {
      putCache.run(key, value, Date.now());
    },
    saveUnit(steamId, unitId, itemCount, items) {
      putUnit.run(steamId, unitId, itemCount, JSON.stringify(items), Date.now());
    },
    loadUnits(steamId) {
      const units = /* @__PURE__ */ new Map();
      for (const row of getUnits.all(steamId)) {
        units.set(String(row.unit_id), {
          itemCount: Number(row.item_count),
          items: JSON.parse(String(row.items_json), reviveItem),
        });
      }
      return units;
    },
    pruneUnits(steamId, keepIds) {
      const keep = new Set(keepIds);
      for (const row of listUnitIds.all(steamId)) {
        if (!keep.has(String(row.unit_id))) deleteUnit.run(steamId, String(row.unit_id));
      }
    },
    clearUnits(steamId) {
      deleteUnits.run(steamId);
    },
    addSnapshot({ steamId, currency }, s) {
      putSnapshot.run(
        steamId,
        currency,
        s.takenAt,
        s.totalValue,
        s.inventoryValue,
        s.storageValue,
        s.itemCount,
      );
      pruneSnapshots.run(Date.now() - SERVER_LIMITS.snapshotRetentionDays * DAY_MS);
    },
    lastSnapshotAt({ steamId, currency }) {
      const row = lastSnapshot.get(steamId, currency);
      return row?.taken_at == null ? void 0 : Number(row.taken_at);
    },
    listSnapshots({ steamId, currency }) {
      return listSnapshots.all(steamId, currency).map((row) => ({
        takenAt: Number(row.taken_at),
        totalValue: Number(row.total_value),
        inventoryValue: Number(row.inventory_value),
        storageValue: Number(row.storage_value),
        itemCount: Number(row.item_count),
      }));
    },
    saveHistoryEvents(steamId, events) {
      let added = 0;
      for (const event of events) {
        const result = insertEvent.run(steamId, event.id, event.occurredAt, JSON.stringify(event));
        added += Number(result.changes);
      }
      return added;
    },
    hasHistoryEvent(steamId, eventId) {
      return hasEvent.get(steamId, eventId) !== void 0;
    },
    loadHistoryEvents(steamId) {
      return listEvents.all(steamId).map((row) => JSON.parse(String(row.event_json)));
    },
    loadHistorySync(steamId) {
      const row = getSync.get(steamId);
      return row ? JSON.parse(String(row.state_json)) : void 0;
    },
    saveHistorySync(steamId, state) {
      putSync.run(steamId, JSON.stringify(state));
    },
    close: () => db2.close(),
  };
}

// src/lib/items/item.types.ts
var INVENTORY_LOCATION_ID = "inventory";

// server/dashboard.ts
var UNKNOWN_LABEL = "Other";
function addTo(map, key, value, color) {
  const entry = map.get(key) ?? { value: 0, count: 0, color };
  entry.value += value;
  entry.count += 1;
  map.set(key, entry);
}
function toSlices(map) {
  return [...map]
    .map(([label, { value, count, color }]) => ({
      label,
      value,
      count,
      ...(color ? { color } : {}),
    }))
    .sort((a, b) => b.value - a.value);
}
function changeSince(history, current, now, windowMs) {
  const cutoff = now - windowMs;
  let baseline;
  for (const snapshot of history) if (snapshot.takenAt <= cutoff) baseline = snapshot;
  return baseline ? current - baseline.totalValue : null;
}
function summarizeValue(items) {
  let inventoryValue = 0;
  let storageValue = 0;
  for (const item of items) {
    const price = item.price ?? 0;
    if (item.locationId === INVENTORY_LOCATION_ID) inventoryValue += price;
    else storageValue += price;
  }
  return { inventoryValue, storageValue, totalValue: inventoryValue + storageValue };
}
function buildDashboard(args) {
  const { items, history, currency, priceUpdatedAt, unitsLoaded, unitsTotal } = args;
  const now = args.now ?? Date.now();
  const { inventoryValue, storageValue, totalValue } = summarizeValue(items);
  const category = /* @__PURE__ */ new Map();
  const rarity = /* @__PURE__ */ new Map();
  const wear = /* @__PURE__ */ new Map();
  const location = /* @__PURE__ */ new Map();
  const stacks = /* @__PURE__ */ new Map();
  for (const item of items) {
    const price = item.price ?? 0;
    addTo(category, item.category, price);
    addTo(rarity, item.rarityName ?? UNKNOWN_LABEL, price, item.rarityColor ?? void 0);
    if (item.wearName) addTo(wear, item.wearName, price);
    const place = location.get(item.locationId) ?? { value: 0, count: 0, name: item.locationName };
    place.value += price;
    place.count += 1;
    location.set(item.locationId, place);
    const key = item.marketHashName ?? item.name;
    const stack = stacks.get(key) ?? {
      name: item.name,
      imageUrl: item.imageUrl,
      rarityColor: item.rarityColor,
      count: 0,
      unitPrice: price,
      totalValue: 0,
    };
    stack.count += 1;
    stack.totalValue += price;
    stacks.set(key, stack);
  }
  const holdings = [...stacks.values()].sort((a, b) => b.totalValue - a.totalValue);
  const byLocation = [...location]
    .map(([id, { value, count, name }]) => ({ id, label: name, value, count }))
    .sort((a, b) =>
      a.id === INVENTORY_LOCATION_ID ? -1 : b.id === INVENTORY_LOCATION_ID ? 1 : b.value - a.value,
    );
  const withFloat = items.filter((i) => i.wear !== null);
  const toHighlight = (i) => ({
    id: `${i.locationId}:${i.id}`,
    name: i.name,
    wear: i.wear ?? 0,
    imageUrl: i.imageUrl,
    rarityColor: i.rarityColor,
    price: i.price,
  });
  const byWear = [...withFloat].sort((a, b) => (a.wear ?? 0) - (b.wear ?? 0));
  const lowestFloats = byWear.slice(0, DASHBOARD.highlightCount).map(toHighlight);
  const highestFloats = byWear.slice(-DASHBOARD.highlightCount).reverse().map(toHighlight);
  const stackList = holdings
    .filter((h) => h.count >= DASHBOARD.stackMinCount)
    .sort((a, b) => b.count - a.count || b.totalValue - a.totalValue)
    .slice(0, DASHBOARD.highlightCount);
  const change = {
    day: changeSince(history, totalValue, now, DASHBOARD.dayMs),
    week: changeSince(history, totalValue, now, DASHBOARD.dayMs * 7),
    month: changeSince(history, totalValue, now, DASHBOARD.dayMs * 30),
  };
  return {
    currency,
    priceUpdatedAt,
    totals: {
      value: totalValue,
      itemCount: items.length,
      inventoryValue,
      storageValue,
      unitsLoaded,
      unitsTotal,
    },
    change,
    history: [
      ...history.map((s) => ({
        takenAt: s.takenAt,
        totalValue: s.totalValue,
        inventoryValue: s.inventoryValue,
        storageValue: s.storageValue,
      })),
      { takenAt: now, totalValue, inventoryValue, storageValue },
    ],
    byCategory: toSlices(category),
    byRarity: toSlices(rarity),
    byWear: DASHBOARD.wearOrder.flatMap((label) => {
      const entry = wear.get(label);
      return entry ? [{ label, value: entry.value, count: entry.count }] : [];
    }),
    byLocation,
    topHoldings: holdings.slice(0, DASHBOARD.topHoldingCount),
    insights: { lowestFloats, highestFloats, stacks: stackList },
  };
}

// server/items/collect.ts
var INVENTORY_LOCATION_NAME = "Inventory";
function collectItems(gateway2, catalog2, book) {
  const priceOf = (hash) => (hash ? (book.byName.get(hash)?.price ?? null) : null);
  const toCollected = (raw, locationId, locationName) => {
    const { view, skin } = catalog2.describe(raw);
    return {
      skin,
      view: {
        ...view,
        price: priceOf(view.marketHashName),
        locationId,
        locationName,
      },
    };
  };
  const collected = gateway2
    .getInventory()
    .map((raw) => toCollected(raw, INVENTORY_LOCATION_ID, INVENTORY_LOCATION_NAME));
  for (const unit of gateway2.getUnits()) {
    for (const raw of unit.items) collected.push(toCollected(raw, unit.id, unit.name));
  }
  return collected;
}

// server/items/catalog.ts
var UNKNOWN_CATEGORY = "Other";
var NO_WEAR = "Not Painted";
var NAME_PREFIX = {
  slab: "Sticker Slab | ",
  sticker: "Sticker | ",
  souvenirCharm: "Souvenir Charm | ",
  souvenirPackage: "Souvenir Package",
  /** Vanilla knives and gloves are listed with a star; the base-weapon data omits it. */
  star: "\u2605 ",
};
var VANILLA_SKIN = "Vanilla";
var STARRED_CATEGORIES = ["Knives", "Gloves"];
async function loadFile(db2, name) {
  const key = `${ITEM_DATA.cachePrefix}${name}`;
  const fresh = db2.getCache(key, ITEM_DATA.cacheTtlMs);
  if (fresh) return JSON.parse(fresh);
  try {
    const response = await fetch(`${ITEM_DATA.baseUrl}/${name}.json`, {
      signal: AbortSignal.timeout(ITEM_DATA.fetchTimeoutMs),
    });
    if (!response.ok) throw new Error(`${name}.json returned ${response.status}`);
    const text = await response.text();
    db2.setCache(key, text);
    return JSON.parse(text);
  } catch (error) {
    console.warn(`[catalog] ${name} unavailable:`, error);
    const stale = db2.getCacheStale(key);
    return stale ? JSON.parse(stale) : [];
  }
}
function sizedImage(url) {
  if (!url) return null;
  return url.includes(STEAM_ECONOMY_IMAGE_MARKER) ? `${url}${IMAGE_SIZE_SUFFIX}` : url;
}
function wearNameFor(float) {
  return (WEAR_BANDS.find((band) => float < band.max) ?? WEAR_BANDS[WEAR_BANDS.length - 1]).name;
}
function byDefIndex(records) {
  const map = /* @__PURE__ */ new Map();
  for (const record of records)
    if (record.def_index !== void 0) map.set(Number(record.def_index), record);
  return map;
}
function readUInt32(item, attributeId) {
  const bytes = item.attribute?.find((a) => a.def_index === attributeId)?.value_bytes;
  return bytes && bytes.length >= 4 ? bytes.readUInt32LE(0) : void 0;
}
function hasAttribute(item, attributeId) {
  return item.attribute?.some((a) => a.def_index === attributeId) ?? false;
}
async function loadCatalog(db2) {
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
    loadFile(db2, "skins_not_grouped"),
    loadFile(db2, "base_weapons"),
    loadFile(db2, "crates"),
    loadFile(db2, "keys"),
    loadFile(db2, "tools"),
    loadFile(db2, "agents"),
    loadFile(db2, "collectibles"),
    loadFile(db2, "stickers"),
    loadFile(db2, "patches"),
    loadFile(db2, "graffiti"),
    loadFile(db2, "keychains"),
    loadFile(db2, "highlights"),
    loadFile(db2, "music_kits"),
    loadFile(db2, "collections"),
  ]);
  const collectionsBySkin = /* @__PURE__ */ new Map();
  for (const collection of collections) {
    for (const entry of collection.contains) {
      collectionsBySkin.set(entry.id, [...(collectionsBySkin.get(entry.id) ?? []), collection.id]);
    }
  }
  const collectionIdsOf = (skin) =>
    (skin.skin_id ? collectionsBySkin.get(skin.skin_id) : void 0) ?? [];
  const skinByKey = /* @__PURE__ */ new Map();
  const variantsBySkinId = /* @__PURE__ */ new Map();
  const rarityByCategory = /* @__PURE__ */ new Map();
  const skinsByBase = /* @__PURE__ */ new Map();
  const byHash = /* @__PURE__ */ new Map();
  const outputsByPool = /* @__PURE__ */ new Map();
  for (const skin of skins) {
    if (skin.skin_id && !skin.souvenir && skin.paint_index === void 0)
      variantsBySkinId.set(skin.skin_id, [...(variantsBySkinId.get(skin.skin_id) ?? []), skin]);
    if (!skin.weapon || skin.paint_index === void 0) continue;
    const flags = `${skin.stattrak ? 1 : 0}:${skin.souvenir ? 1 : 0}`;
    const base = `${skin.weapon.weapon_id}:${skin.paint_index}:${flags}`;
    skinByKey.set(`${base}:${skin.wear?.name ?? NO_WEAR}`, skin);
    skinsByBase.set(base, [...(skinsByBase.get(base) ?? []), skin]);
    if (skin.skin_id && !skin.souvenir)
      variantsBySkinId.set(skin.skin_id, [...(variantsBySkinId.get(skin.skin_id) ?? []), skin]);
    if (skin.market_hash_name)
      byHash.set(skin.market_hash_name, { ...skin, category: skin.category?.name });
    const tier = skin.category?.name;
    if (tier && skin.rarity && STARRED_CATEGORIES.includes(tier) && !rarityByCategory.has(tier))
      rarityByCategory.set(tier, skin.rarity);
    if (skin.souvenir) continue;
    for (const collectionId of collectionIdsOf(skin)) {
      const pool = `${collectionId}:${skin.rarity?.id}:${skin.stattrak ? 1 : 0}`;
      const known = outputsByPool.get(pool) ?? [];
      if (!known.some((other) => other.skin_id === skin.skin_id))
        outputsByPool.set(pool, [...known, skin]);
    }
  }
  const specialsBySkin = /* @__PURE__ */ new Map();
  for (const crate of crates) {
    const specials = crate.contains_rare ?? [];
    if (specials.length === 0 || crate.name.includes(NAME_PREFIX.souvenirPackage)) continue;
    for (const { id } of crate.contains ?? []) {
      const known = specialsBySkin.get(id) ?? [];
      specialsBySkin.set(id, [
        ...known,
        ...specials.filter((s) => !known.some((k) => k.id === s.id)),
      ]);
    }
  }
  const hashSources = [
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
  const graffitiByKit = /* @__PURE__ */ new Map();
  for (const record of graffiti) {
    const kit = Number(record.def_index);
    graffitiByKit.set(kit, [...(graffitiByKit.get(kit) ?? []), record]);
  }
  function stickerViews(item) {
    return (item.stickers ?? []).flatMap((sticker) => {
      const record = stickerByKit.get(sticker.sticker_id);
      return record ? [{ name: record.name, imageUrl: sizedImage(record.image) }] : [];
    });
  }
  function charmViews(item) {
    const pattern = readUInt32(item, GC_ATTRIBUTE.keychainPattern) ?? null;
    const highlight = readUInt32(item, GC_ATTRIBUTE.keychainHighlight);
    const charm = readUInt32(item, GC_ATTRIBUTE.keychainId);
    const record =
      highlight !== void 0
        ? highlightById.get(highlight)
        : charm === void 0
          ? void 0
          : keychainById.get(charm);
    return record ? [{ name: record.name, imageUrl: sizedImage(record.image), pattern }] : [];
  }
  function describe(item) {
    const float = item.paint_wear;
    const isStatTrak = hasAttribute(item, GC_ATTRIBUTE.killEater);
    const isSouvenir = item.quality === SOUVENIR_QUALITY;
    const wearName = float === void 0 ? null : wearNameFor(float);
    const kitId = item.stickers?.[0]?.sticker_id;
    let record;
    let category = UNKNOWN_CATEGORY;
    let name;
    let marketHashName;
    let skinFacts = null;
    if (item.paint_index !== void 0 && wearName) {
      const base = `${item.def_index}:${Math.round(item.paint_index)}`;
      const skin =
        skinByKey.get(`${base}:${isStatTrak ? 1 : 0}:${isSouvenir ? 1 : 0}:${wearName}`) ??
        skinByKey.get(`${base}:0:0:${wearName}`);
      if (skin) {
        record = skin;
        category = skin.category?.name ?? "Skin";
        skinFacts = {
          skinId: skin.skin_id ?? null,
          collectionIds: collectionIdsOf(skin),
          rarityId: skin.rarity?.id ?? "",
          isStatTrak: skin.stattrak === true,
          isSouvenir: skin.souvenir === true,
        };
      }
    } else if (item.def_index === ITEM_DEF.sticker && kitId !== void 0) {
      record = stickerByKit.get(kitId);
      category = "Sticker";
    } else if (item.def_index === ITEM_DEF.patch && kitId !== void 0) {
      record = patchByKit.get(kitId);
      category = "Patch";
    } else if (
      (item.def_index === ITEM_DEF.sealedGraffiti || item.def_index === ITEM_DEF.graffiti) &&
      kitId !== void 0
    ) {
      const options = graffitiByKit.get(kitId) ?? [];
      const tint = readUInt32(item, GC_ATTRIBUTE.sprayTintId);
      record = options.find((g) => (g.tint?.id ?? void 0) === tint) ?? options[0];
      category = "Graffiti";
    } else if (item.def_index === ITEM_DEF.charm) {
      const sticker = readUInt32(item, GC_ATTRIBUTE.keychainSticker);
      const highlight = readUInt32(item, GC_ATTRIBUTE.keychainHighlight);
      const charm = readUInt32(item, GC_ATTRIBUTE.keychainId);
      if (sticker !== void 0) {
        const base = stickerByKit.get(sticker);
        if (base) {
          record = base;
          name = base.name.replace(NAME_PREFIX.sticker, NAME_PREFIX.slab);
        }
        category = "Sticker Slab";
      } else if (highlight !== void 0) {
        record = highlightById.get(highlight);
        category = "Souvenir Charm";
        if (record) name = `${NAME_PREFIX.souvenirCharm}${record.name}`;
      } else if (charm !== void 0) {
        record = keychainById.get(charm);
        category = "Charm";
      }
    } else if (item.def_index === ITEM_DEF.musicKit) {
      const id = readUInt32(item, GC_ATTRIBUTE.musicId);
      record = id === void 0 ? void 0 : musicById.get(id);
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
        stickers: item.paint_index === void 0 ? [] : stickerViews(item),
        charms: item.paint_index === void 0 ? [] : charmViews(item),
        pattern:
          item.def_index === ITEM_DEF.charm
            ? (readUInt32(item, GC_ATTRIBUTE.keychainPattern) ?? null)
            : null,
        tradableAfter:
          item.tradable_after && item.tradable_after.getTime() > Date.now()
            ? item.tradable_after.getTime()
            : null,
      },
    };
  }
  function categoryForDef(defIndex) {
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
    specialsFor: (skinId) => specialsBySkin.get(skinId) ?? [],
    resolveSpecial: (special, isStatTrak, float) => {
      const variants = variantsBySkinId.get(special.id) ?? [];
      const pool = variants.filter((v) => (v.stattrak === true) === isStatTrak);
      const candidates = pool.length > 0 ? pool : variants;
      const painted = candidates.some((v) => v.wear);
      const range = candidates.find((v) => v.min_float !== void 0);
      const min = range?.min_float ?? 0;
      const max = range?.max_float ?? 1;
      const wearName = painted ? wearNameFor(min + float * (max - min)) : null;
      const variant = candidates.find((v) => (wearName ? v.wear?.name === wearName : true));
      if (!variant?.market_hash_name) return void 0;
      return {
        id: special.id,
        name: variant.name,
        marketHashName: variant.market_hash_name,
        imageUrl: sizedImage(variant.image ?? special.image),
        minFloat: range?.min_float ?? null,
        maxFloat: range?.max_float ?? null,
        wearName,
      };
    },
    resolveWear: (record, float) => {
      if (!record.weapon || record.paint_index === void 0) return void 0;
      const base = `${record.weapon.weapon_id}:${record.paint_index}:${record.stattrak ? 1 : 0}:${record.souvenir ? 1 : 0}`;
      return skinByKey.get(`${base}:${wearNameFor(float)}`);
    },
  };
}

// src/lib/settings/settings.config.ts
var MARKETPLACES = ["skinport", "steam", "buff163", "csfloat", "csmoney", "youpin", "lisskins"];
var DEFAULT_MARKETPLACE = "buff163";
var LEGACY_HISTORY_MARKETPLACE = "skinport";

// server/prices/prices.ts
var memory = /* @__PURE__ */ new Map();
var inFlight = /* @__PURE__ */ new Map();
function asPrice(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}
function field(value, key) {
  return typeof value === "object" && value !== null ? value[key] : void 0;
}
var PRICE_EXTRACTORS = {
  skinport: (raw) => asPrice(field(raw, "starting_at")),
  steam: (raw) =>
    asPrice(field(raw, "last_24h")) ??
    asPrice(field(raw, "last_7d")) ??
    asPrice(field(raw, "last_30d")),
  buff163: (raw) => asPrice(field(field(raw, "starting_at"), "price")),
  csfloat: (raw) =>
    asPrice(field(raw, "price")) ?? asPrice(field(field(raw, "starting_at"), "price")),
  csmoney: (raw) => asPrice(field(raw, "price")),
  youpin: asPrice,
  lisskins: (raw) => asPrice(field(raw, "price")),
};
var PHASE_EXTRACTORS = {
  csfloat: (raw) => field(field(raw, "starting_at"), "doppler") ?? field(raw, "doppler"),
  buff163: (raw) => field(field(raw, "starting_at"), "doppler"),
  csmoney: (raw) => field(raw, "doppler"),
};
function phasePrices(raw, rate) {
  if (typeof raw !== "object" || raw === null) return void 0;
  const phases = {};
  for (const [phase, value] of Object.entries(raw)) {
    const usd = asPrice(value);
    if (usd !== null) phases[phase] = usd * rate;
  }
  return Object.keys(phases).length > 0 ? phases : void 0;
}
async function fetchJson(file) {
  const response = await fetch(`${PRICE_DATA.baseUrl}/${file}.json`, {
    signal: AbortSignal.timeout(PRICE_DATA.fetchTimeoutMs),
  });
  if (!response.ok) throw new Error(`Price source returned ${response.status}`);
  return await response.json();
}
async function fetchBook(currency, marketplace) {
  const [feed, rates] = await Promise.all([
    fetchJson(marketplace),
    fetchJson(PRICE_DATA.ratesFile),
  ]);
  const rate = rates[currency];
  if (typeof rate !== "number" || !(rate > 0)) throw new Error(`No exchange rate for ${currency}`);
  const extract = PRICE_EXTRACTORS[marketplace];
  const byName = /* @__PURE__ */ new Map();
  for (const [name, raw] of Object.entries(feed)) {
    const usd = extract(raw);
    if (usd === null) continue;
    const phases = phasePrices(PHASE_EXTRACTORS[marketplace]?.(raw), rate);
    byName.set(name, phases ? { price: usd * rate, phases } : { price: usd * rate });
  }
  return { byName, fetchedAt: Date.now() };
}
function readStored(db2, key, maxAgeMs) {
  const raw = maxAgeMs === void 0 ? db2.getCacheStale(key) : db2.getCache(key, maxAgeMs);
  if (!raw) return void 0;
  const stored = JSON.parse(raw);
  return { byName: new Map(stored.entries), fetchedAt: stored.fetchedAt };
}
async function getPriceBook(db2, currency, marketplace, force = false) {
  const id = `${currency}:${marketplace}`;
  const key = `${PRICE_DATA.cachePrefix}${id}`;
  const cached = memory.get(id);
  if (!force && cached && Date.now() - cached.fetchedAt < PRICE_DATA.cacheTtlMs) return cached;
  if (!force) {
    const stored = readStored(db2, key, PRICE_DATA.cacheTtlMs);
    if (stored) {
      memory.set(id, stored);
      return stored;
    }
  }
  const pending =
    inFlight.get(id) ??
    fetchBook(currency, marketplace)
      .then((book) => {
        db2.setCache(
          key,
          JSON.stringify({
            fetchedAt: book.fetchedAt,
            entries: [...book.byName],
          }),
        );
        memory.set(id, book);
        return book;
      })
      .catch((error) => {
        const stale = cached ?? readStored(db2, key, void 0);
        if (stale) return stale;
        throw error;
      })
      .finally(() => inFlight.delete(id));
  inFlight.set(id, pending);
  return pending;
}

// server/steam/steam.real.ts
import GlobalOffensive from "globaloffensive";
import QRCode from "qrcode";
import { EAuthTokenPlatformType, LoginSession } from "steam-session";
import SteamUser from "steam-user";

// server/steam/session-file.ts
import { chmodSync, mkdirSync as mkdirSync2, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join as join3 } from "node:path";
var FILE_NAME = "session.json";
var FILE_MODE = 384;
var DIR_MODE = 448;
function isSavedSession(value) {
  if (typeof value !== "object" || value === null) return false;
  const record = value;
  return (
    typeof record.refreshToken === "string" &&
    typeof record.accountName === "string" &&
    typeof record.steamId === "string"
  );
}
function createSessionFile(dataDir) {
  const file = join3(dataDir, FILE_NAME);
  return {
    load() {
      try {
        const parsed = JSON.parse(readFileSync(file, "utf8"));
        return isSavedSession(parsed) ? parsed : void 0;
      } catch {
        return void 0;
      }
    },
    save(session) {
      mkdirSync2(dataDir, { recursive: true, mode: DIR_MODE });
      writeFileSync(file, JSON.stringify(session), { mode: FILE_MODE });
      chmodSync(file, FILE_MODE);
    },
    clear() {
      rmSync(file, { force: true });
    },
  };
}

// server/steam/steam.store.ts
function createSnapshotStore() {
  let auth = { status: AUTH_STATUS.signedOut };
  let units = [];
  let loadingUnits = false;
  let transfer = { status: "idle" };
  let revision = 0;
  const loaded = /* @__PURE__ */ new Set();
  const listeners = /* @__PURE__ */ new Set();
  let emitScheduled = false;
  function getSnapshot() {
    return {
      auth,
      units: units.map((unit) => ({ ...unit, loaded: loaded.has(unit.id) })),
      loadingUnits,
      transfer,
      revision,
    };
  }
  function emit() {
    revision += 1;
    if (emitScheduled) return;
    emitScheduled = true;
    setImmediate(() => {
      emitScheduled = false;
      const snapshot = getSnapshot();
      for (const listener of listeners) listener(snapshot);
    });
  }
  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setAuth(next) {
      auth = next;
      emit();
    },
    setUnits(next) {
      units = next;
      for (const id of [...loaded]) if (!next.some((unit) => unit.id === id)) loaded.delete(id);
      emit();
    },
    markLoaded(unitId) {
      loaded.add(unitId);
      emit();
    },
    setTransfer(next) {
      transfer = next;
      emit();
    },
    getTransfer: () => transfer,
    setLoadingUnits(next) {
      loadingUnits = next;
      emit();
    },
    touch: emit,
    reset() {
      auth = { status: AUTH_STATUS.signedOut };
      units = [];
      loadingUnits = false;
      transfer = { status: "idle" };
      loaded.clear();
      emit();
    },
    units: () => units,
  };
}

// server/steam/item-ids.ts
function isPlaceholderItemId(id) {
  try {
    return BigInt(id) >> PLACEHOLDER_ITEM_ID.shiftBits === PLACEHOLDER_ITEM_ID.topNibble;
  } catch {
    return false;
  }
}

// server/steam/rename.ts
var TAG = { subjectItemId: 16, attrValue: 34 };
var VARINT_CONTINUE = 128;
var VARINT_MASK = 127;
var VARINT_SHIFT = 7n;
function varint(value) {
  const bytes = [];
  let rest = value;
  while (rest > BigInt(VARINT_MASK)) {
    bytes.push(Number(rest & BigInt(VARINT_MASK)) | VARINT_CONTINUE);
    rest >>= VARINT_SHIFT;
  }
  bytes.push(Number(rest));
  return bytes;
}
function encodeNameItem(itemId, name) {
  const text = Buffer.from(name, "utf8");
  return Buffer.from([
    TAG.subjectItemId,
    ...varint(BigInt(itemId)),
    TAG.attrValue,
    ...varint(BigInt(text.length)),
    ...text,
  ]);
}

// server/steam/transfer.ts
var defaultPause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function awaitCasketNotification(gc, casketId, accepted, timeoutMs) {
  return new Promise((resolve, reject) => {
    const listener = (itemIds, type) => {
      if (String(itemIds[0]) !== casketId || !accepted.includes(type)) return;
      clearTimeout(timer);
      gc.off("itemCustomizationNotification", listener);
      resolve(type);
    };
    const timer = setTimeout(() => {
      gc.off("itemCustomizationNotification", listener);
      reject(new Error("The Game Coordinator did not confirm the move in time"));
    }, timeoutMs);
    gc.on("itemCustomizationNotification", listener);
  });
}
async function removeFromUnit(gc, unitId, itemId, timeoutMs) {
  const confirmation = awaitCasketNotification(
    gc,
    unitId,
    [CASKET_NOTIFICATION.removed, CASKET_NOTIFICATION.inventoryFull],
    timeoutMs,
  );
  gc.removeFromCasket(unitId, itemId);
  if ((await confirmation) === CASKET_NOTIFICATION.inventoryFull)
    throw new Error("Your inventory is full");
}
async function addToUnit(gc, unitId, itemId, timeoutMs) {
  const confirmation = awaitCasketNotification(
    gc,
    unitId,
    [CASKET_NOTIFICATION.added, CASKET_NOTIFICATION.tooFull],
    timeoutMs,
  );
  gc.addToCasket(unitId, itemId);
  if ((await confirmation) === CASKET_NOTIFICATION.tooFull)
    throw new Error("The destination storage unit is full");
}
async function runTransfer(job) {
  const pause = job.pause ?? defaultPause;
  const timeoutMs = job.confirmTimeoutMs ?? STORAGE_LIMITS.moveConfirmTimeoutMs;
  const failures = [];
  let done = 0;
  let cancelled = false;
  for (const itemId of job.itemIds) {
    if (job.isCancelled()) {
      cancelled = true;
      break;
    }
    let leftInInventory = false;
    try {
      if (job.from !== INVENTORY_LOCATION_ID) {
        await removeFromUnit(job.gc, job.from, itemId, timeoutMs);
        leftInInventory = true;
      }
      if (job.to !== INVENTORY_LOCATION_ID) {
        await addToUnit(job.gc, job.to, itemId, timeoutMs);
        leftInInventory = false;
      }
      done += 1;
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push({
        itemId,
        name: job.nameOf(itemId),
        reason: leftInInventory ? `${reason}; the item was left in your inventory` : reason,
      });
      if (/full/i.test(reason)) break;
    }
    job.onProgress(done);
    await pause(STORAGE_LIMITS.moveGapMs);
  }
  return { done, failures, cancelled };
}

// server/steam/steam.types.ts
var UserFacingError = class extends Error {
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};

// server/steam/steam.real.ts
function toErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function createRealGateway(db2, dataDir, nameOf) {
  const store = createSnapshotStore();
  const sessionFile = createSessionFile(dataDir);
  const unitContents = /* @__PURE__ */ new Map();
  const readyListeners = [];
  let login;
  let steam;
  let csgo;
  let gcTimeout;
  let steamId;
  let activeSession;
  let webCookies;
  let reconnectTimer;
  let reconnectAttempts = 0;
  let unitRefreshTimer;
  let gcConnected = false;
  let loadQueue = Promise.resolve();
  function readUnitMeta() {
    return (csgo?.inventory ?? [])
      .filter((item) => item.def_index === ITEM_DEF.storageUnit)
      .map((item) => ({
        id: item.id,
        name: item.custom_name ?? `Storage Unit ${item.id.slice(-4)}`,
        itemCount: item.casket_contained_item_count ?? 0,
      }));
  }
  function teardownConnection() {
    clearTimeout(gcTimeout);
    clearTimeout(unitRefreshTimer);
    csgo?.removeAllListeners();
    csgo = void 0;
    gcConnected = false;
    steam?.logOff();
    steam?.removeAllListeners();
    steam = void 0;
    webCookies = void 0;
  }
  function teardown() {
    clearTimeout(reconnectTimer);
    reconnectAttempts = 0;
    unitContents.clear();
    login?.cancelLoginAttempt();
    login = void 0;
    teardownConnection();
    activeSession = void 0;
    steamId = void 0;
  }
  function fail(message) {
    teardown();
    store.reset();
    store.setAuth({ status: AUTH_STATUS.error, message });
  }
  async function collectLoadedItems(gc, unitId, expected) {
    const deadline = Date.now() + STORAGE_LIMITS.contentsSettleMs;
    const read = () => (gc.inventory ?? []).filter((item) => item.casket_id === unitId);
    while (read().length < expected && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, STORAGE_LIMITS.contentsPollMs));
    }
    return [...read()];
  }
  async function loadUnit(gc, unit) {
    if (!gc.haveGCSession || steamId === void 0) return;
    if (unit.itemCount > 0) {
      await new Promise((resolve, reject) => {
        gc.getCasketContents(unit.id, (error) => (error ? reject(error) : resolve()));
      });
    }
    const items = unit.itemCount > 0 ? await collectLoadedItems(gc, unit.id, unit.itemCount) : [];
    unitContents.set(unit.id, items);
    db2.saveUnit(steamId, unit.id, unit.itemCount, items);
    store.markLoaded(unit.id);
  }
  function refreshUnits(force) {
    const run = loadQueue.then(async () => {
      const gc = csgo;
      const current = steamId;
      if (!gc || !current) return;
      const units = store.units();
      const cached = db2.loadUnits(current);
      store.setLoadingUnits(true);
      try {
        for (const unit of units) {
          const hit = cached.get(unit.id);
          if (!force && hit && hit.itemCount === unit.itemCount && unitContents.has(unit.id))
            continue;
          try {
            await loadUnit(gc, unit);
          } catch (error) {
            console.warn(`[units] could not load ${unit.name}:`, toErrorMessage(error));
          }
        }
      } finally {
        store.setLoadingUnits(false);
      }
    });
    loadQueue = run.catch(() => void 0);
    return run;
  }
  function restoreCachedUnits(current) {
    const cached = db2.loadUnits(current);
    for (const [unitId, entry] of cached) {
      unitContents.set(unitId, entry.items);
      store.markLoaded(unitId);
    }
  }
  function scheduleReconnect(reason) {
    const session = activeSession;
    if (!session) return;
    teardownConnection();
    const delay = Math.min(
      STORAGE_LIMITS.reconnectMaxMs,
      STORAGE_LIMITS.reconnectBaseMs * 2 ** reconnectAttempts,
    );
    reconnectAttempts += 1;
    store.setAuth({
      status: AUTH_STATUS.connecting,
      detail: `${reason} Retrying in ${Math.round(delay / 1e3)}s\u2026`,
    });
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connect(session), delay);
  }
  function startGcTimeout() {
    clearTimeout(gcTimeout);
    gcTimeout = setTimeout(
      () => scheduleReconnect("Timed out waiting for the CS2 Game Coordinator."),
      STORAGE_LIMITS.gcConnectTimeoutMs,
    );
  }
  function connect(session) {
    const { refreshToken, steamId: id } = session;
    activeSession = session;
    let displayName2 = session.displayName ?? null;
    store.setAuth({ status: AUTH_STATUS.connecting, detail: "Connecting to Steam\u2026" });
    const client = new SteamUser({ autoRelogin: true });
    steam = client;
    steamId = id;
    startGcTimeout();
    client.on("accountInfo", (name) => {
      const persona = name.trim();
      if (!persona) return;
      displayName2 = persona;
      if (activeSession && activeSession.displayName !== persona) {
        activeSession = { ...activeSession, displayName: persona };
        sessionFile.save(activeSession);
      }
      if (gcConnected) store.setAuth({ status: AUTH_STATUS.ready, displayName: displayName2 });
    });
    client.on("webSession", (_sessionId, cookies) => {
      webCookies = cookies;
    });
    client.on("error", (error) => {
      if (error.eresult !== void 0 && TOKEN_REJECTED_ERESULTS.includes(error.eresult)) {
        sessionFile.clear();
        fail(`Steam rejected the saved login (${error.message}). Sign in again.`);
        return;
      }
      scheduleReconnect(`Steam connection lost (${error.message}).`);
    });
    client.on("playingState", (blocked, playingApp) => {
      if (blocked) {
        clearTimeout(gcTimeout);
        if (!gcConnected) {
          store.setAuth({
            status: AUTH_STATUS.connecting,
            detail: "CS2 is running on another device. OpenInventory will connect when it closes.",
          });
        }
        return;
      }
      if (playingApp !== CS2_APP_ID) {
        if (!gcConnected) startGcTimeout();
        client.gamesPlayed([CS2_APP_ID]);
      }
    });
    client.on("loggedOn", () => {
      reconnectAttempts = 0;
      if (csgo) return client.gamesPlayed([CS2_APP_ID]);
      store.setAuth({ status: AUTH_STATUS.connecting, detail: "Connecting to CS2\u2026" });
      const gc = new GlobalOffensive(client);
      csgo = gc;
      gc.on("connectedToGC", () => {
        gcConnected = true;
        clearTimeout(gcTimeout);
        const units = readUnitMeta();
        db2.pruneUnits(
          id,
          units.map((unit) => unit.id),
        );
        store.setUnits(units);
        restoreCachedUnits(id);
        store.setAuth({ status: AUTH_STATUS.ready, displayName: displayName2 });
        for (const listener of readyListeners) listener(id);
        void refreshUnits(false);
      });
      gc.on("disconnectedFromGC", () => {
        gcConnected = false;
      });
      const onItem = (item) => {
        if (item.def_index !== ITEM_DEF.storageUnit) return store.touch();
        store.setUnits(readUnitMeta());
        clearTimeout(unitRefreshTimer);
        unitRefreshTimer = setTimeout(
          () => void refreshUnits(false),
          STORAGE_LIMITS.unitRefreshDebounceMs,
        );
      };
      gc.on("itemAcquired", onItem);
      gc.on("itemRemoved", onItem);
      gc.on("itemChanged", (_old, next) => onItem(next));
      client.gamesPlayed([CS2_APP_ID]);
    });
    client.logOn({ refreshToken });
  }
  function getWebCookies(refresh) {
    const client = steam;
    if (!client) return Promise.reject(new UserFacingError("Not connected to Steam.", 409));
    if (webCookies && !refresh) return Promise.resolve(webCookies);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        client.removeListener("webSession", onSession);
        reject(new UserFacingError("Steam did not provide a web session in time.", 504));
      }, STORAGE_LIMITS.webSessionTimeoutMs);
      const onSession = (_sessionId, cookies) => {
        clearTimeout(timer);
        resolve(cookies);
      };
      client.once("webSession", onSession);
      client.webLogOn();
    });
  }
  function renameUnit(unitId, name) {
    const gc = csgo;
    const client = steam;
    if (!gc || !client || !gc.haveGCSession) {
      throw new UserFacingError("Not connected to the CS2 Game Coordinator", STATUS.conflict);
    }
    if (!store.units().some((unit) => unit.id === unitId))
      throw new UserFacingError("Storage unit not found", STATUS.notFound);
    return new Promise((resolve, reject) => {
      const done = (error) => {
        clearTimeout(timer);
        gc.off("itemChanged", onChanged);
        if (error) reject(error);
        else resolve();
      };
      const onChanged = (_old, next) => {
        if (next.id === unitId && next.custom_name === name) done();
      };
      const timer = setTimeout(
        () => done(new UserFacingError("Steam didn't confirm the rename", STATUS.conflict)),
        STORAGE_LIMITS.renameConfirmTimeoutMs,
      );
      gc.on("itemChanged", onChanged);
      client.sendToGC(CS2_APP_ID, GC_MESSAGE.nameItem, {}, encodeNameItem(unitId, name));
    });
  }
  let transferCancelled = false;
  const STATUS = { badRequest: 400, notFound: 404, conflict: 409 };
  function locationName(id) {
    return id === INVENTORY_LOCATION_ID
      ? "Inventory"
      : store.units().find((unit) => unit.id === id)?.name;
  }
  function looseInventory() {
    return (csgo?.inventory ?? []).filter(
      (item) =>
        item.def_index !== ITEM_DEF.storageUnit &&
        item.casket_id === void 0 &&
        !isPlaceholderItemId(item.id),
    );
  }
  function itemsAt(location) {
    if (location === INVENTORY_LOCATION_ID) {
      return looseInventory();
    }
    return unitContents.get(location);
  }
  async function reloadAfterMove(gc, unitId, expected) {
    const meta = store.units().find((unit) => unit.id === unitId);
    if (!meta) return;
    await loadUnit(gc, { ...meta, itemCount: expected });
  }
  function transferItems(request) {
    const gc = csgo;
    if (!gc || !gc.haveGCSession || steamId === void 0) {
      throw new UserFacingError("Not connected to the CS2 Game Coordinator", STATUS.conflict);
    }
    if (store.getTransfer().status === "running")
      throw new UserFacingError("A transfer is already running", STATUS.conflict);
    const { from, to } = request;
    const itemIds = [...new Set(request.itemIds)];
    if (itemIds.length === 0 || itemIds.length > STORAGE_LIMITS.maxItemsPerTransfer) {
      throw new UserFacingError(
        `Select between 1 and ${STORAGE_LIMITS.maxItemsPerTransfer} items`,
        STATUS.badRequest,
      );
    }
    if (from === to)
      throw new UserFacingError("Source and destination are the same", STATUS.badRequest);
    const fromName = locationName(from);
    const toName = locationName(to);
    if (!fromName || !toName) throw new UserFacingError("Storage unit not found", STATUS.notFound);
    const source = itemsAt(from);
    if (!source)
      throw new UserFacingError("That storage unit hasn't finished loading yet", STATUS.conflict);
    const byId = new Map(source.map((item) => [item.id, item]));
    if (itemIds.some((id) => !byId.has(id))) {
      throw new UserFacingError(
        "Some of those items are no longer in the source. Refresh and try again.",
        STATUS.conflict,
      );
    }
    const destinationCount =
      to === INVENTORY_LOCATION_ID
        ? 0
        : (unitContents.get(to)?.length ?? store.units().find((u) => u.id === to)?.itemCount ?? 0);
    if (
      to !== INVENTORY_LOCATION_ID &&
      destinationCount + itemIds.length > STORAGE_LIMITS.unitCapacity
    ) {
      throw new UserFacingError(
        `${toName} can hold ${STORAGE_LIMITS.unitCapacity - destinationCount} more items`,
        STATUS.badRequest,
      );
    }
    const sourceCount = source.length;
    transferCancelled = false;
    store.setTransfer({ status: "running", total: itemIds.length, done: 0, fromName, toName });
    const run = loadQueue.then(async () => {
      const outcome = await runTransfer({
        gc,
        from,
        to,
        itemIds,
        nameOf: (id) => {
          const raw = byId.get(id);
          return raw ? nameOf(raw) : id;
        },
        onProgress: (done) =>
          store.setTransfer({ status: "running", total: itemIds.length, done, fromName, toName }),
        isCancelled: () => transferCancelled,
      });
      try {
        if (from !== INVENTORY_LOCATION_ID)
          await reloadAfterMove(gc, from, sourceCount - outcome.done);
        if (to !== INVENTORY_LOCATION_ID)
          await reloadAfterMove(gc, to, destinationCount + outcome.done);
      } catch (error) {
        console.warn("[transfer] resync failed:", toErrorMessage(error));
      }
      store.setTransfer({
        status: "finished",
        total: itemIds.length,
        done: outcome.done,
        fromName,
        toName,
        cancelled: outcome.cancelled,
        failures: outcome.failures,
      });
    });
    loadQueue = run.catch(() => void 0);
    void run.catch((error) => {
      console.error("[transfer] failed:", error);
      store.setTransfer({
        status: "finished",
        total: itemIds.length,
        done: 0,
        fromName,
        toName,
        cancelled: false,
        failures: [{ itemId: "", name: "Transfer", reason: toErrorMessage(error) }],
      });
    });
  }
  const saved = sessionFile.load();
  if (saved) connect(saved);
  return {
    getSnapshot: () => store.getSnapshot(),
    subscribe: (listener) => store.subscribe(listener),
    onReady: (listener) => void readyListeners.push(listener),
    getSteamId: () => steamId,
    getWebCookies,
    async startQrLogin() {
      teardown();
      store.reset();
      const session = new LoginSession(EAuthTokenPlatformType.SteamClient);
      session.loginTimeout = STORAGE_LIMITS.qrLoginTimeoutMs;
      login = session;
      const isPending = () => login === session;
      session.on("timeout", () => {
        if (isPending()) fail("QR login timed out. Start again.");
      });
      session.on("error", (error) => {
        if (isPending()) fail(`Login failed: ${error.message}`);
      });
      session.on("authenticated", () => {
        const { accountName, steamID, refreshToken } = session;
        login = void 0;
        session.cancelLoginAttempt();
        const id = steamID.getSteamID64();
        sessionFile.save({ refreshToken, accountName, steamId: id });
        connect({ refreshToken, accountName, steamId: id });
      });
      try {
        const { qrChallengeUrl } = await session.startWithQR();
        if (!qrChallengeUrl) throw new Error("Steam did not return a QR challenge");
        const qrSvg = await QRCode.toString(qrChallengeUrl, { type: "svg", margin: 1 });
        store.setAuth({ status: AUTH_STATUS.qrPending, qrSvg });
        session.on("remoteInteraction", () =>
          store.setAuth({
            status: AUTH_STATUS.connecting,
            detail: "Approve the sign-in in the Steam app\u2026",
          }),
        );
      } catch (error) {
        fail(`Could not start Steam QR login: ${toErrorMessage(error)}`);
      }
    },
    logout() {
      const id = steamId;
      teardown();
      store.reset();
      sessionFile.clear();
      if (id) db2.clearUnits(id);
    },
    getInventory: looseInventory,
    getUnits() {
      return store
        .units()
        .filter((unit) => unitContents.has(unit.id))
        .map((unit) => ({ id: unit.id, name: unit.name, items: unitContents.get(unit.id) ?? [] }));
    },
    refreshUnits,
    renameUnit,
    transferItems,
    cancelTransfer: () => {
      transferCancelled = true;
    },
    dismissTransfer: () => {
      if (store.getTransfer().status === "finished") store.setTransfer({ status: "idle" });
    },
  };
}

// server/tradeup.ts
var MIN_PRICE = 0;
var VANILLA_SKIN2 = "Vanilla";
function inputCountFor(rarityId) {
  return rarityId === TRADE_UP.covertRarity ? TRADE_UP.covertInputCount : TRADE_UP.inputCount;
}
function nextRarityOf(rarityId) {
  if (rarityId === TRADE_UP.covertRarity) return TRADE_UP.covertRarity;
  const index = TRADE_UP.rarityOrder.findIndex((r) => r === rarityId);
  return index < 0 ? void 0 : TRADE_UP.rarityOrder[index + 1];
}
function isEligible(c, rarityId, catalog2) {
  if (c.skin.rarityId !== rarityId || c.skin.isSouvenir) return false;
  if (c.view.wear === null || c.view.tradableAfter) return false;
  if (rarityId !== TRADE_UP.covertRarity) return true;
  return c.skin.skinId !== null && catalog2.specialsFor(c.skin.skinId).length > 0;
}
function eligibleSorted(candidates, rarityId, catalog2) {
  return candidates
    .filter((c) => isEligible(c, rarityId, catalog2))
    .sort((a, b) => (a.view.price ?? Infinity) - (b.view.price ?? Infinity));
}
function listTradeUpCandidates(candidates, rarityId, catalog2, currency) {
  if (!nextRarityOf(rarityId)) return { ok: false, reason: "This rarity cannot be traded up." };
  return {
    ok: true,
    rarityId,
    inputCount: inputCountFor(rarityId),
    candidates: eligibleSorted(candidates, rarityId, catalog2).map((c) => c.view),
    currency,
  };
}
function sortOutcomes(outcomes) {
  return outcomes.sort((a, b) => b.probability - a.probability || (b.price ?? 0) - (a.price ?? 0));
}
function computeTradeUp(candidates, selectedIds, rarityId, catalog2, prices, currency) {
  const nextRarity = nextRarityOf(rarityId);
  if (!nextRarity) return { ok: false, reason: "This rarity cannot be traded up." };
  const inputCount = inputCountFor(rarityId);
  if (selectedIds.length === 0) return { ok: false, reason: "Select skins to see the odds." };
  if (selectedIds.length > inputCount) {
    return { ok: false, reason: `A trade-up takes ${inputCount} skins.` };
  }
  const eligible = new Map(
    eligibleSorted(candidates, rarityId, catalog2).map((c) => [c.view.id, c]),
  );
  const inputs = selectedIds.flatMap((id) => {
    const found = eligible.get(id);
    return found ? [found] : [];
  });
  if (inputs.length !== selectedIds.length) {
    return { ok: false, reason: "Some selected skins can no longer be used. Reselect them." };
  }
  const isStatTrak = inputs[0]?.skin.isStatTrak ?? false;
  if (inputs.some((c) => c.skin.isStatTrak !== isStatTrak)) {
    return { ok: false, reason: "StatTrak and normal skins can't be mixed." };
  }
  const averageFloat = inputs.reduce((sum, c) => sum + (c.view.wear ?? 0), 0) / inputs.length;
  const inputCost = inputs.reduce((sum, c) => sum + (c.view.price ?? MIN_PRICE), 0);
  const priceOf = (hash, phase) => {
    const entry = hash ? prices.byName.get(hash) : void 0;
    return (phase ? entry?.phases?.[phase] : void 0) ?? entry?.price ?? null;
  };
  const outcomes =
    rarityId === TRADE_UP.covertRarity
      ? specialOutcomes(inputs, isStatTrak, averageFloat, catalog2, priceOf)
      : skinOutcomes(inputs, nextRarity, isStatTrak, averageFloat, catalog2, priceOf);
  if (outcomes.length === 0) return { ok: false, reason: "No outcome data for these inputs." };
  const expectedValue = outcomes.reduce((sum, o) => sum + o.probability * (o.price ?? 0), 0);
  const chanceToProfit = outcomes
    .filter((o) => (o.price ?? 0) > inputCost)
    .reduce((sum, o) => sum + o.probability, 0);
  return {
    ok: true,
    inputCount,
    selected: inputs.length,
    chanceToProfit,
    averageFloat,
    inputCost,
    expectedValue,
    outcomes: sortOutcomes(outcomes),
    currency,
  };
}
function skinOutcomes(inputs, nextRarity, isStatTrak, averageFloat, catalog2, priceOf) {
  const perCollection = /* @__PURE__ */ new Map();
  for (const input of inputs) {
    const collectionId = input.skin.collectionIds[0];
    if (collectionId) perCollection.set(collectionId, (perCollection.get(collectionId) ?? 0) + 1);
  }
  const outcomes = [];
  for (const [collectionId, count] of perCollection) {
    const outputs = catalog2.tradeUpOutputs(collectionId, nextRarity, isStatTrak);
    for (const output of outputs) {
      const min = output.min_float ?? 0;
      const max = output.max_float ?? 1;
      const float = min + averageFloat * (max - min);
      const resolved = catalog2.resolveWear(output, float) ?? output;
      const hash = resolved.market_hash_name;
      outcomes.push({
        name: resolved.name,
        imageUrl: catalog2.skinImage(hash ?? "") ?? null,
        rarityColor: resolved.rarity?.color ?? null,
        probability: count / inputs.length / outputs.length,
        float,
        wearName: resolved.wear?.name ?? "",
        price: priceOf(hash),
      });
    }
  }
  return outcomes;
}
var NAME_SEPARATOR = " | ";
function weightOfPhase(special) {
  const table = special.name.includes(TRADE_UP.gammaDopplerName)
    ? TRADE_UP.phaseWeights.gammaDoppler
    : TRADE_UP.phaseWeights.doppler;
  return table[special.phase ?? ""] ?? 1;
}
function poolOdds(pool) {
  const byType = /* @__PURE__ */ new Map();
  for (const special of pool) {
    const [type = special.name, ...finish] = special.name.split(NAME_SEPARATOR);
    const finishes = byType.get(type) ?? /* @__PURE__ */ new Map();
    const key = finish.join(NAME_SEPARATOR) || VANILLA_SKIN2;
    finishes.set(key, [...(finishes.get(key) ?? []), special]);
    byType.set(type, finishes);
  }
  const odds = /* @__PURE__ */ new Map();
  for (const finishes of byType.values()) {
    for (const group of finishes.values()) {
      const share = 1 / byType.size / finishes.size;
      const total = group.reduce((sum, special) => sum + weightOfPhase(special), 0);
      for (const special of group) {
        odds.set(special.id, share * (weightOfPhase(special) / total));
      }
    }
  }
  return odds;
}
function specialOutcomes(inputs, isStatTrak, averageFloat, catalog2, priceOf) {
  const specials = /* @__PURE__ */ new Map();
  const probabilities = /* @__PURE__ */ new Map();
  for (const input of inputs) {
    const pool = input.skin.skinId ? catalog2.specialsFor(input.skin.skinId) : [];
    for (const special of pool) specials.set(special.id, special);
    for (const [id, odds] of poolOdds(pool)) {
      probabilities.set(id, (probabilities.get(id) ?? 0) + odds / inputs.length);
    }
  }
  const outcomes = [];
  for (const [id, probability] of probabilities) {
    const special = specials.get(id);
    const resolved = special && catalog2.resolveSpecial(special, isStatTrak, averageFloat);
    if (!special || !resolved) continue;
    const float =
      resolved.minFloat === null || resolved.maxFloat === null
        ? null
        : resolved.minFloat + averageFloat * (resolved.maxFloat - resolved.minFloat);
    outcomes.push({
      name: displayName(resolved.name, resolved.wearName, special.phase),
      imageUrl: resolved.imageUrl,
      rarityColor: TRADE_UP.specialColor,
      probability,
      float,
      wearName: resolved.wearName ?? "",
      price: priceOf(resolved.marketHashName, special.phase),
    });
  }
  return outcomes;
}
function displayName(name, wearName, phase) {
  const base =
    wearName && name.endsWith(` (${wearName})`) ? name.slice(0, -(wearName.length + 3)) : name;
  const finished = base.includes(NAME_SEPARATOR)
    ? base
    : `${base}${NAME_SEPARATOR}${VANILLA_SKIN2}`;
  const phased = phase ? `${finished} (${phase})` : finished;
  return wearName ? `${phased} (${wearName})` : phased;
}

// server/index.ts
var HTTP = {
  ok: 200,
  accepted: 202,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  unsupportedMedia: 415,
  serverError: 500,
  badGateway: 502,
};
var DEFAULT_CURRENCY = "USD";
var CURRENCY_PATTERN = /^[A-Z]{3}$/;
var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff2": "font/woff2",
};
var IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
var INDEX_FILE = "index.html";
var HEALTH_PATH = "/healthz";
var JSON_CONTENT_TYPE = "application/json";
var CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
var ITEM_ID_PATTERN = /^(\d{1,20}|inventory)$/;
var TRACKED_SCOPES_KEY = "pref:price-scopes";
var settings = readSettings();
var db = openDatabase(settings.dataDir);
var catalog = await loadCatalog(db);
var gateway = createRealGateway(db, settings.dataDir, (raw) => catalog.describe(raw).view.name);
var historySync = createHistorySync(db, gateway);
function sendJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}
function sendError(res, error) {
  const status = error instanceof UserFacingError ? error.status : HTTP.serverError;
  const message = error instanceof UserFacingError ? error.message : "Internal error";
  if (!(error instanceof UserFacingError)) console.error(error);
  sendJson(res, status, { error: message });
}
function isAuthorized(req) {
  if (!settings.password) return true;
  const header = req.headers.authorization ?? "";
  if (!header.startsWith("Basic ")) return false;
  const [, password = ""] = Buffer.from(header.slice("Basic ".length), "base64")
    .toString("utf8")
    .split(/:(.*)/s);
  const expected = Buffer.from(settings.password);
  const given = Buffer.from(password);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > STORAGE_LIMITS.maxRequestBytes)
      throw new UserFacingError("Request too large", HTTP.badRequest);
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new UserFacingError("Body must be JSON", HTTP.badRequest);
  }
}
function parseTransferRequest(body) {
  const record = typeof body === "object" && body !== null ? body : {};
  const { from, to, itemIds } = record;
  const isId = (value) => typeof value === "string" && ITEM_ID_PATTERN.test(value);
  if (!isId(from) || !isId(to) || !Array.isArray(itemIds) || !itemIds.every(isId)) {
    throw new UserFacingError("Invalid transfer request", HTTP.badRequest);
  }
  return { from, to, itemIds };
}
function parseRenameRequest(body) {
  const record = typeof body === "object" && body !== null ? body : {};
  const { id, name } = record;
  if (typeof id !== "string" || !ITEM_ID_PATTERN.test(id) || typeof name !== "string") {
    throw new UserFacingError("Invalid rename request", HTTP.badRequest);
  }
  const trimmed = name.trim();
  if (
    trimmed.length === 0 ||
    trimmed.length > STORAGE_LIMITS.unitNameMaxLength ||
    CONTROL_CHARACTERS.test(trimmed)
  ) {
    throw new UserFacingError(
      `Names are 1 to ${STORAGE_LIMITS.unitNameMaxLength} characters`,
      HTTP.badRequest,
    );
  }
  return { id, name: trimmed };
}
function parseCurrency(url) {
  const value = url.searchParams.get("currency") ?? DEFAULT_CURRENCY;
  if (!CURRENCY_PATTERN.test(value)) throw new UserFacingError("Invalid currency", HTTP.badRequest);
  return value;
}
function parseMarketplace(url) {
  const value = url.searchParams.get("marketplace") ?? DEFAULT_MARKETPLACE;
  const marketplace = MARKETPLACES.find((m) => m === value);
  if (!marketplace) throw new UserFacingError("Invalid marketplace", HTTP.badRequest);
  return marketplace;
}
function parseScope(url) {
  return { currency: parseCurrency(url), marketplace: parseMarketplace(url) };
}
function historyCurrency({ currency, marketplace }) {
  return marketplace === LEGACY_HISTORY_MARKETPLACE ? currency : `${currency}:${marketplace}`;
}
function parseOpeningKind(url) {
  const value = url.searchParams.get("kind") ?? DEFAULT_OPENING_KIND;
  const kind = OPENING_KINDS.find((k) => k === value);
  if (!kind) throw new UserFacingError("Invalid kind", HTTP.badRequest);
  return kind;
}
async function loadPrices({ currency, marketplace }, force = false) {
  try {
    return await getPriceBook(db, currency, marketplace, force);
  } catch (error) {
    throw new UserFacingError(
      `Price source unavailable: ${error instanceof Error ? error.message : String(error)}`,
      HTTP.badGateway,
    );
  }
}
function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (origin !== void 0) {
    let originHost;
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = void 0;
    }
    if (originHost !== req.headers.host)
      throw new UserFacingError("Cross-origin request blocked", HTTP.forbidden);
  }
}
function assertJsonBody(req) {
  if (!req.headers["content-type"]?.startsWith(JSON_CONTENT_TYPE)) {
    throw new UserFacingError("Content-Type must be application/json", HTTP.unsupportedMedia);
  }
}
function requireReady() {
  const steamId = gateway.getSteamId();
  if (gateway.getSnapshot().auth.status !== "ready" || !steamId)
    throw new UserFacingError("Sign in with Steam first", HTTP.unauthorized);
  return steamId;
}
var snapshotsInFlight = /* @__PURE__ */ new Set();
async function recordSnapshot(steamId, scope) {
  const key = { steamId, currency: historyCurrency(scope) };
  const flightKey = `${steamId}:${key.currency}`;
  if (snapshotsInFlight.has(flightKey)) return;
  const last = db.lastSnapshotAt(key);
  if (last !== void 0 && Date.now() - last < SERVER_LIMITS.snapshotIntervalMs) return;
  snapshotsInFlight.add(flightKey);
  try {
    await writeSnapshot(key, scope);
  } finally {
    snapshotsInFlight.delete(flightKey);
  }
}
async function writeSnapshot(key, scope) {
  const snapshot = gateway.getSnapshot();
  if (snapshot.loadingUnits || snapshot.units.some((u) => !u.loaded)) return;
  const book = await loadPrices(scope);
  const items = collectItems(gateway, catalog, book).map((c) => c.view);
  if (items.length === 0) return;
  const { inventoryValue, storageValue, totalValue } = summarizeValue(items);
  db.addSnapshot(key, {
    takenAt: Date.now(),
    totalValue,
    inventoryValue,
    storageValue,
    itemCount: items.length,
  });
}
function handleEvents(req, res) {
  res.writeHead(HTTP.ok, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
    connection: "keep-alive",
  });
  const send = (snapshot) =>
    res.write(`data: ${JSON.stringify(snapshot)}

`);
  send(gateway.getSnapshot());
  const unsubscribe = gateway.subscribe(send);
  const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), SSE_KEEP_ALIVE_MS);
  req.on("close", () => {
    clearInterval(keepAlive);
    unsubscribe();
  });
}
async function serveStatic(webDir, pathname, res) {
  const resolved = normalize(join4(webDir, pathname));
  const inside = resolved === webDir || resolved.startsWith(webDir + sep);
  let file = inside ? resolved : join4(webDir, INDEX_FILE);
  try {
    if ((await stat(file)).isDirectory()) file = join4(file, INDEX_FILE);
  } catch {
    file = join4(webDir, INDEX_FILE);
  }
  const body = await readFile(file);
  const isAsset = file.includes(`${sep}assets${sep}`);
  res.writeHead(HTTP.ok, {
    "content-type": MIME[extname(file)] ?? "application/octet-stream",
    "cache-control": isAsset ? IMMUTABLE_CACHE : "no-cache",
  });
  res.end(body);
}
var server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${settings.host}`);
  const method = req.method ?? "GET";
  try {
    if (url.pathname === HEALTH_PATH) return void res.writeHead(HTTP.ok).end("ok");
    if (!isAuthorized(req)) {
      res.writeHead(HTTP.unauthorized, {
        "www-authenticate": `Basic realm="${SERVER_LIMITS.basicAuthRealm}", charset="UTF-8"`,
      });
      return void res.end();
    }
    const path = url.pathname;
    if (path === STORAGE_API.events && method === "GET") return handleEvents(req, res);
    if (path === STORAGE_API.state && method === "GET")
      return sendJson(res, HTTP.ok, gateway.getSnapshot());
    if (path === STORAGE_API.items && method === "GET") {
      requireReady();
      const scope = parseScope(url);
      const { currency } = scope;
      const book = await loadPrices(scope);
      const items = collectItems(gateway, catalog, book).map((c) => c.view);
      return sendJson(res, HTTP.ok, { items, currency, priceUpdatedAt: book.fetchedAt });
    }
    if (path === STORAGE_API.dashboard && method === "GET") {
      const steamId = requireReady();
      const scope = parseScope(url);
      const { currency } = scope;
      rememberScope(scope);
      const book = await loadPrices(scope);
      const items = collectItems(gateway, catalog, book).map((c) => c.view);
      const units = gateway.getSnapshot().units;
      void recordSnapshot(steamId, scope).catch((e) => console.warn("[snapshot]", e));
      return sendJson(
        res,
        HTTP.ok,
        buildDashboard({
          items,
          history: db.listSnapshots({ steamId, currency: historyCurrency(scope) }),
          currency,
          priceUpdatedAt: book.fetchedAt,
          unitsLoaded: units.filter((u) => u.loaded).length,
          unitsTotal: units.length,
        }),
      );
    }
    if (path === STORAGE_API.cases && method === "GET") {
      const steamId = requireReady();
      historySync.start(steamId, { onlyIfStale: true });
      return sendJson(res, HTTP.ok, {
        stats: buildCaseStats(db.loadHistoryEvents(steamId), parseOpeningKind(url)),
        sync: historySync.status(steamId),
      });
    }
    if ((path === STORAGE_API.tradeUp || path === STORAGE_API.tradeUpOdds) && method === "GET") {
      requireReady();
      const scope = parseScope(url);
      const { currency } = scope;
      const rarity = url.searchParams.get("rarity") ?? "";
      const book = await loadPrices(scope);
      const candidates = collectItems(gateway, catalog, book).flatMap((c) =>
        c.skin ? [{ view: c.view, skin: c.skin }] : [],
      );
      if (path === STORAGE_API.tradeUp) {
        return sendJson(res, HTTP.ok, listTradeUpCandidates(candidates, rarity, catalog, currency));
      }
      const ids = (url.searchParams.get("ids") ?? "").split(",").filter(Boolean);
      return sendJson(
        res,
        HTTP.ok,
        computeTradeUp(candidates, ids, rarity, catalog, book, currency),
      );
    }
    if (method === "POST") {
      assertSameOrigin(req);
      if (path === STORAGE_API.transfer) {
        assertJsonBody(req);
        requireReady();
        gateway.transferItems(parseTransferRequest(await readBody(req)));
        return void res.writeHead(HTTP.accepted).end();
      }
      if (path === STORAGE_API.renameUnit) {
        assertJsonBody(req);
        requireReady();
        const { id, name } = parseRenameRequest(await readBody(req));
        await gateway.renameUnit(id, name);
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.casesSync) {
        historySync.start(requireReady());
        return void res.writeHead(HTTP.accepted).end();
      }
      if (path === STORAGE_API.transferCancel) {
        gateway.cancelTransfer();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.transferDismiss) {
        gateway.dismissTransfer();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.qrLogin) {
        await gateway.startQrLogin();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.logout) {
        gateway.logout();
        return void res.writeHead(HTTP.noContent).end();
      }
      if (path === STORAGE_API.refresh) {
        requireReady();
        await loadPrices(parseScope(url), true);
        void gateway.refreshUnits(true);
        return void res.writeHead(HTTP.noContent).end();
      }
    }
    if (path.startsWith("/api/")) return sendJson(res, HTTP.notFound, { error: "Not found" });
    if (method !== "GET" && method !== "HEAD")
      return sendJson(res, HTTP.methodNotAllowed, { error: "Method not allowed" });
    if (settings.webDir) return await serveStatic(settings.webDir, path, res);
    sendJson(res, HTTP.notFound, { error: "Not found" });
  } catch (error) {
    sendError(res, error);
  }
});
function trackedScopes() {
  const raw = db.getCacheStale(TRACKED_SCOPES_KEY);
  const stored = raw ? JSON.parse(raw) : [];
  const scopes = /* @__PURE__ */ new Map();
  for (const entry of [`${DEFAULT_CURRENCY}:${DEFAULT_MARKETPLACE}`, ...stored]) {
    const [currency = DEFAULT_CURRENCY, marketplace] = entry.split(":");
    const known = MARKETPLACES.find((m) => m === marketplace);
    if (known) scopes.set(entry, { currency, marketplace: known });
  }
  return [...scopes.values()];
}
function scopeId({ currency, marketplace }) {
  return `${currency}:${marketplace}`;
}
function rememberScope(scope) {
  const known = trackedScopes();
  if (!known.some((s) => scopeId(s) === scopeId(scope)))
    db.setCache(TRACKED_SCOPES_KEY, JSON.stringify([...known, scope].map(scopeId)));
}
var snapshotJobStarted = false;
gateway.onReady((steamId) => {
  if (snapshotJobStarted) return;
  snapshotJobStarted = true;
  const tick = () => {
    for (const scope of trackedScopes()) {
      void recordSnapshot(steamId, scope).catch((e) => console.warn("[snapshot]", e));
    }
  };
  setTimeout(tick, SERVER_LIMITS.snapshotInitialDelayMs);
  setInterval(tick, SERVER_LIMITS.snapshotIntervalMs);
});
server.listen(settings.port, settings.host, () => {
  console.log(
    `[openinventory] listening on http://${settings.host}:${settings.port} (data: ${settings.dataDir})`,
  );
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
