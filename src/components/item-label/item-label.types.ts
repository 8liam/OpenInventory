import type { ReactNode } from "react";
import type { ITEM_LABEL } from "./item-label.config";

export type ItemLabelNameFit = keyof typeof ITEM_LABEL.nameClass;

export type ItemLabelProps = {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly size: number;
  readonly customName?: string | null;
  /** Defaults to `responsive`; a fixed-height row passes the fit its height allows. */
  readonly nameFit?: ItemLabelNameFit;
  /** Rendered under the name, e.g. stickers. */
  readonly children?: ReactNode;
};
