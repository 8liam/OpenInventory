import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { Panel } from "~/components/panel/panel.component";
import { Select } from "~/components/select/select.component";
import { accountName } from "~/lib/accounts/account-scope.hooks";
import { authDotClass, authStatusText } from "~/lib/accounts/account-status";
import { ACCOUNT_LABELS } from "~/lib/accounts/accounts.config";
import type { AccountLabel } from "~/lib/accounts/accounts.types";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import type { AccountState } from "~/lib/storage/storage.types";
import { cn } from "~/utils/cn";
import { ACCOUNTS_PANEL } from "./accounts-panel.config";

function toLabel(id: string): AccountLabel | null {
  return ACCOUNT_LABELS.find((label) => label === id) ?? null;
}

function AccountRow({ account }: { readonly account: AccountState }) {
  const copy = COPY.accounts;
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string>();
  const name = accountName(account);

  async function setLabel(id: string) {
    setError(undefined);
    try {
      await postJson(STORAGE_API.accountLabel, {
        accountId: account.steamId,
        label: toLabel(id),
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }

  return (
    <li className="flex flex-col gap-1 py-2.5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-1.5 shrink-0 rounded-full", authDotClass(account.snapshot.auth))}
            aria-hidden
          />
          <span className="truncate">{name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {authStatusText(account.snapshot.auth)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={account.label ?? ACCOUNTS_PANEL.noLabelId}
            ariaLabel={copy.labelAria(name)}
            className={ACCOUNTS_PANEL.labelSelectWidth}
            options={[
              { id: ACCOUNTS_PANEL.noLabelId, label: copy.unlabelled },
              ...ACCOUNT_LABELS.map((label) => ({ id: label, label: copy.labels[label] })),
            ]}
            onChange={(id) => void setLabel(id)}
          />
          <Button small variant="destructive" onClick={() => setRemoving(true)}>
            {copy.remove}
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <DangerDialog
        open={removing}
        title={copy.removeTitle(name)}
        warning={copy.removeWarning}
        effects={copy.removeEffects}
        acknowledgement={copy.removeCheckbox}
        confirmLabel={copy.removeConfirm}
        workingLabel={copy.removeWorking}
        cancelLabel={copy.cancel}
        onConfirm={() => postJson(STORAGE_API.accountRemove, { accountId: account.steamId })}
        onClose={() => setRemoving(false)}
      />
    </li>
  );
}

/** Settings: every tracked account with its label and a way to remove it, plus adding another. */
export function AccountsPanel() {
  const { accounts } = useAppSnapshot();
  const setDialogOpen = useAddAccountDialog((state) => state.setOpen);
  const copy = COPY.accounts;
  return (
    <Panel
      title={copy.settingsTitle}
      action={
        <Button small onClick={() => setDialogOpen(true)}>
          <Plus size={ACCOUNTS_PANEL.addIconSize} aria-hidden />
          {copy.add}
        </Button>
      }
    >
      <p className="mb-3 text-muted-foreground">{copy.settingsBody}</p>
      <ul className="divide-y">
        {accounts.map((account) => (
          <AccountRow key={account.steamId} account={account} />
        ))}
      </ul>
    </Panel>
  );
}
