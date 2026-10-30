import type { ItemView } from '~/lib/items/item.types';
import { INVENTORY_LOCATION_ID } from '~/lib/items/item.types';
import { WEAR_BANDS } from '~/lib/storage/storage.config';
import type { StorageUnit } from '~/lib/storage/storage.types';
import { itemColor, itemImage, seeded } from './mock.config';

type Seed = {
  readonly name: string;
  readonly price: number;
  readonly wear?: number;
  readonly loc?: string;
  readonly stickers?: readonly string[];
};

export const UNIT_TARGETS = [
  { id: 'random', name: 'Miscellaneous', count: 74, value: 4.02 },
  { id: 'investments', name: 'Long-term holds', count: 181, value: 179.24 },
  { id: 'skins', name: 'Trade stock', count: 279, value: 147.29 },
  { id: 'stickers', name: 'Sticker collection', count: 863, value: 33.61 },
] as const;
const INVENTORY_COUNT = 278;
const INVENTORY_VALUE = 3681.03;

const CATEGORY_RULES: readonly [RegExp, string][] = [
  [/^Sticker \|/, 'Sticker'],
  [/Gloves/, 'Gloves'],
  [/^★/, 'Knives'],
  [/^(AK-47|M4A1-S|M4A4|FAMAS)/, 'Rifles'],
  [/^AWP/, 'Sniper Rifles'],
  [/^(Glock-18|Desert Eagle|Tec-9|R8 Revolver|USP-S|StatTrak™ Five-SeveN)/, 'Pistols'],
  [/^(MP9|MP7|P90)/, 'SMGs'],
  [/^Negev/, 'Heavy'],
];

const categoryOf = (name: string) => CATEGORY_RULES.find(([re]) => re.test(name))?.[1] ?? 'Other';
const wearNameOf = (wear: number) => WEAR_BANDS.find((b) => wear < b.max)?.name ?? null;
const split = (n: string) => n.replace(/^★ /, '').replace(/^StatTrak™ /, '');

const CURATED: readonly Seed[] = [
  { name: '★ Butterfly Knife | Vanilla', price: 1062.86 },
  { name: '★ Karambit | Slaughter (Factory New)', price: 977.66, wear: 0.0452 },
  { name: '★ Sport Gloves | Nocts (Field-Tested)', price: 489.39, wear: 0.1963 },
  { name: 'Tec-9 | Whiteout (Factory New)', price: 173.23, wear: 0.0681 },
  { name: 'M4A1-S | Control Panel (Factory New)', price: 123.95, wear: 0.0501 },
  { name: 'AK-47 | Inheritance (Factory New)', price: 88.93, wear: 0.0653, stickers: ['Sticker | Aerial | Katowice 2019', 'Sticker | ableJ | Katowice 2019', 'Sticker | Aerial | Katowice 2019', 'Sticker | ableJ | Katowice 2019', 'Sticker | Aerial | Katowice 2019'] },
  { name: 'Glock-18 | Gamma Doppler (Factory New)', price: 85.12, wear: 0.0342 },
  { name: 'MP9 | Starlight Protector (Factory New)', price: 83.56, wear: 0.0668 },
  { name: 'Desert Eagle | Cobalt Disruption (Factory New)', price: 76.98, wear: 0.0385 },
  { name: 'M4A4 | Temukau (Factory New)', price: 76.16, wear: 0.0687 },
  { name: 'AWP | Asiimov (Field-Tested)', price: 58.2, wear: 0.2511 },
  { name: 'MP9 | Starlight Protector (Battle-Scarred)', price: 49.28, wear: 0.6796 },
  { name: 'AK-47 | Nightwish (Battle-Scarred)', price: 48.68, wear: 0.6782 },
  { name: 'FAMAS | Bad Trip (Field-Tested)', price: 37.59, wear: 0.3165 },
  { name: 'AK-47 | Aquamarine Revenge (Field-Tested)', price: 31.94, wear: 0.2981 },
  { name: 'Desert Eagle | Printstream (Well-Worn)', price: 30.47, wear: 0.4334 },
  { name: 'R8 Revolver | Fade (Field-Tested)', price: 71.46, wear: 0.1712, loc: 'skins' },
  { name: 'Glock-18 | Shinobu (Factory New)', price: 22.5, wear: 0.0291, loc: 'skins' },
  { name: 'MP7 | Abyssal Apparition (Factory New)', price: 18.2, wear: 0.0612, loc: 'skins' },
  { name: 'StatTrak™ Five-SeveN | Fowl Play (Factory New)', price: 14.1, wear: 0.0505, loc: 'skins' },
  { name: 'AK-47 | Redline (Field-Tested)', price: 28.4, wear: 0.2011, loc: 'investments' },
  { name: 'USP-S | The Traitor (Field-Tested)', price: 21.9, wear: 0.2204, loc: 'investments' },
  { name: 'M4A1-S | Decimator (Field-Tested)', price: 19.7, wear: 0.1888, loc: 'investments' },
  { name: 'P90 | Trigon (Field-Tested)', price: 16.8, wear: 0.2402, loc: 'investments' },
  { name: 'Sticker | Aerial | Katowice 2019', price: 0.5, loc: 'random' },
  { name: 'Sticker | Miami Stabbyfish', price: 0.49, loc: 'random' },
  { name: 'Sticker | Blue Lethal', price: 0.44, loc: 'random' },
  { name: 'Sticker | Green Shark Shooter', price: 0.37, loc: 'random' },
  { name: 'Sticker | ableJ | Katowice 2019', price: 0.31, loc: 'random' },
  { name: 'Sticker | Yellow Bombster', price: 0.3, loc: 'random' },
  { name: 'Sticker | Red Cyclawps', price: 0.25, loc: 'random' },
  { name: 'Sticker | Red Cyclawps', price: 0.25, loc: 'random' },
  { name: 'Sticker | Purple Cyclawps', price: 0.24, loc: 'random' },
  { name: 'M4A4 | Poly Mag (Minimal Wear)', price: 0.13, wear: 0.1129, loc: 'random' },
  { name: 'Negev | Drop Me (Field-Tested)', price: 0.06, wear: 0.3778, loc: 'random' },
  { name: 'FAMAS | Meow 36 (Battle-Scarred)', price: 0.04, wear: 0.8082, loc: 'random' },
];

