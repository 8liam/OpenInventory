/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { render, screen } from "~test/ui";
import { ItemLabel } from "./item-label.component";

const base = { imageUrl: null, rarityColor: null, size: 32 } as const;

describe("ItemLabel", () => {
  test("shows the weapon above the skin, with the full name as a title", () => {
    render(<ItemLabel name="AK-47 | Redline" {...base} />);
    assert.ok(screen.getByText("AK-47"));
    assert.equal(screen.getByText("Redline").getAttribute("title"), "AK-47 | Redline");
  });

  test("a name without a skin shows once", () => {
    render(<ItemLabel name="Danger Zone Case" {...base} />);
    assert.equal(screen.getAllByText("Danger Zone Case").length, 1);
  });

  test("shows a custom name and extra content under the name", () => {
    render(
      <ItemLabel name="AK-47 | Redline" customName="Old faithful" {...base}>
        <span>stickers</span>
      </ItemLabel>,
    );
    assert.ok(screen.getByText(/Old faithful/));
    assert.ok(screen.getByText("stickers"));
  });

  test("renders the thumbnail only when it has an image", () => {
    const { container, rerender } = render(<ItemLabel name="X" {...base} />);
    assert.equal(container.querySelectorAll("img").length, 0);
    rerender(<ItemLabel name="X" {...base} imageUrl="x.png" />);
    assert.equal(container.querySelectorAll("img").length, 1);
  });
});
