import { ItemLabel } from "~/components/item-label/item-label.component";
import { ITEM_CELL } from "./item-cell.config";
import type { ItemCellProps } from "./item-cell.types";

export function ItemCell({ item }: ItemCellProps) {
  const { imageSize, stickerSize, maxStickers } = ITEM_CELL;
  return (
    <ItemLabel
      name={item.name}
      imageUrl={item.imageUrl}
      rarityColor={item.rarityColor}
      customName={item.customName}
      size={imageSize}
    >
      {item.stickers.length > 0 && (
        <div className="mt-1 flex gap-0.5">
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
        </div>
      )}
    </ItemLabel>
  );
}
