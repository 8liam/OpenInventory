import { useMemo } from "react";
import { AccountName } from "~/components/account-name/account-name.component";
import { DataTable } from "~/components/data-table/data-table.component";
import type { DataTableColumn, DataTableCompact } from "~/components/data-table/data-table.types";
import { HighlightDisclosure } from "~/components/highlight-disclosure/highlight-disclosure.component";
import { ItemCell } from "~/components/item-cell/item-cell.component";
import { ITEM_CELL } from "~/components/item-cell/item-cell.config";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import { highlightSortValue } from "~/lib/items/highlights";
import type { ItemView } from "~/lib/items/item.types";
import { formatFloat, formatMoney } from "~/utils/format";
import { ITEM_TABLE } from "./item-table.config";
import { joinDetail } from "./item-table.utils";
import type { ItemTableProps } from "./item-table.types";

/**
 * Items as a sortable, selectable table. The table picks its layout from its own width: every
 * column where there is room, or (in a side pane or on a phone) the compact item + price rows
 * with a sort menu for the columns that went away.
 */
export function ItemTable({
  items,
  currency,
  showLocation = true,
  accountNames,
  selected,
  onSelectionChange,
}: ItemTableProps) {
  const { columns, compact } = useMemo(() => {
    const sizes = ITEM_TABLE.columns;
    const name: Omit<DataTableColumn<ItemView>, "width" | "cell"> = {
      id: "item",
      header: COPY.itemColumns.item,
      sortValue: (r) => r.name,
    };
    const price: Omit<DataTableColumn<ItemView>, "width"> = {
      id: "price",
      header: COPY.itemColumns.price,
      align: "right",
      sortValue: (r) => r.price,
      cell: (r) => (r.price === null ? COPY.common.empty : formatMoney(r.price, currency)),
    };
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
            sortValue: (r) => accountNames.get(r.accountId) ?? null,
            cell: (r) => {
              const owner = accountNames.get(r.accountId);
              return owner && <AccountName name={owner} className="text-muted-foreground" />;
            },
          },
        ]
      : [];
    const full: readonly DataTableColumn<ItemView>[] = [
      {
        ...name,
        ...sizes.item.wide,
        cell: (r) => <ItemCell item={r} nameFit="single" currency={currency} />,
      },
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
        sortValue: (r) => r.wear,
        cell: (r) => (r.wear === null ? COPY.common.empty : formatFloat(r.wear)),
      },
      // Orders rows T1 first, then other highlights, then by price; the cell's tier (or marker)
      // opens every reason.
      {
        id: "highlights",
        header: COPY.items.highlights,
        ...sizes.highlights,
        align: "right",
        sortValue: highlightSortValue,
        cell: (r) => <HighlightDisclosure item={r} />,
      },
      { ...price, ...sizes.price.wide },
    ];
    // Compact rows carry where the item is and its float, the owner and the highlight button under the name.
    const narrow: DataTableCompact<ItemView> = {
      columns: [
        {
          ...name,
          ...sizes.item.narrow,
          cell: (r) => (
            <ItemCell
              item={r}
              currency={currency}
              detail={joinDetail(
                [
                  showLocation ? r.locationName : null,
                  r.wear === null ? null : formatFloat(r.wear),
                  r.pattern === null ? null : `${ITEM_CELL.patternLabel} #${r.pattern}`,
                ],
                ITEM_TABLE.detailSeparator,
              )}
              account={accountNames?.get(r.accountId)}
              compact
              nameFit="double"
            />
          ),
        },
        // The sort menu already says "Price"; the header stays for screen readers only.
        { ...price, ...sizes.price.narrow, sortValue: undefined, hideHeader: true },
      ],
      rowHeight: accountNames
        ? ITEM_TABLE.rowHeight.narrowWithAccount
        : ITEM_TABLE.rowHeight.narrow,
      sortOptions: ITEM_TABLE.sortOptions,
      sortLabel: ITEM_TABLE.sortLabel,
    };
    return { columns: full, compact: narrow };
  }, [currency, showLocation, accountNames]);

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
      compact={compact}
      getRowKey={itemRowKey}
      rowHeight={ITEM_TABLE.rowHeight.wide}
      initialSort={ITEM_TABLE.initialSort}
      selection={selection}
    />
  );
}
