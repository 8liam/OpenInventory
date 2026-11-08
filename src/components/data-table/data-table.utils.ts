import { DATA_TABLE } from "./data-table.config.ts";
import type { FittableColumn, FittedColumns, SortValue } from "./data-table.types.ts";

/** A column's grid track: its flexible width, floored at its minimum so its content never clips. */
export function columnTrack(column: FittableColumn): string {
  return column.minWidth === undefined
    ? column.width
    : `minmax(${column.minWidth}px, ${column.width})`;
}

/**
 * Px the row needs to show `columns` at their minimums: the row's padding, the fixed leading
 * tracks (the checkbox column), every column's floor, and the gap between each pair of tracks.
 */
export function requiredWidth(
  columns: readonly FittableColumn[],
  leadingTracks: readonly number[],
): number {
  const tracks = leadingTracks.length + columns.length;
  const gaps = Math.max(0, tracks - 1) * DATA_TABLE.columnGap;
  const leading = leadingTracks.reduce((sum, width) => sum + width, 0);
  return columns.reduce(
    (sum, column) => sum + (column.minWidth ?? 0),
    DATA_TABLE.horizontalPadding + leading + gaps,
  );
}

/**
 * Drops optional columns (lowest `hidePriority` first) until the rest fit `available` px at
 * their minimum widths. Columns without a priority always stay. Unmeasured: every column.
 */
export function fitColumns<C extends FittableColumn>(
  columns: readonly C[],
  available: number | undefined,
  leadingTracks: readonly number[],
): readonly C[] {
  if (available === undefined) return columns;
  const droppable = columns
    .filter((column) => column.hidePriority !== undefined)
    .sort((a, b) => (a.hidePriority ?? 0) - (b.hidePriority ?? 0));
  let kept = columns;
  for (const column of droppable) {
    if (requiredWidth(kept, leadingTracks) <= available) break;
    kept = kept.filter((candidate) => candidate !== column);
  }
  return kept;
}

/**
 * The full column set, thinned to fit; or, when even its required columns don't fit, the
 * compact set. Decided from the table's own width, so a table in a side pane goes compact even
 * on a wide window.
 */
export function fitLayout<C extends FittableColumn>(
  columns: readonly C[],
  compactColumns: readonly C[] | undefined,
  available: number | undefined,
  leadingTracks: readonly number[],
): FittedColumns<C> {
  const required = columns.filter((column) => column.hidePriority === undefined);
  const compact =
    compactColumns !== undefined &&
    available !== undefined &&
    requiredWidth(required, leadingTracks) > available;
  return compact
    ? { compact, columns: fitColumns(compactColumns, available, leadingTracks) }
    : { compact, columns: fitColumns(columns, available, leadingTracks) };
}

/** Ascending order; values that are missing (`null`) always go last, whichever the direction. */
export function compareSortValues(a: SortValue, b: SortValue, sign: 1 | -1): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return sign * (a - b);
  return sign * String(a).localeCompare(String(b));
}
