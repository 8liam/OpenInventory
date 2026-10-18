import { ItemLabel } from "~/components/item-label/item-label.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger, formatMoney } from "~/utils/format";
import { HOLDINGS_TABLE } from "./holdings-table.config";
import type { HoldingsTableProps } from "./holdings-table.types";

export function HoldingsTable({ holdings, currency }: HoldingsTableProps) {
  const columns = COPY.dashboard.holdingsColumns;
  return (
    <table className="w-full">
      <thead className="text-left text-xs text-muted-foreground">
        <tr>
          <th className="pb-2 font-normal">{columns.item}</th>
          <th className="pb-2 text-right font-normal">{columns.qty}</th>
          <th className="pb-2 text-right font-normal">{columns.unit}</th>
          <th className="pb-2 text-right font-normal">{columns.total}</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((holding) => (
          <tr key={holding.name} className="border-t">
            <td className="py-2">
              <ItemLabel
                name={holding.name}
                imageUrl={holding.imageUrl}
                rarityColor={holding.rarityColor}
                size={HOLDINGS_TABLE.thumbSize}
              />
            </td>
            <td className="tabular py-2 text-right text-muted-foreground">
              {formatInteger(holding.count)}
            </td>
            <td className="tabular py-2 text-right text-muted-foreground">
              {formatMoney(holding.unitPrice, currency)}
            </td>
            <td className="tabular py-2 text-right">{formatMoney(holding.totalValue, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
