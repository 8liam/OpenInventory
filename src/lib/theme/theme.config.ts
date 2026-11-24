/** Every CSS custom property a palette variant must define (without the leading dashes). */
export const THEME_TOKENS = [
  "background",
  "foreground",
  "card",
  "muted",
  "muted-foreground",
  "border",
  "input",
  "accent",
  "accent-foreground",
  "accent-strong",
  "primary",
  "primary-foreground",
  "success",
  "destructive",
  "destructive-solid",
  "warning",
  "skeleton",
  "skeleton-highlight",
] as const;

export const COLOR_SCHEMES = ["system", "light", "dark"] as const;
export const RESOLVED_SCHEMES = ["light", "dark"] as const;
export const DEFAULT_COLOR_SCHEME = "system";

export const PALETTE_IDS = [
  "default",
  "catppuccin",
  "tokyo-night",
  "nord",
  "dracula",
  "gruvbox",
  "rose-pine",
  "solarized",
  "github",
  "one",
] as const;
export const DEFAULT_PALETTE_ID = "default";

export const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

export const THEME_DOM = {
  tokenPrefix: "--",
  colorSchemeProperty: "color-scheme",
} as const;

/** Basic readability floors enforced on every palette variant. */
export const MIN_CONTRAST = {
  text: 4.5,
  mutedText: 3.5,
  onPrimary: 4.5,
} as const;
