import { Skeleton } from "~/components/skeleton/skeleton.component";
import { cn } from "~/utils/cn";
import { DATA_TABLE } from "./data-table.config";
import { useFittedColumns } from "./data-table.hooks";
import type { DataTableSkeletonProps } from "./data-table.types";

/**
 * DataTable's frame: real headers and grid, placeholder rows, clipped to the available height.
 * It is decorative (hidden from assistive tech); the surrounding LoadingRegion announces loading.
 */
export function DataTableSkeleton({
  columns: allColumns,
  compact,
  rowHeight: fullRowHeight = DATA_TABLE.rowHeight,
  rows,
  selectable = false,
}: DataTableSkeletonProps) {
  const {
    ref: rowsRef,
    compact: isCompact,
    columns,
    gridTemplate,
    gutter,
  } = useFittedColumns(allColumns, compact?.columns, selectable);
  const rowHeight = isCompact && compact ? compact.rowHeight : fullRowHeight;
  const gridStyle = { gridTemplateColumns: gridTemplate, columnGap: DATA_TABLE.columnGap };
  return (
    <div aria-hidden className={DATA_TABLE.frameClass}>
      <div
        className={DATA_TABLE.headerClass}
        style={{
          ...gridStyle,
          paddingLeft: DATA_TABLE.edgePadding,
          paddingRight: DATA_TABLE.edgePadding + gutter,
        }}
      >
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
      <div ref={rowsRef} className={DATA_TABLE.skeletonScrollClass}>
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
