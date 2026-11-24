export const TOOLTIP = {
  /** Hover waits this long (ms) so sweeping the pointer across icons doesn't flash tooltips. */
  showDelayMs: 300,
  closeKey: "Escape",
  /** Widest the bubble gets (px); the placement clamps its centre using this as the width. */
  maxWidth: 280,
  viewportMargin: 8,
  gap: 8,
  /** Below this much room above the trigger (px) the bubble opens underneath instead. */
  minRoomAbove: 96,
  /** Splits "Sticker | Team | Event" into its type and the readable remainder. */
  nameSeparator: " | ",
  imageSize: 48,
  triggerClass: "inline-flex shrink-0 rounded-sm outline-offset-2 focus-visible:outline-2",
  bubbleClass:
    "pointer-events-none fixed z-50 -translate-x-1/2 flex items-center gap-3 rounded-md border border-border-strong bg-card px-2.5 py-2 text-xs text-foreground",
  imageClass: "shrink-0 object-contain",
  textClass: "min-w-0",
  kindClass: "text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
  titleClass: "text-[13px] font-medium break-words",
  detailClass: "mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground",
} as const;
