export const SETTINGS_ROW = {
  rowClass: "flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 px-4 py-3",
  stackedClass: "flex flex-col gap-3 px-4 py-3",
  /** Beside the control the text takes the free width; `basis-56` is a width, so it must not apply to a stacked column, where it becomes a 224px height. */
  textClass: "min-w-0 flex-1 basis-56",
  stackedTextClass: "min-w-0",
  labelClass: "font-medium",
  descriptionClass: "mt-0.5 text-xs text-muted-foreground",
  controlClass: "max-w-full shrink-0",
} as const;
