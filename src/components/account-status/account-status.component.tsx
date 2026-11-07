import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { accountName } from "~/lib/accounts/account-scope.hooks";
import { authDotClass } from "~/lib/accounts/account-status";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import type { AccountStatusProps } from "./account-status.types";

/** Stands in for a page while its account isn't connected: progress, or what went wrong and what to do. */
export function AccountStatus({ account }: AccountStatusProps) {
  const copy = COPY.accounts;
  const { auth } = account.snapshot;
  const setDialogOpen = useAddAccountDialog((state) => state.setOpen);
  const [retrying, setRetrying] = useState(false);
  const [failure, setFailure] = useState<string>();

  async function reconnect() {
    setRetrying(true);
    setFailure(undefined);
    try {
      await postJson(STORAGE_API.accountReconnect, { accountId: account.steamId });
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4" role="status">
      <div className="flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", authDotClass(auth))} aria-hidden />
        <h2 className="text-[13px] font-medium">{copy.notReadyTitle(accountName(account))}</h2>
      </div>
      {auth.status === AUTH_STATUS.error ? (
        <p className="mt-2 text-destructive">{auth.message}</p>
      ) : (
        <p className="mt-2 text-muted-foreground">
          {auth.status === AUTH_STATUS.connecting ? auth.detail : copy.connecting}
        </p>
      )}
      {failure && (
        <p role="alert" className="mt-2 text-destructive">
          {failure}
        </p>
      )}
      {auth.status === AUTH_STATUS.error && (
        <div className="mt-3 flex gap-2">
          <Button small disabled={retrying} onClick={() => void reconnect()}>
            {retrying ? copy.reconnecting : copy.reconnect}
          </Button>
          <Button small onClick={() => setDialogOpen(true)}>
            {copy.signInAgain}
          </Button>
        </div>
      )}
    </div>
  );
}
