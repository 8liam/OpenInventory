import type { PaletteId } from "~/lib/theme/theme.types";

export type ThemePickerProps = {
  readonly value: PaletteId;
  readonly onChange: (id: PaletteId) => void;
  readonly ariaLabel: string;
};
