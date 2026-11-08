import type { ReactNode } from "react";

export type SelectOption = {
  readonly id: string;
  readonly label: string;
  /** Quiet text on the right of the row, such as an item count. */
  readonly detail?: string;
  /** Quiet text kept whole beside the label in the trigger while the label truncates, e.g. a SteamID tail. */
  readonly triggerDetail?: string;
  /** A second, quieter line under the label, such as an account's status. */
  readonly hint?: string;
  /** Shown before the label, in the list and (for the chosen option) the trigger, e.g. a status dot. */
  readonly leading?: ReactNode;
  readonly disabled?: boolean;
};

export type SelectProps = {
  readonly value: string;
  readonly options: readonly SelectOption[];
  readonly onChange: (id: string) => void;
  readonly ariaLabel: string;
  readonly disabled?: boolean;
  readonly className?: string;
  /** The open list is at least this wide (px), so long names aren't cut short in a narrow trigger. */
  readonly listMinWidth?: number;
  /** Id of extra text read after the trigger's name, e.g. the chosen account's connection status. */
  readonly describedBy?: string;
};

/** Where the open list sits, in viewport pixels (it is `position: fixed`). */
export type SelectPlacement = {
  readonly left: number;
  readonly width: number;
  readonly top?: number;
  readonly bottom?: number;
  readonly maxHeight: number;
};
