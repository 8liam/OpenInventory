import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatChance, formatMoney } from "~/utils/format";
import { cn } from "~/utils/cn";
import { TRADEUP_ITEM_TILE as C } from "./tradeup-item-tile.config";
import type { TradeUpItemTileProps } from "./tradeup-item-tile.types";

export function TradeUpItemTile({
  name,
  imageUrl,
  rarityColor,
  price,
  currency,
  count,
  probability,
  inputCost,
}: TradeUpItemTileProps) {
  const profit = price !== null && inputCost !== undefined ? price - inputCost : null;
  const positive = profit !== null && profit >= 0;
  return (
    <li
      className={cn(
        "min-w-0 overflow-hidden rounded-md border bg-card",
        profit !== null && (positive ? "border-success/30" : "border-destructive/30"),
      )}
    >
      <ItemThumb imageUrl={imageUrl} rarityColor={null} className="h-20 w-full rounded-none" />
      <div
        className="space-y-1 border-t-2 p-2 text-xs"
        style={{ borderTopColor: rarityColor ?? undefined }}
      >
        <p className="truncate font-medium" title={name}>
          {name}
        </p>
        <div className="flex flex-wrap justify-between gap-1 tabular">
          <span>{price === null ? COPY.common.empty : formatMoney(price, currency)}</span>
          {count !== undefined && (
            <span className="text-muted-foreground">{C.quantity(count)}</span>
          )}
        </div>
        {probability !== undefined && (
          <p className="tabular text-muted-foreground">{formatChance(probability)}</p>
        )}
        {profit !== null && (
          <p className={cn("tabular", positive ? C.positiveClass : C.negativeClass)}>
            {formatMoney(profit, currency)}
          </p>
        )}
      </div>
      {probability !== undefined && (
        <div className="h-1 bg-muted">
          <div
            className={cn("h-full", positive ? "bg-success" : "bg-destructive")}
            style={{ width: `${probability * C.percentScale}%` }}
          />
        </div>
      )}
    </li>
  );
}
