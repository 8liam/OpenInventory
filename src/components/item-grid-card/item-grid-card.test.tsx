/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { makeItem } from "~test/fixtures";
import { renderWithRouter } from "~test/router";
import { screen, setupUser } from "~test/ui";
import { ItemGridCard } from "./item-grid-card.component";
import { ITEM_GRID_CARD } from "./item-grid-card.config";
import type { ItemGridCardProps } from "./item-grid-card.types";

function props(overrides: Partial<ItemGridCardProps> = {}): ItemGridCardProps {
  return {
    item: makeItem({ name: "AK-47 | Redline", price: 12.5, locationName: "Unit A" }),
    currency: "USD",
    showLocation: false,
    index: 0,
    selectable: false,
    checked: false,
    checkboxVisible: false,
    tabIndex: 0,
    onToggle: () => {},
    onFocus: () => {},
    onKeyDown: () => {},
    ...overrides,
  };
}

describe("ItemGridCard", () => {
  test("shows the name, price and optionally the location", async () => {
    const { unmount } = await renderWithRouter(<ItemGridCard {...props()} />);
    assert.ok(screen.getByText("Redline"));
    assert.ok(screen.getByText(formatMoney(12.5, "USD")));
    assert.ok(screen.queryByText("Unit A") === null);
    unmount();
    await renderWithRouter(<ItemGridCard {...props({ showLocation: true })} />);
    assert.ok(screen.getByText("Unit A"));
  });

  test("an unpriced item shows a dash", async () => {
    await renderWithRouter(<ItemGridCard {...props({ item: makeItem({ price: null }) })} />);
    assert.ok(screen.getAllByText(COPY.common.empty).length >= 1);
  });

  test("a selectable card toggles on click and reports its checked state", async () => {
    let toggles = 0;
    await renderWithRouter(
      <ItemGridCard {...props({ selectable: true, checked: true, checkboxVisible: true, onToggle: () => void (toggles += 1) })} />,
    );
    const cell = screen.getByRole("gridcell");
    assert.equal(cell.getAttribute("aria-selected"), "true");
    await setupUser().click(cell);
    assert.equal(toggles, 1);
  });

  test("the checkbox is labelled and does not double-toggle", async () => {
    let toggles = 0;
    await renderWithRouter(
      <ItemGridCard {...props({ selectable: true, checkboxVisible: true, onToggle: () => void (toggles += 1) })} />,
    );
    await setupUser().click(screen.getByRole("checkbox", { name: ITEM_GRID_CARD.selectRowLabel }));
    assert.ok(toggles <= 1);
  });

  test("an unselectable card ignores clicks", async () => {
    let toggles = 0;
    await renderWithRouter(<ItemGridCard {...props({ onToggle: () => void (toggles += 1) })} />);
    await setupUser().click(screen.getByRole("gridcell"));
    assert.equal(toggles, 0);
  });

  test("key presses and focus reach the grid's handlers", async () => {
    const keys: string[] = [];
    let focused = 0;
    await renderWithRouter(
      <ItemGridCard {...props({ onKeyDown: (event) => keys.push(event.key), onFocus: () => void (focused += 1) })} />,
    );
    const user = setupUser();
    await user.click(screen.getByRole("gridcell"));
    screen.getByRole("gridcell").focus();
    await user.keyboard("{ArrowRight}");
    assert.ok(keys.includes("ArrowRight"));
    assert.ok(focused >= 1);
  });

  test("an active terminal shows its state", async () => {
    const item = makeItem({ terminal: { isActive: true, expiresAt: null, isFinalOffer: false } });
    await renderWithRouter(<ItemGridCard {...props({ item })} />);
    assert.ok(screen.getByText(COPY.terminal.active, { exact: false }));
  });
});
