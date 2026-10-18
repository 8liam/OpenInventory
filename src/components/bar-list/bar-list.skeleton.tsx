import { Skeleton } from "~/components/skeleton/skeleton.component";
import type { BarListSkeletonProps } from "./bar-list.types";

/** BarList's rows: a label/value line and the thin share bar under it. */
export function BarListSkeleton({ rows }: BarListSkeletonProps) {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: rows }, (_, row) => (
        <li key={row}>
          <div className="flex items-baseline justify-between gap-3">
            <Skeleton className="h-lh w-24" />
            <Skeleton className="h-lh w-28" />
          </div>
          <Skeleton className="mt-1.5 h-1.5 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
