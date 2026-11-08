import type { ReactNode } from "react";

export type UpdatedHeaderProps = {
  readonly title: string;
  /** Epoch ms of the last price update; null/undefined falls back to the source-only text. */
  readonly priceUpdatedAt: number | null | undefined;
  readonly source: string;
  /** The one account the page acts on, shown as a chip beside the title. */
  readonly account?: string;
  readonly children?: ReactNode;
};
