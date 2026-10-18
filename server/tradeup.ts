import { TRADE_UP } from "../src/lib/storage/storage.config.ts";
import type { ItemView, TradeUpOutcome, TradeUpResponse } from "../src/lib/items/item.types.ts";
import type { Catalog, SkinFacts } from "./items/catalog.types.ts";
import type { PriceBook } from "./prices/prices.ts";

export type TradeUpCandidate = { readonly view: ItemView; readonly skin: SkinFacts };

const MIN_PRICE = 0;

/**
 * Cheapest-N eligible inputs of one rarity. Outcome odds follow the in-game
 * rule: each input contributes 1/N to its collection, split evenly across that
 * collection's next-tier skins. Output float = avg(input float) scaled into the
 * output skin's [min, max] range.
 */
export function computeTradeUp(
  candidates: readonly TradeUpCandidate[],
  rarityId: string,
  catalog: Catalog,
  prices: PriceBook,
  currency: string,
): TradeUpResponse {
  const nextRarity =
    TRADE_UP.rarityOrder[TRADE_UP.rarityOrder.findIndex((r) => r === rarityId) + 1];
  if (!nextRarity) return { ok: false, reason: "This rarity cannot be traded up." };

  const eligible = candidates
    .filter(
      (c) =>
        c.skin.rarityId === rarityId &&
        !c.skin.isSouvenir &&
        c.view.price !== null &&
        c.view.wear !== null &&
        !c.view.tradableAfter,
    )
    .sort((a, b) => (a.view.price ?? 0) - (b.view.price ?? 0));
  const statTrak = eligible.filter((c) => c.skin.isStatTrak);
  const normal = eligible.filter((c) => !c.skin.isStatTrak);
  const pool = normal.length >= TRADE_UP.inputCount ? normal : statTrak;
  if (pool.length < TRADE_UP.inputCount) {
    return {
      ok: false,
      reason: `Need ${TRADE_UP.inputCount} tradable, priced skins of this rarity; you have ${pool.length}.`,
    };
  }
  const inputs = pool.slice(0, TRADE_UP.inputCount);
  const isStatTrak = inputs.every((c) => c.skin.isStatTrak);

  const averageFloat = inputs.reduce((sum, c) => sum + (c.view.wear ?? 0), 0) / inputs.length;
  const inputCost = inputs.reduce((sum, c) => sum + (c.view.price ?? MIN_PRICE), 0);

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
        probability: count / inputs.length / outputs.length,
        float,
        wearName: resolved.wear?.name ?? "",
        price: hash ? (prices.byName.get(hash)?.price ?? null) : null,
      });
    }
  }
  if (outcomes.length === 0) return { ok: false, reason: "No outcome data for these inputs." };
  const expectedValue = outcomes.reduce((sum, o) => sum + o.probability * (o.price ?? 0), 0);
  outcomes.sort((a, b) => b.probability - a.probability || (b.price ?? 0) - (a.price ?? 0));
  return {
    ok: true,
    inputs: inputs.map((c) => c.view),
    averageFloat,
    inputCost,
    expectedValue,
    outcomes,
    currency,
  };
}
