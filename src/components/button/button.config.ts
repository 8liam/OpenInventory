import type { ButtonVariant } from "./button.types";

export const BUTTON_VARIANT_CLASS = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-input bg-card hover:bg-muted",
  destructive: "bg-destructive text-white hover:opacity-90",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  /** A quieter destructive action for lists, where a solid red button per row would shout. */
  destructiveOutline: "border border-destructive/40 text-destructive hover:bg-destructive/10",
} as const satisfies Record<ButtonVariant, string>;

export const BUTTON_SIZE_CLASS = { regular: "h-8 px-3", small: "h-7 px-2.5 text-xs" } as const;
