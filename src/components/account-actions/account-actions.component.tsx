import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import type { AccountActionsProps } from "./account-actions.types";

/** The two ways to fix a broken account: retry its saved login, or sign in to it again. */
export function AccountActions({ steamId, className }: AccountActionsProps) {
  const copy = COPY.accounts;
  const openReauth = useAddAccountDialog((state) => state.openReauth);
  const [retrying, setRetrying] = useState(false);
  const [failure, setFailure] = useState<string>();

  async function reconnect() {
    setRetrying(true);
    setFailure(undefined);
    try {
      await postJson(STORAGE_API.accountReconnect, { accountId: steamId });
    } catch (error) {
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        <Button small disabled={retrying} onClick={() => void reconnect()}>
          {retrying ? copy.reconnecting : copy.reconnect}
        </Button>
        <Button small onClick={() => openReauth(steamId)}>
          {copy.signInAgain}
        </Button>
      </div>
      {failure && (
        <p role="alert" className="text-xs text-destructive">
          {failure}
        </p>
      )}
    </div>
  );
}
