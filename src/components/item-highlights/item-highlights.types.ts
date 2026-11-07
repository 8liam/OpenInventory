import type { ItemView } from "~/lib/items/item.types";

export type ItemHighlightsProps = {
  readonly item: ItemView;
};

export type ItemTierBadgeProps = ItemHighlightsProps & {
  readonly className?: string;
};
