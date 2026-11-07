import { scoreItemHighlights } from "~/lib/items/highlights";
import { formatMoney } from "~/utils/format";
import { cn } from "~/utils/cn";
import { ITEM_HIGHLIGHTS } from "./item-highlights.config";
import type { ItemHighlightsProps, ItemTierMarkerProps } from "./item-highlights.types";

/** Neutral reason chips; the premium estimate lives in a tooltip so it never reads as a price. */
export function ItemHighlights({ item }: ItemHighlightsProps) {
  const { reasons, estimatedPremiumUsd } = scoreItemHighlights(item);
  if (reasons.length === 0) return null;
  const Info = ITEM_HIGHLIGHTS.infoIcon;
  const premium =
    estimatedPremiumUsd === null
      ? null
      : `${ITEM_HIGHLIGHTS.premiumPrefix}${formatMoney(estimatedPremiumUsd, "USD")}`;
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1">
      {reasons.map((reason) => {
        const Icon = ITEM_HIGHLIGHTS.kindIcons[reason.kind];
        return (
          <span
            key={`${reason.kind}-${reason.label}`}
            className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            title={reason.kind === "craft" && premium !== null ? premium : undefined}
          >
            <Icon size={ITEM_HIGHLIGHTS.iconSize} aria-hidden />
            {reason.label}
            {reason.kind === "craft" && premium !== null && (
              <Info
                size={ITEM_HIGHLIGHTS.infoIconSize}
                role="img"
                aria-label={`${ITEM_HIGHLIGHTS.premiumTitle}: ${premium}`}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}

/** The one tier marker, shown only for exceptional items. */
export function ItemTierMarker({ item, className }: ItemTierMarkerProps) {
  const { tier } = scoreItemHighlights(item);
  if (tier === null) return null;
  const Icon = ITEM_HIGHLIGHTS.tierIcons[tier];
  const label = ITEM_HIGHLIGHTS.tierLabels[tier];
  return (
    <span title={label} className={cn("inline-flex text-accent", className)}>
      <Icon size={ITEM_HIGHLIGHTS.tierIconSize} role="img" aria-label={label} />
    </span>
  );
}
