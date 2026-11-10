import { DataTableSkeleton } from "~/components/data-table/data-table.skeleton";
import type { DataTableSkeletonColumn } from "~/components/data-table/data-table.types";
import { ITEM_CELL } from "~/components/item-cell/item-cell.config";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { ITEM_TABLE } from "./item-table.config";
import type { ItemTableSkeletonProps } from "./item-table.types";

const textBar = (width: string) => <Skeleton className={`h-4 ${width}`} />;

/** ItemTable's frame (same columns at the same breakpoints) with placeholder rows. */
export function ItemTableSkeleton({
  showLocation = true,
  showAccount = false,
  selectable,
}: ItemTableSkeletonProps) {
  const sizes = ITEM_TABLE.columns;
  const item = {
    id: "item",
    header: COPY.itemColumns.item,
    cell: (
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton
          className="shrink-0 rounded-md"
          style={{ width: ITEM_CELL.imageSize, height: ITEM_CELL.imageSize }}
        />
        <div className="min-w-0">
          <Skeleton className="mb-0.5 h-[11px] w-16" />
          <Skeleton className="h-4 w-44 max-w-full" />
        </div>
      </div>
    ),
  } as const;
  const price = {
    id: "price",
    header: COPY.itemColumns.price,
    align: "right",
    cell: textBar("w-14"),
  } as const;
  const highlights: DataTableSkeletonColumn = {
    id: "highlights",
    header: COPY.items.highlights,
    ...sizes.highlights,
    align: "right",
    cell: null,
  };
  const columns: readonly DataTableSkeletonColumn[] = [
    { ...item, ...sizes.item.wide },
    ...(showAccount
      ? [
          {
            id: "account",
            header: COPY.accounts.column,
            ...sizes.account,
            cell: textBar("w-20"),
          },
        ]
      : []),
    ...(showLocation
      ? [
          {
            id: "location",
            header: COPY.itemColumns.location,
            ...sizes.location,
            cell: textBar("w-28"),
          },
        ]
      : []),
    { id: "type", header: COPY.itemColumns.type, ...sizes.type, cell: textBar("w-16") },
    { id: "note", header: COPY.itemColumns.note, ...sizes.note, cell: textBar("w-24") },
    {
      id: "float",
      header: COPY.itemColumns.float,
      ...sizes.float,
      align: "right",
      cell: textBar("w-14"),
    },
    highlights,
    { ...price, ...sizes.price.wide },
  ];
  const compact = {
    columns: [
      { ...item, ...sizes.item.narrow },
      { ...price, ...sizes.price.narrow },
    ],
    rowHeight: showAccount ? ITEM_TABLE.rowHeight.narrowWithAccount : ITEM_TABLE.rowHeight.narrow,
  };
  return (
    <DataTableSkeleton
      columns={columns}
      compact={compact}
      rowHeight={ITEM_TABLE.rowHeight.wide}
      rows={ITEM_TABLE.skeletonRows}
      selectable={selectable}
    />
  );
}
