import { BarListSkeleton } from "~/components/bar-list/bar-list.skeleton";
import { DonutChartSkeleton } from "~/components/donut-chart/donut-chart.skeleton";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";
import type { BreakdownPanelSkeletonProps } from "./breakdown-panel.types";

/** The real title and tabs (they need no data), with a ring and rows where the numbers go. */
export function BreakdownPanelSkeleton({ className }: BreakdownPanelSkeletonProps) {
  return (
    <section className={cn("rounded-xl border bg-card p-4", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-medium">{COPY.dashboard.breakdownTitle}</h2>
        <div className="flex rounded-md bg-muted p-0.5">
          {BREAKDOWN_PANEL.tabs.map((tab) => (
            <span
              key={tab.key}
              className={cn(
                "rounded px-2 py-1 text-xs text-muted-foreground",
                tab.key === BREAKDOWN_PANEL.defaultTab &&
                  "bg-card font-medium text-foreground shadow-sm",
              )}
            >
              {tab.label}
            </span>
          ))}
        </div>
      </header>
      <DonutChartSkeleton />
      <div className="mt-5">
        {/* The tail folds into one "Other" row, hence one more than the row limit. */}
        <BarListSkeleton rows={BREAKDOWN_PANEL.rowLimit + 1} />
      </div>
    </section>
  );
}
