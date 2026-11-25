import { Skeleton } from "~/components/skeleton/skeleton.component";
import { HISTORY_PANEL } from "~/components/history-panel/history-panel.config";
import { VALUE_CHART } from "~/components/value-chart/value-chart.config";
import { PORTFOLIO_HERO } from "./portfolio-hero.config";

const { classes } = PORTFOLIO_HERO;

/** Same box as PortfolioHero: kicker + figure, the stat list, filter pills and the chart. */
export function PortfolioHeroSkeleton() {
  return (
    <section className={classes.root}>
      <div className={classes.top}>
        <div className="min-w-0">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="mt-4 h-12 w-56 @md:h-16 @md:w-72 @3xl:h-20 @3xl:w-96" />
          <div className={classes.change} />
        </div>
        <div className={classes.stats}>
          {[0, 1, 2].map((stat) => (
            <div key={stat} className="contents">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
      <div className={classes.chart}>
        <div className="px-0 pb-3 pt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {HISTORY_PANEL.series.map((s) => (
                <Skeleton key={s.key} className="h-7 w-20 rounded-md" />
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {HISTORY_PANEL.ranges.map((r) => (
                <Skeleton key={r.key} className="h-7 w-11 rounded-md" />
              ))}
            </div>
          </div>
          <Skeleton className="w-full rounded-md" style={{ height: VALUE_CHART.height }} />
        </div>
      </div>
    </section>
  );
}
