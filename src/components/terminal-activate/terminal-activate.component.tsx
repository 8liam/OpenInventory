import { useState } from "react";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { accountNameWithId } from "~/lib/accounts/account-names";
import { COPY } from "~/lib/copy/copy.config";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { TERMINAL_ACTIVATE } from "./terminal-activate.config";
import type { TerminalActivateProps } from "./terminal-activate.types";

/** Activating a Terminal is irreversible, so it sits behind an explicit confirmation. */
export function TerminalActivate({ itemId, accountId, name }: TerminalActivateProps) {
  const [open, setOpen] = useState(false);
  const { accounts } = useAppSnapshot();
  const copy = COPY.terminal;
  // Activation can start from the all-accounts item list, so name the account when there is a choice.
  const account = accounts.length > 1 ? accounts.find((a) => a.steamId === accountId) : undefined;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={TERMINAL_ACTIVATE.triggerClass}
      >
        {copy.activate}
      </button>
      <DangerDialog
        open={open}
        title={
          account ? copy.confirmTitleFor(name, accountNameWithId(account)) : copy.confirmTitle(name)
        }
        warning={copy.confirmWarning}
        effects={copy.confirmEffects}
        acknowledgement={copy.confirmCheckbox}
        confirmLabel={copy.confirmButton}
        workingLabel={copy.working}
        cancelLabel={copy.cancel}
        onConfirm={() => postJson(STORAGE_API.activateTerminal, { accountId, id: itemId })}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
