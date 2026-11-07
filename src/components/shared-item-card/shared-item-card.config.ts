export const SHARED_ITEM_CARD = {
  cardClass: "flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-2.5",
  imageClass: "aspect-[4/3] w-full object-contain",
  nameClass: "truncate text-sm font-medium",
  metaClass: "truncate text-xs text-muted-foreground",
  priceClass: "text-sm font-medium",
  /** Joins a card's wear, StatTrak and Souvenir labels on one line. */
  metaSeparator: " · ",
} as const;
