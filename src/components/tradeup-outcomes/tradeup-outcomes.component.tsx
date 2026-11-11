import { ItemLabel } from "~/components/item-label/item-label.component";
import { COPY } from "~/lib/copy/copy.config";
import { TRADEUP_DESIGN as D } from "~/lib/tradeup/tradeup-page.config";
import { formatMoney, formatChance } from "~/utils/format";
import { TRADEUP_OUTCOMES } from "./tradeup-outcomes.config";
import type { TradeUpOutcomesProps } from "./tradeup-outcomes.types";
export function TradeUpOutcomes({ outcomes, currency, inputCost }: TradeUpOutcomesProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b text-xs text-muted-foreground">
          <tr>
            {[D.outcomes, D.odds, D.price, D.profit].map((label) => (
              <th key={label} className="h-9 px-4 font-normal">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {outcomes.map((item) => (
            <tr
              key={`${item.name}-${item.wearName}`}
              className="border-b last:border-0 hover:bg-muted"
            >
              <td className="px-4 py-1.5">
                <ItemLabel
                  name={item.name}
                  imageUrl={item.imageUrl}
                  rarityColor={item.rarityColor}
                  size={TRADEUP_OUTCOMES.imageSize}
                  nameFit="wrap"
                />
              </td>
              <td className="px-4 tabular">{formatChance(item.probability)}</td>
              <td className="whitespace-nowrap px-4 tabular">
                {item.price === null ? COPY.common.empty : formatMoney(item.price, currency)}
              </td>
              <td className="whitespace-nowrap px-4 tabular">
                {item.price === null
                  ? COPY.common.empty
                  : formatMoney(item.price - inputCost, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
