import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Select } from "~/components/select/select.component";
import { formatCount } from "~/utils/plural";
import { cn } from "~/utils/cn";
import { DATA_TABLE } from "./data-table.config";
import { useFittedColumns } from "./data-table.hooks";
import type { DataTableColumn, DataTableProps, SortState } from "./data-table.types";
import { compareSortValues } from "./data-table.utils";

/**
 * Sorting works on an index permutation and rows are windowed, so a 12k-row
 * table only ever mounts ~30 DOM rows and never copies the row objects.
 */
export function DataTable<Row>({
  rows,
  columns: allColumns,
  compact,
  getRowKey,
  onRowClick,
  initialSort,
  rowHeight: fullRowHeight = DATA_TABLE.rowHeight,
  selection,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<SortState | undefined>(initialSort);
  const selectAllRef = useRef<HTMLInputElement>(null);
  // Optional columns hide, then the compact set takes over, as the table's own width shrinks.
  const {
    ref: scrollRef,
    touch,
    compact: isCompact,
    columns,
    gridTemplate,
    gutter,
  } = useFittedColumns(allColumns, compact?.columns, selection !== undefined);
  const sortMenu = isCompact ? compact : undefined;
  const rowHeight = sortMenu ? sortMenu.rowHeight : fullRowHeight;
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

  // Sort keys come from every column of both layouts, so a sort outlives the column it came from.
  const sortValues = useMemo(() => {
    const values = new Map<string, NonNullable<DataTableColumn<Row>["sortValue"]>>();
    for (const column of [...allColumns, ...(compact?.columns ?? [])])
      if (column.sortValue && !values.has(column.id)) values.set(column.id, column.sortValue);
    return values;
  }, [allColumns, compact]);
  // The compact menu replaces the first column's header; every other header sorts by click.
  const headerColumns = sortMenu ? columns.slice(1) : columns;
  const shows = (state: SortState) =>
    sortValues.has(state.columnId) &&
    (headerColumns.some((column) => column.id === state.columnId && column.sortValue) ||
      (sortMenu?.sortOptions.some(
        (option) => option.columnId === state.columnId && option.direction === state.direction,
      ) ??
        false));
  // A sort this layout can't show (its column hid) gives way to the default until it can.
  const activeSort = sort && shows(sort) ? sort : initialSort;

  const order = useMemo(() => {
    const indices = Array.from(rows.keys());
    const sortValue = activeSort && sortValues.get(activeSort.columnId);
    if (!activeSort || !sortValue) return indices;
    const keys = rows.map(sortValue);
    const sign = activeSort.direction === "asc" ? 1 : -1;
    return indices.sort((a, b) => compareSortValues(keys[a] ?? null, keys[b] ?? null, sign));
  }, [rows, sortValues, activeSort]);

  const virtualizer = useVirtualizer({
    count: order.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: DATA_TABLE.overscan,
  });
  // Sizes are cached per index, so a layout switch must drop them or rows keep the old height.
  useLayoutEffect(() => {
    virtualizer.measure();
  }, [virtualizer, rowHeight]);
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
    setSort(
      activeSort?.columnId === column.id
        ? { columnId: column.id, direction: activeSort.direction === "asc" ? "desc" : "asc" }
        : { columnId: column.id, direction: "desc" },
    );
  }

  const menuValue = sortMenu?.sortOptions.find(
    (option) =>
      option.columnId === activeSort?.columnId && option.direction === activeSort.direction,
  )?.id;

  return (
    <div
      role="grid"
      aria-rowcount={order.length + 1}
      aria-multiselectable={selection ? true : undefined}
      className={DATA_TABLE.frameClass}
    >
      <div
        role="row"
        aria-rowindex={1}
        className={DATA_TABLE.headerClass}
        // Rows sit inside the scroll area, so the header steps in by the scrollbar to line up.
        style={{
          ...gridStyle,
          paddingLeft: DATA_TABLE.edgePadding,
          paddingRight: DATA_TABLE.edgePadding + gutter,
        }}
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
        {columns.map((column, index) => {
          if (sortMenu && index === 0)
            return (
              <div
                key={column.id}
                role="columnheader"
                aria-label={column.header}
                className="flex min-w-0 items-center"
              >
                <Select
                  value={menuValue ?? ""}
                  ariaLabel={sortMenu.sortLabel}
                  className={DATA_TABLE.sortSelectClass}
                  options={sortMenu.sortOptions}
                  onChange={(id) => {
                    const option = sortMenu.sortOptions.find((candidate) => candidate.id === id);
                    if (option) setSort({ columnId: option.columnId, direction: option.direction });
                  }}
                />
              </div>
            );
          const active = activeSort?.columnId === column.id;
          return (
            <div
              key={column.id}
              role="columnheader"
              aria-sort={
                active ? (activeSort.direction === "asc" ? "ascending" : "descending") : "none"
              }
              className="flex min-w-0"
            >
              {column.sortValue ? (
                <button
                  type="button"
                  onClick={() => toggleSort(column)}
                  className={cn(
                    "flex h-9 w-full items-center gap-1 hover:text-foreground",
                    column.align === "right" && "justify-end",
                  )}
                >
                  {column.header}
                  {active &&
                    (activeSort.direction === "asc" ? (
                      <ArrowUp size={DATA_TABLE.sortIconSize} />
                    ) : (
                      <ArrowDown size={DATA_TABLE.sortIconSize} />
                    ))}
                </button>
              ) : (
                <span
                  className={cn(
                    "flex h-9 w-full items-center",
                    column.align === "right" && "justify-end",
                  )}
                >
                  {column.header}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {/* A rowgroup may only hold rows, so the empty message sits in a plain container. */}
      <div
        ref={scrollRef}
        className={DATA_TABLE.scrollClass}
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
