export const ITEM_GRID_CARD = {
  /** Thumbnail fills the card width at a fixed height so every card (and virtual row) is the same size. */
  thumbClass: "h-24 w-full",
  attachmentSize: 20,
  maxStickers: 5,
  patternLabel: "Pattern",
  selectRowLabel: "Select item",
  /** A 24px hit area on desktop; 36px on phones and touch screens. */
  checkboxClass:
    "absolute left-1.5 top-1.5 flex rounded bg-background/80 p-1 transition-opacity max-sm:p-2.5 [@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:p-2.5",
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
    skin: "line-clamp-2 break-words text-sm font-medium leading-tight",
    muted: "font-normal text-muted-foreground",
    wear: "mt-0.5 truncate text-[11px] leading-4 text-muted-foreground",
    figures: "mt-1.5 flex items-baseline justify-between gap-2",
    price: "tabular text-base font-semibold leading-tight",
    status: "tabular shrink-0 text-xs text-muted-foreground",
    /** Pinned to the bottom so attachments, note and location line up across a row of cards. */
    footer: "mt-auto flex min-w-0 flex-col gap-1.5 pt-2",
    /** Wraps, but two icon lines is the most the fixed card height has room for. */
    attachments: "flex max-h-11 flex-wrap items-center gap-1 overflow-hidden",
    attachmentImage: "size-5 object-contain",
    charm: "inline-flex shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground",
    /** The footer's own gap already spaces rows, so the row's default top margin is dropped. */
    chips: "mt-0",
    /** Account and location share one line; each truncates, but the account's SteamID tail stays. */
    location: "flex min-w-0 items-baseline gap-1 text-xs text-muted-foreground",
    account: "shrink",
    locationName: "truncate",
  },
} as const;
