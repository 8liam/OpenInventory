import { createFileRoute } from "@tanstack/react-router";
import { LoadError } from "~/components/load-error/load-error.component";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { HoldingsTable } from "~/components/holdings-table/holdings-table.component";
import { BreakdownPanel } from "~/components/breakdown-panel/breakdown-panel.component";
import { DashboardSkeleton } from "~/components/dashboard-skeleton/dashboard-skeleton.component";
import { Insights } from "~/components/insights/insights.component";
import { UpdatedHeader } from "~/components/updated-header/updated-header.component";
import { Panel } from "~/components/panel/panel.component";
import { PortfolioHero } from "~/components/portfolio-hero/portfolio-hero.component";
import { COPY } from "~/lib/copy/copy.config";
import { DASHBOARD_PAGE } from "~/lib/items/dashboard-page.config";
import type { Dashboard } from "~/lib/items/dashboard.types";
import { useScopedPath } from "~/lib/accounts/account-scope.hooks";
import { useRefreshAccounts } from "~/lib/accounts/refresh-accounts.hooks";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery, useSettings } from "~/lib/settings/settings.store";

export const Route = createFileRoute("/")({ component: DashboardPage });

function DashboardPage() {
  const snapshot = useStorageSnapshot();
  const currency = useSettings((s) => s.currency);
  const marketplace = useSettings((s) => s.marketplace);
  const priceQuery = usePriceQuery();
  const data = useRemoteData<Dashboard>(
    useScopedPath(`${STORAGE_API.dashboard}?${priceQuery}`),
    snapshot.revision,
  );
  const refresh = useRefreshAccounts();
  const copy = COPY.dashboard;

  const dashboard = data.status === "ready" ? data.data : undefined;
  const source = COPY.settings.marketplaces[marketplace];
  return (
    <>
      <UpdatedHeader title={copy.title} priceUpdatedAt={dashboard?.priceUpdatedAt} source={source}>
        {snapshot.loadingUnits && (
          <span className="text-xs text-muted-foreground">{copy.unitsLoading}…</span>
        )}
        <Button
          small
          aria-label={COPY.refresh.ariaFor(refresh.scopeLabel)}
          title={COPY.refresh.ariaFor(refresh.scopeLabel)}
          disabled={refresh.busy || snapshot.loadingUnits || !refresh.canRefresh}
          onClick={() => void refresh.refresh()}
        >
          <RefreshCw
            size={DASHBOARD_PAGE.refreshIconSize}
            className={refresh.busy ? "motion-safe:animate-spin" : undefined}
            aria-hidden
          />
          {refresh.busy ? COPY.common.refreshing : COPY.common.refresh}
        </Button>
      </UpdatedHeader>
      {refresh.error && (
        <p role="alert" className="text-xs text-destructive">
          {refresh.error}
        </p>
      )}

      {data.status === "loading" && <DashboardSkeleton />}
      {data.status === "error" && <LoadError message={data.message} onRetry={data.retry} />}

      {dashboard && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [&>*]:shrink-0">
          {dashboard.totals.unitsLoaded < dashboard.totals.unitsTotal && (
            <p className="text-xs text-warning">{copy.unitsPartial}</p>
          )}
          <PortfolioHero dashboard={dashboard} currency={currency} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <Panel title={copy.holdingsTitle} className="lg:col-span-3">
              <HoldingsTable holdings={dashboard.topHoldings} currency={currency} />
            </Panel>
            <BreakdownPanel
              dashboard={dashboard}
              currency={currency}
              className="self-start lg:col-span-2"
            />
          </div>

          <Panel title={copy.insightsTitle}>
            <Insights insights={dashboard.insights} currency={currency} />
          </Panel>
        </div>
      )}
    </>
  );
}
