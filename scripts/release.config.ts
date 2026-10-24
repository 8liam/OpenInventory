export const TAG_PREFIX = "v";
/** Version used for the first ever release, when no tag exists yet. */
export const INITIAL_VERSION = "0.1.0";

export const BUMP = {
  major: "major",
  minor: "minor",
  patch: "patch",
} as const;

/** Conventional-commit types that bump the minor version; anything else is a patch. */
export const MINOR_TYPES: readonly string[] = ["feat"];
