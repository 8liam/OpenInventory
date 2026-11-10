import { PALETTES } from "./palettes.config.ts";
import type {
  ColorScheme,
  Palette,
  PaletteId,
  ResolvedScheme,
  ThemeVariant,
} from "./theme.types.ts";

export function resolveColorScheme(
  colorScheme: ColorScheme,
  systemPrefersDark: boolean,
): ResolvedScheme {
  if (colorScheme === "system") return systemPrefersDark ? "dark" : "light";
  return colorScheme;
}

export function pickVariant(palette: Palette, scheme: ResolvedScheme): ThemeVariant {
  return palette[scheme];
}

export function getPalette(id: PaletteId): Palette {
  return PALETTES[id];
}
