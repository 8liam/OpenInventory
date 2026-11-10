import { DARK_MEDIA_QUERY, DEFAULT_ACCENT_ID, THEME_DOM, THEME_TOKENS } from "./theme.config.ts";
import { accentOverrides, getPalette, pickVariant, resolveColorScheme } from "./theme.ts";
import type { AccentId, ColorScheme, PaletteId } from "./theme.types.ts";

/**
 * Writes the palette's tokens (then the accent's overrides) to the root element. Every token is
 * rewritten each time, so going back to the default accent clears the override. `data-theme`
 * stays the resolved light/dark value because Tailwind's `dark:` variant keys off it.
 */
export function applyTheme(
  colorScheme: ColorScheme,
  paletteId: PaletteId,
  accent: AccentId = DEFAULT_ACCENT_ID,
): void {
  const root = document.documentElement;
  const scheme = resolveColorScheme(colorScheme, window.matchMedia(DARK_MEDIA_QUERY).matches);
  const variant = pickVariant(getPalette(paletteId), scheme);
  for (const token of THEME_TOKENS) {
    root.style.setProperty(`${THEME_DOM.tokenPrefix}${token}`, variant[token]);
  }
  for (const [token, value] of Object.entries(accentOverrides(accent) ?? {})) {
    root.style.setProperty(`${THEME_DOM.tokenPrefix}${token}`, value);
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
