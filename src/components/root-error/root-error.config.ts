export const ROOT_ERROR = {
  title: "Something went wrong",
  body: "The page hit an unexpected error and stopped. Your inventory data is not affected.",
  reload: "Reload the app",
  headingId: "root-error-heading",
  classes: {
    root: "mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-4 p-6 outline-none",
    title: "text-lg font-semibold tracking-tight",
    body: "text-muted-foreground",
    detail:
      "overflow-x-auto rounded-md border bg-card p-3 text-xs text-muted-foreground whitespace-pre-wrap break-words",
    actions: "flex flex-wrap gap-2",
  },
} as const;
