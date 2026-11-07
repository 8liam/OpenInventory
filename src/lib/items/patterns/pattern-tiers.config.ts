import { CASE_HARDENED_TABLES } from "./data/case-hardened.config.ts";
import { PHASE_TABLES } from "./data/doppler-phases.config.ts";
import { FADE_TABLES } from "./data/fade.config.ts";
import { GUIDE_PATTERN_TABLES } from "./data/guide-patterns.config.ts";
import { MARBLE_FADE_TABLES } from "./data/marble-fade.config.ts";
import { RARE_PATTERN_TABLES } from "./data/rare-patterns.config.ts";
import { WEB_TABLES } from "./data/web.config.ts";
import type { PatternTable, PhaseTable } from "./pattern-tiers.types.ts";

/** Add a finish by adding its data file under `data/` and listing it here. */
const PATTERN_TABLES: readonly PatternTable[] = [
  ...CASE_HARDENED_TABLES,
  ...FADE_TABLES,
  ...MARBLE_FADE_TABLES,
  ...WEB_TABLES,
  ...RARE_PATTERN_TABLES,
  ...GUIDE_PATTERN_TABLES,
];

export const PATTERN_TIERS = {
  /** Catalog names read "★ Karambit | Fade"; the prefixes are not part of the weapon. */
  nameSeparator: " | ",
  namePrefixes: ["★ ", "StatTrak™ ", "Souvenir "],
  tables: PATTERN_TABLES,
  phaseTables: PHASE_TABLES satisfies readonly PhaseTable[],
} as const;
