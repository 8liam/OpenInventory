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
export function ItemTableSkeleton({ showLocation = true, selectable }: ItemTableSkeletonProps) {
  const wide = useMediaQuery(ITEM_TABLE.wideQuery);
  const { widths } = ITEM_TABLE;
  const item: DataTableSkeletonColumn = {
    id: "item",
    header: COPY.itemColumns.item,
    width: wide ? widths.item.wide : widths.item.narrow,
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
    width: wide ? widths.price.wide : widths.price.narrow,
    align: "right",
    cell: textBar("w-14"),
  };
  const columns: readonly DataTableSkeletonColumn[] = wide
    ? [
        item,
        ...(showLocation
          ? [
              {
                id: "location",
                header: COPY.itemColumns.location,
                width: widths.location,
                cell: textBar("w-28"),
              },
            ]
          : []),
        { id: "type", header: COPY.itemColumns.type, width: widths.type, cell: textBar("w-16") },
        {
          id: "float",
          header: COPY.itemColumns.float,
          width: widths.float,
          align: "right",
          cell: textBar("w-14"),
        },
        price,
      ]
    : [item, price];
  return (
    <DataTableSkeleton
      columns={columns}
      rowHeight={ITEM_TABLE.rowHeight}
      rows={ITEM_TABLE.skeletonRows}
      selectable={selectable}
    />
  );
}
