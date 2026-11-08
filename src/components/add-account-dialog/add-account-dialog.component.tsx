import { useEffect, useId, useRef } from "react";
import { Button } from "~/components/button/button.component";
import { LoginCard } from "~/components/login-card/login-card.component";
import { accountNameWithId } from "~/lib/accounts/account-scope.hooks";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { ADD_ACCOUNT_DIALOG } from "./add-account-dialog.config";

/**
 * The QR sign-in, either to add an account or to sign an existing one in again.
 * Closes itself once the server reports the sign-in finished; the outcome is announced outside.
 */
export function AddAccountDialog() {
  const { open, target, close, finish } = useAddAccountDialog();
  const { accounts, login, lastLogin } = useAppSnapshot();
  const dialog = useRef<HTMLDialogElement>(null);
  // The sign-in that had finished when the dialog opened; a different one is this dialog's.
  const sequenceAtOpen = useRef<number | undefined>(undefined);
  const headingId = useId();
  const bodyId = useId();
  const copy = COPY.accounts;
  const targetAccount = accounts.find((account) => account.steamId === target);
  const currentSequence = lastLogin?.sequence;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      sequenceAtOpen.current = currentSequence;
      element.showModal();
    }
    if (!open && element.open) element.close();
    // A sequence change while open is the sign-in finishing, handled below, not a reopen.
  }, [open, currentSequence]);

  useEffect(() => {
    if (!open || !lastLogin || lastLogin.sequence === sequenceAtOpen.current) return;
    finish({ steamId: lastLogin.steamId, added: lastLogin.added, target });
  }, [open, lastLogin, target, finish]);

  /** Closing mid sign-in also abandons it, or it would sit on Steam's QR session until it times out. */
  function dismiss() {
    if (!useAddAccountDialog.getState().open) return;
    close();
    if (login.status === AUTH_STATUS.qrPending || login.status === AUTH_STATUS.connecting)
      void postJson(STORAGE_API.accountLoginCancel, {}).catch(() => undefined);
  }

  const name = targetAccount ? accountNameWithId(targetAccount) : undefined;
  return (
    <dialog
      ref={dialog}
      className={ADD_ACCOUNT_DIALOG.dialogClass}
      aria-labelledby={headingId}
      aria-describedby={bodyId}
      onClose={dismiss}
    >
      <div className="flex flex-col gap-4 p-6">
        <LoginCard
          login={login}
          framed={false}
          headingId={headingId}
          bodyId={bodyId}
          title={name ? copy.reauthTitle(name) : copy.addTitle}
          body={name ? copy.reauthBody(name) : copy.addBody}
          buttonLabel={COPY.signIn.button}
        />
        <Button variant="ghost" className="self-end" onClick={dismiss}>
          {copy.cancel}
        </Button>
      </div>
    </dialog>
  );
}
