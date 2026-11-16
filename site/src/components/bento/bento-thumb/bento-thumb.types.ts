import type { BentoItem } from "../bento.types";

export type BentoThumbProps = {
  readonly item: BentoItem;
  /** Edge length in px, as ItemThumb's `size`. */
  readonly size: number;
  readonly class?: string;
  /** Adds the shimmering skeleton that sits over an image while it loads. */
  readonly skeleton?: boolean;
};
