import { RefreshCw } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { COPY } from "~/lib/copy/copy.config";
import { SYNC_BANNER } from "./sync-banner.config";
import type { SyncBannerProps } from "./sync-banner.types";

const { classes } = SYNC_BANNER;

/** Progress and the sync button for reading Steam's inventory history. */
export function SyncBanner({ sync, onSync, requestPending, requestError }: SyncBannerProps) {
  const copy = COPY.cases;
  const running = sync.state === "running";
  const busy = running || requestPending;
  return (
    <div className={classes.root}>
      <div className={classes.status}>
        {running && (
          <p className={classes.progress}>
            {copy.syncing}… {sync.pages} {copy.syncProgress} · {sync.events} {copy.eventsFound}
          </p>
        )}
        {!running && sync.state === "error" && (
          <p role="alert" className={classes.error}>
            {sync.message}
          </p>
        )}
        {requestError && (
          <p role="alert" className={classes.error}>
            {requestError}
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
      <p role="status" className={classes.srOnly}>
        {busy ? copy.syncStarted : ""}
      </p>
      {/* Stays focusable while busy (a disabled button would drop focus to the page); a press is ignored. */}
      <Button
        small
        aria-disabled={busy}
        className={busy ? SYNC_BANNER.busyClass : undefined}
        onClick={busy ? undefined : onSync}
      >
        <RefreshCw
          size={SYNC_BANNER.iconSize}
          aria-hidden
          className={busy ? SYNC_BANNER.spinClass : undefined}
        />
        {busy ? copy.syncing : copy.sync}
      </Button>
    </div>
  );
}
