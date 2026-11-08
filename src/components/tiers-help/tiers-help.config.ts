export const TIERS_HELP = {
  iconSize: 14,
  closeKey: "Escape",
  /** Popover width in px; shrinks to the viewport (minus margins) on narrow screens. */
  width: 304,
  viewportMargin: 8,
  gap: 6,
  rootClass: "relative",
  /** Desktop keeps the 32px icon button; touch screens and phones get a 36px square, the height of the selects beside it. */
  triggerClass:
    "px-2 aria-expanded:bg-muted aria-expanded:text-foreground max-sm:size-9 pointer-coarse:size-9",
  panelClass:
    "fixed z-50 max-h-[70vh] overflow-y-auto rounded-md border bg-card p-3 text-xs text-foreground shadow-lg",
  titleClass: "text-sm font-medium",
  introClass: "mt-1 text-muted-foreground",
  signalsClass: "mt-2 space-y-1 text-muted-foreground",
  signalLabelClass: "font-medium text-foreground",
  pointsClass: "mt-2 list-disc space-y-1 pl-4 text-muted-foreground",
} as const;
