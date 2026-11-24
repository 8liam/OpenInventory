export const MONEY_FIGURE = {
  classes: {
    root: "figure inline-block whitespace-nowrap leading-[0.9]",
    /** The currency sign: smaller, raised, muted. Whole units read first. */
    sign: "mr-[0.06em] align-[0.62em] text-[0.42em] tracking-normal text-muted-foreground",
    whole: "",
    /** Cents step down to muted grey. */
    fraction: "text-muted-foreground",
  },
} as const;
