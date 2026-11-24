/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser } from "~test/ui";
import { ItemInspectButton } from "./item-inspect.component";
import { ITEM_INSPECT } from "./item-inspect.config";

describe("ItemInspectButton", () => {
  test("renders nothing for an item with nothing to inspect", () => {
    const { container } = render(<ItemInspectButton item={makeItem({ wear: null })} />);
    assert.equal(container.innerHTML, "");
  });

  test("an item with a float gets a labelled button", () => {
    render(<ItemInspectButton item={makeItem({ name: "AK-47 | Redline", wear: 0.2 })} />);
    const button = screen.getByRole("button", {
      name: `${ITEM_INSPECT.buttonLabel}: AK-47 | Redline`,
    });
    assert.equal(button.getAttribute("aria-haspopup"), "dialog");
  });

  test("pressing opens the inspect dialog without selecting the row behind it", async () => {
    let rowClicks = 0;
    render(
      <div onClick={() => void (rowClicks += 1)}>
        <ItemInspectButton item={makeItem({ name: "AK-47 | Redline", wear: 0.2 })} currency="USD" />
      </div>,
    );
    await setupUser().click(screen.getByRole("button", { name: /AK-47/ }));
    assert.ok(await screen.findByRole("dialog", { name: "AK-47 | Redline" }));
    assert.equal(rowClicks, 0);
  });
});
