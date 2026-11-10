import type { ThemeVariant } from "~/lib/theme/theme.types";

export type FlashbangProps = {
  /** The grenade is painted in this theme variant's colours. */
  readonly variant: ThemeVariant;
  /** Tilt in degrees; the art is drawn upright. */
  readonly angle?: number;
  readonly className?: string;
};
