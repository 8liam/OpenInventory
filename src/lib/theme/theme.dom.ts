import { DARK_MEDIA_QUERY, THEME_DOM, THEME_TOKENS } from "./theme.config.ts";
import { getPalette, pickVariant, resolveColorScheme } from "./theme.ts";
import type { ColorScheme, PaletteId } from "./theme.types.ts";

/**
 * Writes the palette's tokens to the root element. `data-theme` stays the resolved
 * light/dark value because Tailwind's `dark:` variant keys off it.
 */
export function applyTheme(colorScheme: ColorScheme, paletteId: PaletteId): void {
  const root = document.documentElement;
  const scheme = resolveColorScheme(colorScheme, window.matchMedia(DARK_MEDIA_QUERY).matches);
  const variant = pickVariant(getPalette(paletteId), scheme);
  for (const token of THEME_TOKENS) {
    root.style.setProperty(`${THEME_DOM.tokenPrefix}${token}`, variant[token]);
  }
  root.style.setProperty(THEME_DOM.colorSchemeProperty, scheme);
  root.dataset.theme = scheme;
  root.dataset.palette = paletteId;
}

/** Re-applies the theme when the OS scheme flips; only matters while on "system". Returns an unsubscribe. */
export function watchSystemScheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_MEDIA_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
