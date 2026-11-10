import { readableTextOn } from "../../utils/contrast.ts";
import { ACCENT_COLORS } from "./theme.config.ts";
import { PALETTES } from "./palettes.config.ts";
import type {
  AccentId,
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

/** The tokens an accent overrides, or null for "default". The foreground is whichever of black/white reads best. */
export function accentOverrides(
  accent: AccentId,
): Readonly<Record<"primary" | "primary-foreground", string>> | null {
  if (accent === "default") return null;
  const primary = ACCENT_COLORS[accent];
  return { primary, "primary-foreground": readableTextOn(primary) };
}
