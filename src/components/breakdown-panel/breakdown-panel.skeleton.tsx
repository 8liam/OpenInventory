import { BarListSkeleton } from "~/components/bar-list/bar-list.skeleton";
import { DonutChartSkeleton } from "~/components/donut-chart/donut-chart.skeleton";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";
import type { BreakdownPanelSkeletonProps } from "./breakdown-panel.types";

/** The real title and tabs (they need no data), with a ring and rows where the numbers go. */
export function BreakdownPanelSkeleton({ className }: BreakdownPanelSkeletonProps) {
  return (
    <section className={cn(BREAKDOWN_PANEL.classes.section, className)}>
      <header className={BREAKDOWN_PANEL.classes.header}>
        <h2 className={BREAKDOWN_PANEL.classes.title}>{COPY.dashboard.breakdownTitle}</h2>
        <div className={BREAKDOWN_PANEL.classes.tablist}>
          {BREAKDOWN_PANEL.tabs.map((tab) => (
            <span
              key={tab.key}
              className={cn(
                BREAKDOWN_PANEL.classes.tab,
                tab.key === BREAKDOWN_PANEL.defaultTab && BREAKDOWN_PANEL.classes.tabActive,
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
