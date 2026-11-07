import type {
  SellSuggestion,
  SuggestionReason,
} from "../../src/lib/items/sell-suggestions.types.ts";
import { INVENTORY_LOCATION_ID } from "../../src/lib/items/item.types.ts";
import { itemRowKey } from "../../src/lib/items/item-key.ts";
import type { PriceTrend } from "../prices/prices.ts";
import { SELL_SUGGESTIONS } from "./sell-suggestions.config.ts";
import type { SellThresholds, SuggestionItem } from "./sell-suggestions.types.ts";

/** USD thresholds expressed in the book's currency. */
export function thresholdsFor(rate: number): SellThresholds {
  return {
    spikeRatio: SELL_SUGGESTIONS.spikeRatio,
    declineShare: SELL_SUGGESTIONS.declineShare,
    minTrendPrice: SELL_SUGGESTIONS.minTrendPriceUsd * rate,
    idleMinCount: SELL_SUGGESTIONS.idleMinCount,
    idleMaxUnitPrice: SELL_SUGGESTIONS.idleMaxUnitPriceUsd * rate,
  };
}

/** Locked copies can't be sold yet, so they never justify a suggestion. */
function isSellableNow(item: SuggestionItem, now: number): boolean {
  return item.tradableAfter === null || item.tradableAfter <= now;
}

/** Every window must step down from the last to the first: 90d > 30d > 7d > 24h. */
function isSteadyDecline(trend: PriceTrend): boolean {
  return (
    trend.last90d > trend.last30d && trend.last30d > trend.last7d && trend.last7d > trend.last24h
  );
}

function trendReasons(
  trend: PriceTrend,
  itemKeys: readonly string[],
  thresholds: SellThresholds,
): SuggestionReason[] {
  if (trend.last24h < thresholds.minTrendPrice) return [];
  const reasons: SuggestionReason[] = [];
  if (trend.last24h >= trend.last30d * thresholds.spikeRatio) {
    reasons.push({ kind: "spike", change: trend.last24h / trend.last30d - 1, itemKeys });
  }
  if (isSteadyDecline(trend) && trend.last24h <= trend.last90d * (1 - thresholds.declineShare)) {
    reasons.push({ kind: "decline", change: trend.last24h / trend.last90d - 1, itemKeys });
  }
  return reasons;
}

function idleReason(
  sellable: readonly SuggestionItem[],
  thresholds: SellThresholds,
): SuggestionReason | undefined {
  const stored = sellable.filter((item) => item.locationId !== INVENTORY_LOCATION_ID);
  const unitPrice = stored[0]?.price ?? null;
  if (stored.length < thresholds.idleMinCount || unitPrice === null) return undefined;
  if (unitPrice > thresholds.idleMaxUnitPrice) return undefined;
  return { kind: "idle-stack", unitPrice, itemKeys: stored.map(itemRowKey) };
}

/**
 * Items worth considering for sale, from Steam's rolling averages (spikes and steady
 * declines) and from storage stacks that are numerous but cheap. Items with no market
 * hash name, or with no sellable copy, are skipped.
 */
export function findSellSuggestions(args: {
  readonly items: readonly SuggestionItem[];
  readonly trends: ReadonlyMap<string, PriceTrend>;
  readonly thresholds: SellThresholds;
  readonly now: number;
}): SellSuggestion[] {
  const { items, trends, thresholds, now } = args;
  const groups = new Map<string, SuggestionItem[]>();
  for (const item of items) {
    if (item.marketHashName === null) continue;
    const group = groups.get(item.marketHashName) ?? [];
    group.push(item);
    groups.set(item.marketHashName, group);
  }

  const ranked: { readonly suggestion: SellSuggestion; readonly value: number }[] = [];
  for (const [key, copies] of groups) {
    const sellable = copies.filter((item) => isSellableNow(item, now));
    const first = copies[0];
    if (!first || sellable.length === 0) continue;
    const trend = trends.get(key);
    const itemKeys = sellable.map(itemRowKey);
    const idle = idleReason(sellable, thresholds);
    const reasons = [
      ...(trend ? trendReasons(trend, itemKeys, thresholds) : []),
      ...(idle ? [idle] : []),
    ];
    if (reasons.length === 0) continue;
    ranked.push({
      value: sellable.reduce((sum, item) => sum + (item.price ?? 0), 0),
      suggestion: {
        key,
        name: first.name,
        imageUrl: first.imageUrl,
        rarityColor: first.rarityColor,
        reasons,
      },
    });
  }
  return ranked.sort((a, b) => b.value - a.value).map((entry) => entry.suggestion);
}
