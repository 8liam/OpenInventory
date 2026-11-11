export const TRADEUP_ITEM_TILE = {
  percentScale: 100,
  quantity: (count: number) => `×${count}`,
  gridClass:
    "grid grid-cols-[repeat(auto-fill,minmax(min(100%,8rem),1fr))] gap-2 lg:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))]",
  positiveClass: "text-success",
  negativeClass: "text-destructive",
} as const;
