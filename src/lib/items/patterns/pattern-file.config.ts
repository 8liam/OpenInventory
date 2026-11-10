/** Limits for the community-editable pattern data files under `data/patterns/`. */
export const PATTERN_FILE = {
  /** Paint seeds run 0-1000 in CS2 (a few finishes use 0). */
  maxSeed: 1000,
  /** `YYYY-MM-DD`, when the sources were last checked. */
  retrievedPattern: /^\d{4}-\d{2}-\d{2}$/,
  slugSeparator: "-",
  schemaPath: "../../schema/pattern-file.schema.json",
} as const;
