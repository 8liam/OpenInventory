/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen, setupUser } from "~test/ui";
import { FilteredEmpty } from "./filtered-empty.component";

test("FilteredEmpty explains and its action fires", async () => {
  let cleared = 0;
  render(
    <FilteredEmpty title="No match" body="Filters hid all" actionLabel="Clear" onAction={() => void (cleared += 1)} />,
  );
  assert.ok(screen.getByRole("status"));
  assert.ok(screen.getByText("No match"));
  assert.ok(screen.getByText("Filters hid all"));
  await setupUser().click(screen.getByRole("button", { name: "Clear" }));
  assert.equal(cleared, 1);
});
