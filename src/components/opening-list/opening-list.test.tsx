/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { formatDate } from "~/utils/format";
import { makeOpening } from "~test/fixtures";
import { render, screen } from "~test/ui";
import { OpeningList } from "./opening-list.component";

describe("OpeningList", () => {
  test("lists each opening with its date", () => {
    const first = makeOpening({ itemName: "AK-47 | Redline", openedAt: Date.UTC(2025, 5, 1) });
    const second = makeOpening({ itemName: "M4A4 | Howl", openedAt: Date.UTC(2025, 6, 1) });
    render(<OpeningList openings={[first, second]} emptyText="none" />);
    assert.equal(screen.getAllByRole("listitem").length, 2);
    assert.ok(screen.getByText("Redline"));
    assert.ok(screen.getByText("Howl"));
    assert.ok(screen.getByText(formatDate(first.openedAt)));
  });

  test("an empty list renders no rows", () => {
    render(<OpeningList openings={[]} emptyText="none" />);
    assert.equal(screen.queryAllByRole("listitem").length, 0);
  });
});
