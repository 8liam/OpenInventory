import type { ReactNode } from "react";

export type RevealProps = {
  readonly open: boolean;
  /** Content to show; the last non-null value stays mounted while the panel closes. */
  readonly children: ReactNode;
};
