import { Fingerprint, Gem, Ruler, Sticker, type LucideIcon } from "lucide-react";
import type { HighlightKind } from "~/lib/items/highlights.types";

export const ITEM_HIGHLIGHTS = {
  iconSize: 11,
  tierIconSize: 12,
  tierPrefix: "T",
  kindIcons: {
    float: Ruler,
    pattern: Fingerprint,
    craft: Sticker,
  } satisfies Record<HighlightKind, LucideIcon>,
  tierIcon: Gem,
  /** Badge classes by tier number (T1 first); T1 is solid accent and lower tiers fade out. */
  tierStyles: [
    "bg-accent font-semibold text-accent-foreground",
    "bg-accent/35 font-medium text-foreground",
    "bg-muted text-foreground/80",
  ],
  fallbackTierStyle: "bg-muted text-muted-foreground",
} as const;
