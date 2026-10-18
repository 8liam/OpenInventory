import { cn } from "~/utils/cn";
import { ITEM_THUMB } from "./item-thumb.config";
import type { ItemThumbProps } from "./item-thumb.types";

export function ItemThumb({ imageUrl, rarityColor, size, className }: ItemThumbProps) {
  const { angle, tintPercent, tintFalloff } = ITEM_THUMB;
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-md bg-muted", className)}
      style={{
        width: size,
        height: size,
        backgroundImage: rarityColor
          ? `linear-gradient(${angle}deg, color-mix(in srgb, ${rarityColor} ${tintPercent}%, transparent), transparent ${tintFalloff}%)`
          : undefined,
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          className="size-full object-contain p-0.5 drop-shadow-sm"
        />
      )}
    </div>
  );
}
