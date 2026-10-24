import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Metric } from "~/components/metric/metric.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { TradeUpInputs } from "~/components/tradeup-inputs/tradeup-inputs.component";
import { TradeUpOutcomes } from "~/components/tradeup-outcomes/tradeup-outcomes.component";
import { TradeUpSkeleton } from "~/components/tradeup-skeleton/tradeup-skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import type { TradeUpCandidatesResponse, TradeUpOddsResponse } from "~/lib/items/item.types";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API, TRADE_UP } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { formatChance, formatFloat, formatMoney, formatPercent } from "~/utils/format";

export const Route = createFileRoute("/tradeup")({ component: TradeUpPage });

const INPUT_RARITIES = TRADE_UP.rarityOrder.slice(0, -1).concat(TRADE_UP.covertRarity);
const SELECTION_SEPARATOR = ",";

function TradeUpPage() {
  const snapshot = useStorageSnapshot();
  const priceQuery = usePriceQuery();
  const [rarity, setRarity] = useState<string>(TRADE_UP.defaultInputRarity);
  const [selection, setSelection] = useState<readonly string[]>([]);
  const candidates = useRemoteData<TradeUpCandidatesResponse>(
    `${STORAGE_API.tradeUp}?rarity=${rarity}&${priceQuery}`,
    snapshot.revision,
  );
  const copy = COPY.tradeup;
  // Data fetched for the previous rarity lingers while the new one loads; ignore it.
  const current = candidates.status === "ready" && candidates.data.ok ? candidates.data : undefined;
  const ready = current?.rarityId === rarity ? current : undefined;

  // Drop picks that are no longer available (moved, locked, or the rarity changed).
  const selectedIds = useMemo(() => {
    if (!ready) return new Set<string>();
    const available = new Set(ready.candidates.map((c) => c.id));
    return new Set(selection.filter((id) => available.has(id)));
  }, [ready, selection]);
  const orderedIds = useMemo(() => [...selectedIds], [selectedIds]);

  const odds = useRemoteData<TradeUpOddsResponse>(
    orderedIds.length === 0
      ? undefined
      : `${STORAGE_API.tradeUpOdds}?rarity=${rarity}&ids=${orderedIds.join(SELECTION_SEPARATOR)}&${priceQuery}`,
    snapshot.revision,
  );
  const result = odds.status === "ready" && odds.data.ok ? odds.data : undefined;

  function toggle(id: string) {
    setSelection((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  function autoFill() {
    if (!ready) return;
    const first = ready.candidates[0];
    if (!first) return;
    const picks = ready.candidates
      .filter((c) => c.isStatTrak === first.isStatTrak)
      .slice(0, ready.inputCount)
      .map((c) => c.id);
    setSelection(picks);
  }

  return (
    <>
      <PageHeader title={copy.title} description={copy.description}>
        <label className="flex items-center gap-2 text-muted-foreground">
          {copy.rarity}
          <select
            value={rarity}
            onChange={(e) => {
              setRarity(e.target.value);
              setSelection([]);
            }}
            className="h-8 rounded-md border border-input bg-card px-2.5 text-foreground outline-none"
          >
            {INPUT_RARITIES.map((id) => (
              <option key={id} value={id}>
                {copy.rarities[id as keyof typeof copy.rarities]}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>
      {(candidates.status === "loading" || (current && !ready)) && <TradeUpSkeleton />}
      {candidates.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {candidates.message}
        </p>
      )}
      {candidates.status === "ready" && !candidates.data.ok && (
        <p className="text-muted-foreground">{candidates.data.reason}</p>
      )}
      {ready && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
          <TradeUpInputs
            candidates={ready.candidates}
            selectedIds={selectedIds}
            inputCount={ready.inputCount}
            currency={ready.currency}
            onToggle={toggle}
            onAutoFill={autoFill}
            onClear={() => setSelection([])}
          />
          {orderedIds.length === 0 && <p className="text-muted-foreground">{copy.pickPrompt}</p>}
          {odds.status === "error" && (
            <p role="alert" className="text-destructive">
              {COPY.common.errorPrefix} {odds.message}
            </p>
          )}
          {odds.status === "ready" && !odds.data.ok && orderedIds.length > 0 && (
            <p className="text-muted-foreground">{odds.data.reason}</p>
          )}
          {result && orderedIds.length > 0 && (
            <>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Metric
                  label={copy.inputCost}
                  value={formatMoney(result.inputCost, result.currency)}
                />
                <Metric label={copy.averageFloat} value={formatFloat(result.averageFloat)} />
                <Metric
                  label={copy.expectedValue}
                  value={formatMoney(result.expectedValue, result.currency)}
                />
                <Metric
                  label={copy.expectedReturn}
                  value={
                    result.inputCost > 0
                      ? formatPercent(result.expectedValue / result.inputCost - 1)
                      : COPY.common.empty
                  }
                  tone={result.expectedValue >= result.inputCost ? "positive" : "negative"}
                />
                <Metric label={copy.chanceToProfit} value={formatChance(result.chanceToProfit)} />
              </div>
              {result.selected < result.inputCount && (
                <p className="text-xs text-muted-foreground">
                  {copy.selectMore(result.inputCount - result.selected)}
                </p>
              )}
              <TradeUpOutcomes outcomes={result.outcomes} currency={result.currency} />
              <p className="text-xs text-muted-foreground">{copy.formulaNote}</p>
            </>
          )}
        </div>
      )}
    </>
  );
}
