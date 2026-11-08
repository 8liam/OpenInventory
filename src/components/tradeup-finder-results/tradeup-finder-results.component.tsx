import { EmptyState } from "~/components/empty-state/empty-state.component";
import { LoadError } from "~/components/load-error/load-error.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { REMOTE_STATUS } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { formatChance, formatFloat, formatMoney } from "~/utils/format";
import { TRADEUP_FINDER_RESULTS } from "./tradeup-finder-results.config";
import type { TradeUpFinderResultsProps } from "./tradeup-finder-results.types";

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

/** The best-EV contracts the finder found in this account, or its loading and empty states. */
export function TradeUpFinderResults({ finder }: TradeUpFinderResultsProps) {
  const copy = TRADEUP_FINDER_RESULTS;
  const { classes } = copy;
  if (finder.status === REMOTE_STATUS.loading) {
    return (
      <LoadingRegion className={classes.loading}>
        {range(copy.skeletonCards).map((card) => (
          <div key={card} className={classes.skeletonCard}>
            <Skeleton className={classes.skeletonTitle} />
            <Skeleton className={classes.skeletonSubtitle} />
            <div className={classes.skeletonOutcomes}>
              {range(copy.skeletonOutcomes).map((outcome) => (
                <Skeleton key={outcome} className={classes.skeletonOutcome} />
              ))}
            </div>
          </div>
        ))}
      </LoadingRegion>
    );
  }
  if (finder.status === REMOTE_STATUS.error)
    return <LoadError message={finder.message} onRetry={finder.retry} retrying={finder.retrying} />;
  const { results, currency } = finder.data;
  if (results.length === 0)
    return <EmptyState icon={copy.empty.icon} title={copy.empty.title} body={copy.empty.body} />;

  return (
    // Focusable: a scroll area with no controls inside is otherwise out of reach by keyboard.
    <ol aria-label={copy.listLabel} tabIndex={0} className={cn(classes.list, copy.listClass)}>
      {results.map((contract, index) => (
        <li key={contract.inputIds.join(":")} className={classes.card}>
          <div className={classes.summary}>
            <span className={classes.rank}>{copy.rank(index)}</span>
            <dl className={classes.figures}>
              {[
                { label: copy.expectedValue, value: formatMoney(contract.expectedValue, currency) },
                { label: copy.cost, value: formatMoney(contract.inputCost, currency) },
                {
                  label: copy.profit,
                  value: formatMoney(contract.profit, currency),
                  tone: contract.profit >= 0 ? classes.gain : classes.loss,
                },
                {
                  label: copy.float,
                  value: contract.odds.ok
                    ? formatFloat(contract.odds.averageFloat)
                    : COPY.common.empty,
                },
              ].map(({ label, value, tone }) => (
                <div key={label} className={classes.figure}>
                  <dt className={classes.figureLabel}>{label}</dt>
                  <dd className={cn(classes.figureValue, tone)}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className={classes.inputs}>
            <span className={classes.inputsLabel}>{copy.inputs}:</span>{" "}
            {contract.inputs.map((item) => item.name).join(copy.inputSeparator)}
          </p>
          {contract.odds.ok && (
            <ul className={classes.outcomes} style={{ gridTemplateColumns: copy.outcomeColumns }}>
              {contract.odds.outcomes.map((outcome) => (
                <li key={`${outcome.name}:${outcome.float}`} className={classes.outcome}>
                  <span className={classes.outcomeName} title={outcome.name}>
                    {outcome.name}
                  </span>
                  <span className={classes.outcomeChance}>{formatChance(outcome.probability)}</span>
                  <span className={classes.outcomePrice}>
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
