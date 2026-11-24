export const OFFER_PANEL = {
  imageSize: 96,
  earlierImageSize: 36,
  /** The GC reports offer prices in US cents. */
  priceCurrency: "USD",
  centsPerUnit: 100,
  iconSize: 11,
  classes: {
    card: "relative flex flex-wrap items-center justify-between gap-4 rounded-md border border-control bg-card p-4",
    rarity: "absolute inset-y-3 left-0 w-0.5",
    weapon: "text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground",
    skin: "text-base font-semibold leading-tight",
    meta: "mt-1 font-mono text-[11px] tabular-nums text-muted-foreground",
    facts: "grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-[13px]",
    factLabel: "text-muted-foreground",
    factValue: "text-right font-mono text-xs tabular-nums",
    edge: "inline-flex items-center justify-end gap-0.5",
    gain: "text-success",
    loss: "text-destructive",
    final:
      "rounded-sm border border-border-strong px-1.5 font-mono text-[10px] leading-5 text-muted-foreground",
    earlierTitle: "kicker",
    earlierRow: "flex items-center justify-between gap-3 border-b py-1.5 text-sm",
    earlierPrice: "shrink-0 font-mono text-xs tabular-nums text-muted-foreground",
  },
} as const;
