import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { DASHBOARD } from "~/lib/storage/storage.config";
import { HOLDINGS_TABLE } from "./holdings-table.config";

/** HoldingsTable's markup with the data cells swapped for placeholders. */
export function HoldingsTableSkeleton() {
  const columns = COPY.dashboard.holdingsColumns;
  return (
    <table className="w-full">
      <thead className="text-left text-xs text-muted-foreground">
        <tr>
          <th className="pb-2 font-normal">{columns.item}</th>
          <th className="pb-2 text-right font-normal">{columns.qty}</th>
          <th className="pb-2 text-right font-normal">{columns.unit}</th>
          <th className="pb-2 text-right font-normal">{columns.total}</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: DASHBOARD.topHoldingCount }, (_, row) => (
          <tr key={row} className="border-t">
            <td className="py-2">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton
                  className="shrink-0 rounded-md"
                  style={{ width: HOLDINGS_TABLE.thumbSize, height: HOLDINGS_TABLE.thumbSize }}
                />
                <div className="min-w-0">
                  <Skeleton className="mb-0.5 h-[11px] w-16" />
                  <Skeleton className="h-4 w-44" />
                </div>
              </div>
            </td>
            <td className="py-2">
              <Skeleton className="ml-auto h-4 w-3" />
            </td>
            <td className="py-2">
              <Skeleton className="ml-auto h-4 w-[62px]" />
            </td>
            <td className="py-2">
              <Skeleton className="ml-auto h-4 w-[62px]" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
