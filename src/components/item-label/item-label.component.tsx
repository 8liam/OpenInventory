import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { ITEM_LABEL } from "./item-label.config";
import type { ItemLabelProps } from "./item-label.types";
import { splitItemName } from "./item-label.utils";

/** Thumbnail plus weapon / skin name: the one way items are identified across the app. */
export function ItemLabel({
  name,
  imageUrl,
  rarityColor,
  size,
  customName,
  nameFit = "responsive",
  children,
}: ItemLabelProps) {
  const [weapon, skin] = splitItemName(name);
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ItemThumb imageUrl={imageUrl} rarityColor={rarityColor} size={size} />
      {/* Fills the row, so the highlight line's container query sees the real space available. */}
      <div className="min-w-0 flex-1">
        {weapon && (
          <p className="mb-0.5 truncate text-[11px] uppercase leading-none tracking-wide text-muted-foreground">
            {weapon}
          </p>
        )}
        <p className={ITEM_LABEL.nameClass[nameFit]} title={name}>
          {skin}
          {customName && <span className="text-muted-foreground"> “{customName}”</span>}
        </p>
        {children}
      </div>
    </div>
  );
}
