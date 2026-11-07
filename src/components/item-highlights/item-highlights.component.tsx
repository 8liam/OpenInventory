import { itemHighlights } from "~/lib/items/highlights";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { ITEM_HIGHLIGHTS } from "./item-highlights.config";
import type { ItemHighlightsProps, ItemTierBadgeProps } from "./item-highlights.types";

/** Neutral reason chips under the item name. */
export function ItemHighlights({ item }: ItemHighlightsProps) {
  const { reasons } = itemHighlights(item);
  if (reasons.length === 0) return null;
  return (
    <div className="mt-0.5 flex flex-wrap items-center gap-1">
      {reasons.map((reason) => {
        const Icon = ITEM_HIGHLIGHTS.kindIcons[reason.kind];
        return (
          <span
            key={`${reason.kind}-${reason.label}`}
            className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
          >
            <Icon size={ITEM_HIGHLIGHTS.iconSize} aria-hidden />
            {reason.label}
          </span>
        );
      })}
    </div>
  );
}

/** Gem icon and "T1".."TX"; the most valuable tier is accented and lower tiers fade. */
export function ItemTierBadge({ item, className }: ItemTierBadgeProps) {
  const { tier } = itemHighlights(item);
  if (tier === null) return null;
  const Icon = ITEM_HIGHLIGHTS.tierIcon;
  const description = COPY.items.tierDescription(tier);
  return (
    <span
      role="img"
      aria-label={description}
      title={description}
      className={cn(
        "tabular inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]",
        ITEM_HIGHLIGHTS.tierStyles[tier.tier - 1] ?? ITEM_HIGHLIGHTS.fallbackTierStyle,
        className,
      )}
    >
      <Icon size={ITEM_HIGHLIGHTS.tierIconSize} aria-hidden />
      {ITEM_HIGHLIGHTS.tierPrefix}
      {tier.tier}
    </span>
  );
}
