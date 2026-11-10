import { Moon, Sun } from "lucide-react";
import type { ResolvedScheme, ThemeToken } from "~/lib/theme/theme.types";

export const THEME_PICKER = {
  orbIconSize: 12,
  schemeIcons: { light: Sun, dark: Moon } as const satisfies Record<ResolvedScheme, typeof Sun>,
  /** Gradient highlights painted over the variant's background, as [position, token, stop %]. */
  orbLayers: [
    ["72% 78%", "primary", 62],
    ["26% 24%", "accent", 54],
  ] as const satisfies readonly (readonly [string, ThemeToken, number])[],
  classes: {
    grid: "grid grid-cols-2 gap-3 @3xl:grid-cols-3",
    card: "flex flex-col gap-4 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted",
    selected: "border-primary/50",
    orbs: "flex items-center justify-center gap-5 py-1",
    orb: "relative size-[52px] shrink-0 rounded-full border",
    orbSelected: "ring-2 ring-primary ring-offset-[3px] ring-offset-card",
    badge:
      "absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border bg-background text-foreground",
    name: "truncate text-[13px] font-medium",
  },
} as const;
