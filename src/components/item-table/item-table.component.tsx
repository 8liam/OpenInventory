import { useMemo } from "react";
import { AccountName } from "~/components/account-name/account-name.component";
import { DataTable } from "~/components/data-table/data-table.component";
import type { DataTableColumn } from "~/components/data-table/data-table.types";
import { HighlightDisclosure } from "~/components/highlight-disclosure/highlight-disclosure.component";
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
  const layout = wide ? "wide" : "narrow";
  const sizes = ITEM_TABLE.columns;
  const columns = useMemo<readonly DataTableColumn<ItemView>[]>(() => {
    const item: DataTableColumn<ItemView> = {
      id: "item",
      header: COPY.itemColumns.item,
      ...sizes.item[layout],
      sortValue: (r) => r.name,
      // Narrow rows have no Account column, so the owner moves under the name.
      cell: (r) =>
        wide ? (
          <ItemCell item={r} />
        ) : (
          <ItemCell item={r} account={accountNames?.get(r.accountId)} compact />
        ),
    };
    const price: DataTableColumn<ItemView> = {
      id: "price",
      header: COPY.itemColumns.price,
      ...sizes.price[layout],
      align: "right",
      sortValue: (r) => r.price ?? -1,
      cell: (r) => (r.price === null ? COPY.common.empty : formatMoney(r.price, currency)),
    };
    // Orders rows T1 first, then other highlights, then by price; the cell's tier (or marker)
    // opens every reason. Narrow rows show that button under the name instead of a column.
    const highlights: DataTableColumn<ItemView> = {
      id: "highlights",
      header: COPY.items.highlights,
      ...sizes.highlights,
      align: "right",
      sortValue: highlightSortValue,
      cell: (r) => <HighlightDisclosure item={r} />,
    };
    if (!wide) return [item, price];
    const location: DataTableColumn<ItemView>[] = showLocation
      ? [
          {
            id: "location",
            header: COPY.itemColumns.location,
            ...sizes.location,
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
            ...sizes.account,
            sortValue: (r) => accountNames.get(r.accountId)?.name ?? "",
            cell: (r) => {
              const name = accountNames.get(r.accountId);
              return name && <AccountName name={name} className="text-muted-foreground" />;
            },
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
        ...sizes.type,
        sortValue: (r) => r.category,
        cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
      },
      {
        id: "float",
        header: COPY.itemColumns.float,
        ...sizes.float,
        align: "right",
        sortValue: (r) => r.wear ?? -1,
        cell: (r) => (r.wear === null ? COPY.common.empty : formatFloat(r.wear)),
      },
      highlights,
      price,
    ];
  }, [currency, showLocation, wide, layout, sizes, accountNames]);

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
      rowHeight={
        wide
          ? ITEM_TABLE.rowHeight.wide
          : accountNames
            ? ITEM_TABLE.rowHeight.narrowWithAccount
            : ITEM_TABLE.rowHeight.narrow
      }
      initialSort={{ columnId: "price", direction: "desc" }}
      selection={selection}
    />
  );
}
