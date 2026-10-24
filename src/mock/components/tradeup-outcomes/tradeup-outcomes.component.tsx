import { ItemLabel } from "~/components/item-label/item-label.component";
import { Panel } from "~/components/panel/panel.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatFloat, formatMoney, formatChance } from "~/utils/format";
import { TRADEUP_OUTCOMES } from "./tradeup-outcomes.config";
import type { TradeUpOutcomesProps } from "./tradeup-outcomes.types";

/** What the trade-up can produce, with the chance of each. */
export function TradeUpOutcomes({ outcomes, currency }: TradeUpOutcomesProps) {
  const copy = COPY.tradeup;
  return (
    <Panel title={copy.outcomes}>
      <ul className="flex flex-col gap-2.5">
        {outcomes.map((outcome) => (
          <li key={`${outcome.name}-${outcome.wearName}`} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <ItemLabel
                name={outcome.name}
                imageUrl={outcome.imageUrl}
                rarityColor={outcome.rarityColor}
                size={TRADEUP_OUTCOMES.imageSize}
              />
              <span className="tabular shrink-0 text-right">
                <span className="block font-medium">{formatChance(outcome.probability)}</span>
                <span className="block text-xs text-muted-foreground">
                  {outcome.float !== null && `${formatFloat(outcome.float)} · `}
                  {outcome.price === null
                    ? COPY.common.empty
                    : formatMoney(outcome.price, currency)}
                </span>
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/60"
                style={{
                  width: `${Math.max(outcome.probability * 100, TRADEUP_OUTCOMES.minBarPercent)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
