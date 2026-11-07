import type { ReactNode } from "react";

export type PanelProps = {
  readonly title?: ReactNode;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
};
