import type { ReactNode } from "react";
import type { ItemView } from "~/lib/items/item.types";

export type ItemHighlightsProps = {
  readonly item: ItemView;
  /** Extra inline content kept on the same line, such as sticker thumbnails. */
  readonly children?: ReactNode;
};

export type ItemTierBadgeProps = {
  readonly item: ItemView;
  readonly className?: string;
};

export type ItemHighlightCellProps = { readonly item: ItemView };
