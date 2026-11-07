import {
  INVENTORY_LOCATION_ID,
  type TradeUpFinderOptions,
  type TradeUpFinderResponse,
} from "../src/lib/items/item.types.ts";
import { TRADE_UP, TRADE_UP_FINDER } from "../src/lib/storage/storage.config.ts";
import type { Catalog } from "./items/catalog.types.ts";
import type { PriceBook } from "./prices/prices.ts";
import { computeTradeUp, inputCountFor, type TradeUpCandidate } from "./tradeup.ts";

/** Search bounded price, float, and collection cohorts; this is a fast heuristic, not exhaustive. */
export function findTradeUps(
  candidates: readonly TradeUpCandidate[],
  options: TradeUpFinderOptions,
  catalog: Catalog,
  prices: PriceBook,
  currency: string,
): TradeUpFinderResponse {
  const inputCount = inputCountFor(options.rarityId);
  const eligible = candidates.filter((candidate) => {
    if (candidate.skin.rarityId !== options.rarityId || candidate.skin.isSouvenir) return false;
    if (candidate.view.wear === null || candidate.view.tradableAfter) return false;
    if (!options.includeStorage && candidate.view.locationId !== INVENTORY_LOCATION_ID)
      return false;
    if (options.statTrak === "normal" && candidate.skin.isStatTrak) return false;
    if (options.statTrak === "stattrak" && !candidate.skin.isStatTrak) return false;
    if (options.rarityId === TRADE_UP.covertRarity) {
      return (
        candidate.skin.skinId !== null && catalog.specialsFor(candidate.skin.skinId).length > 0
      );
    }
    return true;
  });
  const cohorts = new Map<string, TradeUpCandidate[]>();
  for (const candidate of eligible) {
    const key = String(candidate.skin.isStatTrak);
    const cohort = cohorts.get(key) ?? [];
    cohort.push(candidate);
    cohorts.set(key, cohort);
  }
  const contracts = new Map<string, readonly TradeUpCandidate[]>();
  const addWindows = (group: readonly TradeUpCandidate[]) => {
    if (contracts.size >= TRADE_UP_FINDER.maxContracts) return;
    const priceOrder = [...group].sort(
      (a, b) => (a.view.price ?? Infinity) - (b.view.price ?? Infinity),
    );
    const floatOrder = [...group].sort((a, b) => (a.view.wear ?? 0) - (b.view.wear ?? 0));
    for (const ordered of [priceOrder, floatOrder]) {
      const bounded = ordered.slice(0, TRADE_UP_FINDER.candidateLimit);
      for (let start = 0; start + inputCount <= bounded.length; start += 1) {
        const selection = bounded.slice(start, start + inputCount);
        const key = selection
          .map((candidate) => candidate.view.id)
          .sort()
          .join(",");
        contracts.set(key, selection);
        if (contracts.size >= TRADE_UP_FINDER.maxContracts) return;
      }
    }
  };
  for (const group of cohorts.values()) {
    addWindows(group);
    const byCollection = new Map<string, TradeUpCandidate[]>();
    for (const candidate of group) {
      const collection = candidate.skin.collectionIds[0];
      if (!collection) continue;
      const collectionGroup = byCollection.get(collection) ?? [];
      collectionGroup.push(candidate);
      byCollection.set(collection, collectionGroup);
    }
    for (const collection of byCollection.values()) {
      addWindows(collection);
      if (contracts.size >= TRADE_UP_FINDER.maxContracts) break;
    }
  }
  const results = [...contracts.values()].flatMap((inputs) => {
    const odds = computeTradeUp(
      candidates,
      inputs.map((candidate) => candidate.view.id),
      options.rarityId,
      catalog,
      prices,
      currency,
    );
    if (!odds.ok || odds.selected !== inputCount) return [];
    const selected = [...inputs].sort((a, b) => (a.view.price ?? 0) - (b.view.price ?? 0));
    return [
      {
        inputIds: selected.map((candidate) => candidate.view.id),
        inputs: selected.map((candidate) => candidate.view),
        inputCost: odds.inputCost,
        expectedValue: odds.expectedValue,
        profit: odds.expectedValue - odds.inputCost,
        odds,
      },
    ];
  });
  results.sort((a, b) => b.profit - a.profit || a.inputCost - b.inputCost);
  return {
    results: results.slice(0, TRADE_UP_FINDER.resultLimit),
    currency,
    searched: contracts.size,
  };
}
