export const ACCOUNT_ROW = {
  labelSelectWidth: "w-28",
  noLabelId: "none",
  /**
   * Every row lays out the same way for the panel's width: name and controls side by side when
   * both fit (a long name truncates), otherwise the controls drop under the name on every row.
   */
  rowClass: "@container flex flex-col gap-2 py-3 first:pt-0 last:pb-0",
  headClass:
    "flex flex-col gap-2 @min-[28rem]:flex-row @min-[28rem]:items-center @min-[28rem]:justify-between @min-[28rem]:gap-3",
  identityClass: "flex min-w-0 items-center gap-2",
  statusClass: "shrink-0 text-xs text-muted-foreground",
  controlsClass: "flex shrink-0 items-center gap-2",
  savingClass: "text-xs text-muted-foreground",
  problemClass: "flex flex-col gap-2 pl-3.5",
  problemTextClass: "text-xs text-destructive",
  errorClass: "text-xs text-destructive",
} as const;
