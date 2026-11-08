import { TRADE_UP_STATTRAK_FILTER } from "~/lib/storage/storage.config";

export const TRADEUP_FINDER_CONTROLS = {
  title: "Find best EV contracts",
  statTrakLabel: "StatTrak",
  statTrakOptions: [
    { id: TRADE_UP_STATTRAK_FILTER.all, label: "Include all" },
    { id: TRADE_UP_STATTRAK_FILTER.normal, label: "Normal only" },
    { id: TRADE_UP_STATTRAK_FILTER.statTrak, label: "StatTrak only" },
  ],
  includeStorage: "Include storage unit items",
  selectWidth: "w-40",
} as const;
