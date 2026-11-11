import { TradeUpItemTile } from "~/components/tradeup-item-tile/tradeup-item-tile.component";
import { TRADEUP_ITEM_TILE } from "~/components/tradeup-item-tile/tradeup-item-tile.config";
import { cn } from "~/utils/cn";
import { Button } from "~/components/button/button.component";
import { ItemSearch } from "~/components/item-search/item-search.component";
import { COPY } from "~/lib/copy/copy.config";
import { Fragment, useState } from "react";
import { TRADEUP_DESIGN as DESIGN } from "~/lib/tradeup/tradeup-page.config";
import { EmptyState } from "~/components/empty-state/empty-state.component";
import { LoadError } from "~/components/load-error/load-error.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { REMOTE_STATUS } from "~/lib/storage/storage.config";
import { formatMoney, formatPercent } from "~/utils/format";
import { TRADEUP_FINDER_RESULTS } from "./tradeup-finder-results.config";
import type { TradeUpFinderResultsProps } from "./tradeup-finder-results.types";

const range = (count: number) => Array.from({ length: count }, (_, index) => index);

/** The best-EV contracts the finder found in this account, or its loading and empty states. */
export function TradeUpFinderResults({ finder, onOpen }: TradeUpFinderResultsProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState("");
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

  const queryText = query.trim().toLowerCase();
  const visible = results.filter((contract) =>
    [...contract.inputs, ...(contract.odds.ok ? contract.odds.outcomes : [])].some((item) =>
      item.name.toLowerCase().includes(queryText),
    ),
  );
  return (
    <div>
      <ItemSearch value={query} onChange={setQuery} />
      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="border-b text-xs text-muted-foreground">
            <tr>
              {[DESIGN.contract, copy.expectedValue, copy.cost, DESIGN.roi].map((label) => (
                <th key={label} className="h-9 px-2 sm:px-4 font-normal">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((contract, index) => {
              const key = contract.inputIds.join(":");
              const open = expanded.has(key);
              const inputs = new Map<
                string,
                { item: (typeof contract.inputs)[number]; count: number }
              >();
              for (const item of contract.inputs) {
                const name = item.marketHashName ?? item.name;
                const existing = inputs.get(name);
                inputs.set(name, { item, count: (existing?.count ?? 0) + 1 });
              }
              const toggle = () =>
                setExpanded((current) => {
                  const next = new Set(current);
                  if (open) next.delete(key);
                  else next.add(key);
                  return next;
                });
              return (
                <Fragment key={key}>
                  <tr className="h-10 cursor-pointer border-b hover:bg-muted" onClick={toggle}>
                    <td className="px-2 sm:px-4">
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={`contract-${index}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggle();
                        }}
                        className="py-2 text-left"
                      >
                        {DESIGN.contract} {copy.rank(index)}
                      </button>
                    </td>
                    <td
                      className={cn(
                        "whitespace-nowrap px-2 sm:px-4 tabular",
                        contract.profit >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {formatMoney(contract.expectedValue, currency)}
                    </td>
                    <td className="whitespace-nowrap px-2 sm:px-4 tabular">
                      {formatMoney(contract.inputCost, currency)}
                    </td>
                    <td className="px-2 sm:px-4 tabular">
                      {contract.inputCost > 0
                        ? formatPercent(contract.profit / contract.inputCost)
                        : COPY.common.empty}
                    </td>
                  </tr>
                  <tr id={`contract-${index}`} hidden={!open}>
                    <td colSpan={TRADEUP_FINDER_RESULTS.columnCount} className="border-b p-4">
                      <div className="space-y-4">
                        <section>
                          <h3 className="mb-2 text-xs text-muted-foreground">{DESIGN.inputs}</h3>
                          <ul className={TRADEUP_ITEM_TILE.gridClass}>
                            {Array.from(inputs, ([name, { item, count }]) => (
                              <TradeUpItemTile
                                key={name}
                                {...item}
                                currency={currency}
                                count={count}
                              />
                            ))}
                          </ul>
                        </section>
                        <section>
                          <h3 className="mb-2 text-xs text-muted-foreground">{DESIGN.outcomes}</h3>
                          <ul className={TRADEUP_ITEM_TILE.gridClass}>
                            {contract.odds.ok &&
                              contract.odds.outcomes.map((item) => (
                                <TradeUpItemTile
                                  key={`${item.name}-${item.wearName}`}
                                  {...item}
                                  currency={currency}
                                  inputCost={contract.inputCost}
                                />
                              ))}
                          </ul>
                        </section>
                      </div>
                      <div className="mt-4">
                        <Button small onClick={() => onOpen(contract)}>
                          {DESIGN.open}
                        </Button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && <p className="p-4 text-muted-foreground">{DESIGN.noMatches}</p>}
      </div>
    </div>
  );
}
