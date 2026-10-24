import type { Slice } from "~/lib/items/dashboard.types";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";

/** Keeps the biggest slices, folds the tail into "Other", and guarantees every slice a colour. */
export function colorSlices(
  slices: readonly Slice[],
  otherLabel: string,
): (Slice & { color: string })[] {
  const { rowLimit, palette, otherColor } = BREAKDOWN_PANEL;
  const head = slices.slice(0, rowLimit);
  const tail = slices.slice(rowLimit);
  const merged: Slice[] =
    tail.length === 0
      ? head
      : [
          ...head,
          {
            label: otherLabel,
            value: tail.reduce((sum, s) => sum + s.value, 0),
            count: tail.reduce((sum, s) => sum + s.count, 0),
            color: otherColor,
          },
        ];
  return merged.map((slice, index) => ({
    ...slice,
    color: slice.color ?? palette[index % palette.length] ?? otherColor,
  }));
}
