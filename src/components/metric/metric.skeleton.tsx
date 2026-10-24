import { Skeleton } from "~/components/skeleton/skeleton.component";
import type { MetricSkeletonProps } from "./metric.types";

/** Metric's card with its (static) label shown and a placeholder where the value goes. */
export function MetricSkeleton({ label }: MetricSkeletonProps) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Skeleton className="mt-1 h-[22px] w-28" />
    </div>
  );
}
