export const ITEM_INSPECT_DIALOG = {
  closeLabel: "Close",
  classes: {
    dialog:
      "m-auto flex max-h-[90dvh] whitespace-normal w-[min(94vw,30rem)] flex-col overflow-hidden rounded-lg border border-border-strong bg-card p-0 text-foreground backdrop:bg-black/60",
    header: "flex shrink-0 items-start justify-between gap-2 border-b px-4 py-3",
    title: "min-w-0 break-words font-semibold leading-snug",
    body: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
  },
} as const;
