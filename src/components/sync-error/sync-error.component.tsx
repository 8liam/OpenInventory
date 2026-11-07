import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { accountName } from "~/lib/accounts/account-scope.hooks";
import { COPY } from "~/lib/copy/copy.config";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import type { AccountState } from "~/lib/storage/storage.types";
import { SYNC_ERROR } from "./sync-error.config";

function SyncErrorBanner({
  account,
  named,
}: {
  readonly account: AccountState;
  readonly named: boolean;
}) {
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
    <div
      className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-card px-4 py-3"
      role="alert"
    >
      <p className="min-w-0 text-destructive">
        {named ? COPY.accounts.bannerFor(accountName(account), syncError) : syncError}
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
