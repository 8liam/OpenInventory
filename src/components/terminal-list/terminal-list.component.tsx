import { useState } from "react";
import { ItemLabel } from "~/components/item-label/item-label.component";
import { OfferPanel } from "~/components/offer-panel/offer-panel.component";
import { Panel } from "~/components/panel/panel.component";
import { TerminalActivate } from "~/components/terminal-activate/terminal-activate.component";
import { COPY } from "~/lib/copy/copy.config";
import { INVENTORY_LOCATION_ID, type ItemView } from "~/lib/items/item.types";
import { formatDateTime } from "~/utils/format";
import { TERMINAL_LIST } from "./terminal-list.config";
import type { TerminalListProps } from "./terminal-list.types";

function expiryText(expiresAt: number, now: number): string {
  const remaining = expiresAt - now;
  if (remaining <= 0) return COPY.terminal.expired;
  const days = Math.floor(remaining / TERMINAL_LIST.dayMs);
  const hours = Math.floor((remaining % TERMINAL_LIST.dayMs) / TERMINAL_LIST.hourMs);
  const span = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  return `${COPY.terminal.expiresIn} ${span} (${formatDateTime(expiresAt)})`;
}

function TerminalLabel({ item }: { readonly item: ItemView }) {
  return (
    <ItemLabel
      name={item.name}
      imageUrl={item.imageUrl}
      rarityColor={item.rarityColor}
      customName={item.customName}
      size={TERMINAL_LIST.imageSize}
    />
  );
}

/** Active Terminals (with their offers) first, then sealed ones that can be activated. */
export function TerminalList({ terminals }: TerminalListProps) {
  const [now] = useState(() => Date.now());
  const active = terminals.filter((t) => t.terminal?.isActive === true);
  const sealed = terminals.filter((t) => t.terminal?.isActive === false);
  return (
    <div className="flex flex-col gap-4">
      {active.length > 0 && (
        <Panel title={COPY.terminal.activeHeading}>
          <div className="flex flex-col gap-6">
            {active.map((item) => (
              <div key={item.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <TerminalLabel item={item} />
                  {item.terminal?.expiresAt != null && (
                    <span className="text-xs text-muted-foreground">
                      {expiryText(item.terminal.expiresAt, now)}
                    </span>
                  )}
                </div>
                {item.locationId === INVENTORY_LOCATION_ID && <OfferPanel terminalId={item.id} />}
              </div>
            ))}
          </div>
        </Panel>
      )}
      {sealed.length > 0 && (
        <Panel title={COPY.terminal.sealedHeading}>
          <div className="flex flex-col gap-3">
            {sealed.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2">
                <TerminalLabel item={item} />
                {item.locationId === INVENTORY_LOCATION_ID ? (
                  <TerminalActivate itemId={item.id} name={item.name} />
                ) : (
                  <span className="text-xs text-muted-foreground">{COPY.terminal.inStorage}</span>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
