/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { installFakeApi, type FakeApi } from "~test/fake-api";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser, waitFor } from "~test/ui";
import { ItemNoteEditor } from "./item-note-editor.component";
import { ITEM_NOTE_EDITOR } from "./item-note-editor.config";

describe("ItemNoteEditor", () => {
  let api: FakeApi;
  beforeEach(() => {
    api = installFakeApi();
  });
  afterEach(() => api.restore());

  test("an item without a note offers to add one", () => {
    render(<ItemNoteEditor item={makeItem({ note: null })} />);
    assert.ok(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.addLabel }));
  });

  test("an item with a note shows it as a chip and offers to edit", () => {
    render(<ItemNoteEditor item={makeItem({ note: "keep this" })} />);
    assert.ok(screen.getByText("keep this", { exact: false }));
    assert.ok(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.editLabel }));
  });

  test("saving posts the trimmed-in note for the item's account and closes the editor", async () => {
    const item = makeItem({ id: "i1", accountId: "acc", note: null });
    render(<ItemNoteEditor item={item} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.addLabel }));
    await user.type(screen.getByRole("textbox", { name: ITEM_NOTE_EDITOR.inputLabel }), "hello");
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.saveLabel }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0], {
      path: STORAGE_API.itemNote,
      method: "POST",
      body: { accountId: "acc", id: "i1", note: "hello" },
    });
    await waitFor(() => assert.ok(screen.queryByRole("textbox") === null));
  });

  test("saving an unchanged note sends nothing", async () => {
    render(<ItemNoteEditor item={makeItem({ note: "same" })} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.editLabel }));
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.saveLabel }));
    assert.equal(api.calls.length, 0);
    assert.ok(screen.queryByRole("textbox") === null);
  });

  test("Escape cancels without saving", async () => {
    render(<ItemNoteEditor item={makeItem({ note: null })} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.addLabel }));
    await user.type(screen.getByRole("textbox"), "draft");
    await user.keyboard("{Escape}");
    assert.ok(screen.queryByRole("textbox") === null);
    assert.equal(api.calls.length, 0);
  });

  test("the Cancel button closes the editor", async () => {
    render(<ItemNoteEditor item={makeItem({ note: null })} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.addLabel }));
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.cancelLabel }));
    assert.ok(screen.queryByRole("textbox") === null);
  });

  test("a failed save keeps the editor open and shows the error", async () => {
    api.respond(STORAGE_API.itemNote, () => ({ status: 500, body: { error: "disk full" } }));
    render(<ItemNoteEditor item={makeItem({ note: null })} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.addLabel }));
    await user.type(screen.getByRole("textbox"), "x");
    await user.click(screen.getByRole("button", { name: ITEM_NOTE_EDITOR.saveLabel }));
    assert.equal((await screen.findByRole("alert")).textContent, "disk full");
    assert.ok(screen.getByRole("textbox"));
  });

  test("removing the chip posts an empty note", async () => {
    render(<ItemNoteEditor item={makeItem({ id: "i1", accountId: "acc", note: "bye" })} />);
    await setupUser().click(screen.getByRole("button", { name: /remove/i }));
    await waitFor(() => assert.equal(api.calls.length, 1));
    assert.deepEqual(api.calls[0]?.body, { accountId: "acc", id: "i1", note: "" });
  });
});
