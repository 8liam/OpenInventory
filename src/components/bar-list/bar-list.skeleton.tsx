import { Skeleton } from "~/components/skeleton/skeleton.component";
import { BAR_LIST } from "./bar-list.config";
import type { BarListSkeletonProps } from "./bar-list.types";

/** BarList's rows: a label/value line and the thin share bar under it. */
export function BarListSkeleton({ rows }: BarListSkeletonProps) {
  return (
    <ul className={BAR_LIST.classes.list}>
      {Array.from({ length: rows }, (_, row) => (
        <li key={row} className={BAR_LIST.classes.item}>
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-lh w-24" />
            <Skeleton className="h-lh w-28" />
          </div>
          <Skeleton className="h-1.5" />
        </li>
      ))}
    </ul>
  );
}
