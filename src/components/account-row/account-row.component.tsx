import { useState } from "react";
import { AccountActions } from "~/components/account-actions/account-actions.component";
import { AccountStatusDot } from "~/components/account-status-dot/account-status-dot.component";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { Select } from "~/components/select/select.component";
import {
  accountIdSuffix,
  accountName,
  accountNameWithId,
} from "~/lib/accounts/account-scope.hooks";
import { authStatusText } from "~/lib/accounts/account-status";
import { ACCOUNT_LABELS } from "~/lib/accounts/accounts.config";
import type { AccountLabel } from "~/lib/accounts/accounts.types";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { ACCOUNT_ROW } from "./account-row.config";
import type { AccountRowProps } from "./account-row.types";

function toLabel(id: string): AccountLabel | null {
  return ACCOUNT_LABELS.find((label) => label === id) ?? null;
}

/** One tracked account in settings: its status, how to fix it, its label, and removing it. */
export function AccountRow({ account, onRemoved }: AccountRowProps) {
  const copy = COPY.accounts;
  const [removing, setRemoving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const name = accountName(account);
  const { auth } = account.snapshot;

  async function setLabel(id: string) {
    setError(undefined);
    setSaving(true);
    try {
      await postJson(STORAGE_API.accountLabel, {
        accountId: account.steamId,
        label: toLabel(id),
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <AccountStatusDot status={auth.status} decorative />
          <span className="truncate">{account.displayName ?? copy.fallbackShortName}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular">
            {accountIdSuffix(account.steamId)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {authStatusText(auth.status)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span role="status" className="text-xs text-muted-foreground">
            {saving ? copy.labelSaving : ""}
          </span>
          <Select
            value={account.label ?? ACCOUNT_ROW.noLabelId}
            ariaLabel={copy.labelAria(name)}
            className={ACCOUNT_ROW.labelSelectWidth}
            disabled={saving}
            options={[
              { id: ACCOUNT_ROW.noLabelId, label: copy.unlabelled },
              ...ACCOUNT_LABELS.map((label) => ({ id: label, label: copy.labels[label] })),
            ]}
            onChange={(id) => void setLabel(id)}
          />
          <Button
            small
            variant="destructiveOutline"
            aria-label={copy.removeAria(accountNameWithId(account))}
            onClick={() => setRemoving(true)}
          >
            {copy.remove}
          </Button>
        </div>
      </div>
      {auth.status === AUTH_STATUS.error && (
        <div className="flex flex-col gap-2 pl-3.5">
          <p className="text-xs text-destructive">{auth.message}</p>
          <AccountActions steamId={account.steamId} />
        </div>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <DangerDialog
        open={removing}
        title={copy.removeTitle(accountNameWithId(account))}
        warning={copy.removeWarning}
        effects={copy.removeEffects}
        acknowledgement={copy.removeCheckbox}
        confirmLabel={copy.removeConfirm}
        workingLabel={copy.removeWorking}
        cancelLabel={copy.cancel}
        onConfirm={async () => {
          await postJson(STORAGE_API.accountRemove, { accountId: account.steamId });
          onRemoved();
        }}
        onClose={() => setRemoving(false)}
      />
    </li>
  );
}
