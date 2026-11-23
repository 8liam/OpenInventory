export const ITEM_CELL = {
  imageSize: 48,
  stickerSize: 18,
  charmSize: 18,
  maxStickers: 5,
  patternLabel: "Pattern",
  compactLineClass: "mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden",
  chipsClass: "flex min-w-0 shrink items-center gap-1.5 overflow-hidden",
  // Attachments clip on their own so the Inspect button (a non-shrinking slot) stays on the line.
  attachmentsClass: "flex min-w-0 items-center gap-0.5 overflow-hidden",
  inspectSlotClass: "shrink-0",
  detailClass: "mt-0.5 truncate text-xs leading-4 text-muted-foreground",
  accountClass: "mt-0.5 text-xs leading-4 text-muted-foreground",
} as const;
