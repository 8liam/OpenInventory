import type { ReactNode } from "react";

export type ItemLabelProps = {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly size: number;
  readonly customName?: string | null;
  /** Rendered under the name, e.g. stickers. */
  readonly children?: ReactNode;
};
