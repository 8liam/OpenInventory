import { z } from "zod";
import { PATTERN_FILE } from "./pattern-file.config.ts";

const seed = z.number().int().min(0).max(PATTERN_FILE.maxSeed);

const tier = z.object({
  /** Overrides the group's label for seeds in this tier (e.g. "Sapphire"). */
  label: z.string().min(1).optional(),
  seeds: z.array(seed),
});

const group = z
  .object({
    label: z.string().min(1),
    /** Where this group's tiers came from. */
    source: z.string().min(1).optional(),
    /** When set, the group only applies to these paint kits (Doppler and Gamma Doppler phases). */
    paintIndexes: z.array(z.number().int().min(0)).optional(),
    /** `tiers[0]` is T1, the most valuable. */
    tiers: z.array(tier).min(1),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<number>();
    for (const [tierIndex, { seeds }] of value.tiers.entries()) {
      for (const s of seeds) {
        if (seen.has(s))
          ctx.addIssue({
            code: "custom",
            message: `seed ${s} is listed more than once in "${value.label}" (second time in tier ${tierIndex + 1})`,
          });
        seen.add(s);
      }
    }
  });

const phases = z
  .object({
    tierCount: z.number().int().min(1),
    entries: z.array(
      z.object({
        paintIndex: z.number().int().min(0),
        label: z.string().min(1),
        tier: z.number().int().min(1),
      }),
    ),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<number>();
    for (const entry of value.entries) {
      if (entry.tier > value.tierCount)
        ctx.addIssue({
          code: "custom",
          message: `phase "${entry.label}" has tier ${entry.tier}, above tierCount ${value.tierCount}`,
        });
      if (seen.has(entry.paintIndex))
        ctx.addIssue({ code: "custom", message: `paintIndex ${entry.paintIndex} is listed twice` });
      seen.add(entry.paintIndex);
    }
  });

/**
 * One weapon + finish. The file lives at `data/patterns/<weapon>/<finish>.json` (lowercase, dashes)
 * and holds seed tiers (`groups`), Doppler-style phases (`phases`), or both.
 */
export const patternFileSchema = z
  .object({
    $schema: z.string().optional(),
    /** As in the catalog name "★ Karambit | Fade": the weapon is "Karambit". */
    weapon: z.string().min(1),
    /** The finish is "Fade". */
    finish: z.string().min(1),
    /** When the sources were last checked, `YYYY-MM-DD`. */
    retrieved: z.string().regex(PATTERN_FILE.retrievedPattern),
    sources: z.array(z.string().min(1)).min(1),
    /** Human notes on how the tiers were chosen. */
    notes: z.array(z.string().min(1)).default([]),
    phases: phases.optional(),
    groups: z.array(group).optional(),
  })
  .refine((value) => value.phases !== undefined || (value.groups?.length ?? 0) > 0, {
    message: "a pattern file needs `groups`, `phases`, or both",
  });

export type PatternFile = z.infer<typeof patternFileSchema>;
