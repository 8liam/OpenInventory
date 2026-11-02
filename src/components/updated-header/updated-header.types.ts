import type { ReactNode } from "react";

export type UpdatedHeaderProps = {
  readonly title: string;
  /** Epoch ms of the last price update; null/undefined falls back to the source-only text. */
  readonly priceUpdatedAt: number | null | undefined;
  readonly source: string;
  readonly children?: ReactNode;
};
