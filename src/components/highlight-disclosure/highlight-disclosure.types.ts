import type { ItemView } from "~/lib/items/item.types";

export type HighlightDisclosureProps = {
  readonly item: ItemView;
  /** Adds the number of reasons beside the tier badge, for rows with no room for chips. */
  readonly showCount?: boolean;
};

/** Where the open panel sits, in viewport pixels (it is `position: fixed`). */
export type HighlightDisclosurePlacement = {
  readonly left: number;
  readonly width: number;
  readonly top?: number;
  readonly bottom?: number;
  readonly maxHeight: number;
};
