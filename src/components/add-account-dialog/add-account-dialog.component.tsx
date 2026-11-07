import { useEffect, useRef } from "react";
import { Button } from "~/components/button/button.component";
import { LoginCard } from "~/components/login-card/login-card.component";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { ADD_ACCOUNT_DIALOG } from "./add-account-dialog.config";

/** Adds another account through the same QR sign-in; closes itself once the account appears. */
export function AddAccountDialog() {
  const { open, setOpen } = useAddAccountDialog();
  const { accounts, login } = useAppSnapshot();
  const dialog = useRef<HTMLDialogElement>(null);
  const accountCount = useRef(accounts.length);
  const copy = COPY.accounts;

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  useEffect(() => {
    if (open && accounts.length > accountCount.current) setOpen(false);
    accountCount.current = accounts.length;
  }, [accounts.length, open, setOpen]);

  function close() {
    setOpen(false);
    // An abandoned attempt would otherwise sit on Steam's QR session until it times out.
    void postJson(STORAGE_API.accountLoginCancel, {}).catch(() => undefined);
  }

  return (
    <dialog ref={dialog} className={ADD_ACCOUNT_DIALOG.dialogClass} onClose={close}>
      <div className="flex flex-col gap-3 p-3">
        <LoginCard
          login={login}
          title={copy.addTitle}
          body={copy.addBody}
          buttonLabel={COPY.signIn.button}
        />
        <Button onClick={close}>{copy.close}</Button>
      </div>
    </dialog>
  );
}
