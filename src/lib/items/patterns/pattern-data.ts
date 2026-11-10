import { PATTERN_FILES } from "../../../../data/index.generated.ts";
import { describeIssues } from "./pattern-file.utils.ts";
import { patternFileSchema, type PatternFile } from "./pattern-file.schema.ts";
import type { PatternTable, PhaseTable } from "./pattern-tiers.types.ts";

/** Every community data file, validated. A bad file fails here with the file named in the error. */
export function loadPatternFiles(raw: readonly unknown[] = PATTERN_FILES): readonly PatternFile[] {
  return raw.map((file, index) => {
    const parsed = patternFileSchema.safeParse(file);
    if (parsed.success) return parsed.data;
    const name =
      typeof file === "object" && file !== null && "weapon" in file && "finish" in file
        ? `${String(file.weapon)} | ${String(file.finish)}`
        : `file #${index}`;
    throw new Error(`Invalid pattern data for ${name}: ${describeIssues(parsed.error)}`);
  });
}

export function toPatternTables(files: readonly PatternFile[]): readonly PatternTable[] {
  return files.flatMap((file) =>
    file.groups === undefined
      ? []
      : [
          {
            weapon: file.weapon,
            finish: file.finish,
            groups: file.groups.map((group) => ({
              label: group.label,
              ...(group.paintIndexes ? { paintIndexes: group.paintIndexes } : {}),
              tiers: group.tiers.map((tier) => ({
                ...(tier.label ? { label: tier.label } : {}),
                seeds: tier.seeds,
              })),
            })),
          },
        ],
  );
}

export function toPhaseTables(files: readonly PatternFile[]): readonly PhaseTable[] {
  return files.flatMap((file) =>
    file.phases === undefined
      ? []
      : [
          {
            weapon: file.weapon,
            finish: file.finish,
            tierCount: file.phases.tierCount,
            phases: file.phases.entries,
          },
        ],
  );
}
