export const HIGHLIGHTS = {
  floatTailFraction: 0.03,
  floatLabelPrefix: "Float",
  craftLabel: "Sticker craft",
  seedMarker: "#",
  /** Sort ranks for highlights-first order; tiered items rank by their tier number, which is far below these. */
  rank: { untiered: 1_000, none: 1_001 },
  /** Stickers and charms that make a craft notable, matched by name; no value is attached. */
  craftAttachmentNames: [
    "Crown (Foil)",
    "Titan (Holo) | Katowice 2014",
    "Reason Gaming (Holo) | Katowice 2014",
    "iBUYPOWER (Holo) | Katowice 2014",
    "Howling Dawn",
    "Dragon Lore",
  ],
} as const;
