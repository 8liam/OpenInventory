export const TRADEUP_INPUTS = {
  slotSize: 44,
  listMaxHeightClass: "max-h-80",
  /** A filled slot's name for the pointer and for assistive tech; the rarity is spelled out, not just tinted. */
  slotLabel: (name: string, rarity: string | null, action: string) =>
    `${name}${rarity ? ` (${rarity})` : ""} · ${action}`,
  classes: {
    candidateRow: "flex items-center gap-x-2 border-b px-2 hover:bg-muted lg:gap-x-3",
    candidateSelected: "bg-muted/60",
    candidateLabel:
      "grid min-w-0 flex-1 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 py-1.5 lg:grid-cols-[auto_minmax(0,1fr)_4rem_7rem_5rem] lg:gap-x-3",
    candidateDisabled: "cursor-not-allowed opacity-40",
    candidateInspect: "flex w-6 shrink-0",
  },
} as const;
