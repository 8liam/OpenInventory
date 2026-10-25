import { useState } from "react";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import type { TerminalActivateProps } from "./terminal-activate.types";

/** Activating a Terminal is irreversible, so it sits behind an explicit confirmation. */
export function TerminalActivate({ itemId, name }: TerminalActivateProps) {
  const [open, setOpen] = useState(false);
  const copy = COPY.terminal;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] text-destructive hover:underline"
      >
        {copy.activate}
      </button>
      <DangerDialog
        open={open}
        title={copy.confirmTitle(name)}
        warning={copy.confirmWarning}
        effects={copy.confirmEffects}
        acknowledgement={copy.confirmCheckbox}
        confirmLabel={copy.confirmButton}
        workingLabel={copy.working}
        cancelLabel={copy.cancel}
        onConfirm={() => postJson(STORAGE_API.activateTerminal, { id: itemId })}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
