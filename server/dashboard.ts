import type {
  Dashboard,
  FloatHighlight,
  Holding,
  LocationSlice,
  Slice,
  ValueChange,
} from "../src/lib/items/dashboard.types.ts";
import { INVENTORY_LOCATION_ID, type ItemView } from "../src/lib/items/item.types.ts";
import { DASHBOARD } from "../src/lib/storage/storage.config.ts";
import type { ValueSnapshot } from "./db/db.types.ts";

const UNKNOWN_LABEL = "Other";

function addTo(
  map: Map<string, { value: number; count: number; color?: string }>,
  key: string,
  value: number,
  color?: string,
) {
  const entry = map.get(key) ?? { value: 0, count: 0, color };
  entry.value += value;
  entry.count += 1;
  map.set(key, entry);
}

function toSlices(map: Map<string, { value: number; count: number; color?: string }>): Slice[] {
  return [...map]
    .map(([label, { value, count, color }]) => ({
      label,
      value,
      count,
      ...(color ? { color } : {}),
    }))
    .sort((a, b) => b.value - a.value);
}

/** Value change versus the newest snapshot at least `windowMs` old; null when history is too short. */
function changeSince(
  history: readonly ValueSnapshot[],
  current: number,
  now: number,
  windowMs: number,
): number | null {
  const cutoff = now - windowMs;
  let baseline: ValueSnapshot | undefined;
  for (const snapshot of history) if (snapshot.takenAt <= cutoff) baseline = snapshot;
  return baseline ? current - baseline.totalValue : null;
}

export function summarizeValue(items: readonly ItemView[]) {
  let inventoryValue = 0;
  let storageValue = 0;
  for (const item of items) {
    const price = item.price ?? 0;
    if (item.locationId === INVENTORY_LOCATION_ID) inventoryValue += price;
    else storageValue += price;
  }
  return { inventoryValue, storageValue, totalValue: inventoryValue + storageValue };
}

export function buildDashboard(args: {
  readonly items: readonly ItemView[];
  readonly history: readonly ValueSnapshot[];
  readonly currency: string;
  readonly priceUpdatedAt: number | null;
  readonly unitsLoaded: number;
  readonly unitsTotal: number;
  readonly now?: number;
}): Dashboard {
  const { items, history, currency, priceUpdatedAt, unitsLoaded, unitsTotal } = args;
  const now = args.now ?? Date.now();
  const { inventoryValue, storageValue, totalValue } = summarizeValue(items);

  const category = new Map<string, { value: number; count: number; color?: string }>();
  const rarity = new Map<string, { value: number; count: number; color?: string }>();
  const wear = new Map<string, { value: number; count: number; color?: string }>();
  const location = new Map<string, { value: number; count: number; name: string }>();
  const stacks = new Map<
    string,
    {
      name: string;
      imageUrl: string | null;
      rarityColor: string | null;
      count: number;
      unitPrice: number;
      totalValue: number;
    }
  >();

  for (const item of items) {
    const price = item.price ?? 0;
    addTo(category, item.category, price);
    addTo(rarity, item.rarityName ?? UNKNOWN_LABEL, price, item.rarityColor ?? undefined);
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

  const holdings: Holding[] = [...stacks.values()].sort((a, b) => b.totalValue - a.totalValue);

  const byLocation: LocationSlice[] = [...location]
    .map(([id, { value, count, name }]) => ({ id, label: name, value, count }))
    .sort((a, b) =>
      a.id === INVENTORY_LOCATION_ID ? -1 : b.id === INVENTORY_LOCATION_ID ? 1 : b.value - a.value,
    );

  const withFloat = items.filter((i) => i.wear !== null);
  const toHighlight = (i: ItemView): FloatHighlight => ({
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

  const change: ValueChange = {
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
      ...history.map((s) => ({ takenAt: s.takenAt, totalValue: s.totalValue })),
      { takenAt: now, totalValue },
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
