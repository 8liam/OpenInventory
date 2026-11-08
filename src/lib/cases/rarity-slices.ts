import type { RaritySlice } from "./cases.types.ts";
import type { RarityChartSlice } from "./rarity-slices.types.ts";

/**
 * Chart slices for the "What you pulled" panel. Openings with no recorded rarity get their own
 * slice, so the chart adds up to the same total as the summary above it.
 */
export function buildRaritySlices(
  rarity: readonly RaritySlice[],
  total: number,
  unknown: { readonly label: string; readonly color: string },
): RarityChartSlice[] {
  const slices = rarity.map((r) => ({
    label: r.label,
    value: r.count,
    count: r.count,
    color: `#${r.color}`,
  }));
  const unknownCount = total - rarity.reduce((sum, r) => sum + r.count, 0);
  if (unknownCount <= 0) return slices;
  return [
    ...slices,
    { label: unknown.label, value: unknownCount, count: unknownCount, color: `#${unknown.color}` },
  ];
}
