/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatMoney } from "~/utils/format";
import { makeItem } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { ItemInspectCard } from "./item-inspect-card.component";
import { ITEM_INSPECT_CARD } from "./item-inspect-card.config";

const { labels } = ITEM_INSPECT_CARD;
const NOW = Date.UTC(2026, 0, 1);

describe("ItemInspectCard", () => {
  test("shows the price and location facts", () => {
    render(
      <ItemInspectCard
        item={makeItem({ price: 12.5, locationName: "Unit A" })}
        currency="USD"
        now={NOW}
      />,
    );
    assert.ok(screen.getByText(formatMoney(12.5, "USD")));
    assert.ok(screen.getByText("Unit A"));
  });

  test("without a currency the price is left out", () => {
    render(<ItemInspectCard item={makeItem({ price: 12.5 })} now={NOW} />);
    assert.ok(screen.queryByText(labels.price) === null);
  });

  test("a float on the scale shows the meter and the skin's range", () => {
    render(
      <ItemInspectCard item={makeItem({ wear: 0.12, minWear: 0.06, maxWear: 0.8 })} now={NOW} />,
    );
    assert.ok(screen.getByRole("meter"));
    assert.ok(screen.getByText(new RegExp(labels.skinRange)));
  });

  test("no float means no meter", () => {
    render(<ItemInspectCard item={makeItem({ wear: null })} now={NOW} />);
    assert.ok(screen.queryByRole("meter") === null);
  });

  test("StatTrak and Souvenir show as chips", () => {
    render(<ItemInspectCard item={makeItem({ isStatTrak: true, isSouvenir: true })} now={NOW} />);
    assert.ok(screen.getByText(labels.statTrak));
    assert.ok(screen.getByText(labels.souvenir));
  });

  test("a missing image shows the placeholder", () => {
    render(<ItemInspectCard item={makeItem({ imageUrl: null })} now={NOW} />);
    assert.ok(screen.getByText(labels.noImage));
  });

  test("stickers and charms are listed, charms with pattern and price", () => {
    const item = makeItem({
      stickers: [{ name: "Sticker | Crown", imageUrl: null }],
      charms: [
        {
          name: "Charm | Lil Ava",
          imageUrl: null,
          pattern: 77,
          videoUrl: null,
          marketHashName: null,
          price: 3,
        },
      ],
    });
    render(<ItemInspectCard item={item} currency="USD" now={NOW} />);
    assert.ok(screen.getByText(/Crown/));
    assert.ok(screen.getByText(/Lil Ava/));
    assert.ok(screen.getByText(new RegExp(`${labels.pattern} #77`)));
    assert.ok(screen.getAllByText(formatMoney(3, "USD")).length >= 1);
  });

  test("a trade lock in the future shows the date; a past one does not", () => {
    const locked = makeItem({ tradableAfter: NOW + 86_400_000 });
    const { rerender } = render(<ItemInspectCard item={locked} now={NOW} />);
    assert.ok(screen.getByText(labels.tradeLock));
    rerender(<ItemInspectCard item={makeItem({ tradableAfter: NOW - 1 })} now={NOW} />);
    assert.ok(screen.queryByText(labels.tradeLock) === null);
  });

  test("a note and collections appear as facts", () => {
    render(
      <ItemInspectCard
        item={makeItem({ note: "keep", collections: ["Mirage", "Dust"] })}
        now={NOW}
      />,
    );
    assert.ok(screen.getByText("keep"));
    assert.ok(screen.getByText(`Mirage${labels.listSeparator}Dust`));
  });
});
