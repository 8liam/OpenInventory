export const BUTTON_VARIANT_CLASS = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-input bg-card hover:bg-accent",
  ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
} as const;

export const BUTTON_SIZE_CLASS = { regular: "h-8 px-3", small: "h-7 px-2.5 text-xs" } as const;
