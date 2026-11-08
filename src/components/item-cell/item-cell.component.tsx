import { HighlightPlayer } from "~/components/highlight-player/highlight-player.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatDateTime } from "~/utils/format";
import { Link } from "@tanstack/react-router";
import { TerminalActivate } from "~/components/terminal-activate/terminal-activate.component";
import { INVENTORY_LOCATION_ID } from "~/lib/items/item.types";
import { ItemLabel } from "~/components/item-label/item-label.component";
import { ItemHighlights } from "~/components/item-highlights/item-highlights.component";
import { AccountName } from "~/components/account-name/account-name.component";
import { HighlightDisclosure } from "~/components/highlight-disclosure/highlight-disclosure.component";
import { itemHighlights } from "~/lib/items/highlights";
import { ITEM_CELL } from "./item-cell.config";
import type { ItemCellProps } from "./item-cell.types";

export function ItemCell({ item, account, detail, compact = false, nameFit }: ItemCellProps) {
  const { imageSize, stickerSize, charmSize, maxStickers, patternLabel } = ITEM_CELL;
  // A sticker without an image would render as a broken-image glyph; its name is in the item data.
  const stickers = item.stickers
    .filter((sticker) => sticker.imageUrl !== null)
    .slice(0, maxStickers);
  const hasAttachments = stickers.length > 0 || item.charms.length > 0;
  const { tier, reasons } = itemHighlights(item);
  const hasHighlights = tier !== null || reasons.length > 0;
  const attachments = hasAttachments && (
    <span className="flex shrink-0 items-center gap-0.5">
      {stickers.map((sticker, index) => (
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
          {charm.imageUrl !== null && (
            <img
              src={charm.imageUrl}
              alt={charm.name}
              loading="lazy"
              decoding="async"
              width={charmSize}
              height={charmSize}
            />
          )}
          {charm.pattern !== null && <span>#{charm.pattern}</span>}
          {charm.videoUrl !== null && (
            <HighlightPlayer videoUrl={charm.videoUrl} title={charm.name} />
          )}
        </span>
      ))}
    </span>
  );
  return (
    <ItemLabel
      name={item.name}
      imageUrl={item.imageUrl}
      rarityColor={item.rarityColor}
      customName={item.customName}
      size={imageSize}
      nameFit={nameFit}
      compactOnNarrow={compact}
    >
      {detail && (
        <p className={ITEM_CELL.detailClass} title={detail}>
          {detail}
        </p>
      )}
      {account && <AccountName name={account} className={ITEM_CELL.accountClass} />}
      {item.pattern !== null && !compact && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {patternLabel} #{item.pattern}
        </p>
      )}
      {item.terminal !== null && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.terminal.isActive ? COPY.terminal.active : COPY.terminal.sealed}
          {item.terminal.expiresAt !== null &&
            ` · ${COPY.terminal.expires} ${formatDateTime(item.terminal.expiresAt)}`}
        </p>
      )}
      {item.terminal !== null &&
        !item.terminal.isActive &&
        item.locationId === INVENTORY_LOCATION_ID && (
          <TerminalActivate itemId={item.id} accountId={item.accountId} name={item.name} />
        )}
      {item.terminal?.isActive === true && item.locationId === INVENTORY_LOCATION_ID && (
        <Link to="/terminals" className="text-[11px] text-muted-foreground hover:text-foreground">
          {COPY.terminal.viewOffer}
        </Link>
      )}
      {item.videoUrl !== null && <HighlightPlayer videoUrl={item.videoUrl} title={item.name} />}
      {/* Reasons and attachments share one line, so the row keeps its fixed height. */}
      {compact ? (
        (hasAttachments || hasHighlights) && (
          <div className={ITEM_CELL.compactLineClass}>
            <HighlightDisclosure item={item} showCount />
            {attachments}
          </div>
        )
      ) : (
        <ItemHighlights item={item}>{attachments}</ItemHighlights>
      )}
    </ItemLabel>
  );
}
