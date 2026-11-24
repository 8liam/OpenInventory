/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { ItemNoteChip } from "./item-note-chip.component";
import { ITEM_NOTE_CHIP } from "./item-note-chip.config";

describe("ItemNoteChip", () => {
  test("shows the note text", () => {
    render(<ItemNoteChip note="bought cheap" />);
    assert.ok(screen.getByText("bought cheap", { exact: false }));
    assert.ok(screen.queryByRole("button") === null);
  });

  test("with onRemove it offers a remove button", async () => {
    let removed = 0;
    render(<ItemNoteChip note="x" onRemove={() => void (removed += 1)} />);
    await setupUser().click(screen.getByRole("button", { name: ITEM_NOTE_CHIP.removeLabel }));
    assert.equal(removed, 1);
  });

  test("removing disables the remove button", () => {
    render(<ItemNoteChip note="x" onRemove={() => {}} removing />);
    assert.equal((screen.getByRole("button") as HTMLButtonElement).disabled, true);
  });
});
