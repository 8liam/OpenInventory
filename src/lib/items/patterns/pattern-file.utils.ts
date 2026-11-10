import type { ZodError } from "zod";
import { PATTERN_FILE } from "./pattern-file.config.ts";

/** "Case Hardened" becomes "case-hardened"; used for the data file's path. */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, PATTERN_FILE.slugSeparator)
    .replace(/^-+|-+$/g, "");
}

/** Where a weapon + finish file belongs, relative to `data/patterns/`. */
export function patternFilePath(weapon: string, finish: string): string {
  return `${slugify(weapon)}/${slugify(finish)}.json`;
}

/** A validation error as one readable line per problem, with the path to the bad value. */
export function describeIssues(error: ZodError): string {
  return error.issues
    .map((issue) =>
      issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
    )
    .join("; ");
}
