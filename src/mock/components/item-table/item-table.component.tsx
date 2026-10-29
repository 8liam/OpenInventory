import { useMemo } from "react";
import { DataTable } from "~/components/data-table/data-table.component";
import type { DataTableColumn } from "~/components/data-table/data-table.types";
import { ItemCell } from "~/components/item-cell/item-cell.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import type { ItemView } from "~/lib/items/item.types";
import { formatFloat, formatMoney } from "~/utils/format";
import { useMediaQuery } from "~/utils/use-media-query";
import { ITEM_TABLE } from "./item-table.config";
import type { ItemTableProps } from "./item-table.types";

export function ItemTable({
  items,
  currency,
  showLocation = true,
  scrollable,
  selected,
  onSelectionChange,
}: ItemTableProps) {
  const wide = useMediaQuery(ITEM_TABLE.wideQuery);
  const columns = useMemo<readonly DataTableColumn<ItemView>[]>(() => {
    const item: DataTableColumn<ItemView> = {
      id: "item",
      header: COPY.itemColumns.item,
      width: wide ? ITEM_TABLE.widths.item.wide : ITEM_TABLE.widths.item.narrow,
      sortValue: (r) => r.name,
      cell: (r) => <ItemCell item={r} />,
    };
    const price: DataTableColumn<ItemView> = {
      id: "price",
      header: COPY.itemColumns.price,
      width: wide ? ITEM_TABLE.widths.price.wide : ITEM_TABLE.widths.price.narrow,
      align: "right",
      sortValue: (r) => r.price ?? -1,
      cell: (r) => (r.price === null ? COPY.common.empty : formatMoney(r.price, currency)),
    };
    if (!wide) return [item, price];
    const location: DataTableColumn<ItemView>[] = showLocation
      ? [
          {
            id: "location",
            header: COPY.itemColumns.location,
            width: ITEM_TABLE.widths.location,
            sortValue: (r) => r.locationName,
            cell: (r) => <span className="text-muted-foreground">{r.locationName}</span>,
          },
        ]
      : [];
    return [
      item,
      ...location,
      {
        id: "type",
        header: COPY.itemColumns.type,
        width: ITEM_TABLE.widths.type,
        sortValue: (r) => r.category,
        cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
      },
      {
        id: "float",
        header: COPY.itemColumns.float,
        width: ITEM_TABLE.widths.float,
        align: "right",
        sortValue: (r) => r.wear ?? -1,
        cell: (r) => (r.wear === null ? COPY.common.empty : formatFloat(r.wear)),
      },
      price,
    ];
  }, [currency, showLocation, wide]);

  const selection = useMemo(
    () =>
      selected && onSelectionChange
        ? {
            selected,
            onToggle: (key: string | number) => {
              const next = new Set(selected);
              if (!next.delete(String(key))) next.add(String(key));
              onSelectionChange(next);
            },
            onToggleAll: (checked: boolean) =>
              onSelectionChange(checked ? new Set(items.map(itemRowKey)) : new Set()),
          }
        : undefined,
    [selected, onSelectionChange, items],
  );

  return (
    <DataTable
      rows={items}
      columns={columns}
      getRowKey={itemRowKey}
      rowHeight={ITEM_TABLE.rowHeight}
      initialSort={{ columnId: "price", direction: "desc" }}
      scrollable={scrollable}
      selection={selection}
    />
  );
}
