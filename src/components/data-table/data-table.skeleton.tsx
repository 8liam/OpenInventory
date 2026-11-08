import { Skeleton } from "~/components/skeleton/skeleton.component";
import { cn } from "~/utils/cn";
import { useMediaQuery } from "~/utils/use-media-query";
import { DATA_TABLE } from "./data-table.config";
import { useFittedColumns } from "./data-table.hooks";
import type { DataTableSkeletonProps } from "./data-table.types";

/** DataTable's frame: real headers and grid, placeholder rows, clipped to the available height. */
export function DataTableSkeleton({
  columns: allColumns,
  rowHeight = DATA_TABLE.rowHeight,
  rows,
  selectable = false,
}: DataTableSkeletonProps) {
  const touch = useMediaQuery(DATA_TABLE.touchQuery);
  const {
    ref: frameRef,
    columns,
    gridTemplate,
  } = useFittedColumns(
    allColumns,
    selectable,
    touch ? DATA_TABLE.touchSelectionColumnWidth : DATA_TABLE.selectionColumnWidth,
  );
  const gridStyle = { gridTemplateColumns: gridTemplate, columnGap: DATA_TABLE.columnGap };
  return (
    <div
      ref={frameRef}
      className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card"
    >
      <div className="grid shrink-0 border-b px-4 text-xs text-muted-foreground" style={gridStyle}>
        {selectable && (
          <div className="flex h-9 items-center">
            <Skeleton className="size-4 rounded-sm" />
          </div>
        )}
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn("flex h-9 items-center", column.align === "right" && "justify-end")}
          >
            {column.header}
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-hidden" role="rowgroup">
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="grid items-center border-b px-4"
            style={{ height: rowHeight, ...gridStyle }}
          >
            {selectable && <Skeleton className="size-4 rounded-sm" />}
            {columns.map((column) => (
              <div
                key={column.id}
                className={cn("min-w-0", column.align === "right" && "flex justify-end")}
              >
                {column.cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="shrink-0 border-t px-4 py-1.5">
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
