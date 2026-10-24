import { RefreshCw } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { COPY } from "~/lib/copy/copy.config";
import type { SyncBannerProps } from "./sync-banner.types";

/** Progress and the sync button for reading Steam's inventory history. */
export function SyncBanner({ sync, onSync }: SyncBannerProps) {
  const copy = COPY.cases;
  const running = sync.state === "running";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
      <div className="min-w-0 text-xs text-muted-foreground">
        {running && (
          <p className="tabular">
            {copy.syncing}… {sync.pages} {copy.syncProgress} · {sync.events} {copy.eventsFound}
          </p>
        )}
        {!running && sync.state === "error" && (
          <p role="alert" className="text-destructive">
            {sync.message}
          </p>
        )}
        {!running && sync.state !== "error" && sync.lastSyncAt && (
          <p>
            {copy.lastSync} {new Date(sync.lastSyncAt).toLocaleString()}
          </p>
        )}
        {!running && !sync.lastSyncAt && <p>{copy.firstSyncHint}</p>}
        {!sync.complete && sync.lastSyncAt !== null && !running && <p>{copy.partial}</p>}
      </div>
      <Button small disabled={running} onClick={onSync}>
        <RefreshCw size={12} className={running ? "animate-spin" : undefined} />
        {running ? copy.syncing : copy.sync}
      </Button>
    </div>
  );
}
