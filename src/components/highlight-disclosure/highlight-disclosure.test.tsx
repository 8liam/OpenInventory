/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser } from "~test/ui";
import { HighlightDisclosure } from "./highlight-disclosure.component";

const HIGHLIGHTED = makeItem({ wear: 0.0004, minWear: 0, maxWear: 1 });
const PLAIN = makeItem({ wear: 0.5, minWear: 0, maxWear: 1 });

describe("HighlightDisclosure", () => {
  test("a plain item has no disclosure", () => {
    const { container } = render(<HighlightDisclosure item={PLAIN} />);
    assert.equal(container.innerHTML, "");
  });

  test("a highlighted item has a collapsed trigger naming the item", () => {
    render(<HighlightDisclosure item={HIGHLIGHTED} />);
    const trigger = screen.getByRole("button", { name: /AK-47 \| Redline/ });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });

  test("click opens the panel with the reasons; Escape closes it and refocuses the trigger", async () => {
    render(<HighlightDisclosure item={HIGHLIGHTED} />);
    const user = setupUser();
    const trigger = screen.getByRole("button", { name: /AK-47 \| Redline/ });
    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.ok(screen.getAllByText(/Float/).length > 0);
    await user.keyboard("{Escape}");
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(document.activeElement, trigger);
  });

  test("clicking the trigger again closes it", async () => {
    render(<HighlightDisclosure item={HIGHLIGHTED} />);
    const user = setupUser();
    const trigger = screen.getByRole("button", { name: /AK-47 \| Redline/ });
    await user.click(trigger);
    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });

  test("a click does not reach the row behind it", async () => {
    let rowClicks = 0;
    render(
      <div onClick={() => void (rowClicks += 1)}>
        <HighlightDisclosure item={HIGHLIGHTED} />
      </div>,
    );
    await setupUser().click(screen.getByRole("button", { name: /AK-47 \| Redline/ }));
    assert.equal(rowClicks, 0);
  });

  test("a press outside closes the panel", async () => {
    render(
      <>
        <button type="button">outside</button>
        <HighlightDisclosure item={HIGHLIGHTED} />
      </>,
    );
    const user = setupUser();
    const trigger = screen.getByRole("button", { name: /AK-47 \| Redline/ });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "outside" }));
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });
});
