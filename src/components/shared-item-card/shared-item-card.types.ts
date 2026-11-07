import type { SharedItem } from "~/lib/shares/share.types";

export type SharedItemCardProps = {
  readonly item: SharedItem;
  /** Null when the owner hid prices, so no price line is shown. */
  readonly currency: string | null;
};
