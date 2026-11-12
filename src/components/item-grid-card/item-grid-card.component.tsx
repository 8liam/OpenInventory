import { Chip } from "~/components/chip/chip.component";
import { ChipRow } from "~/components/chip-row/chip-row.component";
import { ItemNoteChip } from "~/components/item-note-chip/item-note-chip.component";
import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { HighlightPlayer } from "~/components/highlight-player/highlight-player.component";
import { Tooltip } from "~/components/tooltip/tooltip.component";
import {
  ItemHighlights,
  ItemTierBadge,
} from "~/components/item-highlights/item-highlights.component";
import { splitItemName } from "~/components/item-label/item-label.utils";
import { charmTooltipDetail } from "~/lib/items/charm-tooltip";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney } from "~/utils/format";
import { AccountName } from "~/components/account-name/account-name.component";
import { ITEM_GRID_CARD } from "./item-grid-card.config";
import type { ItemGridCardProps } from "./item-grid-card.types";
import { splitWear } from "./item-grid-card.utils";

/** One item as a card: image, then name, price and highlights, with attachments, note and location pinned below. */
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
  const [weapon, fullSkin] = splitItemName(item.name);
  const { skin, wear } = splitWear(fullSkin, item.wearName);
  const { attachmentSize, maxStickers, thumbClass, selectRowLabel, classes } = ITEM_GRID_CARD;
  // A sticker without an image would render as a broken-image glyph; its name is in the item data.
  const stickers = item.stickers.filter((sticker) => sticker.imageUrl !== null);
  const hiddenStickers = stickers.length - maxStickers;
  const hasAttachments = stickers.length > 0 || item.charms.length > 0;
  const charmVideos = item.charms.filter((charm) => charm.videoUrl !== null);
  const hasChips = charmVideos.length > 0 || item.videoUrl !== null;
  const hasFooter = hasAttachments || hasChips || showLocation;
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
        {wear && <p className={classes.wear}>{wear}</p>}
      </div>
      <div className={classes.figures}>
        <p className={classes.price}>
          {item.price === null ? COPY.common.empty : formatMoney(item.price, currency)}
        </p>
        {status !== null && (
          <p
            className={classes.status}
            title={item.terminal === null ? COPY.itemColumns.float : undefined}
          >
            {status}
          </p>
        )}
      </div>
      <ItemHighlights item={item} wrap>
        {item.note !== null && <ItemNoteChip note={item.note} />}
      </ItemHighlights>
      {hasFooter && (
        <div className={classes.footer}>
          {hasAttachments && (
            <div className={classes.attachments}>
              {stickers.slice(0, maxStickers).map((sticker, stickerIndex) => (
                <Tooltip
                  key={`${sticker.name}-${stickerIndex}`}
                  name={sticker.name}
                  imageUrl={sticker.imageUrl}
                >
                  <img
                    src={sticker.imageUrl ?? undefined}
                    alt={sticker.name}
                    loading="lazy"
                    decoding="async"
                    width={attachmentSize}
                    height={attachmentSize}
                    className={classes.attachmentImage}
                  />
                </Tooltip>
              ))}
              {hiddenStickers > 0 && (
                <Chip
                  className="tabular"
                  title={stickers
                    .slice(maxStickers)
                    .map((sticker) => sticker.name)
                    .join(", ")}
                >
                  {COPY.items.moreHighlights(hiddenStickers)}
                </Chip>
              )}
              {item.charms.map((charm, charmIndex) => (
                <span key={`${charm.name}-${charmIndex}`} className={classes.charm}>
                  <Tooltip
                    name={charm.name}
                    imageUrl={charm.imageUrl}
                    detail={charmTooltipDetail(charm, currency)}
                  >
                    {charm.imageUrl === null ? (
                      <Chip>{charm.name}</Chip>
                    ) : (
                      <img
                        src={charm.imageUrl}
                        alt={charm.name}
                        loading="lazy"
                        decoding="async"
                        width={attachmentSize}
                        height={attachmentSize}
                        className={classes.attachmentImage}
                      />
                    )}
                  </Tooltip>
                  {charm.pattern !== null && <span className="tabular">#{charm.pattern}</span>}
                </span>
              ))}
            </div>
          )}
          {hasChips && (
            <ChipRow className={classes.chips}>
              {charmVideos.map((charm, charmIndex) => (
                <span
                  key={`${charm.name}-${charmIndex}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <HighlightPlayer videoUrl={charm.videoUrl ?? ""} title={charm.name} />
                </span>
              ))}
              {item.videoUrl !== null && (
                <span onClick={(event) => event.stopPropagation()}>
                  <HighlightPlayer videoUrl={item.videoUrl} title={item.name} />
                </span>
              )}
            </ChipRow>
          )}
          {showLocation && (
            <p className={classes.location}>
              {accountName && (
                <>
                  <AccountName name={accountName} className={classes.account} />
                  <span aria-hidden>{ITEM_GRID_CARD.locationSeparator}</span>
                </>
              )}
              <span className={classes.locationName}>{item.locationName}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
