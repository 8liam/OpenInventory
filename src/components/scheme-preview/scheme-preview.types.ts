import type { ThemeVariant } from "~/lib/theme/theme.types";

export type SchemePreviewProps = {
  /** Previewed in these colours; "split" shows the light variant on the left and the dark on the right. */
  readonly variants: { readonly light: ThemeVariant; readonly dark: ThemeVariant };
  readonly mode: "light" | "dark" | "split";
};

export type MiniUiProps = {
  readonly variant: ThemeVariant;
};
