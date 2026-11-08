import { useMemo, useRef } from "react";
import { useMediaQuery } from "~/utils/use-media-query";
import { useScrollArea } from "~/utils/use-scroll-area";
import { DATA_TABLE } from "./data-table.config";
import type { FittableColumn } from "./data-table.types";
import { columnTrack, fitLayout } from "./data-table.utils";

/**
 * The columns that fit the table's own scroll area and their shared grid template. Attach `ref`
 * to the element the rows scroll in; the header, rows and skeleton all use the same template,
 * and the header pads its right edge by `gutter` so it lines up with rows beside a scrollbar.
 */
export function useFittedColumns<C extends FittableColumn>(
  columns: readonly C[],
  compactColumns: readonly C[] | undefined,
  selectable: boolean,
) {
  const ref = useRef<HTMLDivElement>(null);
  const area = useScrollArea(ref);
  const touch = useMediaQuery(DATA_TABLE.touchQuery);
  const selectionWidth = touch
    ? DATA_TABLE.touchSelectionColumnWidth
    : DATA_TABLE.selectionColumnWidth;
  return useMemo(() => {
    const leading = selectable ? [selectionWidth] : [];
    const fitted = fitLayout(columns, compactColumns, area?.width, leading);
    const gridTemplate = [
      ...leading.map((width) => `${width}px`),
      ...fitted.columns.map(columnTrack),
    ].join(" ");
    return {
      ref,
      touch,
      compact: fitted.compact,
      columns: fitted.columns,
      gridTemplate,
      gutter: area?.gutter ?? 0,
    };
  }, [columns, compactColumns, area, selectable, selectionWidth, touch]);
}
