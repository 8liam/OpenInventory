import type { CaseOpening, CaseStats } from "~/lib/cases/cases.types";
import type { Dashboard, HistoryPoint, Holding, Slice } from "~/lib/items/dashboard.types";
import type { ItemView } from "~/lib/items/item.types";
import { STEAM_ID_A } from "./fake-api";

const DAY_MS = 86_400_000;

export function makeItem(overrides: Partial<ItemView> = {}): ItemView {
  return {
    id: "item-1",
    name: "AK-47 | Redline",
    marketHashName: "AK-47 | Redline (Field-Tested)",
    imageUrl: null,
    rarityColor: "#eb4b4b",
    rarityName: "Classified",
    category: "Rifle",
    customName: null,
    wear: 0.2,
    wearName: "Field-Tested",
    isStatTrak: false,
    isSouvenir: false,
    stickers: [],
    charms: [],
    pattern: null,
    videoUrl: null,
    terminal: null,
    tradableAfter: null,
    price: 12.5,
    locationId: "inventory",
    locationName: "Inventory",
    collections: [],
    accountId: STEAM_ID_A,
    note: null,
    ...overrides,
  };
}

export function makeSlice(label: string, value: number, count = 1, color?: string): Slice {
  return color === undefined ? { label, value, count } : { label, value, count, color };
}

export function makeHolding(overrides: Partial<Holding> = {}): Holding {
  return {
    name: "Dreams & Nightmares Case",
    imageUrl: null,
    rarityColor: null,
    count: 3,
    unitPrice: 1.5,
    totalValue: 4.5,
    ...overrides,
  };
}

export function makeHistory(count: number, endAt = Date.now()): HistoryPoint[] {
  return Array.from({ length: count }, (_, index) => ({
    takenAt: endAt - (count - 1 - index) * DAY_MS,
    totalValue: 100 + index * 10,
    inventoryValue: 60 + index * 5,
    storageValue: 40 + index * 5,
  }));
}

export function makeDashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return {
    currency: "USD",
    priceUpdatedAt: null,
    totals: {
      value: 1234.56,
      itemCount: 42,
      inventoryValue: 800,
      storageValue: 434.56,
      charmsValue: 0,
      unitsLoaded: 2,
      unitsTotal: 3,
    },
    change: { day: 5, week: null, month: null },
    history: makeHistory(5),
    byCategory: [
      makeSlice("Rifles", 600, 10),
      makeSlice("Pistols", 300, 5),
      makeSlice("Knives", 100, 1),
    ],
    byRarity: [makeSlice("Covert", 700, 3), makeSlice("Classified", 200, 4)],
    byWear: [makeSlice("Factory New", 500, 2), makeSlice("Field-Tested", 400, 8)],
    byLocation: [
      { id: "inventory", label: "Inventory", value: 800, count: 30 },
      { id: "unit-1", label: "Unit A", value: 434.56, count: 12 },
    ],
    topHoldings: [makeHolding()],
    insights: { lowestFloats: [], highestFloats: [], stacks: [] },
    ...overrides,
  };
}

export function makeCaseStats(overrides: Partial<CaseStats> = {}): CaseStats {
  return {
    kind: "case",
    kindCounts: { case: 100, souvenir: 0, capsule: 0, tradeUp: 0, drop: 0 },
    total: 100,
    gold: 2,
    statTrak: 10,
    firstOpenedAt: Date.UTC(2020, 0, 1),
    lastOpenedAt: Date.UTC(2026, 0, 1),
    casesSinceGold: 5,
    casesToFirstGold: 40,
    rarity: [],
    caseRarities: [
      {
        key: "milSpec",
        label: "Mil-spec",
        color: "4b69ff",
        count: 80,
        sinceLast: 0,
        hasDrop: true,
        uncertain: false,
      },
      {
        key: "restricted",
        label: "Restricted",
        color: "8847ff",
        count: 16,
        sinceLast: 3,
        hasDrop: true,
        uncertain: false,
      },
      {
        key: "classified",
        label: "Classified",
        color: "d32ce6",
        count: 3,
        sinceLast: 12,
        hasDrop: true,
        uncertain: false,
      },
      {
        key: "covert",
        label: "Covert",
        color: "eb4b4b",
        count: 1,
        sinceLast: 40,
        hasDrop: true,
        uncertain: false,
      },
    ],
    rarest: [],
    topItems: [],
    topCases: [],
    perMonth: [],
    recent: [],
    ...overrides,
  };
}

export function makeOpening(overrides: Partial<CaseOpening> = {}): CaseOpening {
  return {
    itemName: "AK-47 | Redline",
    imageUrl: null,
    color: "eb4b4b",
    isStatTrak: false,
    isGold: false,
    caseName: "Prisma Case",
    openedAt: Date.UTC(2025, 5, 1),
    ...overrides,
  };
}
