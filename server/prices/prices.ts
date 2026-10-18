import { PRICE_DATA } from "../../src/lib/storage/storage.config.ts";
import type { Database } from "../db/db.types.ts";

export type PriceEntry = { readonly price: number };
export type PriceBook = {
  readonly byName: ReadonlyMap<string, PriceEntry>;
  readonly fetchedAt: number;
};

type SkinportItem = {
  market_hash_name: string;
  min_price: number | null;
};

type StoredBook = {
  readonly fetchedAt: number;
  readonly entries: readonly (readonly [string, PriceEntry])[];
};

const memory = new Map<string, PriceBook>();
const inFlight = new Map<string, Promise<PriceBook>>();

async function fetchBook(currency: string): Promise<PriceBook> {
  const url = new URL(PRICE_DATA.url);
  url.searchParams.set("app_id", String(PRICE_DATA.appId));
  url.searchParams.set("currency", currency);
  const response = await fetch(url, {
    headers: { "accept-encoding": "br" },
    signal: AbortSignal.timeout(PRICE_DATA.fetchTimeoutMs),
  });
  if (!response.ok) throw new Error(`Price source returned ${response.status}`);
  const items = (await response.json()) as SkinportItem[];
  const byName = new Map<string, PriceEntry>();
  for (const item of items) {
    if (item.min_price !== null) byName.set(item.market_hash_name, { price: item.min_price });
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
 * Per-currency price book: memory -> SQLite -> network. A failed refresh falls
 * back to the last stored book so a source outage never blanks the dashboard.
 */
export async function getPriceBook(
  db: Database,
  currency: string,
  force = false,
): Promise<PriceBook> {
  const key = `${PRICE_DATA.cachePrefix}${currency}`;
  const cached = memory.get(currency);
  if (!force && cached && Date.now() - cached.fetchedAt < PRICE_DATA.cacheTtlMs) return cached;
  if (!force) {
    const stored = readStored(db, key, PRICE_DATA.cacheTtlMs);
    if (stored) {
      memory.set(currency, stored);
      return stored;
    }
  }
  const pending =
    inFlight.get(currency) ??
    fetchBook(currency)
      .then((book) => {
        db.setCache(
          key,
          JSON.stringify({
            fetchedAt: book.fetchedAt,
            entries: [...book.byName],
          } satisfies StoredBook),
        );
        memory.set(currency, book);
        return book;
      })
      .catch((error: unknown) => {
        const stale = cached ?? readStored(db, key, undefined);
        if (stale) return stale;
        throw error;
      })
      .finally(() => inFlight.delete(currency));
  inFlight.set(currency, pending);
  return pending;
}
