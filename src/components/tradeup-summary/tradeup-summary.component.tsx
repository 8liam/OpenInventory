import { COPY } from "~/lib/copy/copy.config";
import { formatChance, formatMoney } from "~/utils/format";
import { SUMMARY } from "./tradeup-summary.config";
import type { TradeUpSummaryProps } from "./tradeup-summary.types";
export function TradeUpSummary({ result, inputs }: TradeUpSummaryProps) {
  const collections = new Map<string, number>();
  for (const input of inputs) {
    const name = input.collections[0];
    if (name) collections.set(name, (collections.get(name) ?? 0) + 1);
  }
  const prices = result.outcomes.flatMap((item) => (item.price === null ? [] : [item.price]));
  const complete = prices.length > 0 && prices.length === result.outcomes.length;
  const figures = [
    [COPY.tradeup.inputCost, result.inputCost],
    [COPY.tradeup.expectedValue, result.expectedValue],
    [SUMMARY.best, complete ? Math.max(...prices) : null],
    [SUMMARY.worst, complete ? Math.min(...prices) : null],
  ] as const;
  return (
    <div className="space-y-2 text-sm">
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        {figures.map(([label, value]) => (
          <div key={label} className="flex gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular">
              {value === null ? COPY.common.empty : formatMoney(value, result.currency)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        {[...collections]
          .map(([name, count]) => `${name} ${formatChance(count / inputs.length)}`)
          .join(SUMMARY.separator)}
      </p>
    </div>
  );
}
