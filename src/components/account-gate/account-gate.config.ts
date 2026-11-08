import { COPY } from "~/lib/copy/copy.config";

export const ACCOUNT_GATE = {
  /** Page headings for the routes that ask for one account, so the prompt keeps the page's name. */
  pageTitles: {
    "/": COPY.dashboard.title,
    "/items": COPY.items.title,
    "/storage": COPY.storage.title,
    "/terminals": COPY.terminal.pageTitle,
    "/tradeup": COPY.tradeup.title,
    "/cases": COPY.cases.title,
  } as Readonly<Record<string, string>>,
  cardClass: "rounded-lg border bg-card p-4",
  /** Foreground text, so the link clears 4.5:1 on the tinted banner in both themes. */
  settingsLinkClass:
    "inline-flex h-7 items-center whitespace-nowrap rounded-md px-2.5 font-medium text-foreground underline-offset-2 hover:bg-muted hover:underline",
  bannerClass:
    "flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-xs",
  bannerIconSize: 14,
} as const;
