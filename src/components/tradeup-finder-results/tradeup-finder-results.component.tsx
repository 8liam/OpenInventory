import { LoadError } from "~/components/load-error/load-error.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { REMOTE_STATUS } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney, formatPercent } from "~/utils/format";
import { TRADEUP_FINDER_RESULTS } from "./tradeup-finder-results.config";
import type { TradeUpFinderResultsProps } from "./tradeup-finder-results.types";

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

/** The best-EV contracts the finder found in this account, or its loading and empty states. */
export function TradeUpFinderResults({ finder }: TradeUpFinderResultsProps) {
  const copy = TRADEUP_FINDER_RESULTS;
  if (finder.status === REMOTE_STATUS.loading) {
    return (
      <LoadingRegion className="flex shrink-0 flex-col gap-3">
        {range(copy.skeletonCards).map((card) => (
          <div key={card} className="rounded-lg border p-3">
            <Skeleton className="mb-2 h-4 w-72 max-w-full" />
            <Skeleton className="mb-2 h-3 w-96 max-w-full" />
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {range(copy.skeletonOutcomes).map((outcome) => (
                <Skeleton key={outcome} className="h-6" />
              ))}
            </div>
          </div>
        ))}
      </LoadingRegion>
    );
  }
  if (finder.status === REMOTE_STATUS.error)
    return <LoadError message={finder.message} onRetry={finder.retry} />;
  const { results, currency } = finder.data;
  if (results.length === 0) return <p className="text-muted-foreground">{copy.empty}</p>;

  return (
    <ol aria-label={copy.listLabel} className={cn("flex flex-col gap-3", copy.listClass)}>
      {results.map((contract, index) => (
        <li key={contract.inputIds.join(":")} className="rounded-lg border bg-card p-3">
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-semibold tabular">{copy.rank(index)}</span>
            <dl className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {[
                { label: copy.expectedValue, value: formatMoney(contract.expectedValue, currency) },
                { label: copy.cost, value: formatMoney(contract.inputCost, currency) },
                {
                  label: copy.profit,
                  value: formatMoney(contract.profit, currency),
                  tone: contract.profit >= 0 ? "text-success" : "text-destructive",
                },
                {
                  label: copy.float,
                  value: contract.odds.ok
                    ? formatFloat(contract.odds.averageFloat)
                    : COPY.common.empty,
                },
              ].map(({ label, value, tone }) => (
                <div key={label} className="flex gap-1">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className={cn("tabular", tone)}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{copy.inputs}:</span>{" "}
            {contract.inputs.map((item) => item.name).join(copy.inputSeparator)}
          </p>
          {contract.odds.ok && (
            <ul className="grid gap-1 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {contract.odds.outcomes.map((outcome) => (
                <li
                  key={`${outcome.name}:${outcome.float}`}
                  className="flex justify-between gap-2 rounded bg-muted px-2 py-1"
                >
                  <span className="truncate">
                    {outcome.name}
                    {copy.outcomeSeparator}
                    {formatPercent(outcome.probability)}
                  </span>
                  <span className="shrink-0 tabular">
                    {outcome.price === null
                      ? COPY.common.empty
                      : formatMoney(outcome.price, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}
