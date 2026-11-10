import { Fingerprint, Gem, Ruler, Sparkle, Sticker, type LucideIcon } from "lucide-react";
import type { HighlightKind } from "~/lib/items/highlights.types";

export const ITEM_HIGHLIGHTS = {
  tierIconSize: 12,
  tierPrefix: "T",
  /**
   * How many chips fit is decided by the width of the name column itself (a container query),
   * not the viewport: one chip always, a second from 220px, a third from 320px. The rest fold
   * into `+N`. Index i of `chipVisibility` styles chip i; chips past the end are always folded.
   */
  lineClass: "@container mt-1 flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden",
  chipVisibility: ["", "hidden @min-[220px]:inline-flex", "hidden @min-[320px]:inline-flex"],
  /** `+N` for the chips folded at each width: index i is the badge shown while i + 1 chips fit. */
  moreVisibility: [
    "@min-[220px]:hidden",
    "hidden @min-[220px]:inline-flex @min-[320px]:hidden",
    "hidden @min-[320px]:inline-flex",
  ],
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
