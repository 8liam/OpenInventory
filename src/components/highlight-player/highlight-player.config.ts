import { ITEM_HIGHLIGHTS } from "~/components/item-highlights/item-highlights.config";

export const HIGHLIGHT_PLAYER = {
  iconSize: 11,
  /** The same pill as the float and pattern chips, as a button. */
  badgeClass: `${ITEM_HIGHLIGHTS.chipClass} shrink-0 cursor-pointer transition-colors hover:bg-foreground/15 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1`,
  dialogClass:
    "m-auto w-[min(90vw,960px)] rounded-lg border bg-card p-0 text-foreground backdrop:bg-black/70",
} as const;
