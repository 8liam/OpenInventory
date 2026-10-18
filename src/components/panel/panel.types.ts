import type { ReactNode } from "react";

export type PanelProps = {
  readonly title?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
};
