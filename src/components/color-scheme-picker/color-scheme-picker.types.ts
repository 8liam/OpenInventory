import type { ColorScheme, Palette } from "~/lib/theme/theme.types";

export type ColorSchemePickerProps = {
  readonly value: ColorScheme;
  readonly onChange: (scheme: ColorScheme) => void;
  /** Previews are painted in this palette. */
  readonly palette: Palette;
  readonly labels: Readonly<Record<ColorScheme, string>>;
  readonly ariaLabel: string;
};
