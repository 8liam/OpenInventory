import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { PAGE_HEADER } from "~/components/page-header/page-header.config";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { restoreLostFocus } from "~/utils/restore-focus";
import { ACCOUNT_ACTIONS } from "./account-actions.config";
import type { AccountActionsProps } from "./account-actions.types";

/** The two ways to fix a broken account: retry its saved login, or sign in to it again. */
export function AccountActions({ steamId, className }: AccountActionsProps) {
  const copy = COPY.accounts;
  const openReauth = useAddAccountDialog((state) => state.openReauth);
  const [retrying, setRetrying] = useState(false);
  const retryingRef = useRef(false);
  const reconnectStarted = useRef(false);
  const [failure, setFailure] = useState<string>();

  useEffect(
    () => () => {
      // A successful reconnect can replace this whole card before its request resolves.
      if (reconnectStarted.current)
        requestAnimationFrame(() =>
          restoreLostFocus(document.getElementById(PAGE_HEADER.headingId)),
        );
    },
    [],
  );

  async function reconnect() {
    if (retryingRef.current) return;
    retryingRef.current = true;
    reconnectStarted.current = true;
    setRetrying(true);
    setFailure(undefined);
    try {
      await postJson(STORAGE_API.accountReconnect, { accountId: steamId });
    } catch (error) {
      reconnectStarted.current = false;
      setFailure(error instanceof Error ? error.message : String(error));
    } finally {
      retryingRef.current = false;
      setRetrying(false);
    }
  }

  return (
    <div className={cn(ACCOUNT_ACTIONS.rootClass, className)}>
      <div className={ACCOUNT_ACTIONS.buttonsClass}>
        <Button
          small
          aria-disabled={retrying}
          className={retrying ? "cursor-wait opacity-50" : undefined}
          onClick={() => void reconnect()}
        >
          {retrying ? copy.reconnecting : copy.reconnect}
        </Button>
        <span role="status" className="sr-only">
          {retrying ? copy.reconnecting : ""}
        </span>
        <Button small onClick={() => openReauth(steamId)}>
          {copy.signInAgain}
        </Button>
      </div>
      {failure && (
        <p role="alert" className={ACCOUNT_ACTIONS.errorClass}>
          {failure}
        </p>
      )}
    </div>
  );
}
