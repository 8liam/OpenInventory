/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { render, screen, setupUser } from "~test/ui";
import { TiersHelp } from "./tiers-help.component";

const { tiersHelp } = COPY.items;

describe("TiersHelp", () => {
  test("is a collapsed help button until pressed", () => {
    render(<TiersHelp />);
    const trigger = screen.getByRole("button", { name: tiersHelp.trigger });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.ok(screen.queryByRole("heading", { name: tiersHelp.title }) === null);
  });

  test("pressing opens the panel; pressing again closes it", async () => {
    render(<TiersHelp />);
    const user = setupUser();
    const trigger = screen.getByRole("button", { name: tiersHelp.trigger });
    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.ok(screen.getByRole("heading", { name: tiersHelp.title }));
    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });

  test("Escape closes it and returns focus to the button", async () => {
    render(<TiersHelp />);
    const user = setupUser();
    const trigger = screen.getByRole("button", { name: tiersHelp.trigger });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(document.activeElement, trigger);
  });

  test("a press outside closes it", async () => {
    render(
      <>
        <button type="button">outside</button>
        <TiersHelp />
      </>,
    );
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: tiersHelp.trigger }));
    await user.click(screen.getByRole("button", { name: "outside" }));
    assert.equal(screen.getByRole("button", { name: tiersHelp.trigger }).getAttribute("aria-expanded"), "false");
  });
});
