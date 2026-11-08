import type { UnitStripOverflow } from "./unit-strip.types";

export const UNIT_STRIP = {
  /** Pixels of slack when deciding whether a card is fully in view (sub-pixel layout). */
  tolerance: 2,
  none: { after: 0, before: 0 } satisfies UnitStripOverflow,
  iconSize: 14,
  scrollLabel: "Storage units",
  more: (count: number) => `+${count} more`,
  showMore: (count: number) => `Show ${count} more storage ${count === 1 ? "unit" : "units"}`,
  classes: {
    /** A column of its own so the units list can still scroll vertically beside the contents. */
    root: "relative flex min-h-0 min-w-0 shrink-0 flex-col @min-[56rem]/storage:shrink",
    /** Fades the cut-off edge so a card is visibly "continued", not just clipped. */
    fadeAfter: "[mask-image:linear-gradient(to_right,#000_calc(100%-6.5rem),transparent)]",
    fadeBefore: "[mask-image:linear-gradient(to_right,transparent,#000_2.5rem)]",
    fadeBoth:
      "[mask-image:linear-gradient(to_right,transparent,#000_2.5rem,#000_calc(100%-6.5rem),transparent)]",
    more: "absolute right-1 top-1/2 z-10 inline-flex h-7 -translate-y-1/2 items-center gap-1 rounded-full border bg-card px-2.5 text-xs font-medium shadow-sm hover:bg-muted @min-[56rem]/storage:hidden",
  },
} as const;
