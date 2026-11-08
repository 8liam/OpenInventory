import { CloudOff } from "lucide-react";

export const STALE_BANNER = {
  icon: CloudOff,
  iconSize: 14,
  reconnecting: "Lost the live connection to the server. Reconnecting…",
  refreshFailed: "Couldn't refresh this page.",
  /** Says how old the data on screen is, e.g. "Showing data from 2:04 PM (5 minutes ago)." */
  showingSince: (time: string, relative: string) => `Showing data from ${time} (${relative}).`,
  retry: "Retry now",
  rootClass:
    "flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-xs",
} as const;
