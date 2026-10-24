import type { HistorySyncStatus } from "~/lib/cases/cases.types";

export type SyncBannerProps = {
  readonly sync: HistorySyncStatus;
  readonly onSync: () => void;
};
