import type { ReactNode } from "react";

export type SettingsSectionProps = {
  readonly title: string;
  readonly description?: string;
  /** A control beside the title, such as an add button. */
  readonly action?: ReactNode;
  /** Rows (or one list of them); hairlines separate the direct children. */
  readonly children: ReactNode;
};
