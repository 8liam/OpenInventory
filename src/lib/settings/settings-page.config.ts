export const SETTINGS_PAGE = {
  /** The panels scroll under the page header, like every other page's content. */
  scrollClass: "@container min-h-0 flex-1 overflow-y-auto pb-4",
  /** One readable column while narrow; accounts and data beside the preferences once the content is wide. */
  layoutClass:
    "grid max-w-xl grid-cols-1 items-start gap-3 @3xl:max-w-5xl @3xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]",
  columnClass: "flex min-w-0 flex-col gap-3",
  selectWidth: "w-40",
  refreshIconSize: 14,
} as const;
