/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { render, screen } from "~test/ui";
import { PulledList } from "./pulled-list.component";

test("PulledList shows each item with how many times it was pulled", () => {
  render(
    <PulledList
      items={[
        { name: "AK-47 | Redline", imageUrl: null, color: "eb4b4b", count: 1234 },
        { name: "Prisma Case", imageUrl: null, color: null, count: 2 },
      ]}
    />,
  );
  assert.equal(screen.getAllByRole("listitem").length, 2);
  assert.ok(screen.getByText("Redline"));
  assert.ok(screen.getByText(/1,234/));
});

test("PulledList with no items has no rows", () => {
  render(<PulledList items={[]} />);
  assert.equal(screen.queryAllByRole("listitem").length, 0);
});
