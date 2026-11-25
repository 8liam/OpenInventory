/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { UnitStrip } from "./unit-strip.component";
import { UNIT_STRIP } from "./unit-strip.config";

test("UnitStrip is a labelled group holding its children", () => {
  render(
    <UnitStrip className="x">
      <button type="button">one</button>
      <button type="button">two</button>
    </UnitStrip>,
  );
  const group = screen.getByRole("group", { name: UNIT_STRIP.scrollLabel });
  assert.ok(group.contains(screen.getByRole("button", { name: "one" })));
  assert.ok(group.contains(screen.getByRole("button", { name: "two" })));
});

test("UnitStrip shows no scroll button when everything fits", () => {
  render(
    <UnitStrip className="x">
      <span>one</span>
    </UnitStrip>,
  );
  assert.ok(screen.queryByRole("button", { name: /show \d+ more/i }) === null);
});
