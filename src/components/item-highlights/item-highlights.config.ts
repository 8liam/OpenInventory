import { Fingerprint, Gem, Ruler, Sparkle, Sticker, type LucideIcon } from "lucide-react";
import type { HighlightKind } from "~/lib/items/highlights.types";

export const ITEM_HIGHLIGHTS = {
  iconSize: 11,
  tierIconSize: 12,
  tierPrefix: "T",
  /** Chips kept on the one line under the name; the rest collapse into a `+N` chip. */
  visibleChips: { narrow: 1, wide: 3 },
  /** Chips may shrink (their label ellipsises) so the first one still fits a narrow column. */
  chipClass:
    "inline-flex min-w-0 items-center gap-1 rounded bg-foreground/[0.07] px-1.5 py-px text-[11px] leading-4 text-foreground/80",
  /** Phone table rows are narrow, so chips drop their icon there to leave room for the label. */
  chipIconClass: "shrink-0 max-md:hidden",
  kindIcons: {
    float: Ruler,
    pattern: Fingerprint,
    craft: Sticker,
  } satisfies Record<HighlightKind, LucideIcon>,
  tierIcon: Gem,
  /** Marks a highlighted item without a pattern tier (float or craft only) in the Highlights column. */
  markerIcon: Sparkle,
  markerIconSize: 13,
  /** Badge classes by tier number (T1 first); T1 is solid accent and lower tiers fade out. */
  tierStyles: [
    "bg-accent font-semibold text-accent-foreground",
    "bg-accent/35 font-medium text-foreground",
    "bg-muted text-foreground/80",
  ],
  fallbackTierStyle: "bg-muted text-muted-foreground",
} as const;