const FILLER_SKINS = [
  'AK-47 | Redline (Field-Tested)', 'AWP | Asiimov (Field-Tested)', 'M4A1-S | Decimator (Field-Tested)', 'P90 | Trigon (Field-Tested)',
  'MP7 | Abyssal Apparition (Factory New)', 'Glock-18 | Shinobu (Factory New)', 'USP-S | The Traitor (Field-Tested)', 'FAMAS | Meow 36 (Battle-Scarred)',
  'Negev | Drop Me (Field-Tested)', 'M4A4 | Poly Mag (Minimal Wear)', 'Tec-9 | Whiteout (Factory New)', 'MP9 | Starlight Protector (Battle-Scarred)',
] as const;
const FILLER_STICKERS = [
  'Sticker | Aerial | Katowice 2019', 'Sticker | Miami Stabbyfish', 'Sticker | Blue Lethal', 'Sticker | Green Shark Shooter',
  'Sticker | ableJ | Katowice 2019', 'Sticker | Yellow Bombster', 'Sticker | Red Cyclawps', 'Sticker | Purple Cyclawps',
] as const;

const locationName = (id: string) => (id === INVENTORY_LOCATION_ID ? 'Inventory' : (UNIT_TARGETS.find((u) => u.id === id)?.name ?? id));

function make(id: string, loc: string, seed: Seed, price: number, rand: () => number): ItemView {
  const isSticker = seed.name.startsWith('Sticker |');
  const knifeLike = categoryOf(seed.name) === 'Knives' && seed.wear === undefined;
  const wear = isSticker || knifeLike ? null : (seed.wear ?? Number((rand() * 0.9 + 0.01).toFixed(4)));
  return {
    id,
    name: seed.name.replace(/^StatTrak™ /, 'StatTrak™ '),
    marketHashName: seed.name,
    imageUrl: itemImage(seed.name),
    rarityColor: itemColor(seed.name),
    rarityName: null,
    category: categoryOf(seed.name),
    customName: null,
    wear,
    wearName: wear === null ? null : wearNameOf(wear),
    isStatTrak: seed.name.startsWith('StatTrak'),
    isSouvenir: false,
    stickers: (seed.stickers ?? []).map((s) => ({ name: s, imageUrl: itemImage(s) })),
    charms: [],
    pattern: null,
    tradableAfter: null,
    videoUrl: null,
    terminal: null,
    price,
    locationId: loc,
    locationName: locationName(loc),
  };
}

/** Pads a location with generated cheap items so its price total and item count match the sample account. */
function fill(loc: string, curated: readonly ItemView[], count: number, target: number, pool: readonly string[], rand: () => number): ItemView[] {
  const missing = count - curated.length;
  const remainderCents = Math.max(Math.round((target - curated.reduce((s, i) => s + (i.price ?? 0), 0)) * 100), missing);
  // One cent each, then the rest shared by random weights; the last item takes the rounding.
  const weights = Array.from({ length: missing }, () => 0.05 + rand() ** 3);
  const sum = weights.reduce((a, b) => a + b, 0);
  const extra = remainderCents - missing;
  let spent = 0;
  return weights.map((w, i) => {
    const share = i === missing - 1 ? extra - spent : Math.floor((w / sum) * extra);
    spent += share;
    const name = pool[Math.floor(rand() * pool.length)] ?? pool[0] ?? '';
    return make(`${loc}-g${i}`, loc, { name, price: 0 }, (1 + share) / 100, rand);
  });
}

function build(): ItemView[] {
  const rand = seeded(1675);
  const byLoc = new Map<string, ItemView[]>();
  CURATED.forEach((seed, i) => {
    const loc = seed.loc ?? INVENTORY_LOCATION_ID;
    byLoc.set(loc, [...(byLoc.get(loc) ?? []), make(`${loc}-c${i}`, loc, seed, seed.price, rand)]);
  });
  const out: ItemView[] = [];
  const inv = byLoc.get(INVENTORY_LOCATION_ID) ?? [];
  out.push(...inv, ...fill(INVENTORY_LOCATION_ID, inv, INVENTORY_COUNT, INVENTORY_VALUE, FILLER_SKINS, rand));
  for (const unit of UNIT_TARGETS) {
    const have = byLoc.get(unit.id) ?? [];
    const pool = unit.id === 'stickers' || unit.id === 'random' ? FILLER_STICKERS : FILLER_SKINS;
    out.push(...have, ...fill(unit.id, have, unit.count, unit.value, pool, rand));
  }
  return out;
}

export const INVENTORY_MOCK: readonly ItemView[] = build();

export const UNITS_MOCK: readonly StorageUnit[] = UNIT_TARGETS.map((u) => ({ id: u.id, name: u.name, itemCount: u.count, loaded: true }));
