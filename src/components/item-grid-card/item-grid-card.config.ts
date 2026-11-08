export const ITEM_GRID_CARD = {
  /** Thumbnail fills the card width at a fixed height so every card (and virtual row) is the same size. */
  thumbClass: "h-28 w-full",
  stickerSize: 16,
  maxStickers: 5,
  selectRowLabel: "Select item",
  /** Cards are narrow at every width, so one reason chip shows and the rest fold into `+N`. */
  visibleHighlights: 1,
} as const;
