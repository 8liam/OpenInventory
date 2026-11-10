import { ItemLabel } from "~/components/item-label/item-label.component";
import { Link } from "@tanstack/react-router";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger, formatMoney } from "~/utils/format";
import { HOLDINGS_TABLE } from "./holdings-table.config";
import type { HoldingsTableProps } from "./holdings-table.types";

export function HoldingsTable({ holdings, currency }: HoldingsTableProps) {
  const columns = COPY.dashboard.holdingsColumns;
  return (
    <>
      <ul className="divide-y sm:hidden">
        {holdings.map((holding) => (
          <li key={holding.name} className="py-3 first:pt-0 last:pb-0">
            <Link
              to="/items"
              search={{ q: holding.name }}
              title={HOLDINGS_TABLE.findItem}
              className="block min-w-0 rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ItemLabel
                name={holding.name}
                imageUrl={holding.imageUrl}
                rarityColor={holding.rarityColor}
                size={HOLDINGS_TABLE.thumbSize}
                nameFit="wrap"
              />
            </Link>
            <dl className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
              <div className="flex gap-1">
                <dt className="text-muted-foreground">{columns.qty}</dt>
                <dd className="tabular">{formatInteger(holding.count)}</dd>
              </div>
              <div className="flex gap-1">
                <dt className="text-muted-foreground">{columns.unit}</dt>
                <dd className="tabular">{formatMoney(holding.unitPrice, currency)}</dd>
              </div>
              <div className="flex w-full justify-end gap-1 text-sm">
                <dt className="text-muted-foreground">{columns.total}</dt>
                <dd className="tabular font-medium">{formatMoney(holding.totalValue, currency)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <table className="hidden w-full sm:table">
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
                <Link
                  to="/items"
                  search={{ q: holding.name }}
                  title={HOLDINGS_TABLE.findItem}
                  className="block rounded-sm focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <ItemLabel
                    name={holding.name}
                    imageUrl={holding.imageUrl}
                    rarityColor={holding.rarityColor}
                    size={HOLDINGS_TABLE.thumbSize}
                  />
                </Link>
              </td>
              <td className="tabular py-2 text-right text-muted-foreground">
                {formatInteger(holding.count)}
              </td>
              <td className="tabular py-2 text-right text-muted-foreground">
                {formatMoney(holding.unitPrice, currency)}
              </td>
              <td className="tabular py-2 text-right">
                {formatMoney(holding.totalValue, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
