import type { ReactNode } from "react";

export type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  /** The one account a single-account page acts on, shown as a chip beside the title. */
  readonly account?: string;
  readonly children?: ReactNode;
};
