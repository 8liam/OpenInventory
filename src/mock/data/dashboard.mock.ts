import type { Dashboard, Holding, HistoryPoint, FloatHighlight } from '~/lib/items/dashboard.types';
import { DAY_MS, HOUR_MS, MOCK_CURRENCY, MOCK_NOW, itemColor, itemImage, seeded } from './mock.config';

const TOTAL = 4045.19;
const INVENTORY = 3681.03;
const STORAGE = 364.16;
const HISTORY_DAYS = 150;

/** Daily points for ~5 months, hourly for the last two days; ends exactly on today's value. */
function buildHistory(): HistoryPoint[] {
  const rand = seeded(730);
  const out: HistoryPoint[] = [];
  const stamps: number[] = [];
  for (let d = HISTORY_DAYS; d > 2; d--) stamps.push(MOCK_NOW - d * DAY_MS);
  for (let h = 48; h >= 0; h--) stamps.push(MOCK_NOW - h * HOUR_MS);
  let drift = 0;
  const raw = stamps.map((t, i) => {
    drift += (rand() - 0.47) * 0.034;
    const season = Math.sin((i / stamps.length) * Math.PI * 1.6) * 0.07;
    return 1 + drift * 0.55 + season;
  });
  const lastRaw = raw[raw.length - 1] ?? 1;
  stamps.forEach((takenAt, i) => {
    const ratio = (raw[i] ?? 1) / lastRaw;
    const totalValue = Number((TOTAL * ratio * (0.84 + 0.16 * (i / stamps.length))).toFixed(2));
    const storageValue = Number((totalValue * (STORAGE / TOTAL)).toFixed(2));
    out.push({ takenAt, totalValue, storageValue, inventoryValue: Number((totalValue - storageValue).toFixed(2)) });
  });
  const lastIndex = out.length - 1;
  out[lastIndex] = { takenAt: MOCK_NOW, totalValue: TOTAL, inventoryValue: INVENTORY, storageValue: STORAGE };
  return out;
}

const holding = (name: string, count: number, unitPrice: number): Holding => ({
  name,
  imageUrl: itemImage(name),
  rarityColor: itemColor(name),
  count,
  unitPrice,
  totalValue: Number((unitPrice * count).toFixed(2)),
});

const float = (id: string, name: string, wear: number, price: number): FloatHighlight => ({
  id,
  name,
  wear,
  imageUrl: itemImage(name),
  rarityColor: itemColor(name),
  price,
});

export const DASHBOARD_MOCK: Dashboard = {
  currency: MOCK_CURRENCY,
  priceUpdatedAt: MOCK_NOW,
  totals: { value: TOTAL, itemCount: 1675, inventoryValue: INVENTORY, storageValue: STORAGE, unitsLoaded: 4, unitsTotal: 4 },
  change: { day: 31.52, week: 88.1, month: -142.6 },
  history: buildHistory(),
  byCategory: [
    { label: 'Knives', value: 2040.52, count: 2 },
    { label: 'Rifles', value: 551.81, count: 147 },
    { label: 'Pistols', value: 544.65, count: 150 },
    { label: 'Gloves', value: 489.39, count: 1 },
    { label: 'Stickers', value: 168.9, count: 1010 },
    { label: 'SMGs', value: 156.4, count: 96 },
    { label: 'Other', value: 93.52, count: 269 },
  ],
  byRarity: [
    { label: 'Covert', value: 2530.4, count: 4, color: '#eb4b4b' },
    { label: 'Classified', value: 702.18, count: 38, color: '#d32ce6' },
    { label: 'Restricted', value: 410.33, count: 164, color: '#8847ff' },
    { label: 'Mil-Spec', value: 318.9, count: 612, color: '#4b69ff' },
    { label: 'Industrial', value: 52.1, count: 90, color: '#5e98d9' },
    { label: 'Consumer', value: 31.28, count: 767, color: '#b0c3d9' },
  ],
  byWear: [
    { label: 'Factory New', value: 1950.21, count: 212 },
    { label: 'Field-Tested', value: 1120.64, count: 301 },
    { label: 'Minimal Wear', value: 540.12, count: 188 },
    { label: 'Battle-Scarred', value: 301.7, count: 140 },
    { label: 'Well-Worn', value: 132.52, count: 94 },
  ],
  byLocation: [
    { id: 'inventory', label: 'Inventory', value: INVENTORY, count: 278 },
    { id: 'investments', label: 'investments', value: 179.24, count: 181 },
    { id: 'skins', label: 'skins i dont use', value: 147.29, count: 279 },
    { id: 'stickers', label: 'stickers', value: 33.61, count: 863 },
    { id: 'random', label: 'random', value: 4.02, count: 74 },
  ].sort((a, b) => b.value - a.value),
  topHoldings: [
    holding('★ Butterfly Knife | Vanilla', 1, 1062.86),
    holding('★ Karambit | Slaughter (Factory New)', 1, 977.66),
    holding('★ Sport Gloves | Nocts (Field-Tested)', 1, 489.39),
    holding('Tec-9 | Cut Out (Factory New)', 1, 173.23),
    holding('M4A1-S | Control Panel (Factory New)', 1, 123.95),
  ],
  insights: {
    lowestFloats: [
      float('f1', 'Glock-18 | Gamma Doppler (Factory New)', 0.0342, 85.12),
      float('f2', 'Desert Eagle | Cobalt Disruption (Factory New)', 0.0385, 76.98),
      float('f3', '★ Karambit | Slaughter (Factory New)', 0.0452, 977.66),
    ],
    highestFloats: [
      float('f4', 'MP9 | Starlight Protector (Battle-Scarred)', 0.6796, 49.28),
      float('f5', 'AK-47 | Nightwish (Battle-Scarred)', 0.6782, 48.68),
      float('f6', 'FAMAS | Meow 36 (Battle-Scarred)', 0.8082, 0.04),
    ],
    stacks: [
      holding('Sticker | Red Cyclawps', 18, 0.25),
      holding('Sticker | Aerial | Katowice 2019', 12, 0.5),
      holding('Sticker | Blue Lethal', 9, 0.44),
    ],
  },
};
