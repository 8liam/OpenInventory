import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { TradeLockBadge } from "~/components/trade-lock-badge/trade-lock-badge.component";
import type { ItemLabelProps } from "./item-label.types";
import { splitItemName } from "./item-label.utils";

/** Thumbnail plus weapon / skin name: the one way items are identified across the app. */
export function ItemLabel({
  name,
  imageUrl,
  rarityColor,
  size,
  customName,
  tradableAfter,
  children,
}: ItemLabelProps) {
  const [weapon, skin] = splitItemName(name);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ItemThumb imageUrl={imageUrl} rarityColor={rarityColor} size={size} />
      <div className="min-w-0">
        {weapon && (
          <p className="mb-0.5 truncate text-[11px] uppercase leading-none tracking-wide text-muted-foreground">
            {weapon}
          </p>
        )}
        <p
          className="break-words leading-tight max-md:line-clamp-2 max-md:whitespace-normal md:truncate"
          title={name}
        >
          {skin}
          {customName && <span className="text-muted-foreground"> “{customName}”</span>}
        </p>
        {children}
        {tradableAfter !== undefined && tradableAfter !== null && (
          <p className="mt-0.5">
            <TradeLockBadge tradableAfter={tradableAfter} />
          </p>
        )}
      </div>
    </div>
  );
}
