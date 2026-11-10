import type {
  ACCENT_COLORS,
  ACCENT_IDS,
  COLOR_SCHEMES,
  PALETTE_IDS,
  RESOLVED_SCHEMES,
  THEME_TOKENS,
} from "./theme.config.ts";

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ColorScheme = (typeof COLOR_SCHEMES)[number];
export type ResolvedScheme = (typeof RESOLVED_SCHEMES)[number];
export type AccentId = (typeof ACCENT_IDS)[number];
export type AccentColorId = keyof typeof ACCENT_COLORS;
export type PaletteId = (typeof PALETTE_IDS)[number];

/** A missing token is a compile error. */
export type ThemeVariant = Readonly<Record<ThemeToken, string>>;

export type Palette = {
  readonly id: PaletteId;
  readonly name: string;
  readonly light: ThemeVariant;
  readonly dark: ThemeVariant;
};
