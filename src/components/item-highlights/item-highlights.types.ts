import type { ItemView } from "~/lib/items/item.types";

export type ItemHighlightsProps = {
  readonly item: ItemView;
};

export type ItemTierMarkerProps = ItemHighlightsProps & {
  readonly className?: string;
};
