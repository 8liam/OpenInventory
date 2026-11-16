import { useMemo, useState } from "react";
import { Metric } from "~/components/metric/metric.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { TradeUpInputs } from "~/components/tradeup-inputs/tradeup-inputs.component";
import { TradeUpOutcomes } from "~/components/tradeup-outcomes/tradeup-outcomes.component";
import { DEFAULT_SELECTION, tradeUpCandidates, tradeUpOdds } from "@demo/data/tradeup.mock";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatChance, formatFloat, formatMoney, formatPercent } from "~/utils/format";
import {
  DEMO_VISIBLE_WIDTH,
  FEATURE_DEMO_VARIANT,
} from "../../components/features/feature-demo.config";
import type { FeatureDemoComponentProps } from "../../components/features/feature-demo.types";
import { TradeUpInlineInputs } from "./tradeup-demo-inline";
import { TRADEUP_DEMO } from "./tradeup-demo.config";

/**
 * The real Trade-up calculator body: pick inputs, see average float, expected value and every outcome.
 * The cropped panel gets a lean composition that stays legible when scaled; the dialog gets the full app.
 */
export default function TradeUpDemo({
  variant = FEATURE_DEMO_VARIANT.dialog,
}: FeatureDemoComponentProps) {
  const inline = variant === FEATURE_DEMO_VARIANT.inline;
  const copy = COPY.tradeup;
  const candidates = useMemo(() => tradeUpCandidates(), []);
  const [selection, setSelection] = useState<readonly string[]>(DEFAULT_SELECTION);
  if (!candidates.ok) return null;
  const selectedIds = new Set(selection);
  const odds = tradeUpOdds(selection);
  const result = odds.ok ? odds : undefined;

  const toggle = (id: string) =>
    setSelection((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : cur.length >= candidates.inputCount
          ? cur
          : [...cur, id],
    );

  const autoFill = () =>
    setSelection(candidates.candidates.slice(0, candidates.inputCount).map((c) => c.id));
  const clear = () => setSelection([]);
  const inputProps = {
    selectedIds,
    inputCount: candidates.inputCount,
    currency: candidates.currency,
    onToggle: toggle,
    onAutoFill: autoFill,
    onClear: clear,
  };
  const metrics = result && (
    <div className={inline ? TRADEUP_DEMO.inlineMetricsClass : TRADEUP_DEMO.dialogMetricsClass}>
      <Metric label={copy.inputCost} value={formatMoney(result.inputCost, result.currency)} />
      <Metric label={copy.averageFloat} value={formatFloat(result.averageFloat)} />
      <Metric
        label={copy.expectedValue}
        value={formatMoney(result.expectedValue, result.currency)}
      />
      <Metric
        label={copy.expectedReturn}
        value={formatPercent(result.expectedValue / result.inputCost - 1)}
        tone={result.expectedValue >= result.inputCost ? "positive" : "negative"}
      />
      <Metric label={copy.chanceToProfit} value={formatChance(result.chanceToProfit)} />
    </div>
  );
  const outcomes = result && (
    <TradeUpOutcomes
      outcomes={inline ? result.outcomes.slice(0, TRADEUP_DEMO.inlineOutcomeCap) : result.outcomes}
      currency={result.currency}
      inputCost={result.inputCost}
    />
  );
  const selectMore = result && result.selected < result.inputCount && (
    <p className="text-xs text-muted-foreground">
      {copy.selectMore(result.inputCount - result.selected)}
    </p>
  );
  const pickPrompt = selection.length === 0 && (
    <p className="text-muted-foreground">{copy.pickPrompt}</p>
  );

  return (
    <div
      className="oi-app flex flex-col gap-3 p-4"
      style={inline ? { maxWidth: DEMO_VISIBLE_WIDTH } : undefined}
    >
      <PageHeader title={copy.title} description={copy.description}>
        <span className="text-muted-foreground">
          {copy.rarity}{" "}
          <span className="text-foreground">{copy.rarities.rarity_ancient_weapon}</span>
        </span>
      </PageHeader>
      {inline ? (
        <>
          {metrics}
          <div className={TRADEUP_DEMO.inlineLayoutClass}>
            <TradeUpInlineInputs
              candidates={candidates.candidates.slice(0, TRADEUP_DEMO.inlineCandidateCap)}
              {...inputProps}
            />
            <div className="flex min-w-0 flex-col gap-3">
              {pickPrompt}
              {selectMore}
              {outcomes}
            </div>
          </div>
        </>
      ) : (
        <div className={TRADEUP_DEMO.dialogLayoutClass}>
          <div className={cn("min-w-0", TRADEUP_DEMO.dialogListClass)}>
            <TradeUpInputs candidates={candidates.candidates} {...inputProps} />
          </div>
          <div className="flex min-w-0 flex-col gap-3">
            {pickPrompt}
            {metrics}
            {selectMore}
            {outcomes}
            {result && <p className="text-xs text-muted-foreground">{copy.formulaNote}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
