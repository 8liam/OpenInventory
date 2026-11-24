/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser, waitFor } from "~test/ui";
import ItemInspectDialog from "./item-inspect-dialog.component";
import { ITEM_INSPECT_DIALOG } from "./item-inspect-dialog.config";

describe("ItemInspectDialog", () => {
  test("opens as a modal named after the item", () => {
    render(<ItemInspectDialog item={makeItem({ name: "AK-47 | Redline" })} currency="USD" onClose={() => {}} />);
    assert.ok(screen.getByRole("dialog", { name: "AK-47 | Redline" }));
  });

  test("Close closes the dialog and reports it", async () => {
    let closed = 0;
    render(<ItemInspectDialog item={makeItem()} onClose={() => void (closed += 1)} />);
    await setupUser().click(screen.getByRole("button", { name: ITEM_INSPECT_DIALOG.closeLabel }));
    await waitFor(() => assert.equal(closed, 1));
  });
});
