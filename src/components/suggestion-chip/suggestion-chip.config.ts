export const SUGGESTION_CHIP = {
  labels: { spike: "Spike", decline: "Declining", idleStack: "Idle stack" },
  /** Window each percentage refers to, shown after it. */
  windows: { spike: "30d avg", decline: "90d avg" },
  idleSuffix: "in storage",
  classes: {
    spike: "border-warning/50 text-warning",
    decline: "border-destructive/50 text-destructive",
    idleStack: "border-border text-muted-foreground",
  },
} as const;
