import type { ReactNode } from "react";

export type SettingsRowProps = {
  readonly label: string;
  readonly description?: string;
  /** Extra lines under the description, such as a status or error message. */
  readonly detail?: ReactNode;
  readonly children?: ReactNode;
  /** Puts the control under the label at full width instead of beside it. */
  readonly stacked?: boolean;
  /** Id of the label element, for a control that names itself by it. */
  readonly labelId?: string;
};
