import type { ReactNode } from "react";

export type SettingsSectionProps = {
  readonly title: string;
  readonly description?: string;
  /** A control beside the title, such as an add button. */
  readonly action?: ReactNode;
  /** Rows (or one list of them); hairlines separate the direct children. */
  readonly children: ReactNode;
  /** Content sits directly under the title instead of in a bordered card (pickers made of cards). */
  readonly plain?: boolean;
};
