import { useState } from "react";
import { isImageLoaded, markImageLoaded } from "~/lib/images/image-preload";
import { cn } from "~/utils/cn";
import { ITEM_THUMB } from "./item-thumb.config";
import type { ItemThumbProps } from "./item-thumb.types";

export function ItemThumb({ imageUrl, rarityColor, size, className }: ItemThumbProps) {
  const { angle, tintPercent, tintFalloff } = ITEM_THUMB;
  const [loadedUrl, setLoadedUrl] = useState<string>();
  // A URL decoded earlier (or preloaded) shows at once instead of fading in again.
  const loaded = imageUrl !== null && (loadedUrl === imageUrl || isImageLoaded(imageUrl));
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundImage: rarityColor
          ? `linear-gradient(${angle}deg, color-mix(in srgb, ${rarityColor} ${tintPercent}%, transparent), transparent ${tintFalloff}%)`
          : undefined,
      }}
    >
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
          className={cn(
            "size-full object-contain p-0.5 drop-shadow-sm transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}
    </div>
  );
}
