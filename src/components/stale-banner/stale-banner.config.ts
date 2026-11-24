import { CloudOff } from "lucide-react";

export const STALE_BANNER = {
  icon: CloudOff,
  iconSize: 14,
  reconnecting: "Lost the live connection to the server. Reconnecting…",
  refreshFailed: "Couldn't refresh this page.",
  /** Says how old the data on screen is, e.g. "Showing data from 2:04 PM (5 minutes ago)." */
  showingSince: (time: string, relative: string) => `Showing data from ${time} (${relative}).`,
  retry: "Retry now",
  /** Lays out nothing itself; it only notices focus inside the banner. */
  wrapperClass: "contents",
  messageClass: "flex min-w-0 items-center gap-2",
  iconClass: "shrink-0 text-warning",
  rootClass:
    "flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-y border-border-strong py-2.5 text-xs",
} as const;
