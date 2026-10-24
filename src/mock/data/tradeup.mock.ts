import type { ItemView, TradeUpCandidatesResponse, TradeUpOddsResponse, TradeUpOutcome } from '~/lib/items/item.types';
import { WEAR_BANDS } from '~/lib/storage/storage.config';
import { INVENTORY_MOCK } from './inventory.mock';
import { MOCK_CURRENCY, itemColor, itemImage } from './mock.config';

export const TRADEUP_INPUT_COUNT = 5;
const REFERENCE_FLOAT = 0.4811;

const CANDIDATE_NAMES = [
  'Desert Eagle | Printstream (Well-Worn)',
  'AK-47 | Aquamarine Revenge (Field-Tested)',
  'FAMAS | Bad Trip (Field-Tested)',
  'AK-47 | Nightwish (Battle-Scarred)',
  'MP9 | Starlight Protector (Battle-Scarred)',
  'AWP | Asiimov (Field-Tested)',
  'M4A4 | Temukau (Factory New)',
  'Glock-18 | Gamma Doppler (Factory New)',
  'AK-47 | Inheritance (Factory New)',
  'M4A1-S | Control Panel (Factory New)',
  'Tec-9 | Cut Out (Factory New)',
] as const;

const CANDIDATES: readonly ItemView[] = CANDIDATE_NAMES.map((name) => INVENTORY_MOCK.find((i) => i.locationId === 'inventory' && i.marketHashName === name))
  .filter((i): i is ItemView => i !== undefined)
  .sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

export const DEFAULT_SELECTION: readonly string[] = CANDIDATES.slice(0, TRADEUP_INPUT_COUNT).map((c) => c.id);

type OutcomeSeed = { readonly name: string; readonly image: string; readonly probability: number; readonly basePrice: number; readonly min: number; readonly max: number };

/** Probabilities sum to 1; prices chosen so the default five inputs give the sample's -20.03% return. */
const OUTCOMES: readonly OutcomeSeed[] = [
  { name: '★ Bowie Knife | Tiger Tooth', image: '★ Bowie Knife | Tiger Tooth (Factory New)', probability: 0.1369, basePrice: 420.9, min: 0, max: 0.08 },
  { name: '★ Falchion Knife | Slaughter', image: '★ Falchion Knife | Slaughter (Minimal Wear)', probability: 0.2, basePrice: 150.2, min: 0, max: 0.2 },
  { name: '★ Falchion Knife | Fade', image: '★ Falchion Knife | Fade (Factory New)', probability: 0.2, basePrice: 139.9, min: 0, max: 0.08 },
  { name: '★ Falchion Knife | Case Hardened', image: '★ Falchion Knife | Case Hardened (Battle-Scarred)', probability: 0.2, basePrice: 110.4, min: 0, max: 1 },
  { name: '★ Falchion Knife | Crimson Web', image: '★ Falchion Knife | Crimson Web (Well-Worn)', probability: 0.15, basePrice: 98.3, min: 0, max: 1 },
  { name: '★ Falchion Knife | Night', image: '★ Falchion Knife | Night (Well-Worn)', probability: 0.0631, basePrice: 92.6, min: 0, max: 1 },
];

const wearName = (f: number) => WEAR_BANDS.find((b) => f < b.max)?.name ?? 'Battle-Scarred';

export function tradeUpCandidates(): TradeUpCandidatesResponse {
  return { ok: true, rarityId: 'rarity_ancient_weapon', inputCount: TRADEUP_INPUT_COUNT, candidates: CANDIDATES, currency: MOCK_CURRENCY };
}

export function tradeUpOdds(ids: readonly string[]): TradeUpOddsResponse {
  const picked = CANDIDATES.filter((c) => ids.includes(c.id));
  if (picked.length === 0) return { ok: false, reason: 'Pick at least one skin.' };
  const inputCost = picked.reduce((s, c) => s + (c.price ?? 0), 0);
  const averageFloat = picked.reduce((s, c) => s + (c.wear ?? 0), 0) / picked.length;
  // Lower floats are worth a little more, so swapping inputs visibly moves the result.
  const wearFactor = 1 + (REFERENCE_FLOAT - averageFloat) * 0.2;
  const outcomes: TradeUpOutcome[] = OUTCOMES.map((o) => {
    const float = o.min + averageFloat * (o.max - o.min);
    return {
      name: o.name,
      imageUrl: itemImage(o.image),
      rarityColor: itemColor(o.image),
      probability: o.probability,
      float,
      wearName: wearName(float),
      price: Number((o.basePrice * wearFactor).toFixed(2)),
    };
  }).sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  const expectedValue = outcomes.reduce((s, o) => s + o.probability * (o.price ?? 0), 0);
  const chanceToProfit = outcomes.reduce((s, o) => s + ((o.price ?? 0) > inputCost ? o.probability : 0), 0);
  return { ok: true, inputCount: TRADEUP_INPUT_COUNT, selected: picked.length, averageFloat, inputCost, expectedValue, chanceToProfit, outcomes, currency: MOCK_CURRENCY };
}
