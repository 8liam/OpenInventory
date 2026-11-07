import type { Marketplace } from "../../src/lib/settings/settings.types.ts";
import { PRICE_DATA } from "../../src/lib/storage/storage.config.ts";
import type { Database } from "../db/db.types.ts";

/** Steam's rolling average prices, in the book's currency. */
export type PriceTrend = {
  readonly last24h: number;
  readonly last7d: number;
  readonly last30d: number;
  readonly last90d: number;
};

export type PriceEntry = {
  readonly price: number;
  /** Doppler-family prices by phase ("Phase 1", "Ruby", ...), when the feed splits them out. */
  readonly phases?: Readonly<Record<string, number>>;
  /** Rolling averages, present only on feeds that publish them (Steam). */
  readonly trend?: PriceTrend;
};
export type PriceBook = {
  readonly byName: ReadonlyMap<string, PriceEntry>;
  readonly fetchedAt: number;
  /** USD to the book's currency, so thresholds kept in USD can be converted. */
  readonly rate: number;
};

type StoredBook = {
  readonly fetchedAt: number;
  readonly rate: number;
  readonly entries: readonly (readonly [string, PriceEntry])[];
};

const memory = new Map<string, PriceBook>();
const inFlight = new Map<string, Promise<PriceBook>>();
const feedsInFlight = new Map<string, Promise<RawFeed>>();

type RawFeed = Record<string, unknown>;
type ExchangeRates = Readonly<Record<string, number>>;

function asPrice(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function field(value: unknown, key: string): unknown {
  return typeof value === "object" && value !== null ? (value as RawFeed)[key] : undefined;
}

/** Each feed shapes its USD price differently; this picks the one we show. */
const PRICE_EXTRACTORS: Readonly<Record<Marketplace, (raw: unknown) => number | null>> = {
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

/** Feeds that list Doppler-family phase prices, and where they keep them. */
const PHASE_EXTRACTORS: Partial<Readonly<Record<Marketplace, (raw: unknown) => unknown>>> = {
  csfloat: (raw) => field(field(raw, "starting_at"), "doppler") ?? field(raw, "doppler"),
  buff163: (raw) => field(field(raw, "starting_at"), "doppler"),
  csmoney: (raw) => field(raw, "doppler"),
};

/** Steam's rolling averages; all four must be present for a trend to be useful. */
function trendOf(raw: unknown, rate: number): PriceTrend | undefined {
  const fields = PRICE_DATA.steamTrendFields;
  const last24h = asPrice(field(raw, fields.last24h));
  const last7d = asPrice(field(raw, fields.last7d));
  const last30d = asPrice(field(raw, fields.last30d));
  const last90d = asPrice(field(raw, fields.last90d));
  if (last24h === null || last7d === null || last30d === null || last90d === null) return undefined;
  return {
    last24h: last24h * rate,
    last7d: last7d * rate,
    last30d: last30d * rate,
    last90d: last90d * rate,
  };
}

function phasePrices(raw: unknown, rate: number): Record<string, number> | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const phases: Record<string, number> = {};
  for (const [phase, value] of Object.entries(raw)) {
    const usd = asPrice(value);
    if (usd !== null) phases[phase] = usd * rate;
  }
  return Object.keys(phases).length > 0 ? phases : undefined;
}

async function fetchJson(file: string): Promise<RawFeed> {
  const response = await fetch(`${PRICE_DATA.baseUrl}/${file}.json`, {
    signal: AbortSignal.timeout(PRICE_DATA.fetchTimeoutMs),
  });
  if (!response.ok) throw new Error(`Price source returned ${response.status}`);
  return (await response.json()) as RawFeed;
}

/** Share the network response and JSON parse while currencies refresh together. */
function fetchSharedJson(file: string): Promise<RawFeed> {
  const existing = feedsInFlight.get(file);
  if (existing) return existing;
  const pending = fetchJson(file).finally(() => feedsInFlight.delete(file));
  feedsInFlight.set(file, pending);
  return pending;
}

async function fetchBook(currency: string, marketplace: Marketplace): Promise<PriceBook> {
  const [feed, rates] = await Promise.all([
    fetchSharedJson(marketplace),
    fetchSharedJson(PRICE_DATA.ratesFile) as Promise<ExchangeRates>,
  ]);
  const rate = rateOf(rates, currency);
  const extract = PRICE_EXTRACTORS[marketplace];
  const byName = new Map<string, PriceEntry>();
  for (const [name, raw] of Object.entries(feed)) {
    const usd = extract(raw);
    if (usd === null) continue;
    const phases = phasePrices(PHASE_EXTRACTORS[marketplace]?.(raw), rate);
    const trend = marketplace === PRICE_DATA.trendMarketplace ? trendOf(raw, rate) : undefined;
    byName.set(name, {
      price: usd * rate,
      ...(phases ? { phases } : {}),
      ...(trend ? { trend } : {}),
    });
  }
  return { byName, fetchedAt: Date.now(), rate };
}

function rateOf(rates: ExchangeRates, currency: string): number {
  const rate = rates[currency];
  if (typeof rate !== "number" || !(rate > 0)) throw new Error(`No exchange rate for ${currency}`);
  return rate;
}

function readStored(
  db: Database,
  key: string,
  maxAgeMs: number | undefined,
): PriceBook | undefined {
  const raw = maxAgeMs === undefined ? db.getCacheStale(key) : db.getCache(key, maxAgeMs);
  if (!raw) return undefined;
  const stored = JSON.parse(raw) as StoredBook;
  return { byName: new Map(stored.entries), fetchedAt: stored.fetchedAt, rate: stored.rate };
}

/**
 * Per-currency, per-marketplace price book: memory -> SQLite -> network. A failed
 * refresh falls back to the last stored book so a source outage never blanks the dashboard.
 */
export async function getPriceBook(
  db: Database,
  currency: string,
  marketplace: Marketplace,
  force = false,
): Promise<PriceBook> {
  const id = `${currency}:${marketplace}`;
  const key = `${PRICE_DATA.cachePrefix}${id}`;
  const cached = memory.get(id);
  if (!force && cached && Date.now() - cached.fetchedAt < PRICE_DATA.cacheTtlMs) return cached;
  if (!force) {
    const stored = readStored(db, key, PRICE_DATA.cacheTtlMs);
    if (stored) {
      memory.set(id, stored);
      return stored;
    }
  }
  const pending =
    inFlight.get(id) ??
    fetchBook(currency, marketplace)
      .then((book) => {
        db.setCache(
          key,
          JSON.stringify({
            fetchedAt: book.fetchedAt,
            rate: book.rate,
            entries: [...book.byName],
          } satisfies StoredBook),
        );
        memory.set(id, book);
        return book;
      })
      .catch((error: unknown) => {
        const stale = cached ?? readStored(db, key, undefined);
        if (stale) return stale;
        throw error;
      })
      .finally(() => inFlight.delete(id));
  inFlight.set(id, pending);
  return pending;
}
