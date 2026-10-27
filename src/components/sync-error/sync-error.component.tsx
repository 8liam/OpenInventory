import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { callStorageApi, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { SYNC_ERROR } from "./sync-error.config";

/** Global banner for a failed CS2 session (e.g. the game is running elsewhere); lives above every page. */
export function SyncError() {
  const { syncError, loadingUnits } = useStorageSnapshot();
  const priceQuery = usePriceQuery();
  const [retrying, setRetrying] = useState(false);
  if (!syncError) return null;
  const busy = retrying || loadingUnits;

  async function retry() {
    setRetrying(true);
    try {
      await callStorageApi(`${STORAGE_API.refresh}?${priceQuery}`);
    } catch {
      // The server republishes the failure through the snapshot, so the banner already shows it.
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div
      className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-card px-4 py-3"
      role="alert"
    >
      <p className="min-w-0 text-destructive">{syncError}</p>
      <Button small disabled={busy} onClick={() => void retry()}>
        <RefreshCw size={SYNC_ERROR.iconSize} className={busy ? "animate-spin" : undefined} />
        {busy ? SYNC_ERROR.retrying : SYNC_ERROR.retry}
      </Button>
    </div>
  );
}
