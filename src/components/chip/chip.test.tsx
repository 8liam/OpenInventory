/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { Star } from "lucide-react";
import { render, screen, setupUser } from "~test/ui";
import { Chip } from "./chip.component";

describe("Chip", () => {
  test("renders its text with a title", () => {
    render(<Chip title="More info">Float 0.01</Chip>);
    assert.ok(screen.getByText("Float 0.01"));
    assert.ok(screen.getByTitle("More info"));
  });

  test("an icon is decorative", () => {
    const { container } = render(<Chip icon={Star}>Fav</Chip>);
    assert.equal(container.querySelector("svg")?.getAttribute("aria-hidden"), "true");
  });

  test("onClick makes the chip a button named by ariaLabel", async () => {
    let clicks = 0;
    render(
      <Chip ariaLabel="Open note" onClick={() => void (clicks += 1)}>
        Note
      </Chip>,
    );
    await setupUser().click(screen.getByRole("button", { name: "Open note" }));
    assert.equal(clicks, 1);
  });

  test("without handlers there is no button", () => {
    render(<Chip>Plain</Chip>);
    assert.ok(screen.queryByRole("button") === null);
  });

  test("onRemove adds a remove button that does not trigger the chip", async () => {
    let removed = 0;
    render(
      <Chip onRemove={() => void (removed += 1)} removeLabel="Remove tag">
        Tag
      </Chip>,
    );
    await setupUser().click(screen.getByRole("button", { name: "Remove tag" }));
    assert.equal(removed, 1);
  });

  test("removing disables the remove button", () => {
    render(
      <Chip onRemove={() => {}} removeLabel="Remove tag" removing>
        Tag
      </Chip>,
    );
    assert.equal(
      (screen.getByRole("button", { name: "Remove tag" }) as HTMLButtonElement).disabled,
      true,
    );
  });
});
