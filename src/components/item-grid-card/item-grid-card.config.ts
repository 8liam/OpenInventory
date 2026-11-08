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
  classes: {
    card: "group relative flex h-full min-w-0 flex-col rounded-lg border bg-card p-3 text-left transition-colors focus-visible:outline-offset-2",
    cardSelectable: "cursor-pointer hover:bg-muted",
    cardChecked: "border-primary/60 bg-muted",
    media: "relative",
    tierBadge: "absolute right-1.5 top-1.5 shadow-sm",
    checkboxShown: "opacity-100",
    checkboxHidden: "opacity-0 focus-within:opacity-100 group-hover:opacity-100",
    checkbox: "size-4 accent-primary",
    text: "mt-2.5 min-w-0",
    weapon:
      "mb-0.5 truncate text-[11px] uppercase leading-none tracking-wide text-muted-foreground",
    skin: "truncate leading-tight",
    muted: "text-muted-foreground",
    figures: "mt-1.5 flex items-baseline justify-between gap-2",
    price: "tabular text-sm font-medium",
    status: "tabular shrink-0 text-xs text-muted-foreground",
    account: "shrink",
    location: "truncate",
    attachments: "mt-auto flex h-6 items-end gap-0.5 overflow-hidden",
    charms: "ml-1 text-[11px] text-muted-foreground",
  },
} as const;
