import { useVirtualizer } from "@tanstack/react-virtual";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ItemGridCard } from "~/components/item-grid-card/item-grid-card.component";
import { Select } from "~/components/select/select.component";
import { itemRowKey } from "~/lib/items/item-key";
import { formatCount } from "~/utils/plural";
import { ITEM_GRID } from "./item-grid.config";
import type { ItemGridProps, ItemGridSortId } from "./item-grid.types";
import { columnsFor, sortItems } from "./item-grid.utils";

/** The item table's card view: same panel, header strip and footer, with a virtualised card grid. */
export function ItemGrid({
  items,
  currency,
  showLocation = true,
  accountNames,
  selected,
  onSelectionChange,
}: ItemGridProps) {
  const [sort, setSort] = useState<ItemGridSortId>(ITEM_GRID.defaultSort);
  const ordered = useMemo(() => sortItems(items, sort), [items, sort]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(0);
  const columns = columnsFor(width, ITEM_GRID.minCardWidth, ITEM_GRID.gap, ITEM_GRID.padding);
  const rowCount = Math.ceil(ordered.length / columns);
  const cardHeight = showLocation
    ? ITEM_GRID.cardHeight.withLocation
    : ITEM_GRID.cardHeight.withoutLocation;
  const selectable = selected !== undefined && onSelectionChange !== undefined;

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const measure = () => setWidth(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => cardHeight + ITEM_GRID.gap,
    overscan: ITEM_GRID.overscan,
    paddingStart: ITEM_GRID.padding,
    paddingEnd: ITEM_GRID.padding,
  });
  const virtualRows = virtualizer.getVirtualItems();

  const selectedCount = useMemo(
    () =>
      selected ? ordered.reduce((n, item) => n + (selected.has(itemRowKey(item)) ? 1 : 0), 0) : 0,
    [ordered, selected],
  );
  const allSelected = ordered.length > 0 && selectedCount === ordered.length;
  useEffect(() => {
    if (selectAllRef.current)
      selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected;
  }, [selectedCount, allSelected]);

  const toggle = useCallback(
    (key: string) => {
      if (!selected || !onSelectionChange) return;
      const next = new Set(selected);
      if (!next.delete(key)) next.add(key);
      onSelectionChange(next);
    },
    [selected, onSelectionChange],
  );

  // Roving focus over a windowed list: one card is tabbable; if it is scrolled out of the DOM the
  // first mounted card takes over so Tab still lands in the grid.
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = ordered.length - 1;
  const clampedActive = Math.min(activeIndex, Math.max(lastIndex, 0));
  const activeRow = Math.floor(clampedActive / columns);
  const activeMounted = virtualRows.some((row) => row.index === activeRow);
  const tabbableIndex = activeMounted ? clampedActive : (virtualRows[0]?.index ?? 0) * columns;
  const focusPending = useRef(false);

  useEffect(() => {
    if (!focusPending.current) return;
    const target = scrollRef.current?.querySelector<HTMLElement>(
      `[data-card-index="${clampedActive}"]`,
    );
    if (!target) return;
    focusPending.current = false;
    target.focus();
  });

  function moveFocus(index: number) {
    const next = Math.max(0, Math.min(lastIndex, index));
    focusPending.current = true;
    setActiveIndex(next);
    virtualizer.scrollToIndex(Math.floor(next / columns));
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLDivElement>, index: number, key: string) {
    // Keys from the checkbox inside the card keep their own behaviour.
    if (event.target !== event.currentTarget) return;
    const { keys } = ITEM_GRID;
    const pageRows = Math.max(
      1,
      Math.floor((scrollRef.current?.clientHeight ?? 0) / (cardHeight + ITEM_GRID.gap)),
    );
    if (event.key === keys.right) moveFocus(index + 1);
    else if (event.key === keys.left) moveFocus(index - 1);
    else if (event.key === keys.down) moveFocus(index + columns);
    else if (event.key === keys.up) moveFocus(index - columns);
    else if (event.key === keys.pageDown) moveFocus(index + pageRows * columns);
    else if (event.key === keys.pageUp) moveFocus(index - pageRows * columns);
    else if (event.key === keys.first) moveFocus(0);
    else if (event.key === keys.last) moveFocus(lastIndex);
    else if (keys.activate.includes(event.key) && selectable) toggle(key);
    else return;
    event.preventDefault();
  }

  return (
    <div
      role="grid"
      aria-rowcount={rowCount}
      aria-colcount={columns}
      aria-multiselectable={selectable ? true : undefined}
      className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card"
    >
      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b px-4 text-xs text-muted-foreground">
        {selectable ? (
          <label className="flex items-center gap-2">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={(event) =>
                onSelectionChange(
                  event.target.checked ? new Set(ordered.map(itemRowKey)) : new Set(),
                )
              }
              aria-label={ITEM_GRID.selectAllLabel}
              className="size-4 accent-primary"
            />
            {ITEM_GRID.selectAllText}
          </label>
        ) : (
          <span />
        )}
        <Select
          value={sort}
          ariaLabel={ITEM_GRID.sortLabel}
          className="w-48"
          options={ITEM_GRID.sorts}
          onChange={(id) => setSort(id as ItemGridSortId)}
        />
      </div>
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-auto"
        role={ordered.length === 0 ? undefined : "rowgroup"}
      >
        {ordered.length === 0 ? (
          <div className="p-6 text-muted-foreground">{ITEM_GRID.emptyLabel}</div>
        ) : (
          <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
            {virtualRows.map((virtualRow) => (
              <div
                key={virtualRow.key}
                role="row"
                aria-rowindex={virtualRow.index + 1}
                className="absolute inset-x-0 grid"
                style={{
                  height: cardHeight,
                  transform: `translateY(${virtualRow.start}px)`,
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: ITEM_GRID.gap,
                  padding: `0 ${ITEM_GRID.padding}px`,
                }}
              >
                {ordered
                  .slice(virtualRow.index * columns, virtualRow.index * columns + columns)
                  .map((item, offset) => {
                    const index = virtualRow.index * columns + offset;
                    const key = itemRowKey(item);
                    return (
                      <ItemGridCard
                        key={key}
                        item={item}
                        currency={currency}
                        showLocation={showLocation}
                        accountName={accountNames?.get(item.accountId)}
                        index={index}
                        selectable={selectable}
                        checked={selected?.has(key) ?? false}
                        checkboxVisible={selectedCount > 0}
                        tabIndex={index === tabbableIndex ? 0 : -1}
                        onToggle={() => toggle(key)}
                        onFocus={() => setActiveIndex(index)}
                        onKeyDown={(event) => onCardKeyDown(event, index, key)}
                      />
                    );
                  })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 border-t px-4 py-1.5 text-xs text-muted-foreground">
        {formatCount(ordered.length, ITEM_GRID.count)}
      </div>
    </div>
  );
}
