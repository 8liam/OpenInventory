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
  /** Edges of inputs, tracks and checkboxes; at least 3:1 against the card and the page. */
  "control-border",
  /** A 1px line round accent fills where the fill alone is too faint against the page. */
  "accent-edge",
  /** The same edge for primary buttons. */
  "primary-edge",
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
  /** Non-text contrast (WCAG 1.4.11) for control edges. */
  control: 3,
} as const;
