import type { ReactNode } from "react";
import type { ItemView } from "~/lib/items/item.types";

export type ItemHighlightsProps = {
  readonly item: ItemView;
  /** Extra inline content kept on the same line, such as sticker thumbnails. */
  readonly children?: ReactNode;
  /** Chips shown before `+N` at every width; by default it follows the viewport (narrow vs wide). */
  readonly visible?: number;
  /** Shows every chip and wraps them onto further lines, instead of folding the rest into `+N`. */
  readonly wrap?: boolean;
};

export type ItemTierBadgeProps = {
  readonly item: ItemView;
  readonly className?: string;
  /** Inside a control that already names the tier, so the badge is visual only. */
  readonly decorative?: boolean;
};
