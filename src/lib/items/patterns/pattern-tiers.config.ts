import { loadPatternFiles, toPatternTables, toPhaseTables } from "./pattern-data.ts";

const PATTERN_FILES = loadPatternFiles();

export const PATTERN_TIERS = {
  /** Catalog names read "★ Karambit | Fade"; the prefixes are not part of the weapon. */
  nameSeparator: " | ",
  namePrefixes: ["★ ", "StatTrak™ ", "Souvenir "],
  /** Add a finish by adding `data/patterns/<weapon>/<finish>.json` and running `pnpm data:build`. */
  tables: toPatternTables(PATTERN_FILES),
  phaseTables: toPhaseTables(PATTERN_FILES),
} as const;
