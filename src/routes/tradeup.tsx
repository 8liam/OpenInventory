import { Pill } from "~/components/pill/pill.component";
import { createFileRoute } from "@tanstack/react-router";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "~/components/empty-state/empty-state.component";
import { LoadError } from "~/components/load-error/load-error.component";
import { useMemo, useState } from "react";
import { PageHeader } from "~/components/page-header/page-header.component";
import { RarityPicker } from "~/components/rarity-picker/rarity-picker.component";
import { TradeUpFinderControls } from "~/components/tradeup-finder-controls/tradeup-finder-controls.component";
import { TradeUpFinderResults } from "~/components/tradeup-finder-results/tradeup-finder-results.component";
import { TradeUpInputs } from "~/components/tradeup-inputs/tradeup-inputs.component";
import { TradeUpSummary } from "~/components/tradeup-summary/tradeup-summary.component";
import { TRADEUP_DESIGN } from "~/lib/tradeup/tradeup-page.config";
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
import { useRestoreFocusOnRecovery } from "~/lib/storage/recovered-focus.hooks";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API, TRADE_UP, TRADE_UP_FINDER } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { TRADEUP_PAGE } from "~/lib/tradeup/tradeup-page.config";

export const Route = createFileRoute("/tradeup")({
  validateSearch: (search: Record<string, unknown>): { view: "tradeup" | "finder" } => ({
    view: search.view === "finder" ? "finder" : "tradeup",
  }),
  component: TradeUpPage,
});

const INPUT_RARITIES = TRADE_UP.rarityOrder.slice(0, -1).concat(TRADE_UP.covertRarity);
const SELECTION_SEPARATOR = ",";
const RARITY_OPTIONS = INPUT_RARITIES.map((id) => ({
  id,
  label: COPY.tradeup.rarities[id as keyof typeof COPY.tradeup.rarities],
  color: TRADE_UP.rarityColors[id as keyof typeof TRADE_UP.rarityColors],
}));

function TradeUpPage() {
  const { view } = Route.useSearch();
  const navigate = Route.useNavigate();
  const switchView = (view: "tradeup" | "finder") => void navigate({ search: { view } });
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
  useRestoreFocusOnRecovery(candidates.status);
  useRestoreFocusOnRecovery(odds.status);
  useRestoreFocusOnRecovery(finder.status);

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
      <div role="group" aria-label={copy.title} className="mb-4 flex flex-wrap gap-1.5">
        {TRADEUP_DESIGN.views.map((tab) => (
          <Pill key={tab} active={view === tab} onClick={() => switchView(tab)}>
            {TRADEUP_DESIGN[tab]}
          </Pill>
        ))}
      </div>
      {/* One scroll region for the whole page, so the calculator never gets squeezed below the finder. */}
      <div
        role="region"
        aria-label={copy.title}
        tabIndex={0}
        className={TRADEUP_PAGE.classes.scrollRegion}
      >
        <div hidden={view !== "finder"} className="space-y-4">
          <TradeUpFinderControls
            statTrak={finderStatTrak}
            onStatTrakChange={setFinderStatTrak}
            includeStorage={includeStorage}
            onIncludeStorageChange={setIncludeStorage}
          />
          <TradeUpFinderResults
            finder={finder}
            onOpen={(contract) => {
              setSelection(contract.inputIds);
              switchView("tradeup");
            }}
          />
        </div>
        <div hidden={view !== "tradeup"} className="space-y-4">
          {(candidates.status === "loading" || (current && !ready)) && <TradeUpSkeleton />}
          {candidates.status === "error" && (
            <LoadError
              message={candidates.message}
              onRetry={candidates.retry}
              retrying={candidates.retrying}
            />
          )}
          {candidates.status === "ready" && !candidates.data.ok && (
            <EmptyState
              icon={PackageSearch}
              title={copy.calculatorEmpty}
              body={candidates.data.reason}
            />
          )}
          {ready && (
            <div className={TRADEUP_PAGE.classes.calculator}>
              <TradeUpInputs
                candidates={ready.candidates}
                selectedIds={selectedIds}
                inputCount={ready.inputCount}
                currency={ready.currency}
                onToggle={toggle}
                onAutoFill={autoFill}
                onClear={() => setSelection([])}
              />
              {orderedIds.length === 0 && (
                <p className={TRADEUP_PAGE.classes.muted}>{copy.pickPrompt}</p>
              )}
              {odds.status === "error" && (
                <LoadError message={odds.message} onRetry={odds.retry} retrying={odds.retrying} />
              )}
              {odds.status === "ready" && !odds.data.ok && orderedIds.length > 0 && (
                <p className={TRADEUP_PAGE.classes.muted}>{odds.data.reason}</p>
              )}
              {result && orderedIds.length > 0 && (
                <>
                  <TradeUpSummary
                    result={result}
                    inputs={ready.candidates.filter((item) => selectedIds.has(item.id))}
                  />
                  {result.selected < result.inputCount && (
                    <p className={TRADEUP_PAGE.classes.note}>
                      {copy.selectMore(result.inputCount - result.selected)}
                    </p>
                  )}
                  <TradeUpOutcomes
                    outcomes={result.outcomes}
                    currency={result.currency}
                    inputCost={result.inputCost}
                  />
                  <p className={TRADEUP_PAGE.classes.note}>{copy.formulaNote}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
