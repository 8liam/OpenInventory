import type { Marketplace } from "../../src/lib/settings/settings.types.ts";
import { PRICE_DATA } from "../../src/lib/storage/storage.config.ts";
import type { Database } from "../db/db.types.ts";

export type PriceEntry = { readonly price: number };
export type PriceBook = {
  readonly byName: ReadonlyMap<string, PriceEntry>;
  readonly fetchedAt: number;
};

type StoredBook = {
  readonly fetchedAt: number;
  readonly entries: readonly (readonly [string, PriceEntry])[];
};

const memory = new Map<string, PriceBook>();
const inFlight = new Map<string, Promise<PriceBook>>();

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

async function fetchJson(file: string): Promise<RawFeed> {
  const response = await fetch(`${PRICE_DATA.baseUrl}/${file}.json`, {
    signal: AbortSignal.timeout(PRICE_DATA.fetchTimeoutMs),
  });
  if (!response.ok) throw new Error(`Price source returned ${response.status}`);
  return (await response.json()) as RawFeed;
}

async function fetchBook(currency: string, marketplace: Marketplace): Promise<PriceBook> {
  const [feed, rates] = await Promise.all([
    fetchJson(marketplace),
    fetchJson(PRICE_DATA.ratesFile) as Promise<ExchangeRates>,
  ]);
  const rate = rates[currency];
  if (typeof rate !== "number" || !(rate > 0)) throw new Error(`No exchange rate for ${currency}`);
  const extract = PRICE_EXTRACTORS[marketplace];
  const byName = new Map<string, PriceEntry>();
  for (const [name, raw] of Object.entries(feed)) {
    const usd = extract(raw);
    if (usd !== null) byName.set(name, { price: usd * rate });
  }
  return { byName, fetchedAt: Date.now() };
}

function readStored(
  db: Database,
  key: string,
  maxAgeMs: number | undefined,
): PriceBook | undefined {
  const raw = maxAgeMs === undefined ? db.getCacheStale(key) : db.getCache(key, maxAgeMs);
  if (!raw) return undefined;
  const stored = JSON.parse(raw) as StoredBook;
  return { byName: new Map(stored.entries), fetchedAt: stored.fetchedAt };
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
