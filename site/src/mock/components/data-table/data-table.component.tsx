import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatInteger } from "~/utils/format";
import { cn } from "~/utils/cn";
import { DATA_TABLE } from "./data-table.config";
import type { DataTableColumn, DataTableProps, SortDirection } from "./data-table.types";

type SortState = { readonly columnId: string; readonly direction: SortDirection } | undefined;

function compare(a: string | number, b: string | number): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

/**
 * Sorting works on an index permutation and rows are windowed, so a 12k-row
 * table only ever mounts ~30 DOM rows and never copies the row objects.
 */
export function DataTable<Row>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  initialSort,
  rowHeight = DATA_TABLE.rowHeight,
  scrollable = true,
  selection,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<SortState>(initialSort);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const gridTemplate = [
    selection ? DATA_TABLE.selectionColumnWidth : undefined,
    ...columns.map((c) => c.width),
  ]
    .filter(Boolean)
    .join(" ");
  const selectedCount = selection
    ? rows.reduce((n, row) => n + (selection.selected.has(getRowKey(row)) ? 1 : 0), 0)
    : 0;
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected;
  }, [selectedCount, allSelected]);

  const order = useMemo(() => {
    const indices = Array.from(rows.keys());
    const column = columns.find((c) => c.id === sort?.columnId);
    const sortValue = column?.sortValue;
    if (!sort || !sortValue) return indices;
    const keys = rows.map(sortValue);
    const sign = sort.direction === "asc" ? 1 : -1;
    return indices.sort((a, b) => sign * compare(keys[a] ?? 0, keys[b] ?? 0));
  }, [rows, columns, sort]);

  const virtualizer = useVirtualizer({
    count: order.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: scrollable ? DATA_TABLE.overscan : DATA_TABLE.staticOverscan,
    initialRect: { width: 800, height: 480 },
  });

  function toggleSort(column: DataTableColumn<Row>) {
    if (!column.sortValue) return;
    setSort((current) =>
      current?.columnId === column.id
        ? { columnId: column.id, direction: current.direction === "asc" ? "desc" : "asc" }
        : { columnId: column.id, direction: "desc" },
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
      <div
        className="grid shrink-0 border-b px-4 text-xs text-muted-foreground"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {selection && (
          <label className="flex h-9 items-center">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={(e) => selection.onToggleAll(e.target.checked)}
              aria-label={DATA_TABLE.selectAllLabel}
              className="size-4 accent-primary"
            />
          </label>
        )}
        {columns.map((column) => {
          const active = sort?.columnId === column.id;
          return (
            <button
              key={column.id}
              type="button"
              disabled={!column.sortValue}
              onClick={() => toggleSort(column)}
              title={column.sortValue ? `Sort by ${column.header}` : undefined}
              className={cn(
                "flex h-9 items-center gap-1 rounded-md px-1.5 outline-none enabled:hover:bg-foreground/10 enabled:hover:text-foreground",
                column.align === "right" && "justify-end",
              )}
            >
              {column.header}
              {active &&
                (sort.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
            </button>
          );
        })}
      </div>
      <div
        ref={scrollRef}
        data-lenis-prevent={scrollable ? "" : undefined}
        className={cn("min-h-0 flex-1", scrollable ? "overflow-auto" : "overflow-hidden")}
      >
        {order.length === 0 ? (
          <p className="p-6 text-muted-foreground">{DATA_TABLE.emptyLabel}</p>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[order[virtualRow.index] ?? 0];
              if (row === undefined) return null;
              const key = getRowKey(row);
              const checked = selection?.selected.has(key) ?? false;
              const clickable = Boolean(onRowClick ?? selection);
              return (
                <div
                  key={key}
                  onClick={
                    selection
                      ? () => selection.onToggle(key)
                      : onRowClick
                        ? () => onRowClick(row)
                        : undefined
                  }
                  className={cn(
                    "absolute inset-x-0 grid items-center border-b px-4",
                    clickable && "cursor-pointer hover:bg-accent",
                    checked && "bg-accent",
                  )}
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: gridTemplate,
                  }}
                >
                  {selection && (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => selection.onToggle(key)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={DATA_TABLE.selectRowLabel}
                      className="size-4 accent-primary"
                    />
                  )}
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      className={cn(
                        "truncate",
                        column.align === "right" && "text-right tabular-nums",
                      )}
                    >
                      {column.cell(row)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t px-4 py-1.5 text-xs text-muted-foreground">
        {formatInteger(rows.length)} {DATA_TABLE.rowCountSuffix}
      </div>
    </div>
  );
}
