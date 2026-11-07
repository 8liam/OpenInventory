import type { ReactNode } from "react";

export type AccountGateProps = {
  /** The current route, to know whether it can show every account at once. */
  readonly pathname: string;
  readonly children: ReactNode;
};
