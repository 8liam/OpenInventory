import type { TerminalOffer } from "~/lib/items/item.types";

export type OfferPanelProps = {
  readonly terminalId: string;
};

export type OfferCardProps = {
  readonly offer: TerminalOffer;
  readonly currency: string;
};
