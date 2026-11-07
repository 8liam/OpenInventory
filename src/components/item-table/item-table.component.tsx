import { useMemo } from "react";
import { DataTable } from "~/components/data-table/data-table.component";
import type { DataTableColumn } from "~/components/data-table/data-table.types";
import { ItemTierBadge } from "~/components/item-highlights/item-highlights.component";
import { ItemCell } from "~/components/item-cell/item-cell.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import { highlightSortValue } from "~/lib/items/highlights";
import type { ItemView } from "~/lib/items/item.types";
import { formatFloat, formatMoney } from "~/utils/format";
import { useMediaQuery } from "~/utils/use-media-query";
import { ITEM_TABLE } from "./item-table.config";
import type { ItemTableProps } from "./item-table.types";

export function ItemTable({
  items,
  currency,
  showLocation = true,
  accountNames,
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
    // Orders rows T1 first, then by price; the cell shows only the tier badge.
    const highlights: DataTableColumn<ItemView> = {
      id: "highlights",
      header: COPY.items.highlights,
      width: wide ? ITEM_TABLE.widths.highlights : ITEM_TABLE.widths.highlightsNarrow,
      align: "right",
      sortValue: highlightSortValue,
      cell: (r) => <ItemTierBadge item={r} />,
    };
    if (!wide) return [item, highlights, price];
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
    const account: DataTableColumn<ItemView>[] = accountNames
      ? [
          {
            id: "account",
            header: COPY.accounts.column,
            width: ITEM_TABLE.widths.account,
            sortValue: (r) => accountNames.get(r.accountId) ?? "",
            cell: (r) => (
              <span className="text-muted-foreground">{accountNames.get(r.accountId)}</span>
            ),
          },
        ]
      : [];
    return [
      item,
      ...account,
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
      highlights,
      price,
    ];
  }, [currency, showLocation, wide, accountNames]);

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
      selection={selection}
    />
  );
}
