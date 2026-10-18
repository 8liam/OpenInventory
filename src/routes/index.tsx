import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { BarList } from "~/components/bar-list/bar-list.component";
import { Button } from "~/components/button/button.component";
import { ChangeLine } from "~/components/change-line/change-line.component";
import { HoldingsTable } from "~/components/holdings-table/holdings-table.component";
import { Insights } from "~/components/insights/insights.component";
import { Metric } from "~/components/metric/metric.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { StackedBar } from "~/components/stacked-bar/stacked-bar.component";
import { ValueChart } from "~/components/value-chart/value-chart.component";
import { COPY } from "~/lib/copy/copy.config";
import type { Dashboard } from "~/lib/items/dashboard.types";
import { callStorageApi, useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { useSettings } from "~/lib/settings/settings.store";
import { formatInteger, formatMoney } from "~/utils/format";

export const Route = createFileRoute("/")({ component: DashboardPage });

const MIN_HISTORY_POINTS = 3; // two persisted snapshots plus the live value

function DashboardPage() {
  const snapshot = useStorageSnapshot();
  const currency = useSettings((s) => s.currency);
  const data = useRemoteData<Dashboard>(
    `${STORAGE_API.dashboard}?currency=${currency}`,
    snapshot.revision,
  );
  const [refreshing, setRefreshing] = useState(false);
  const copy = COPY.dashboard;

  async function refresh() {
    setRefreshing(true);
    try {
      await callStorageApi(`${STORAGE_API.refresh}?currency=${currency}`);
    } finally {
      setRefreshing(false);
    }
  }

  const dashboard = data.status === "ready" ? data.data : undefined;
  return (
    <>
      <PageHeader
        title={copy.title}
        description={
          dashboard?.priceUpdatedAt
            ? `${copy.updated} ${new Date(dashboard.priceUpdatedAt).toLocaleTimeString()} · ${COPY.common.priceNote}`
            : COPY.common.priceNote
        }
      >
        {snapshot.loadingUnits && (
          <span className="text-xs text-muted-foreground">{copy.unitsLoading}…</span>
        )}
        <Button small disabled={refreshing || snapshot.loadingUnits} onClick={() => void refresh()}>
          <RefreshCw size={12} className={refreshing ? "animate-spin" : undefined} />
          {refreshing ? COPY.common.refreshing : COPY.common.refresh}
        </Button>
      </PageHeader>

      {data.status === "loading" && <p className="text-muted-foreground">{COPY.common.loading}</p>}
      {data.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {data.message}
        </p>
      )}

      {dashboard && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
          {dashboard.totals.unitsLoaded < dashboard.totals.unitsTotal && (
            <p className="text-xs text-warning">{copy.unitsPartial}</p>
          )}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              label={copy.totalValue}
              value={formatMoney(dashboard.totals.value, currency)}
              detail={<ChangeLine change={dashboard.change} currency={currency} />}
              tone="neutral"
            />
            <Metric
              label={copy.inventory}
              value={formatMoney(dashboard.totals.inventoryValue, currency)}
            />
            <Metric
              label={copy.storage}
              value={formatMoney(dashboard.totals.storageValue, currency)}
              detail={`${dashboard.totals.unitsLoaded}/${dashboard.totals.unitsTotal} units`}
            />
            <Metric label={copy.items} value={formatInteger(dashboard.totals.itemCount)} />
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Panel title={copy.historyTitle} className="lg:col-span-2">
              {dashboard.history.length >= MIN_HISTORY_POINTS ? (
                <ValueChart points={dashboard.history} currency={currency} />
              ) : (
                <p className="py-10 text-center text-muted-foreground">{copy.historyEmpty}</p>
              )}
            </Panel>
            <Panel title={copy.locationTitle}>
              <BarList slices={dashboard.byLocation} currency={currency} limit={6} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Panel title={copy.categoryTitle}>
              <BarList slices={dashboard.byCategory} currency={currency} limit={7} />
            </Panel>
            <Panel title={copy.rarityTitle}>
              <StackedBar slices={dashboard.byRarity} currency={currency} />
            </Panel>
            <Panel title={copy.wearTitle}>
              <BarList slices={dashboard.byWear} currency={currency} />
            </Panel>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <Panel title={copy.holdingsTitle} className="lg:col-span-2">
              <HoldingsTable holdings={dashboard.topHoldings} currency={currency} />
            </Panel>
            <Panel title={copy.insightsTitle}>
              <Insights insights={dashboard.insights} currency={currency} />
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
