import type { TerminalOffer } from "~/lib/items/item.types";

export type OfferPanelProps = {
  readonly terminalId: string;
  /** The account that owns the Terminal; offers are asked of that account only. */
  readonly accountId: string;
};

export type OfferCardProps = {
  readonly offer: TerminalOffer;
  readonly currency: string;
};
