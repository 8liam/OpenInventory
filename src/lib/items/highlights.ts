import { formatFloat } from "../../utils/format.ts";
import { NOTABLE_ATTACHMENTS } from "./attachments/attachments.ts";
import { DEFAULT_FLOAT_THRESHOLD, FLOAT_THRESHOLD_FRACTIONS } from "../settings/settings.config.ts";
import type { FloatThresholdId } from "../settings/settings.types.ts";
import { HIGHLIGHTS } from "./highlights.config.ts";
import type { ItemView } from "./item.types.ts";
import type { HighlightReason, ItemHighlights } from "./highlights.types.ts";
import { resolvePatternTier } from "./patterns/pattern-tiers.ts";
import type { PatternTierMatch } from "./patterns/pattern-tiers.types.ts";

function hasCraftAttachment(item: ItemView): boolean {
  return NOTABLE_ATTACHMENTS.some(({ name, kind }) => {
    const wanted = name.toLocaleLowerCase();
    const owned = kind === "sticker" ? item.stickers : item.charms;
    return owned.some((attachment) => attachment.name.toLocaleLowerCase().includes(wanted));
  });
}

let floatTailFraction: number = FLOAT_THRESHOLD_FRACTIONS[DEFAULT_FLOAT_THRESHOLD];
let cache = new WeakMap<ItemView, ItemHighlights>();

/** Sets how near a skin's min/max float counts as notable ("off" disables it) and drops memoised results. */
export function setFloatThreshold(threshold: FloatThresholdId): void {
  const fraction = FLOAT_THRESHOLD_FRACTIONS[threshold];
  if (fraction === floatTailFraction) return;
  floatTailFraction = fraction;
  cache = new WeakMap();
}

function floatSignal(item: ItemView): boolean {
  const { wear, minWear, maxWear } = item;
  if (floatTailFraction === 0) return false;
  if (wear === null || minWear == null || maxWear == null || maxWear <= minWear) return false;
  const tail = (maxWear - minWear) * floatTailFraction;
  return wear <= minWear + tail || wear >= maxWear - tail;
}

function patternLabel({ label, seed }: PatternTierMatch): string {
  return seed === null ? label : `${label} ${HIGHLIGHTS.seedMarker}${seed}`;
}

function computeHighlights(item: ItemView): ItemHighlights {
  const reasons: HighlightReason[] = [];
  if (item.wear !== null && floatSignal(item)) {
    reasons.push({
      kind: "float",
      label: `${HIGHLIGHTS.floatLabelPrefix} ${formatFloat(item.wear)}`,
    });
  }
  const tier = resolvePatternTier(item);
  if (tier !== null) reasons.push({ kind: "pattern", label: patternLabel(tier) });
  if (hasCraftAttachment(item)) reasons.push({ kind: "craft", label: HIGHLIGHTS.craftLabel });
  return { reasons, tier };
}

/** Why an item is notable, and its pattern tier if it has one. Memoised per item object. */
export function itemHighlights(item: ItemView): ItemHighlights {
  const cached = cache.get(item);
  if (cached) return cached;
  const computed = computeHighlights(item);
  cache.set(item, computed);
  return computed;
}

/** Lower sorts first: tiered items by tier number, then other highlights, then everything else. */
export function highlightRank(item: ItemView): number {
  const { tier, reasons } = itemHighlights(item);
  if (tier !== null) return tier.tier;
  return reasons.length > 0 ? HIGHLIGHTS.rank.untiered : HIGHLIGHTS.rank.none;
}

/** Table sort key, higher first: best rank, with price breaking ties. */
export function highlightSortValue(item: ItemView): number {
  return -highlightRank(item) * HIGHLIGHTS.rank.priceSpan + (item.price ?? 0);
}
