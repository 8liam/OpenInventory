import { HoldingsTableSkeleton } from "~/components/holdings-table/holdings-table.skeleton";
import { InsightsSkeleton } from "~/components/insights/insights.skeleton";
import { BreakdownPanelSkeleton } from "~/components/breakdown-panel/breakdown-panel.skeleton";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Panel } from "~/components/panel/panel.component";
import { PortfolioHeroSkeleton } from "~/components/portfolio-hero/portfolio-hero.skeleton";
import { COPY } from "~/lib/copy/copy.config";

/** The whole dashboard body, laid out exactly like the loaded page. */
export function DashboardSkeleton() {
  const copy = COPY.dashboard;
  return (
    <LoadingRegion className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [&>*]:shrink-0">
      <PortfolioHeroSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Panel title={copy.holdingsTitle} className="lg:col-span-3">
          <HoldingsTableSkeleton />
        </Panel>
        <BreakdownPanelSkeleton className="self-start lg:col-span-2" />
      </div>
      <Panel title={copy.insightsTitle}>
        <InsightsSkeleton />
      </Panel>
    </LoadingRegion>
  );
}
