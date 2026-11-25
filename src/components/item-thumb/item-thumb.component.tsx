import { useState } from "react";
import { isImageLoaded, markImageLoaded } from "~/lib/images/image-preload";
import { cn } from "~/utils/cn";
import { ITEM_THUMB } from "./item-thumb.config";
import type { ItemThumbProps } from "./item-thumb.types";

/** Shared one-layer mask. Only the paint colour changes between items. */
export function ItemThumbBackdrop({ rarityColor }: Pick<ItemThumbProps, "rarityColor">) {
  return (
    <span
      aria-hidden
      className={ITEM_THUMB.classes.backdrop}
      style={{ color: rarityColor ?? undefined }}
    />
  );
}

export function ItemThumb({
  imageUrl,
  rarityColor,
  showRarityBar = true,
  size,
  className,
}: ItemThumbProps) {
  const [loadedUrl, setLoadedUrl] = useState<string>();
  // A URL decoded earlier (or preloaded) shows at once instead of fading in again.
  const loaded = imageUrl !== null && (loadedUrl === imageUrl || isImageLoaded(imageUrl));
  return (
    <div className={cn(ITEM_THUMB.classes.root, className)} style={{ width: size, height: size }}>
      <ItemThumbBackdrop rarityColor={rarityColor} />
      {/* Rarity is item data: a 2px key along the bottom edge, never a wash. */}
      {showRarityBar && rarityColor && (
        <span
          aria-hidden
          className={ITEM_THUMB.classes.rarity}
          style={{ background: rarityColor }}
        />
      )}
      {imageUrl && !loaded && (
        <span aria-hidden className="skeleton absolute inset-0 rounded-[inherit] opacity-60" />
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          width={size}
          height={size}
          onLoad={() => {
            markImageLoaded(imageUrl);
            setLoadedUrl(imageUrl);
          }}
          onError={() => setLoadedUrl(imageUrl)}
          className={cn(ITEM_THUMB.classes.image, loaded ? "opacity-100" : "opacity-0")}
        />
      )}
    </div>
  );
}
