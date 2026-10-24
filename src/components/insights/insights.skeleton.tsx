import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { DASHBOARD } from "~/lib/storage/storage.config";
import { INSIGHTS } from "./insights.config";

const TITLES = [COPY.insights.lowestFloats, COPY.insights.highestFloats, COPY.insights.stacks];

/** Insights' three lists: real headings, placeholder rows. */
export function InsightsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {TITLES.map((title) => (
        <div key={title}>
          <h3 className="mb-2 text-xs text-muted-foreground">{title}</h3>
          <ul className="flex flex-col gap-2">
            {Array.from({ length: DASHBOARD.highlightCount }, (_, row) => (
              <li key={row} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Skeleton
                    className="shrink-0 rounded-md"
                    style={{ width: INSIGHTS.thumbSize, height: INSIGHTS.thumbSize }}
                  />
                  <div className="min-w-0">
                    <Skeleton className="mb-0.5 h-[11px] w-14" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <Skeleton className="h-4 w-10" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
