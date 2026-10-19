import { TRADE_UP } from "../src/lib/storage/storage.config.ts";
import type {
  ItemView,
  TradeUpCandidatesResponse,
  TradeUpOddsResponse,
  TradeUpOutcome,
} from "../src/lib/items/item.types.ts";
import type { Catalog, SkinFacts } from "./items/catalog.types.ts";
import type { PriceBook } from "./prices/prices.ts";

export type TradeUpCandidate = { readonly view: ItemView; readonly skin: SkinFacts };

const MIN_PRICE = 0;
const VANILLA_SKIN = "Vanilla";

export function inputCountFor(rarityId: string): number {
  return rarityId === TRADE_UP.covertRarity ? TRADE_UP.covertInputCount : TRADE_UP.inputCount;
}

/** The tier a trade-up of this rarity yields; covert yields knives and gloves (no skin tier). */
function nextRarityOf(rarityId: string): string | undefined {
  if (rarityId === TRADE_UP.covertRarity) return TRADE_UP.covertRarity;
  const index = TRADE_UP.rarityOrder.findIndex((r) => r === rarityId);
  return index < 0 ? undefined : TRADE_UP.rarityOrder[index + 1];
}

/** Whether a skin can go into a trade-up of this rarity (covert needs a knife/glove pool). */
function isEligible(c: TradeUpCandidate, rarityId: string, catalog: Catalog): boolean {
  if (c.skin.rarityId !== rarityId || c.skin.isSouvenir) return false;
  if (c.view.wear === null || c.view.tradableAfter) return false;
  if (rarityId !== TRADE_UP.covertRarity) return true;
  return c.skin.skinId !== null && catalog.specialsFor(c.skin.skinId).length > 0;
}

function eligibleSorted(
  candidates: readonly TradeUpCandidate[],
  rarityId: string,
  catalog: Catalog,
): TradeUpCandidate[] {
  return candidates
    .filter((c) => isEligible(c, rarityId, catalog))
    .sort((a, b) => (a.view.price ?? Infinity) - (b.view.price ?? Infinity));
}

/** Every skin of this rarity that can be picked as an input, cheapest first. */
export function listTradeUpCandidates(
  candidates: readonly TradeUpCandidate[],
  rarityId: string,
  catalog: Catalog,
  currency: string,
): TradeUpCandidatesResponse {
  if (!nextRarityOf(rarityId)) return { ok: false, reason: "This rarity cannot be traded up." };
  return {
    ok: true,
    rarityId,
    inputCount: inputCountFor(rarityId),
    candidates: eligibleSorted(candidates, rarityId, catalog).map((c) => c.view),
    currency,
  };
}

function sortOutcomes(outcomes: TradeUpOutcome[]): TradeUpOutcome[] {
  return outcomes.sort((a, b) => b.probability - a.probability || (b.price ?? 0) - (a.price ?? 0));
}

/**
 * Odds for the chosen inputs. Each input contributes 1/N to its pool and that
 * share is split evenly across the pool's outcomes: the next-tier skins of its
 * collection, or (for covert) the knives and gloves of its case. Output float =
 * avg(input float) scaled into the output's [min, max] range.
 */
