import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { COPY } from "~/lib/copy/copy.config";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatChance, formatMoney, formatSignedMoney } from "~/utils/format";
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
    <li className="relative min-w-0 overflow-hidden rounded-md border border-control bg-card">
      <ItemThumb
        imageUrl={imageUrl}
        rarityColor={rarityColor}
        showRarityBar={false}
        className="h-20 w-full rounded-none"
      />
      {/* Rarity is a 2px key down the left edge, as on the spec sheet's outcome card. */}
      {rarityColor && (
        <span
          aria-hidden
          className="absolute left-0 top-3 h-14 w-0.5"
          style={{ background: rarityColor }}
        />
      )}
      <div className="space-y-1 border-t p-2 text-xs">
        <p className="truncate font-medium" title={name}>
          {name}
        </p>
        <div className="flex flex-wrap justify-between gap-1 font-mono tabular-nums">
          <span>{price === null ? COPY.common.empty : formatMoney(price, currency)}</span>
          {count !== undefined && (
            <span className="text-muted-foreground">{C.quantity(count)}</span>
          )}
        </div>
        {probability !== undefined && (
          <p className="tabular text-muted-foreground">{formatChance(probability)}</p>
        )}
        {profit !== null && (
          <p className={positive ? C.positiveClass : C.negativeClass}>
            {positive ? (
              <ChevronUp size={C.iconSize} strokeWidth={2.5} aria-hidden />
            ) : (
              <ChevronDown size={C.iconSize} strokeWidth={2.5} aria-hidden />
            )}
            {formatSignedMoney(profit, currency)}
          </p>
        )}
      </div>
      {probability !== undefined && (
        <div className="h-1 bg-muted">
          <div className="h-full bg-fill-3" style={{ width: `${probability * C.percentScale}%` }} />
        </div>
      )}
    </li>
  );
}
