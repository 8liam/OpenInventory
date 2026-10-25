import { HighlightPlayer } from "~/components/highlight-player/highlight-player.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatDateTime } from "~/utils/format";
import { Link } from "@tanstack/react-router";
import { TerminalActivate } from "~/components/terminal-activate/terminal-activate.component";
import { INVENTORY_LOCATION_ID } from "~/lib/items/item.types";
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
          <TerminalActivate itemId={item.id} name={item.name} />
        )}
      {item.terminal?.isActive === true && item.locationId === INVENTORY_LOCATION_ID && (
        <Link to="/terminals" className="text-[11px] text-muted-foreground hover:text-foreground">
          {COPY.terminal.viewOffer}
        </Link>
      )}
      {item.videoUrl !== null && <HighlightPlayer videoUrl={item.videoUrl} title={item.name} />}
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
              {charm.videoUrl !== null && (
                <HighlightPlayer videoUrl={charm.videoUrl} title={charm.name} />
              )}
            </span>
          ))}
        </div>
      )}
    </ItemLabel>
  );
}
