import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { CHIP_TONES } from "./chip.config";

export type ChipTone = (typeof CHIP_TONES)[number];

export type ChipProps = {
  readonly children: ReactNode;
  readonly icon?: LucideIcon;
  readonly tone?: ChipTone;
  readonly title?: string;
  readonly className?: string;
  /** Accessible name when the visible text alone is not enough (an `onClick` chip). */
  readonly ariaLabel?: string;
  /** Makes the whole chip a button. */
  readonly onClick?: () => void;
  /** Adds a remove button to the chip's end. */
  readonly onRemove?: () => void;
  readonly removeLabel?: string;
  /** Disables the remove button while its action is running. */
  readonly removing?: boolean;
};
