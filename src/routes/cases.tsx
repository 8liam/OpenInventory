import { createFileRoute } from "@tanstack/react-router";
import { LoadError } from "~/components/load-error/load-error.component";
import { useEffect, useState } from "react";
import { BarList } from "~/components/bar-list/bar-list.component";
import { CasesSkeleton } from "~/components/cases-skeleton/cases-skeleton.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { CaseSummary } from "~/components/case-summary/case-summary.component";
import { CaseRarityInsights } from "~/components/case-rarity-insights/case-rarity-insights.component";
import { KindPills } from "~/components/kind-pills/kind-pills.component";
import { DonutChart } from "~/components/donut-chart/donut-chart.component";
import { MonthlyBars } from "~/components/monthly-bars/monthly-bars.component";
import { OpeningList } from "~/components/opening-list/opening-list.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { PulledList } from "~/components/pulled-list/pulled-list.component";
import { SyncBanner } from "~/components/sync-banner/sync-banner.component";
import { CASES_PAGE, DEFAULT_OPENING_KIND } from "~/lib/cases/cases.config";
import type { CasesResponse, OpeningKind } from "~/lib/cases/cases.types";
import { cn } from "~/utils/cn";
import { COPY } from "~/lib/copy/copy.config";
import {
  useScopedPath,
  useSingleAccountId,
  useSingleAccountLabel,
} from "~/lib/accounts/account-scope.hooks";
import { useRestoreFocusOnRecovery } from "~/lib/storage/recovered-focus.hooks";
import { postJson, usePageVisible, useRemoteData } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";

export const Route = createFileRoute("/cases")({ component: CasesPage });

function CasesPage() {
  const copy = COPY.cases;
  const [tick, setTick] = useState(0);
  const [kind, setKind] = useState<OpeningKind>(DEFAULT_OPENING_KIND);
  const [syncRequestPending, setSyncRequestPending] = useState(false);
  const [syncRequestError, setSyncRequestError] = useState<string | null>(null);
  const accountId = useSingleAccountId();
  const accountLabel = useSingleAccountLabel();
  const data = useRemoteData<CasesResponse>(
    useScopedPath(`${STORAGE_API.cases}?kind=${kind}`),
    tick,
  );
  useRestoreFocusOnRecovery(data.status);
  const running = data.status === "ready" && data.data.sync.state === "running";
  const visible = usePageVisible();

  // The server reads history in the background; poll for progress while it runs.
  useEffect(() => {
    if (!running || !visible) return;
    const timer = setInterval(() => setTick((t) => t + 1), CASES_PAGE.pollMs);
    return () => clearInterval(timer);
  }, [running, visible]);

  async function sync() {
    if (accountId === undefined) return;
    setSyncRequestPending(true);
    setSyncRequestError(null);
    try {
      await postJson(STORAGE_API.casesSync, { accountId });
      setTick((t) => t + 1);
    } catch (error) {
      setSyncRequestError(error instanceof Error ? error.message : copy.syncFailed);
    } finally {
      setSyncRequestPending(false);
    }
  }

  const response = data.status === "ready" ? data.data : undefined;
  // A refetch keeps the previous response on screen; never show another kind's numbers under this pill.
  const stats = response?.stats.kind === kind ? response.stats : undefined;
  const emptyText = kind === "case" ? copy.empty : copy.emptyOther;
  const raritySlices = (stats?.rarity ?? []).map((r) => ({
    label: r.label,
    value: r.count,
    count: r.count,
    color: `#${r.color}`,
  }));
  return (
    <>
      <PageHeader title={copy.title} description={copy.description} account={accountLabel} />
      {data.status === "loading" && <CasesSkeleton />}
      {data.status === "error" && <LoadError message={data.message} onRetry={data.retry} />}

      {response && (
        <div
          role="region"
          aria-label={copy.title}
          tabIndex={0}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [&>*]:shrink-0"
        >
          <SyncBanner
            sync={response.sync}
            onSync={() => void sync()}
            requestPending={syncRequestPending}
            requestError={syncRequestError}
          />
          <KindPills selected={kind} counts={response.stats.kindCounts} onSelect={setKind} />
          {!stats ? (
            <LoadingRegion className="contents">
              <CasesSkeleton onlyBody />
            </LoadingRegion>
          ) : stats.total === 0 ? (
            !running && <p className="text-muted-foreground">{emptyText}</p>
          ) : (
            <>
              <CaseSummary stats={stats} />
              {kind === "case" && <CaseRarityInsights stats={stats} />}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Panel title={copy.rarityTitle} className="lg:col-span-2">
                  <DonutChart
                    slices={raritySlices}
                    currency=""
                    totalLabel={copy.kinds[kind].headline}
                    formatValue={(n) => String(n)}
                  />
                  <div className="mt-5">
                    <BarList slices={raritySlices} currency="" showValue={false} />
                  </div>
                </Panel>
                <div className="flex flex-col gap-4 lg:col-span-3">
                  <Panel title={`${copy.kinds[kind].pill} per month`}>
                    <MonthlyBars months={stats.perMonth} />
                  </Panel>
                  <Panel title={copy.rarestTitle}>
                    <OpeningList openings={stats.rarest} emptyText={emptyText} />
                  </Panel>
                </div>
              </div>
              <div
                className={cn(
                  "grid grid-cols-1 gap-4",
                  stats.topCases.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2",
                )}
              >
                <Panel title={copy.topItemsTitle}>
                  <PulledList items={stats.topItems} />
                </Panel>
                {stats.topCases.length > 0 && (
                  <Panel title={copy.kinds[kind].sources}>
                    <PulledList items={stats.topCases} />
                  </Panel>
                )}
                <Panel title={copy.kinds[kind].recent}>
                  <OpeningList openings={stats.recent} emptyText={emptyText} />
                </Panel>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
