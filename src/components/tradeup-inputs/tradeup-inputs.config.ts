export const TRADEUP_INPUTS = {
  slotSize: 40,
  listMaxHeightClass: "max-h-80",
  /** A filled slot's name for the pointer and for assistive tech; the rarity is spelled out, not just tinted. */
  slotLabel: (name: string, rarity: string | null, action: string) =>
    `${name}${rarity ? ` (${rarity})` : ""} · ${action}`,
  /** Slot numbers print two digits, like a parts list. */
  slotNumber: (slot: number) => String(slot + 1).padStart(2, "0"),
  /** The funnel under the slots: one line from each slot's foot to the outcome below. */
  funnel: { width: 1000, height: 56, apexHalfWidth: 40 },
  /** Widest a slot may grow, so the visual scales with the slot count instead of filling the panel. */
  slotMaxWidthRem: 7,
  slotGridColumns: (count: number) => `repeat(${count}, minmax(0, 1fr))`,
  classes: {
    visual: "w-full",
    slots: "grid grid-cols-5 gap-1.5 sm:grid-cols-(--slot-cols)",
    slot: "relative flex aspect-[3/4] w-full min-w-0 flex-col justify-end rounded-sm p-1 text-left text-[10px] leading-tight",
    slotFilled: "border border-control bg-card transition-colors hover:bg-muted",
    slotEmpty: "border border-dashed border-control",
    slotNumber: "absolute left-1 top-1 font-mono text-[9px] text-muted-foreground",
    slotRarity: "absolute inset-x-1 top-[18px] h-0.5",
    slotThumb: "mx-auto mb-auto mt-5 border-0",
    slotFloat: "font-mono tabular-nums",
    slotName: "w-full truncate text-muted-foreground",
    funnel: "mb-3 block h-14 w-full",
    funnelLine: "stroke-border-strong",
    funnelLineOn: "stroke-control",
    candidateRow: "flex items-center gap-x-2 border-b px-2 hover:bg-muted lg:gap-x-3",
    candidateSelected: "bg-accent/12 shadow-[inset_2px_0_0_var(--accent-ink)] hover:bg-accent/15",
    candidateLabel:
      "grid min-w-0 flex-1 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 py-1.5 lg:grid-cols-[auto_minmax(0,1fr)_4rem_7rem_5rem] lg:gap-x-3",
    candidateDisabled: "cursor-not-allowed opacity-40",
    candidateInspect: "flex w-6 shrink-0",
  },
} as const;
