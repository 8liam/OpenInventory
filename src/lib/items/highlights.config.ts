/** Curated seeds are intentionally kept here so pattern guides can be updated without changing the scorer. */
export const HIGHLIGHTS = {
  floatTailFraction: 0.03,
  floatScore: 30,
  patternScore: 45,
  attachmentScore: 10,
  notableScore: 10,
  /** Score at which an item earns the single tier marker. */
  exceptionalScore: 45,
  floatLabelPrefix: "Float",
  craftLabel: "Sticker craft",
  /** These are notable AK-47 | Case Hardened Blue Gem seeds from community pattern guides. */
  patterns: [
    {
      finish: "AK-47 | Case Hardened",
      seeds: [661, 151, 179, 321, 387, 670, 955],
      label: "Blue gem",
    },
    { finish: "AK-47 | Case Hardened", seeds: [4, 13, 168, 429, 592, 905], label: "Blue gem" },
    { finish: "M4A1-S | Fade", seeds: [374], label: "100% Fade" },
    { finish: "Butterfly Knife | Fade", seeds: [763], label: "100% Fade" },
    { finish: "Karambit | Fade", seeds: [412], label: "100% Fade" },
    { finish: "Butterfly Knife | Crimson Web", seeds: [921], label: "Crimson Web" },
  ],
  /** Gem phases score as patterns (phases 1–4 are common and score nothing), by paint kit id (Doppler and Gamma Doppler knives); names are matched as a fallback. */
  gemPhases: [
    { paintIndex: 415, label: "Ruby", finish: "Doppler" },
    { paintIndex: 416, label: "Sapphire", finish: "Doppler" },
    { paintIndex: 417, label: "Black Pearl", finish: "Doppler" },
    { paintIndex: 568, label: "Emerald", finish: "Gamma Doppler" },
  ],
  /** Reference USD values for attachment craft estimates; estimates are not market quotes. */
  attachmentEstimatesUsd: [
    { name: "Crown (Foil)", value: 80 },
    { name: "Titan (Holo) | Katowice 2014", value: 1200 },
    { name: "Reason Gaming (Holo) | Katowice 2014", value: 1000 },
    { name: "iBUYPOWER (Holo) | Katowice 2014", value: 1500 },
    { name: "Howling Dawn", value: 120 },
    { name: "Dragon Lore", value: 60 },
  ],
  attachmentPremiumFactor: 0.1,
} as const;
