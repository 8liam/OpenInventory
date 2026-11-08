import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import {
  ItemHighlights,
  ItemTierBadge,
} from "~/components/item-highlights/item-highlights.component";
import { splitItemName } from "~/components/item-label/item-label.utils";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney } from "~/utils/format";
import { AccountName } from "~/components/account-name/account-name.component";
import { ITEM_GRID_CARD } from "./item-grid-card.config";
import type { ItemGridCardProps } from "./item-grid-card.types";

/** One item as a card: the same identity as a table row (thumbnail, weapon over skin), stacked. */
export function ItemGridCard({
  item,
  currency,
  showLocation,
  accountName,
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
  const { stickerSize, maxStickers, thumbClass, selectRowLabel, classes } = ITEM_GRID_CARD;
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
        classes.card,
        selectable && classes.cardSelectable,
        checked && classes.cardChecked,
      )}
    >
      <div className={classes.media}>
        <ItemThumb imageUrl={item.imageUrl} rarityColor={item.rarityColor} className={thumbClass} />
        <ItemTierBadge item={item} className={classes.tierBadge} />
        {selectable && (
          <label
            className={cn(
              ITEM_GRID_CARD.checkboxClass,
              checked || checkboxVisible ? classes.checkboxShown : classes.checkboxHidden,
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={onToggle}
              onClick={(event) => event.stopPropagation()}
              tabIndex={-1}
              aria-label={selectRowLabel}
              className={classes.checkbox}
            />
          </label>
        )}
      </div>
      <div className={classes.text}>
        {weapon && <p className={classes.weapon}>{weapon}</p>}
        <p className={classes.skin} title={item.name}>
          {skin}
          {item.customName && <span className={classes.muted}> “{item.customName}”</span>}
        </p>
      </div>
      <div className={classes.figures}>
        <p className={classes.price}>
          {item.price === null ? COPY.common.empty : formatMoney(item.price, currency)}
        </p>
        {status !== null && <p className={classes.status}>{status}</p>}
      </div>
      <ItemHighlights item={item} visible={ITEM_GRID_CARD.visibleHighlights} />
      {showLocation && (
        <p className={ITEM_GRID_CARD.locationClass}>
          {accountName && (
            <>
              <AccountName name={accountName} className={classes.account} />
              <span aria-hidden>{ITEM_GRID_CARD.locationSeparator}</span>
            </>
          )}
          <span className={classes.location}>{item.locationName}</span>
        </p>
      )}
      <div className={classes.attachments}>
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
          <span className={classes.charms}>
            {item.charms.map((charm) => charm.name).join(", ")}
          </span>
        )}
      </div>
    </div>
  );
}
