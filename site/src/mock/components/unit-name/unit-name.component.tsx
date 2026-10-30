import { Check, Pencil, X } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";
import { STORAGE_LIMITS } from "~/lib/storage/storage.config";
import { UNIT_NAME } from "./unit-name.config";
import type { UnitNameProps } from "./unit-name.types";

const ICON_BUTTON =
  "pointer-events-auto grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50";

export function UnitName({ name, onRename }: UnitNameProps) {
  const [draft, setDraft] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const editing = draft !== undefined;

  function stop() {
    setDraft(undefined);
    setError(undefined);
  }

  async function save(event?: FormEvent) {
    event?.preventDefault();
    const next = draft?.trim();
    if (next === undefined || saving) return;
    if (next === "" || next === name) return stop();
    setSaving(true);
    setError(undefined);
    try {
      await onRename(next);
      stop();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === UNIT_NAME.keys.cancel) stop();
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-1">
        <p className="truncate font-medium">{name}</p>
        <button
          type="button"
          aria-label={UNIT_NAME.editLabel}
          title={UNIT_NAME.editLabel}
          className={ICON_BUTTON}
          onClick={() => setDraft(name)}
        >
          <Pencil size={UNIT_NAME.iconSize} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void save(event)} className="pointer-events-auto min-w-0">
      <div className="flex items-center gap-1">
        <input
          autoFocus
          aria-label={UNIT_NAME.inputLabel}
          value={draft}
          maxLength={STORAGE_LIMITS.unitNameMaxLength}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-7 min-w-0 flex-1 rounded border bg-background px-2 text-sm outline-none focus:border-primary/60"
        />
        <button
          type="submit"
          aria-label={UNIT_NAME.saveLabel}
          title={UNIT_NAME.saveLabel}
          disabled={saving}
          className={ICON_BUTTON}
        >
          <Check size={UNIT_NAME.iconSize} />
        </button>
        <button
          type="button"
          aria-label={UNIT_NAME.cancelLabel}
          title={UNIT_NAME.cancelLabel}
          disabled={saving}
          className={ICON_BUTTON}
          onClick={stop}
        >
          <X size={UNIT_NAME.iconSize} />
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
