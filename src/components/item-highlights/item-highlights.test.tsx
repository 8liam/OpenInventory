/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatFloat } from "~/utils/format";
import { makeItem } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { ItemHighlights, ItemTierBadge } from "./item-highlights.component";

const LOW_FLOAT = makeItem({ wear: 0.0004, minWear: 0, maxWear: 1 });
const PLAIN = makeItem({ wear: 0.5, minWear: 0, maxWear: 1 });

describe("ItemHighlights", () => {
  test("a plain item renders nothing", () => {
    const { container } = render(<ItemHighlights item={PLAIN} />);
    assert.equal(container.innerHTML, "");
  });

  test("an extreme float shows a float chip with the wear", () => {
    render(<ItemHighlights item={LOW_FLOAT} wrap />);
    assert.ok(screen.getByText(new RegExp(formatFloat(0.0004).replace(".", "\\."))));
  });

  test("a plain item still renders children passed in", () => {
    render(
      <ItemHighlights item={PLAIN}>
        <span>extra</span>
      </ItemHighlights>,
    );
    assert.ok(screen.getByText("extra"));
  });

  test("visible folds the rest into a +N chip", () => {
    const item = makeItem({
      wear: 0.0004,
      minWear: 0,
      maxWear: 1,
      stickers: [{ name: "Sticker | Crown (Foil)", imageUrl: null }],
    });
    render(<ItemHighlights item={item} visible={1} />);
    assert.ok(screen.getByText(COPY.items.moreHighlights(1)));
  });
});

describe("ItemTierBadge", () => {
  test("renders nothing for an untiered item", () => {
    const { container } = render(<ItemTierBadge item={PLAIN} />);
    assert.equal(container.innerHTML, "");
  });
});
