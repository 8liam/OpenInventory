export const HIGHLIGHTS = {
  floatTailFraction: 0.03,
  floatLabelPrefix: "Float",
  craftLabel: "Sticker craft",
  seedMarker: "#",
  /** Sort ranks for highlights-first order (tiered items rank by their tier number, far below these); `priceSpan` exceeds any item price so price only breaks ties. */
  rank: { untiered: 1_000, none: 1_001, priceSpan: 1_000_000_000 },
} as const;
