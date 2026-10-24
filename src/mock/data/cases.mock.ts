import type { CaseOpening, CaseStats, CasesResponse, OpeningKind, PulledItem, RaritySlice } from '~/lib/cases/cases.types';
import { DAY_MS, MOCK_NOW, itemColor, itemImage } from './mock.config';

const KIND_COUNTS: Record<OpeningKind, number> = { case: 412, souvenir: 31, capsule: 997, tradeUp: 16, drop: 466 };

/** Cases per month, oldest first, 2024-10 to 2026-09; sums to 412. */
const CASE_MONTHS = [3, 22, 4, 31, 14, 10, 26, 49, 0, 0, 7, 20, 110, 12, 0, 3, 3, 5, 36, 0, 9, 9, 12, 10 + 17];
const monthLabel = (i: number) => {
  const total = 2024 * 12 + 9 + i;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
};

const RARITY_BASE: readonly RaritySlice[] = [
  { label: 'Gold', color: 'e4ae39', count: 1 },
  { label: 'Covert', color: 'eb4b4b', count: 2 },
  { label: 'Classified', color: 'd32ce6', count: 8 },
  { label: 'Restricted', color: '8847ff', count: 63 },
  { label: 'Mil-Spec', color: '4b69ff', count: 336 },
  { label: 'Other', color: 'b0c3d9', count: 2 },
];

type OpeningSeed = { readonly image: string; readonly name: string; readonly source: string; readonly daysAgo: number; readonly gold?: boolean; readonly statTrak?: boolean };
const opening = (s: OpeningSeed): CaseOpening => ({
  itemName: s.name,
  imageUrl: itemImage(s.image),
  color: itemColor(s.image),
  isStatTrak: s.statTrak ?? false,
  isGold: s.gold ?? false,
  caseName: s.source,
  openedAt: MOCK_NOW - s.daysAgo * DAY_MS,
});

const RAREST: readonly CaseOpening[] = [
  opening({ image: '★ Bowie Knife | Tiger Tooth (Factory New)', name: '★ Bowie Knife | Tiger Tooth', source: 'Spectrum 2 Case', daysAgo: 3026, gold: true }),
  opening({ image: 'R8 Revolver | Fade (Factory New)', name: 'R8 Revolver | Fade', source: 'Revolver Case', daysAgo: 908 }),
  opening({ image: 'USP-S | The Traitor (Field-Tested)', name: 'USP-S | The Traitor', source: 'Snakebite Case', daysAgo: 1620 }),
  opening({ image: 'Glock-18 | Shinobu (Factory New)', name: 'Glock-18 | Shinobu', source: 'Fever Case', daysAgo: 362 }),
  opening({ image: 'MP7 | Abyssal Apparition (Factory New)', name: 'MP7 | Abyssal Apparition', source: 'Dreams & Nightmares Case', daysAgo: 1076 }),
  opening({ image: 'StatTrak™ Five-SeveN | Fowl Play (Factory New)', name: 'StatTrak™ Five-SeveN | Fowl Play', source: 'Operation Breakout Weapon Case', daysAgo: 1520, statTrak: true }),
  opening({ image: 'M4A1-S | Decimator (Field-Tested)', name: 'M4A1-S | Decimator', source: 'Spectrum Case', daysAgo: 3440 }),
  opening({ image: 'P90 | Trigon (Field-Tested)', name: 'P90 | Trigon', source: 'Operation Phoenix Weapon Case', daysAgo: 3446 }),
];

const pulled = (image: string, name: string, count: number): PulledItem => ({ name, imageUrl: itemImage(image), color: itemColor(image), count });

function stats(kind: OpeningKind): CaseStats {
  const total = KIND_COUNTS[kind];
  const scale = total / KIND_COUNTS.case;
  const months = CASE_MONTHS.map((c, i) => ({ month: monthLabel(i), count: Math.round(c * scale) }));
  const rarity = RARITY_BASE.map((r) => ({ ...r, count: kind === 'case' ? r.count : Math.max(1, Math.round(r.count * scale)) }));
  return {
    kind,
    kindCounts: KIND_COUNTS,
    total,
    gold: kind === 'case' ? 1 : 0,
    statTrak: kind === 'case' ? 39 : kind === 'souvenir' ? 3 : 0,
    firstOpenedAt: MOCK_NOW - 3446 * DAY_MS,
    lastOpenedAt: MOCK_NOW - 3 * DAY_MS,
    casesSinceGold: kind === 'case' ? 297 : null,
    casesToFirstGold: kind === 'case' ? 115 : null,
    rarity,
    rarest: kind === 'case' ? RAREST : RAREST.slice(0, 5).map((o, i) => ({ ...o, openedAt: o.openedAt + i * 31 * DAY_MS })),
    topItems: [pulled('AK-47 | Redline (Field-Tested)', 'AK-47 | Redline', 7), pulled('M4A4 | Poly Mag (Minimal Wear)', 'M4A4 | Poly Mag', 6), pulled('Negev | Drop Me (Field-Tested)', 'Negev | Drop Me', 5)],
    topCases: kind === 'case' ? [pulled('AK-47 | Redline (Field-Tested)', 'Spectrum 2 Case', 41), pulled('M4A4 | Poly Mag (Minimal Wear)', 'Revolver Case', 33)] : [],
    perMonth: months,
    recent: RAREST.slice(2, 7),
  };
}

export function casesResponse(kind: OpeningKind): CasesResponse {
  return {
    stats: stats(kind),
    sync: { state: 'idle', pages: 71, events: 1922, complete: true, message: null, lastSyncAt: MOCK_NOW - 3600_000 },
  };
}
