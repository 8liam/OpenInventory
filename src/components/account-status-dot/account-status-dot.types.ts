import type { AuthStatus } from "~/lib/storage/storage.types";

export type AccountStatusDotProps = {
  readonly status: AuthStatus;
  /** Replaces the default status text, e.g. a summary for several accounts. */
  readonly text?: string;
  /** Shows the text beside the dot; otherwise it is screen-reader only. */
  readonly showText?: boolean;
  /** Omits the text entirely, for places where the status is already written out nearby. */
  readonly decorative?: boolean;
  readonly className?: string;
};
