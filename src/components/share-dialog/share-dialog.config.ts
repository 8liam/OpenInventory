export const SHARE_DIALOG = {
  dialogClass:
    "m-auto w-[min(92vw,30rem)] rounded-lg border bg-card p-0 text-foreground backdrop:bg-black/70",
  linkInputClass:
    "h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2.5 font-mono text-xs outline-none focus:border-primary",
  selectWidth: "w-40",
  bodyClass: "flex flex-col gap-3 p-5",
  /** Links never expire unless the owner asks for it. */
  defaultExpiry: "never",
} as const;
