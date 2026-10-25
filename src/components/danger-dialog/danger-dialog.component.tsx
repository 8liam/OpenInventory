import { TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { DANGER_DIALOG } from "./danger-dialog.config";
import type { DangerDialogProps } from "./danger-dialog.types";

/** Confirmation for irreversible actions: spells out the effects and needs a tick box. */
export function DangerDialog({
  open,
  title,
  warning,
  effects,
  acknowledgement,
  confirmLabel,
  workingLabel,
  cancelLabel,
  onConfirm,
  onClose,
}: DangerDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function reset() {
    setAcknowledged(false);
    setError(undefined);
    onClose();
  }

  async function confirm() {
    setWorking(true);
    setError(undefined);
    try {
      await onConfirm();
      dialog.current?.close();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setWorking(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className={DANGER_DIALOG.dialogClass}
      onClose={reset}
      onCancel={(event) => working && event.preventDefault()}
    >
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <TriangleAlert size={DANGER_DIALOG.iconSize} aria-hidden />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <p className="font-medium">{warning}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {effects.map((effect) => (
            <li key={effect}>{effect}</li>
          ))}
        </ul>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={acknowledged}
            disabled={working}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          {acknowledgement}
        </label>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button disabled={working} onClick={() => dialog.current?.close()}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" disabled={!acknowledged || working} onClick={confirm}>
            {working ? workingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
