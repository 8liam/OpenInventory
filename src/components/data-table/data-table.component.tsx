import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { formatCount } from "~/utils/plural";
import { cn } from "~/utils/cn";
import { useMediaQuery } from "~/utils/use-media-query";
import { DATA_TABLE } from "./data-table.config";
import { useFittedColumns } from "./data-table.hooks";
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
  columns: allColumns,
  getRowKey,
  onRowClick,
  initialSort,
  rowHeight = DATA_TABLE.rowHeight,
  selection,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<SortState>(initialSort);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const touch = useMediaQuery(DATA_TABLE.touchQuery);
  // Optional columns hide when the table is too narrow for every column's minimum width.
  const {
    ref: frameRef,
    columns,
    gridTemplate,
  } = useFittedColumns(
    allColumns,
    selection !== undefined,
    touch ? DATA_TABLE.touchSelectionColumnWidth : DATA_TABLE.selectionColumnWidth,
  );
  const gridStyle = { gridTemplateColumns: gridTemplate, columnGap: DATA_TABLE.columnGap };
  const selected = selection?.selected;
  const selectedCount = useMemo(
    () => (selected ? rows.reduce((n, row) => n + (selected.has(getRowKey(row)) ? 1 : 0), 0) : 0),
    [rows, getRowKey, selected],
  );
  const allSelected = rows.length > 0 && selectedCount === rows.length;

  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected;
  }, [selectedCount, allSelected]);

  const order = useMemo(() => {
    const indices = Array.from(rows.keys());
    const column = allColumns.find((c) => c.id === sort?.columnId);
    const sortValue = column?.sortValue;
    if (!sort || !sortValue) return indices;
    const keys = rows.map(sortValue);
    const sign = sort.direction === "asc" ? 1 : -1;
    return indices.sort((a, b) => sign * compare(keys[a] ?? 0, keys[b] ?? 0));
  }, [rows, allColumns, sort]);

  const virtualizer = useVirtualizer({
    count: order.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: DATA_TABLE.overscan,
  });
  const virtualRows = virtualizer.getVirtualItems();

  // Roving focus: one row is in the tab order. Rows are windowed, so when the active one has
  // scrolled out of the DOM the first mounted row takes over and Tab still lands in the table.
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = order.length - 1;
  const clampedActive = Math.min(activeIndex, Math.max(lastIndex, 0));
  const activeMounted = virtualRows.some((virtualRow) => virtualRow.index === clampedActive);
  const tabbableIndex = activeMounted ? clampedActive : (virtualRows[0]?.index ?? 0);
  const focusPending = useRef(false);

  useEffect(() => {
    if (!focusPending.current) return;
    const target = scrollRef.current?.querySelector<HTMLElement>(
      `[data-row-index="${clampedActive}"]`,
    );
    if (!target) return;
    focusPending.current = false;
    target.focus();
  });

  function moveFocus(index: number) {
    const next = Math.max(0, Math.min(lastIndex, index));
    focusPending.current = true;
    setActiveIndex(next);
    virtualizer.scrollToIndex(next);
  }

  function onRowKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number, row: Row) {
    // Keys from controls inside the row (the checkbox) keep their own behaviour.
    if (event.target !== event.currentTarget) return;
    const { keys } = DATA_TABLE;
    const pageSize = Math.max(1, Math.floor((scrollRef.current?.clientHeight ?? 0) / rowHeight));
    if (event.key === keys.next) moveFocus(index + 1);
    else if (event.key === keys.previous) moveFocus(index - 1);
    else if (event.key === keys.pageDown) moveFocus(index + pageSize);
    else if (event.key === keys.pageUp) moveFocus(index - pageSize);
    else if (event.key === keys.first) moveFocus(0);
    else if (event.key === keys.last) moveFocus(lastIndex);
    else if (keys.activate.includes(event.key)) activateRow(row);
    else return;
    event.preventDefault();
  }

  function activateRow(row: Row) {
    if (selection) selection.onToggle(getRowKey(row));
    else onRowClick?.(row);
  }

  function toggleSort(column: DataTableColumn<Row>) {
    if (!column.sortValue) return;
    setSort((current) =>
      current?.columnId === column.id
        ? { columnId: column.id, direction: current.direction === "asc" ? "desc" : "asc" }
        : { columnId: column.id, direction: "desc" },
    );
  }

  return (
    <div
      ref={frameRef}
      role="grid"
      aria-rowcount={order.length + 1}
      aria-multiselectable={selection ? true : undefined}
      className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card"
    >
      <div
        role="row"
        aria-rowindex={1}
        className="grid shrink-0 border-b px-4 text-xs text-muted-foreground"
        style={gridStyle}
      >
        {selection && (
          <div role="columnheader" className="flex">
            <label className={touch ? DATA_TABLE.touchCheckboxClass : DATA_TABLE.checkboxClass}>
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={(e) => selection.onToggleAll(e.target.checked)}
                aria-label={DATA_TABLE.selectAllLabel}
                className="size-4 accent-primary"
              />
            </label>
          </div>
        )}
        {columns.map((column) => {
          const active = sort?.columnId === column.id;
          return (
            <div
              key={column.id}
              role="columnheader"
              aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}
              className="flex min-w-0"
            >
              <button
                type="button"
                disabled={!column.sortValue}
                onClick={() => toggleSort(column)}
                className={cn(
                  "flex h-9 w-full items-center gap-1 enabled:hover:text-foreground",
                  column.align === "right" && "justify-end",
                )}
              >
                {column.header}
                {active &&
                  (sort.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
              </button>
            </div>
          );
        })}
      </div>
      {/* A rowgroup may only hold rows, so the empty message sits in a plain container. */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto"
        role={order.length === 0 ? undefined : "rowgroup"}
      >
        {order.length === 0 ? (
          <div className="p-6 text-muted-foreground">{DATA_TABLE.emptyLabel}</div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualRows.map((virtualRow) => {
              const row = rows[order[virtualRow.index] ?? 0];
              if (row === undefined) return null;
              const key = getRowKey(row);
              const checked = selection?.selected.has(key) ?? false;
              const clickable = Boolean(onRowClick ?? selection);
              return (
                <div
                  key={key}
                  role="row"
                  aria-rowindex={virtualRow.index + 2}
                  aria-selected={selection ? checked : undefined}
                  data-row-index={virtualRow.index}
                  tabIndex={virtualRow.index === tabbableIndex ? 0 : -1}
                  onFocus={() => setActiveIndex(virtualRow.index)}
                  onKeyDown={(event) => onRowKeyDown(event, virtualRow.index, row)}
                  onClick={
                    selection
                      ? () => selection.onToggle(key)
                      : onRowClick
                        ? () => onRowClick(row)
                        : undefined
                  }
                  className={cn(
                    "absolute inset-x-0 grid items-center border-b px-4 focus-visible:outline-offset-[-2px]",
                    clickable && "cursor-pointer hover:bg-muted",
                    checked && "bg-muted",
                  )}
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    ...gridStyle,
                  }}
                >
                  {selection && (
                    <div role="gridcell" className="flex items-center">
                      <label
                        className={touch ? DATA_TABLE.touchCheckboxClass : DATA_TABLE.checkboxClass}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => selection.onToggle(key)}
                          onClick={(e) => e.stopPropagation()}
                          tabIndex={-1}
                          aria-label={DATA_TABLE.selectRowLabel}
                          className="size-4 accent-primary"
                        />
                      </label>
                    </div>
                  )}
                  {columns.map((column) => (
                    <div
                      key={column.id}
                      role="gridcell"
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
        {formatCount(rows.length, DATA_TABLE.rowCount)}
      </div>
    </div>
  );
}
