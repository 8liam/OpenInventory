export const ITEM_GRID_CARD = {
  /** Thumbnail fills the card width at a fixed height so every card (and virtual row) is the same size. */
  thumbClass: "h-28 w-full",
  stickerSize: 16,
  maxStickers: 5,
  selectRowLabel: "Select item",
  /** A 24px hit area on desktop; 36px on phones and touch screens. */
  checkboxClass:
    "absolute left-1.5 top-1.5 flex rounded bg-background/80 p-1 transition-opacity max-sm:p-2.5 [@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:p-2.5",
  /** Cards are narrow at every width, so one reason chip shows and the rest fold into `+N`. */
  visibleHighlights: 1,
  /** Account and location share one line; each truncates, but the account's SteamID tail stays. */
  locationClass: "mt-0.5 flex min-w-0 items-baseline gap-1 text-xs text-muted-foreground",
  locationSeparator: "·",
} as const;
