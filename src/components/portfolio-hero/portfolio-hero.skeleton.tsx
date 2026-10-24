import { Skeleton } from "~/components/skeleton/skeleton.component";
import { HISTORY_PANEL } from "~/components/history-panel/history-panel.config";
import { VALUE_CHART } from "~/components/value-chart/value-chart.config";

/** Same box as PortfolioHero: heading + number, stat strip, filter pills and the chart. */
export function PortfolioHeroSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:p-6">
        <div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-1 h-10 w-48 md:h-12 md:w-56" />
          <div className="mt-3 min-h-5" />
        </div>
        <div className="flex gap-6 md:gap-8">
          {[0, 1, 2].map((stat) => (
            <div key={stat} className="min-w-0">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-1 h-6 w-20" />
              {stat === 1 && <Skeleton className="h-4 w-14" />}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <div className="px-4 pb-3 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {HISTORY_PANEL.series.map((s) => (
                <Skeleton key={s.key} className="h-[26px] w-20 rounded-lg" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HISTORY_PANEL.ranges.map((r) => (
                <Skeleton key={r.key} className="h-[26px] w-11 rounded-lg" />
              ))}
            </div>
          </div>
          <Skeleton className="w-full rounded-md" style={{ height: VALUE_CHART.height }} />
        </div>
      </div>
    </section>
  );
}
