import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { ITEM_LABEL } from "./item-label.config";
import type { ItemLabelProps } from "./item-label.types";

function splitName(name: string): [string | null, string] {
  const { nameSeparator } = ITEM_LABEL;
  const at = name.indexOf(nameSeparator);
  return at < 0 ? [null, name] : [name.slice(0, at), name.slice(at + nameSeparator.length)];
}

/** Thumbnail plus weapon / skin name: the one way items are identified across the app. */
export function ItemLabel({
  name,
  imageUrl,
  rarityColor,
  size,
  customName,
  children,
}: ItemLabelProps) {
  const [weapon, skin] = splitName(name);
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
      </div>
    </div>
  );
}
