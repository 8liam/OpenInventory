import { createFileRoute } from "@tanstack/react-router";
import { Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { HoldingsTable } from "~/components/holdings-table/holdings-table.component";
import { BreakdownPanel } from "~/components/breakdown-panel/breakdown-panel.component";
import { DashboardSkeleton } from "~/components/dashboard-skeleton/dashboard-skeleton.component";
import { Insights } from "~/components/insights/insights.component";
import { SellSuggestions } from "~/components/sell-suggestions/sell-suggestions.component";
import { SELL_SUGGESTIONS_CARD } from "~/components/sell-suggestions/sell-suggestions.config";
import { UpdatedHeader } from "~/components/updated-header/updated-header.component";
import { Panel } from "~/components/panel/panel.component";
import { PortfolioHero } from "~/components/portfolio-hero/portfolio-hero.component";
import { COPY } from "~/lib/copy/copy.config";
import type { Dashboard } from "~/lib/items/dashboard.types";
import type { SellSuggestionsResponse } from "~/lib/items/sell-suggestions.types";
import { callStorageApi, useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery, useSettings } from "~/lib/settings/settings.store";

export const Route = createFileRoute("/")({ component: DashboardPage });

function DashboardPage() {
  const snapshot = useStorageSnapshot();
  const currency = useSettings((s) => s.currency);
  const marketplace = useSettings((s) => s.marketplace);
  const priceQuery = usePriceQuery();
  const data = useRemoteData<Dashboard>(
    `${STORAGE_API.dashboard}?${priceQuery}`,
    snapshot.revision,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const report = useRemoteData<{
    period: "weekly" | "monthly";
    currency: string;
    currentValue: number;
    valueChange: number | null;
    topMovers: readonly { name: string; value: number; count: number }[];
  }>(showReport ? `${STORAGE_API.report}?${priceQuery}` : undefined, snapshot.revision);
  const copy = COPY.dashboard;

  async function refresh() {
    setRefreshing(true);
    try {
      await callStorageApi(`${STORAGE_API.refresh}?${priceQuery}`);
    } finally {
      setRefreshing(false);
    }
  }

  const suggestionsData = useRemoteData<SellSuggestionsResponse>(
    `${STORAGE_API.suggestions}?${priceQuery}`,
    snapshot.revision,
  );
  const dashboard = data.status === "ready" ? data.data : undefined;
  const suggestions = suggestionsData.status === "ready" ? suggestionsData.data : undefined;
  const source = COPY.settings.marketplaces[marketplace];
  return (
    <>
      <UpdatedHeader title={copy.title} priceUpdatedAt={dashboard?.priceUpdatedAt} source={source}>
        {snapshot.loadingUnits && (
          <span className="text-xs text-muted-foreground">{copy.unitsLoading}…</span>
        )}
        <Button small disabled={refreshing || snapshot.loadingUnits} onClick={() => void refresh()}>
          <RefreshCw size={12} className={refreshing ? "motion-safe:animate-spin" : undefined} />
          {refreshing ? COPY.common.refreshing : COPY.common.refresh}
        </Button>
        <a
          className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs hover:bg-muted"
          href={`${STORAGE_API.report}?${priceQuery}`}
          download
        >
          <Download size={12} /> Summary report
        </a>
        <Button small onClick={() => setShowReport((visible) => !visible)}>
          {showReport ? "Hide report" : "View report"}
        </Button>
      </UpdatedHeader>

      {data.status === "loading" && <DashboardSkeleton />}
      {data.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {data.message}
        </p>
      )}

      {showReport && report.status === "ready" && (
        <Panel title={`${report.data.period === "weekly" ? "Weekly" : "Monthly"} summary report`}>
          <p className="text-sm">
            Current value: {formatReportMoney(report.data.currentValue, report.data.currency)}
          </p>
          <p className="text-sm">
            Value change:{" "}
            {report.data.valueChange === null
              ? "Not enough history yet"
              : formatReportMoney(report.data.valueChange, report.data.currency)}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {report.data.topMovers.map((mover) => (
              <li key={mover.name} className="flex justify-between gap-3">
                <span>
                  {mover.name} ×{mover.count}
                </span>
                <span>{formatReportMoney(mover.value, report.data.currency)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {showReport && report.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {report.message}
        </p>
      )}

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
          {suggestions && (
            <Panel title={SELL_SUGGESTIONS_CARD.title}>
              <SellSuggestions suggestions={suggestions} />
            </Panel>
          )}
        </div>
      )}
    </>
  );
}

function formatReportMoney(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}
