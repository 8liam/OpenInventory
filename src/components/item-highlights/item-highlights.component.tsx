import { itemHighlights } from "~/lib/items/highlights";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { ITEM_HIGHLIGHTS } from "./item-highlights.config";
import type { ItemHighlightsProps, ItemTierBadgeProps } from "./item-highlights.types";

/**
 * Reason chips on one line under the item name, so a row never grows past its fixed height.
 * Chips that don't fit collapse into `+N`, which names the hidden reasons for screen readers.
 */
export function ItemHighlights({ item, children, visible }: ItemHighlightsProps) {
  const { reasons } = itemHighlights(item);
  if (reasons.length === 0 && !children) return null;
  const { chipVisibility, moreVisibility } = ITEM_HIGHLIGHTS;
  // A fixed count (e.g. a grid card) applies at every width; otherwise the line's width decides.
  const chipClass = (index: number) =>
    visible === undefined ? (chipVisibility[index] ?? "hidden") : index < visible ? "" : "hidden";
  const more = (from: number, className: string) =>
    reasons.length > from && (
      <span
        key={from}
        className={cn(ITEM_HIGHLIGHTS.chipClass, "tabular shrink-0", className)}
        title={reasons
          .slice(from)
          .map((reason) => reason.label)
          .join(", ")}
      >
        <span aria-hidden>{COPY.items.moreHighlights(reasons.length - from)}</span>
        <span className="sr-only">
          {reasons
            .slice(from)
            .map((reason) => reason.label)
            .join(", ")}
        </span>
      </span>
    );
  return (
    <div className={ITEM_HIGHLIGHTS.lineClass}>
      {reasons.map((reason, index) => {
        const Icon = ITEM_HIGHLIGHTS.kindIcons[reason.kind];
        return (
          <span
            key={`${reason.kind}-${reason.label}`}
            className={cn(ITEM_HIGHLIGHTS.chipClass, index > 0 && "shrink-0", chipClass(index))}
          >
            <Icon
              size={ITEM_HIGHLIGHTS.iconSize}
              className={ITEM_HIGHLIGHTS.chipIconClass}
              aria-hidden
            />
            <span className="truncate">{reason.label}</span>
          </span>
        );
      })}
      {visible === undefined
        ? moreVisibility.map((className, from) => more(from + 1, className))
        : more(visible, "")}
      {children}
    </div>
  );
}

/** Gem icon and "T1".."TX"; the most valuable tier is accented and lower tiers fade. */
export function ItemTierBadge({ item, className, decorative = false }: ItemTierBadgeProps) {
  const { tier } = itemHighlights(item);
  if (tier === null) return null;
  const Icon = ITEM_HIGHLIGHTS.tierIcon;
  const description = COPY.items.tierDescription(tier);
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : description}
      aria-hidden={decorative || undefined}
      title={decorative ? undefined : description}
      className={cn(
        "tabular inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px]",
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
