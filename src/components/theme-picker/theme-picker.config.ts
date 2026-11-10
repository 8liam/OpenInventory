import type { ThemeToken } from "~/lib/theme/theme.types";

export const THEME_PICKER = {
  /** Tokens previewed on each card, in order. */
  swatches: ["background", "card", "accent", "primary"] satisfies readonly ThemeToken[],
  checkIconSize: 14,
  gridClass: "grid grid-cols-2 gap-2 @2xl:grid-cols-3 @5xl:grid-cols-5",
  cardClass:
    "relative flex flex-col gap-2 rounded-md border bg-background p-2.5 text-left transition-colors hover:bg-muted",
  selectedClass: "border-primary",
  nameClass: "truncate pr-5 text-xs font-medium",
  swatchRowClass: "flex",
  swatchClass: "size-5 rounded-full border first:ml-0 -ml-1.5",
  checkClass: "absolute right-2 top-2 text-primary",
} as const;
