import type { ColorScheme } from "~/lib/theme/theme.types";

export const COLOR_SCHEME_PICKER = {
  /** How each choice is previewed. */
  previewMode: {
    system: "split",
    light: "light",
    dark: "dark",
  } as const satisfies Record<ColorScheme, "light" | "dark" | "split">,
  classes: {
    group: "grid grid-cols-1 gap-3 @xl:grid-cols-3",
    card: "flex flex-col gap-2 rounded-lg border bg-card p-2.5 text-center text-muted-foreground transition-colors hover:bg-muted",
    /** Selected: ink border plus a semibold label, so it reads without colour. */
    selected:
      "border-accent-ink font-semibold text-foreground outline outline-1 outline-accent-ink",
    label: "pb-0.5 text-[13px]",
  },
} as const;
