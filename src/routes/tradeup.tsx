import { createFileRoute } from "@tanstack/react-router";
import { LoadError } from "~/components/load-error/load-error.component";
import { useMemo, useState } from "react";
import { Metric } from "~/components/metric/metric.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { RarityPicker } from "~/components/rarity-picker/rarity-picker.component";
import { TradeUpFinderControls } from "~/components/tradeup-finder-controls/tradeup-finder-controls.component";
import { TradeUpFinderResults } from "~/components/tradeup-finder-results/tradeup-finder-results.component";
import { TradeUpInputs } from "~/components/tradeup-inputs/tradeup-inputs.component";
import { TradeUpOutcomes } from "~/components/tradeup-outcomes/tradeup-outcomes.component";
import { TradeUpSkeleton } from "~/components/tradeup-skeleton/tradeup-skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import type {
  TradeUpCandidatesResponse,
  TradeUpFinderResponse,
  TradeUpOddsResponse,
  TradeUpStatTrakFilter,
} from "~/lib/items/item.types";
import { useScopedPath, useSingleAccountLabel } from "~/lib/accounts/account-scope.hooks";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API, TRADE_UP, TRADE_UP_FINDER } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { formatChance, formatFloat, formatMoney, formatPercent } from "~/utils/format";

export const Route = createFileRoute("/tradeup")({ component: TradeUpPage });

const INPUT_RARITIES = TRADE_UP.rarityOrder.slice(0, -1).concat(TRADE_UP.covertRarity);
const SELECTION_SEPARATOR = ",";
const RARITY_OPTIONS = INPUT_RARITIES.map((id) => ({
  id,
  label: COPY.tradeup.rarities[id as keyof typeof COPY.tradeup.rarities],
  color: TRADE_UP.rarityColors[id as keyof typeof TRADE_UP.rarityColors],
}));

function TradeUpPage() {
  const snapshot = useStorageSnapshot();
  const priceQuery = usePriceQuery();
  const accountLabel = useSingleAccountLabel();
  const [rarity, setRarity] = useState<string>(TRADE_UP.defaultInputRarity);
  const [selection, setSelection] = useState<readonly string[]>([]);
  const [finderStatTrak, setFinderStatTrak] = useState<TradeUpStatTrakFilter>(
    TRADE_UP_FINDER.defaultStatTrakFilter,
  );
  const [includeStorage, setIncludeStorage] = useState(false);
  const candidatesPath = useScopedPath(`${STORAGE_API.tradeUp}?rarity=${rarity}&${priceQuery}`);
  const candidates = useRemoteData<TradeUpCandidatesResponse>(candidatesPath, snapshot.revision);
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

  const oddsPath = useScopedPath(
    `${STORAGE_API.tradeUpOdds}?rarity=${rarity}&ids=${orderedIds.join(SELECTION_SEPARATOR)}&${priceQuery}`,
  );
  const odds = useRemoteData<TradeUpOddsResponse>(
    orderedIds.length === 0 ? undefined : oddsPath,
    snapshot.revision,
  );
  const result = odds.status === "ready" && odds.data.ok ? odds.data : undefined;
  const finderPath = useScopedPath(
    `${STORAGE_API.tradeUpFinder}?rarity=${rarity}&statTrak=${finderStatTrak}&includeStorage=${includeStorage}&${priceQuery}`,
  );
  const finder = useRemoteData<TradeUpFinderResponse>(finderPath, snapshot.revision);

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
      <PageHeader title={copy.title} description={copy.description} account={accountLabel}>
        <RarityPicker
          label={copy.rarity}
          options={RARITY_OPTIONS}
          value={rarity}
          onChange={(id) => {
            setRarity(id);
            setSelection([]);
          }}
        />
      </PageHeader>
      <TradeUpFinderControls
        statTrak={finderStatTrak}
        onStatTrakChange={setFinderStatTrak}
        includeStorage={includeStorage}
        onIncludeStorageChange={setIncludeStorage}
      />
      <TradeUpFinderResults finder={finder} />
      {(candidates.status === "loading" || (current && !ready)) && <TradeUpSkeleton />}
      {candidates.status === "error" && (
        <LoadError message={candidates.message} onRetry={candidates.retry} />
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
          {odds.status === "error" && <LoadError message={odds.message} onRetry={odds.retry} />}
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
