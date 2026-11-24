/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { makeItem } from "~test/fixtures";
import { render, screen, setupUser } from "~test/ui";
import { UnitCard } from "./unit-card.component";
import { UNIT_CARD } from "./unit-card.config";
import type { UnitCardProps } from "./unit-card.types";

function props(overrides: Partial<UnitCardProps> = {}): UnitCardProps {
  return {
    unit: { id: "u1", name: "Unit A", itemCount: 2, loaded: true },
    items: [makeItem({ price: 10 }), makeItem({ id: "2", price: 5 })],
    currency: "USD",
    selected: false,
    onSelect: () => {},
    onRename: async () => {},
    ...overrides,
  };
}

describe("UnitCard", () => {
  test("shows the unit's item count and total value", () => {
    render(<UnitCard {...props()} />);
    assert.ok(screen.getByText(formatMoney(15, "USD")));
    assert.ok(screen.getByText(/2 items/));
  });

  test("the slot meter reports how full the unit is", () => {
    render(<UnitCard {...props()} />);
    assert.ok(screen.getByRole("img", { name: UNIT_CARD.labels.slots(2, UNIT_CARD.crate.capacity) }));
  });

  test("a unit that has not loaded shows a dash for its value", () => {
    render(<UnitCard {...props({ unit: { id: "u1", name: "Unit A", itemCount: 2, loaded: false } })} />);
    assert.ok(screen.getAllByText(COPY.common.empty).length >= 1);
  });

  test("the select button reports its pressed state and selects on click", async () => {
    let selects = 0;
    const { rerender } = render(<UnitCard {...props({ onSelect: () => void (selects += 1) })} />);
    const button = screen.getByRole("button", { name: "Unit A", pressed: false });
    await setupUser().click(button);
    assert.equal(selects, 1);
    rerender(<UnitCard {...props({ selected: true })} />);
    assert.ok(screen.getByRole("button", { name: "Unit A", pressed: true }));
  });

  test("the unit can be renamed from the card", async () => {
    const renamed: string[] = [];
    render(<UnitCard {...props({ onRename: async (name) => void renamed.push(name) })} />);
    const user = setupUser();
    await user.click(screen.getByRole("button", { name: /rename/i }));
    await user.type(screen.getByRole("textbox"), "2{Enter}");
    await screen.findByText("Unit A");
    assert.deepEqual(renamed, ["Unit A2"]);
  });
});
