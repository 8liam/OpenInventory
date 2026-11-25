import type { Slice } from "~/lib/items/dashboard.types";
import { DASHBOARD } from "~/lib/storage/storage.config";
import { categoricalColor, dataColor, wearColor } from "~/lib/theme/chart-palette";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";
import type { BreakdownScheme } from "./breakdown-panel.types";

/** The colour a slice gets under `scheme`, from its place in the list and its own data. */
function sliceColor(slice: Slice, index: number, scheme: BreakdownScheme): string {
  if (slice.color !== undefined) return dataColor(slice.color);
  if (scheme === "wear") {
    const step = DASHBOARD.wearOrder.findIndex((wear) => wear === slice.label);
    return step === -1 ? BREAKDOWN_PANEL.otherColor : wearColor(step);
  }
  return categoricalColor(index);
}

/**
 * Keeps the biggest slices, folds the tail into "Other", and guarantees every slice a colour. A
 * slice the data already calls "Other" (an unknown rarity) joins the fold, so there is only one.
 */
export function colorSlices(
  slices: readonly Slice[],
  otherLabel: string,
  scheme: BreakdownScheme = BREAKDOWN_PANEL.defaultScheme,
): (Slice & { color: string })[] {
  const { rowLimit, otherColor } = BREAKDOWN_PANEL;
  const named = slices.filter((slice) => slice.label !== otherLabel);
  const head = named.slice(0, rowLimit);
  const tail = [...named.slice(rowLimit), ...slices.filter((slice) => slice.label === otherLabel)];
  const coloured = head.map((slice, index) => ({
    ...slice,
    color: sliceColor(slice, index, scheme),
  }));
  if (tail.length === 0) return coloured;
  return [
    ...coloured,
    {
      label: otherLabel,
      value: tail.reduce((sum, s) => sum + s.value, 0),
      count: tail.reduce((sum, s) => sum + s.count, 0),
      color: otherColor,
    },
  ];
}
