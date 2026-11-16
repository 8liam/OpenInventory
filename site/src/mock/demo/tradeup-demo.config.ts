/** The inline panel lists only the cheapest skins and best outcomes; the dialog lists every one. */
export const TRADEUP_DEMO = {
  inlineCandidateCap: 5,
  inlineOutcomeCap: 4,
  /** Metrics: five across in the cropped panel; 5 across when the dialog stacks, 3 + 2 beside the inputs from xl. */
  inlineMetricsClass: "grid grid-cols-5 gap-2.5",
  dialogMetricsClass:
    "grid grid-cols-2 gap-3 lg:grid-cols-5 xl:grid-cols-6 xl:[&>*]:col-span-2 xl:[&>:nth-child(n+4)]:col-span-3",
  inlineLayoutClass: "grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-start gap-3",
  dialogLayoutClass: "grid items-start gap-3 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]",
  /** The dialog's input list has room to grow beyond the app's own cap once the results sit beside it. */
  dialogListClass: "xl:[&_ul.overflow-y-auto]:max-h-[30rem]",
} as const;
