import { Check, NotebookPen, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { restoreLostFocus } from "~/utils/restore-focus";
import { postJson } from "~/lib/storage/storage.client";
import { STORAGE_API, STORAGE_LIMITS } from "~/lib/storage/storage.config";
import type { SetItemNoteRequest } from "~/lib/storage/storage.types";
import { ITEM_NOTE_EDITOR } from "./item-note-editor.config";
import type { ItemNoteEditorProps } from "./item-note-editor.types";

const ICON_BUTTON =
  "grid size-7 shrink-0 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50";

/** Add, edit or clear the free-text note on one item. Saving refreshes data through the server's push. */
export function ItemNoteEditor({ item }: ItemNoteEditorProps) {
  const [draft, setDraft] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const openButton = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);
  const editing = draft !== undefined;

  // Closing the editor removes the focused field; hand focus back to the button that opened it.
  useEffect(() => {
    if (editing) wasEditing.current = true;
    else if (wasEditing.current) {
      wasEditing.current = false;
      restoreLostFocus(openButton.current);
    }
  }, [editing]);

  function stop() {
    setDraft(undefined);
    setError(undefined);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (draft === undefined || saving) return;
    if (draft.trim() === (item.note ?? "")) return stop();
    setSaving(true);
    setError(undefined);
    try {
      const request: SetItemNoteRequest = {
        accountId: item.accountId,
        id: item.id,
        note: draft,
      };
      await postJson(STORAGE_API.itemNote, request);
      stop();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === ITEM_NOTE_EDITOR.keys.cancel) stop();
  }

  if (!editing) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <button
          ref={openButton}
          type="button"
          onClick={() => setDraft(item.note ?? "")}
          className="inline-flex shrink-0 items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <NotebookPen size={ITEM_NOTE_EDITOR.iconSize} aria-hidden />
          {item.note === null ? ITEM_NOTE_EDITOR.addLabel : ITEM_NOTE_EDITOR.editLabel}
        </button>
        {item.note !== null && (
          <span className="min-w-0 truncate text-xs text-muted-foreground" title={item.note}>
            {item.note}
          </span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void save(event)} className="min-w-0">
      <div className="flex items-center gap-1">
        <input
          autoFocus
          aria-label={ITEM_NOTE_EDITOR.inputLabel}
          placeholder={ITEM_NOTE_EDITOR.placeholder}
          title={ITEM_NOTE_EDITOR.hint}
          value={draft}
          maxLength={STORAGE_LIMITS.itemNoteMaxLength}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          className="h-8 min-w-0 flex-1 rounded border bg-background px-2 text-sm outline-none focus:border-primary/60 sm:max-w-md"
        />
        <button
          type="submit"
          aria-label={ITEM_NOTE_EDITOR.saveLabel}
          title={ITEM_NOTE_EDITOR.saveLabel}
          disabled={saving}
          className={ICON_BUTTON}
        >
          <Check size={ITEM_NOTE_EDITOR.iconSize} />
        </button>
        <button
          type="button"
          aria-label={ITEM_NOTE_EDITOR.cancelLabel}
          title={ITEM_NOTE_EDITOR.cancelLabel}
          disabled={saving}
          className={ICON_BUTTON}
          onClick={stop}
        >
          <X size={ITEM_NOTE_EDITOR.iconSize} />
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
