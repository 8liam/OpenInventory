import { Skeleton } from "~/components/skeleton/skeleton.component";
import { cn } from "~/utils/cn";
import { DATA_TABLE } from "./data-table.config";
import type { DataTableSkeletonProps } from "./data-table.types";

/** DataTable's frame: real headers and grid, placeholder rows, clipped to the available height. */
export function DataTableSkeleton({
  columns,
  rowHeight = DATA_TABLE.rowHeight,
  rows,
  selectable,
}: DataTableSkeletonProps) {
  const gridTemplate = [
    selectable ? DATA_TABLE.selectionColumnWidth : undefined,
    ...columns.map((c) => c.width),
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
      <div
        className="grid shrink-0 border-b px-4 text-xs text-muted-foreground"
        style={{ gridTemplateColumns: gridTemplate }}
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
      <div className="min-h-0 flex-1 overflow-hidden" role="rowgroup">
        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="grid items-center border-b px-4"
            style={{ height: rowHeight, gridTemplateColumns: gridTemplate }}
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
