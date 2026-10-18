import { BarListSkeleton } from "~/components/bar-list/bar-list.skeleton";
import { DonutChartSkeleton } from "~/components/donut-chart/donut-chart.skeleton";
import { KindPills } from "~/components/kind-pills/kind-pills.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { MONTHLY_BARS } from "~/components/monthly-bars/monthly-bars.config";
import { OPENING_LIST } from "~/components/opening-list/opening-list.config";
import { Panel } from "~/components/panel/panel.component";
import { PULLED_LIST } from "~/components/pulled-list/pulled-list.config";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { CASES_SKELETON, DEFAULT_OPENING_KIND } from "~/lib/cases/cases.config";
import { COPY } from "~/lib/copy/copy.config";
import type { CasesSkeletonProps } from "./cases-skeleton.types";

function ItemRow({ thumb, side }: { readonly thumb: number; readonly side?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="shrink-0 rounded-md" style={{ width: thumb, height: thumb }} />
        <div className="min-w-0">
          <Skeleton className="mb-0.5 h-[11px] w-16" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      {side ? (
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-16" />
        </div>
      ) : (
        <Skeleton className="h-lh w-6 shrink-0" />
      )}
    </li>
  );
}

function SummarySkeleton() {
  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-col gap-6 p-5 md:flex-row md:items-end md:justify-between md:p-6">
        <div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-1 h-10 w-32 md:h-12" />
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((tile) => (
            <div key={tile}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-1 h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Everything under the pills: summary, rarity, monthly chart, rarest pulls and the lists. */
export function CasesBodySkeleton() {
  const copy = COPY.cases;
  const kind = copy.kinds[DEFAULT_OPENING_KIND];
  return (
    <>
      <SummarySkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Panel title={copy.rarityTitle} className="lg:col-span-2">
          <DonutChartSkeleton />
          <div className="mt-5">
            <BarListSkeleton rows={CASES_SKELETON.rarityRows} />
          </div>
        </Panel>
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Panel title={copy.monthlyTitle}>
            <Skeleton className="w-full rounded-md" style={{ height: MONTHLY_BARS.height }} />
            <Skeleton className="mt-1.5 h-lh w-full text-[11px]" />
          </Panel>
          <Panel title={copy.rarestTitle}>
            <ul className="flex flex-col gap-2.5">
              {Array.from({ length: CASES_SKELETON.rarestRows }, (_, row) => (
                <ItemRow key={row} thumb={OPENING_LIST.thumbSize} side />
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel title={copy.topItemsTitle}>
          <ul className="flex flex-col gap-2.5">
            {Array.from({ length: CASES_SKELETON.topRows }, (_, row) => (
              <ItemRow key={row} thumb={PULLED_LIST.thumbSize} />
            ))}
          </ul>
        </Panel>
        <Panel title={kind.sources}>
          <ul className="flex flex-col gap-2.5">
            {Array.from({ length: CASES_SKELETON.sourceRows }, (_, row) => (
              <ItemRow key={row} thumb={PULLED_LIST.thumbSize} />
            ))}
          </ul>
        </Panel>
        <Panel title={kind.recent}>
          <ul className="flex flex-col gap-2.5">
            {Array.from({ length: CASES_SKELETON.recentRows }, (_, row) => (
              <ItemRow key={row} thumb={OPENING_LIST.thumbSize} side />
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/** The cases page before its first response: banner, pills and body. */
export function CasesSkeleton({ onlyBody }: CasesSkeletonProps) {
  if (onlyBody) return <CasesBodySkeleton />;
  return (
    <LoadingRegion className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [&>*]:shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-7 w-28 rounded-md" />
      </div>
      <KindPills selected={DEFAULT_OPENING_KIND} onSelect={() => undefined} />
      <CasesBodySkeleton />
    </LoadingRegion>
  );
}
