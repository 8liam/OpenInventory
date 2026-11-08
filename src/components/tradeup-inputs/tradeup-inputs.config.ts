export const TRADEUP_INPUTS = {
  slotSize: 44,
  listMaxHeightClass: "max-h-80",
  /** A filled slot's name for the pointer and for assistive tech; the rarity is spelled out, not just tinted. */
  slotLabel: (name: string, rarity: string | null, action: string) =>
    `${name}${rarity ? ` (${rarity})` : ""} · ${action}`,
} as const;
