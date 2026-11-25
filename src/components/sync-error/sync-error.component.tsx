import { CircleX, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { accountName } from "~/lib/accounts/account-names";
import { COPY } from "~/lib/copy/copy.config";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { SYNC_ERROR } from "./sync-error.config";
import type { SyncErrorBannerProps } from "./sync-error.types";

function SyncErrorBanner({ account, named }: SyncErrorBannerProps) {
  const { syncError, loadingUnits } = account.snapshot;
  const priceQuery = usePriceQuery();
  const [retrying, setRetrying] = useState(false);
  if (!syncError) return null;
  const busy = retrying || loadingUnits;

  async function retry() {
    setRetrying(true);
    try {
      await postJson(`${STORAGE_API.refresh}?${priceQuery}`, { accountId: account.steamId });
    } catch {
      // The server republishes the failure through the snapshot, so the banner already shows it.
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className={SYNC_ERROR.classes.root} role="alert">
      <p className={SYNC_ERROR.classes.message}>
        <CircleX size={SYNC_ERROR.alertIconSize} className={SYNC_ERROR.classes.icon} aria-hidden />
        <span>{named ? COPY.accounts.bannerFor(accountName(account), syncError) : syncError}</span>
      </p>
      <Button small disabled={busy} onClick={() => void retry()}>
        <RefreshCw
          size={SYNC_ERROR.iconSize}
          className={busy ? "motion-safe:animate-spin" : undefined}
        />
        {busy ? SYNC_ERROR.retrying : SYNC_ERROR.retry}
      </Button>
    </div>
  );
}

/** Global banners for a failed CS2 session (e.g. the game is running elsewhere), one per affected account. */
export function SyncError() {
  const { accounts } = useAppSnapshot();
  return accounts.map((account) => (
    <SyncErrorBanner key={account.steamId} account={account} named={accounts.length > 1} />
  ));
}
