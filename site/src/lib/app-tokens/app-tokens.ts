import { CHART_PALETTE } from "~/lib/theme/chart-palette.config";
import { PALETTES } from "~/lib/theme/palettes.config";
import { THEME_DOM, THEME_TOKENS } from "~/lib/theme/theme.config";
import { APP_TOKENS } from "./app-tokens.config";

const declaration = (name: string, value: string): string =>
  `${THEME_DOM.tokenPrefix}${name}: ${value};`;

const numbered = (prefix: string, values: readonly string[]): string[] =>
  values.map((value, index) => declaration(`${prefix}-${index + 1}`, value));

/**
 * The app's palette and chart colours as one CSS rule for the demo scope, read straight from the
 * app's config at build time so the demos can never drift from the app.
 */
export function appTokenCss(): string {
  const variant = PALETTES[APP_TOKENS.palette][APP_TOKENS.scheme];
  const declarations = [
    ...THEME_TOKENS.map((token) => declaration(token, variant[token])),
    ...numbered(APP_TOKENS.chartPrefix, CHART_PALETTE.categorical[APP_TOKENS.scheme]),
    ...numbered(APP_TOKENS.wearPrefix, CHART_PALETTE.wear[APP_TOKENS.scheme]),
  ];
  return `${APP_TOKENS.selector}{${declarations.join("")}}`;
}
