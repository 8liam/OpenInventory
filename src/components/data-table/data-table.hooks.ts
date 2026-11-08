import { useMemo, useRef } from "react";
import { useElementWidth } from "~/utils/use-element-width";
import { DATA_TABLE } from "./data-table.config";
import type { FittableColumn } from "./data-table.types";
import { columnTrack, fitColumns } from "./data-table.utils";

/**
 * The columns that fit the table's measured width and their shared grid template. Attach `ref`
 * to the table's frame; the header, rows and skeleton all use the same template.
 */
export function useFittedColumns<C extends FittableColumn>(
  columns: readonly C[],
  selectable: boolean,
  selectionColumnWidth: number = DATA_TABLE.selectionColumnWidth,
) {
  const ref = useRef<HTMLDivElement>(null);
  const width = useElementWidth(ref);
  return useMemo(() => {
    const reserved = DATA_TABLE.horizontalPadding + (selectable ? selectionColumnWidth : 0);
    const fitted = fitColumns(columns, width, reserved);
    const gridTemplate = [
      selectable ? `${selectionColumnWidth}px` : undefined,
      ...fitted.map(columnTrack),
    ]
      .filter(Boolean)
      .join(" ");
    return { ref, columns: fitted, gridTemplate };
  }, [columns, width, selectable, selectionColumnWidth]);
}