export function computeTradeUp(
  candidates: readonly TradeUpCandidate[],
  selectedIds: readonly string[],
  rarityId: string,
  catalog: Catalog,
  prices: PriceBook,
  currency: string,
): TradeUpOddsResponse {
  const nextRarity = nextRarityOf(rarityId);
  if (!nextRarity) return { ok: false, reason: "This rarity cannot be traded up." };
  const inputCount = inputCountFor(rarityId);
  if (selectedIds.length === 0) return { ok: false, reason: "Select skins to see the odds." };
  if (selectedIds.length > inputCount) {
    return { ok: false, reason: `A trade-up takes ${inputCount} skins.` };
  }

  const eligible = new Map(
    eligibleSorted(candidates, rarityId, catalog).map((c) => [c.view.id, c] as const),
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
  const priceOf = (hash: string | null | undefined, phase?: string | null): number | null => {
    const entry = hash ? prices.byName.get(hash) : undefined;
    return (phase ? entry?.phases?.[phase] : undefined) ?? entry?.price ?? null;
  };

  const outcomes: TradeUpOutcome[] =
    rarityId === TRADE_UP.covertRarity
      ? specialOutcomes(inputs, isStatTrak, averageFloat, catalog, priceOf)
      : skinOutcomes(inputs, nextRarity, isStatTrak, averageFloat, catalog, priceOf);
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

function skinOutcomes(
  inputs: readonly TradeUpCandidate[],
  nextRarity: string,
  isStatTrak: boolean,
  averageFloat: number,
  catalog: Catalog,
  priceOf: (hash: string | null | undefined, phase?: string | null) => number | null,
): TradeUpOutcome[] {
  const perCollection = new Map<string, number>();
  for (const input of inputs) {
    const collectionId = input.skin.collectionIds[0];
    if (collectionId) perCollection.set(collectionId, (perCollection.get(collectionId) ?? 0) + 1);
  }
  const outcomes: TradeUpOutcome[] = [];
  for (const [collectionId, count] of perCollection) {
    const outputs = catalog.tradeUpOutputs(collectionId, nextRarity, isStatTrak);
    for (const output of outputs) {
      const min = output.min_float ?? 0;
      const max = output.max_float ?? 1;
      const float = min + averageFloat * (max - min);
      const resolved = catalog.resolveWear(output, float) ?? output;
      const hash = resolved.market_hash_name;
      outcomes.push({
        name: resolved.name,
        imageUrl: catalog.skinImage(hash ?? "") ?? null,
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

const NAME_SEPARATOR = " | ";

type Special = ReturnType<Catalog["specialsFor"]>[number];

function weightOfPhase(special: Special): number {
  const table = special.name.includes(TRADE_UP.gammaDopplerName)
    ? TRADE_UP.phaseWeights.gammaDoppler
    : TRADE_UP.phaseWeights.doppler;
  return (table as Record<string, number>)[special.phase ?? ""] ?? 1;
}

/**
 * Chance of each knife/glove within one case's pool: every knife (or glove) type
 * is equally likely, then every finish of it (vanilla counts as one), and a
 * Doppler-family finish splits between its phases by `TRADE_UP.phaseWeights`.
 */
function poolOdds(pool: readonly Special[]): Map<string, number> {
  const byType = new Map<string, Map<string, Special[]>>();
  for (const special of pool) {
    const [type = special.name, ...finish] = special.name.split(NAME_SEPARATOR);
    const finishes = byType.get(type) ?? new Map<string, Special[]>();
    const key = finish.join(NAME_SEPARATOR) || VANILLA_SKIN;
    finishes.set(key, [...(finishes.get(key) ?? []), special]);
    byType.set(type, finishes);
  }
  const odds = new Map<string, number>();
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

/** Covert -> knife/glove: each input spreads its share over its case's knives and gloves. */
function specialOutcomes(
  inputs: readonly TradeUpCandidate[],
  isStatTrak: boolean,
  averageFloat: number,
  catalog: Catalog,
  priceOf: (hash: string | null | undefined, phase?: string | null) => number | null,
): TradeUpOutcome[] {
  const specials = new Map<string, Special>();
  const probabilities = new Map<string, number>();
  for (const input of inputs) {
    const pool = input.skin.skinId ? catalog.specialsFor(input.skin.skinId) : [];
    for (const special of pool) specials.set(special.id, special);
    for (const [id, odds] of poolOdds(pool)) {
      probabilities.set(id, (probabilities.get(id) ?? 0) + odds / inputs.length);
    }
  }
  const outcomes: TradeUpOutcome[] = [];
  for (const [id, probability] of probabilities) {
    const special = specials.get(id);
    const resolved = special && catalog.resolveSpecial(special, isStatTrak, averageFloat);
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

function displayName(
  name: string,
  wearName: string | null,
  phase: string | null | undefined,
): string {
  const base =
    wearName && name.endsWith(` (${wearName})`) ? name.slice(0, -(wearName.length + 3)) : name;
  const finished = base.includes(NAME_SEPARATOR) ? base : `${base}${NAME_SEPARATOR}${VANILLA_SKIN}`;
  const phased = phase ? `${finished} (${phase})` : finished;
  return wearName ? `${phased} (${wearName})` : phased;
}
