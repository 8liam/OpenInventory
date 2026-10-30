import { useMemo, useState } from 'react';
import { Metric } from '~/components/metric/metric.component';
import { PageHeader } from '~/components/page-header/page-header.component';
import { TradeUpInputs } from '~/components/tradeup-inputs/tradeup-inputs.component';
import { TradeUpOutcomes } from '~/components/tradeup-outcomes/tradeup-outcomes.component';
import { DEFAULT_SELECTION, tradeUpCandidates, tradeUpOdds } from '@demo/data/tradeup.mock';
import { COPY } from '~/lib/copy/copy.config';
import { formatChance, formatFloat, formatMoney, formatPercent } from '~/utils/format';

/** The demo lists only the cheapest skins; the real app lists every one. */
const CANDIDATE_CAP = 6;

/** The real Trade-up calculator body: pick inputs, see average float, expected value and every outcome. */
export default function TradeUpDemo() {
  const copy = COPY.tradeup;
  const candidates = useMemo(() => tradeUpCandidates(), []);
  const [selection, setSelection] = useState<readonly string[]>(DEFAULT_SELECTION);
  if (!candidates.ok) return null;
  const selectedIds = new Set(selection);
  const odds = tradeUpOdds(selection);
  const result = odds.ok ? odds : undefined;

  const toggle = (id: string) => setSelection((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= candidates.inputCount ? cur : [...cur, id]));

  return (
    <div className="oi-app flex flex-col gap-3 p-4">
      <PageHeader title={copy.title} description={copy.description}>
        <span className="text-muted-foreground">
          {copy.rarity} <span className="text-foreground">{copy.rarities.rarity_ancient_weapon}</span>
        </span>
      </PageHeader>
      <TradeUpInputs
        candidates={candidates.candidates.slice(0, CANDIDATE_CAP)}
       
        selectedIds={selectedIds}
        inputCount={candidates.inputCount}
        currency={candidates.currency}
        onToggle={toggle}
        onAutoFill={() => setSelection(candidates.candidates.slice(0, candidates.inputCount).map((c) => c.id))}
        onClear={() => setSelection([])}
      />
      {selection.length === 0 && <p className="text-muted-foreground">{copy.pickPrompt}</p>}
      {result && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Metric label={copy.inputCost} value={formatMoney(result.inputCost, result.currency)} />
            <Metric label={copy.averageFloat} value={formatFloat(result.averageFloat)} />
            <Metric label={copy.expectedValue} value={formatMoney(result.expectedValue, result.currency)} />
            <Metric
              label={copy.expectedReturn}
              value={formatPercent(result.expectedValue / result.inputCost - 1)}
              tone={result.expectedValue >= result.inputCost ? 'positive' : 'negative'}
            />
            <Metric label={copy.chanceToProfit} value={formatChance(result.chanceToProfit)} />
          </div>
          {result.selected < result.inputCount && <p className="text-xs text-muted-foreground">{copy.selectMore(result.inputCount - result.selected)}</p>}
          <TradeUpOutcomes outcomes={result.outcomes} currency={result.currency} />
          <p className="text-xs text-muted-foreground">{copy.formulaNote}</p>
        </>
      )}
    </div>
  );
}
