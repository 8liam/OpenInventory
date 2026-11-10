import type { ReactNode } from "react";

export type TooltipProps = {
  /** Full item name, e.g. "Sticker | Natus Vincere | Katowice 2014". */
  readonly name: string;
  readonly imageUrl?: string | null;
  /** Extra line under the name, such as a charm's pattern. */
  readonly detail?: string;
  /** The icon the tooltip describes. */
  readonly children: ReactNode;
};

export type TooltipName = {
  /** The leading type ("Sticker", "Charm", "Patch"), or null when the name has none. */
  readonly kind: string | null;
  readonly title: string;
};

/** Where the bubble sits in viewport pixels: `left` is its horizontal centre. */
export type TooltipPlacement = {
  readonly left: number;
  readonly top?: number;
  readonly bottom?: number;
};

export type TooltipAnchor = {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
};

export type TooltipViewport = { readonly width: number; readonly height: number };
