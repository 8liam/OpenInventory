import { Fingerprint, Gem, Info, Ruler, Sticker, type LucideIcon } from "lucide-react";
import type { HighlightKind, HighlightTier } from "~/lib/items/highlights.types";

export const ITEM_HIGHLIGHTS = {
  iconSize: 11,
  tierIconSize: 14,
  infoIconSize: 11,
  kindIcons: {
    float: Ruler,
    pattern: Fingerprint,
    craft: Sticker,
  } satisfies Record<HighlightKind, LucideIcon>,
  tierIcons: { exceptional: Gem } satisfies Record<HighlightTier, LucideIcon>,
  infoIcon: Info,
  tierLabels: { exceptional: "Exceptional highlight" } satisfies Record<HighlightTier, string>,
  premiumPrefix: "est. +",
  premiumTitle: "Estimated attachment premium, not a market price",
} as const;
