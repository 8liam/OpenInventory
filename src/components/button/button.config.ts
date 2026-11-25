import type { ButtonVariant } from "./button.types";

export const BUTTON_VARIANT_CLASS = {
  /** One per view: the lime fill, with an ink edge on light where lime alone is 1.2:1. */
  primary:
    "border border-primary-edge bg-primary font-semibold text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-control bg-transparent hover:bg-muted",
  destructive:
    "border border-transparent bg-destructive-solid text-white hover:bg-destructive-solid-hover",
  ghost: "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
  /** A quieter destructive action for lists, where a solid red button per row would shout. */
  destructiveOutline: "border border-destructive/70 text-destructive hover:bg-destructive/10",
} as const satisfies Record<ButtonVariant, string>;

export const BUTTON_SIZE_CLASS = { regular: "h-8 px-3", small: "h-7 px-2 text-xs" } as const;

export const BUTTON_BASE_CLASS =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-45";
