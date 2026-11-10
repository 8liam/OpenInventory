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

/** "default" leaves the palette's own primary colour alone. */
export const ACCENT_IDS = [
  "default",
  "blue",
  "violet",
  "pink",
  "red",
  "orange",
  "amber",
  "green",
  "teal",
] as const;
export const DEFAULT_ACCENT_ID = "default";

/** Primary colour each accent swaps in, in both schemes. */
export const ACCENT_COLORS = {
  blue: "#3b82f6",
  violet: "#8b5cf6",
  pink: "#ec4899",
  red: "#ef4444",
  orange: "#f97316",
  amber: "#eab308",
  green: "#22c55e",
  teal: "#14b8a6",
} as const;

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
