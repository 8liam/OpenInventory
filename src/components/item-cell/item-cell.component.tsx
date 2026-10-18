import { ItemLabel } from "~/components/item-label/item-label.component";
import { ITEM_CELL } from "./item-cell.config";
import type { ItemCellProps } from "./item-cell.types";

export function ItemCell({ item }: ItemCellProps) {
  const { imageSize, stickerSize, charmSize, maxStickers, patternLabel } = ITEM_CELL;
  const hasAttachments = item.stickers.length > 0 || item.charms.length > 0;
  return (
    <ItemLabel
      name={item.name}
      imageUrl={item.imageUrl}
      rarityColor={item.rarityColor}
      customName={item.customName}
      size={imageSize}
    >
      {item.pattern !== null && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {patternLabel} #{item.pattern}
        </p>
      )}
      {hasAttachments && (
        <div className="mt-1 flex items-center gap-0.5">
          {item.stickers.slice(0, maxStickers).map((sticker, index) => (
            <img
              key={`${sticker.name}-${index}`}
              src={sticker.imageUrl ?? undefined}
              alt={sticker.name}
              title={sticker.name}
              loading="lazy"
              decoding="async"
              width={stickerSize}
              height={stickerSize}
            />
          ))}
          {item.charms.map((charm, index) => (
            <span
              key={`${charm.name}-${index}`}
              className="ml-1 flex items-center gap-0.5 text-[11px] text-muted-foreground"
              title={
                charm.pattern === null
                  ? charm.name
                  : `${charm.name} — ${patternLabel} #${charm.pattern}`
              }
            >
              <img
                src={charm.imageUrl ?? undefined}
                alt={charm.name}
                loading="lazy"
                decoding="async"
                width={charmSize}
                height={charmSize}
              />
              {charm.pattern !== null && <span>#{charm.pattern}</span>}
            </span>
          ))}
        </div>
      )}
    </ItemLabel>
  );
}
