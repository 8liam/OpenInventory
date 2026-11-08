import { DATA_TABLE } from "./data-table.config";
import type { FittableColumn } from "./data-table.types";

/** A column's grid track: its flexible width, floored at its minimum so its content never clips. */
export function columnTrack(column: FittableColumn): string {
  return column.minWidth === undefined
    ? column.width
    : `minmax(${column.minWidth}px, ${column.width})`;
}

function requiredWidth(columns: readonly FittableColumn[], reserved: number): number {
  const gaps = Math.max(0, columns.length - 1) * DATA_TABLE.columnGap;
  return columns.reduce((sum, column) => sum + (column.minWidth ?? 0), reserved + gaps);
}

/**
 * Drops optional columns (lowest `hidePriority` first) until the rest fit `available` px at
 * their minimum widths. Columns without a priority always stay. Unmeasured: every column.
 */
export function fitColumns<C extends FittableColumn>(
  columns: readonly C[],
  available: number | undefined,
  reserved: number,
): readonly C[] {
  if (available === undefined) return columns;
  const droppable = columns
    .filter((column) => column.hidePriority !== undefined)
    .sort((a, b) => (a.hidePriority ?? 0) - (b.hidePriority ?? 0));
  let kept = columns;
  for (const column of droppable) {
    if (requiredWidth(kept, reserved) <= available) break;
    kept = kept.filter((candidate) => candidate !== column);
  }
  return kept;
}
