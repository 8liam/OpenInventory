import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import {
  ItemHighlights,
  ItemTierBadge,
} from "~/components/item-highlights/item-highlights.component";
import { splitItemName } from "~/components/item-label/item-label.utils";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney } from "~/utils/format";
import { ITEM_GRID_CARD } from "./item-grid-card.config";
import type { ItemGridCardProps } from "./item-grid-card.types";

/** One item as a card: the same identity as a table row (thumbnail, weapon over skin), stacked. */
export function ItemGridCard({
  item,
  currency,
  showLocation,
  index,
  selectable,
  checked,
  checkboxVisible,
  tabIndex,
  onToggle,
  onFocus,
  onKeyDown,
}: ItemGridCardProps) {
  const [weapon, skin] = splitItemName(item.name);
  const { stickerSize, maxStickers, thumbClass, selectRowLabel } = ITEM_GRID_CARD;
  const status =
    item.terminal !== null
      ? item.terminal.isActive
        ? COPY.terminal.active
        : COPY.terminal.sealed
      : item.wear !== null
        ? formatFloat(item.wear)
        : null;
  return (
    <div
      role="gridcell"
      aria-selected={selectable ? checked : undefined}
      data-card-index={index}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={selectable ? onToggle : undefined}
      className={cn(
        "group relative flex h-full min-w-0 flex-col rounded-lg border bg-card p-3 text-left transition-colors focus-visible:outline-offset-2",
        selectable && "cursor-pointer hover:bg-muted",
        checked && "border-primary/60 bg-muted",
      )}
    >
      <div className="relative">
        <ItemThumb imageUrl={item.imageUrl} rarityColor={item.rarityColor} className={thumbClass} />
        <ItemTierBadge item={item} className="absolute right-1.5 top-1.5 bg-background/80" />
        {selectable && (
          <label
            className={cn(
              "absolute left-1.5 top-1.5 flex rounded bg-background/80 p-1 transition-opacity [@media(hover:none)]:opacity-100",
              checked || checkboxVisible
                ? "opacity-100"
                : "opacity-0 focus-within:opacity-100 group-hover:opacity-100",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={onToggle}
              onClick={(event) => event.stopPropagation()}
              tabIndex={-1}
              aria-label={selectRowLabel}
              className="size-4 accent-primary"
            />
          </label>
        )}
      </div>
      <div className="mt-2.5 min-w-0">
        {weapon && (
          <p className="mb-0.5 truncate text-[11px] uppercase leading-none tracking-wide text-muted-foreground">
            {weapon}
          </p>
        )}
        <p className="truncate leading-tight" title={item.name}>
          {skin}
          {item.customName && <span className="text-muted-foreground"> “{item.customName}”</span>}
        </p>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="tabular text-sm font-medium">
          {item.price === null ? COPY.common.empty : formatMoney(item.price, currency)}
        </p>
        {status !== null && (
          <p className="tabular shrink-0 text-xs text-muted-foreground">{status}</p>
        )}
      </div>
      <ItemHighlights item={item} />
      {showLocation && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.locationName}</p>
      )}
      <div className="mt-auto flex h-6 items-end gap-0.5 overflow-hidden">
        {item.stickers
          .filter((sticker) => sticker.imageUrl !== null)
          .slice(0, maxStickers)
          .map((sticker, stickerIndex) => (
            <img
              key={`${sticker.name}-${stickerIndex}`}
              src={sticker.imageUrl ?? undefined}
              alt={sticker.name}
              title={sticker.name}
              loading="lazy"
              decoding="async"
              width={stickerSize}
              height={stickerSize}
            />
          ))}
        {item.charms.length > 0 && (
          <span className="ml-1 text-[11px] text-muted-foreground">
            {item.charms.map((charm) => charm.name).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
