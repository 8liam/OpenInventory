import { useState } from "react";
import { AccountActions } from "~/components/account-actions/account-actions.component";
import { AccountStatusDot } from "~/components/account-status-dot/account-status-dot.component";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { Select } from "~/components/select/select.component";
import { AccountName } from "~/components/account-name/account-name.component";
import { accountName } from "~/lib/accounts/account-names";
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
  const { auth } = account.snapshot;

  async function setLabel(id: string) {
    // The select stays enabled while saving, so it keeps focus; a change mid-save is ignored.
    if (saving) return;
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
    <li className={ACCOUNT_ROW.rowClass}>
      <div className={ACCOUNT_ROW.headClass}>
        <div className={ACCOUNT_ROW.identityClass}>
          <AccountStatusDot status={auth.status} decorative />
          <AccountName name={accountName(account)} />
          <span className={ACCOUNT_ROW.statusClass}>{authStatusText(auth.status)}</span>
        </div>
        <div className={ACCOUNT_ROW.controlsClass} aria-busy={saving}>
          <span role="status" className={ACCOUNT_ROW.savingClass}>
            {saving ? copy.labelSaving : ""}
          </span>
          <Select
            value={account.label ?? ACCOUNT_ROW.noLabelId}
            ariaLabel={copy.labelAria(accountName(account))}
            className={ACCOUNT_ROW.labelSelectWidth}
            options={[
              { id: ACCOUNT_ROW.noLabelId, label: copy.unlabelled },
              ...ACCOUNT_LABELS.map((label) => ({ id: label, label: copy.labels[label] })),
            ]}
            onChange={(id) => void setLabel(id)}
          />
          <Button
            small
            variant="destructiveOutline"
            aria-label={copy.removeAria(accountName(account))}
            onClick={() => setRemoving(true)}
          >
            {copy.remove}
          </Button>
        </div>
      </div>
      {auth.status === AUTH_STATUS.error && (
        <div className={ACCOUNT_ROW.problemClass}>
          <p className={ACCOUNT_ROW.problemTextClass}>{auth.message}</p>
          <AccountActions steamId={account.steamId} />
        </div>
      )}
      {error && (
        <p role="alert" className={ACCOUNT_ROW.errorClass}>
          {error}
        </p>
      )}
      <DangerDialog
        open={removing}
        title={copy.removeTitle(accountName(account))}
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
