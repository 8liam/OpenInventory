import { DataTableSkeleton } from "~/components/data-table/data-table.skeleton";
import type { DataTableSkeletonColumn } from "~/components/data-table/data-table.types";
import { ITEM_CELL } from "~/components/item-cell/item-cell.config";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { useMediaQuery } from "~/utils/use-media-query";
import { ITEM_TABLE } from "./item-table.config";
import type { ItemTableSkeletonProps } from "./item-table.types";

const textBar = (width: string) => <Skeleton className={`h-4 ${width}`} />;

/** ItemTable's frame (same columns at the same breakpoints) with placeholder rows. */
export function ItemTableSkeleton({
  showLocation = true,
  showAccount = false,
  selectable,
}: ItemTableSkeletonProps) {
  const wide = useMediaQuery(ITEM_TABLE.wideQuery);
  const layout = wide ? "wide" : "narrow";
  const sizes = ITEM_TABLE.columns;
  const item: DataTableSkeletonColumn = {
    id: "item",
    header: COPY.itemColumns.item,
    ...sizes.item[layout],
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
  };
  const price: DataTableSkeletonColumn = {
    id: "price",
    header: COPY.itemColumns.price,
    ...sizes.price[layout],
    align: "right",
    cell: textBar("w-14"),
  };
  const highlights: DataTableSkeletonColumn = {
    id: "highlights",
    header: COPY.items.highlights,
    ...sizes.highlights[layout],
    align: "right",
    cell: null,
  };
  const columns: readonly DataTableSkeletonColumn[] = wide
    ? [
        item,
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
        {
          id: "float",
          header: COPY.itemColumns.float,
          ...sizes.float,
          align: "right",
          cell: textBar("w-14"),
        },
        highlights,
        price,
      ]
    : [item, highlights, price];
  return (
    <DataTableSkeleton
      columns={columns}
      rowHeight={wide ? ITEM_TABLE.rowHeight.wide : ITEM_TABLE.rowHeight.narrow}
      rows={ITEM_TABLE.skeletonRows}
      selectable={selectable}
    />
  );
}
