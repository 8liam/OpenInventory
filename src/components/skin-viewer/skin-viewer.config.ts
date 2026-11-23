export const SKIN_VIEWER = {
  iconSize: 14,
  buttonLabel: "Inspect in 3D",
  dialogTitle: "3D preview",
  closeLabel: "Close",
  loadingLabel: "Loading 3D preview…",
  errorLabel: "This skin could not be shown in 3D.",
  retryLabel: "Retry",
  /** How long the embed may stay silent before the dialog offers a retry (e.g. a blocked iframe). */
  loadTimeoutMs: 15_000,
  consent: {
    heading: "Load the 3D preview?",
    body: "The preview is drawn by 3d.chainskins.net. Opening it sends the skin's weapon, finish, float and pattern to that site, and your browser connects to it directly.",
    confirmLabel: "Load preview",
    cancelLabel: "Not now",
  },
  frame: {
    allow: "fullscreen",
    referrerPolicy: "no-referrer",
    sandbox: "allow-scripts allow-same-origin",
  },
  classes: {
    button:
      "inline-flex size-6 items-center justify-center rounded-md border bg-background/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    dialog:
      "m-auto w-[min(90vw,960px)] rounded-lg border bg-card p-0 text-foreground backdrop:bg-black/70",
    body: "flex flex-col gap-3 p-4",
    header: "flex items-center justify-between gap-2",
    title: "truncate font-semibold",
    note: "text-sm text-muted-foreground",
    actions: "flex justify-end gap-2",
    stage: "relative aspect-video w-full overflow-hidden rounded-md bg-muted",
    frame: "absolute inset-0 size-full border-0",
    status:
      "absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
  },
} as const;
