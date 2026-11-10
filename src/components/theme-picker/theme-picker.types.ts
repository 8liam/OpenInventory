import type { PaletteId, ResolvedScheme } from "~/lib/theme/theme.types";

export type ThemePickerProps = {
  readonly value: PaletteId;
  readonly onChange: (id: PaletteId) => void;
  /** Each grenade is painted in its theme as it looks in this scheme. */
  readonly scheme: ResolvedScheme;
  readonly ariaLabel: string;
};
