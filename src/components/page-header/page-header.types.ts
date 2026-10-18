import type { ReactNode } from "react";

export type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly children?: ReactNode;
};
